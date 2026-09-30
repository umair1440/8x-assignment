<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PurchaseFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cart_token_is_issued_and_variant_quantities_merge(): void
    {
        $category = Category::create(['name' => 'Audio', 'slug' => 'audio', 'sort_order' => 1]);
        $product = Product::create([
            'category_id' => $category->id,
            'title' => 'Cart Speaker',
            'price' => 25,
            'stock' => 5,
            'status' => 'active',
        ]);

        $initialize = $this->postJson('/api/cart');
        $initialize->assertCreated()->assertHeader('X-Cart-Token');
        $token = $initialize->headers->get('X-Cart-Token');

        $this->withHeader('X-Cart-Token', $token)->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
            'variant_color' => 'black',
            'variant_size' => 'standard',
        ])->assertOk()
            ->assertJsonPath('data.items.0.quantity', 2)
            ->assertJsonPath('data.items.0.line_total', '50.00')
            ->assertJsonPath('data.subtotal', '50.00');

        $this->withHeader('X-Cart-Token', $token)->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
            'variant_color' => 'black',
            'variant_size' => 'standard',
        ])->assertOk()->assertJsonPath('data.items.0.quantity', 3);

        $this->withHeader('X-Cart-Token', $token)->getJson('/api/cart')
            ->assertOk()->assertJsonCount(1, 'data.items');
    }

    public function test_customer_can_checkout_and_only_the_order_owner_can_read_it(): void
    {
        $category = Category::create(['name' => 'Audio', 'slug' => 'audio', 'sort_order' => 1]);
        $seller = User::create([
            'name' => 'Seller',
            'email' => 'seller@example.test',
            'password' => 'password123',
            'role' => 'seller',
            'auth_provider' => 'email',
        ]);
        $product = Product::create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'title' => 'Checkout Speaker',
            'price' => 50,
            'stock' => 4,
            'image_url' => '/speaker.jpg',
            'status' => 'active',
        ]);

        $token = $this->registerCustomer('buyer@example.test');
        [$addressId, $paymentMethodId] = $this->createAddressAndPayment($token);

        $this->withToken($token)->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
            'variant_color' => 'blue',
            'variant_size' => 'large',
        ])->assertOk()->assertJsonPath('data.items.0.quantity', 2);

        $checkout = $this->withToken($token)->postJson('/api/checkout', [
            'address_id' => $addressId,
            'payment_method_id' => $paymentMethodId,
        ]);

        $checkout->assertCreated()
            ->assertJsonPath('data.status', 'placed')
            ->assertJsonPath('data.subtotal', '100.00')
            ->assertJsonPath('data.shipping_fee', '9.99')
            ->assertJsonPath('data.tax', '8.00')
            ->assertJsonPath('data.payment.brand', 'Visa')
            ->assertJsonPath('data.payment.last4', '4242')
            ->assertJsonPath('data.items.0.seller_id', $seller->id)
            ->assertJsonPath('data.items.0.title', 'Checkout Speaker');

        $orderId = $checkout->json('data.id');
        $this->assertSame(2, $product->fresh()->stock);
        $this->withToken($token)->getJson('/api/orders')->assertOk()->assertJsonPath('data.0.id', $orderId);
        $this->withToken($token)->getJson('/api/orders/'.$orderId)->assertOk();

        $otherUser = User::create([
            'name' => 'Other Buyer',
            'email' => 'other@example.test',
            'password' => 'password123',
            'role' => 'customer',
            'auth_provider' => 'email',
        ]);
        $this->actingAs($otherUser, 'sanctum')->getJson('/api/orders/'.$orderId)->assertNotFound();
    }

    public function test_checkout_rejects_stock_changes_without_creating_an_order_or_emptying_cart(): void
    {
        $category = Category::create(['name' => 'Audio', 'slug' => 'audio', 'sort_order' => 1]);
        $product = Product::create([
            'category_id' => $category->id,
            'title' => 'Limited Speaker',
            'price' => 20,
            'stock' => 1,
            'status' => 'active',
        ]);
        $token = $this->registerCustomer('stock-buyer@example.test');
        [$addressId, $paymentMethodId] = $this->createAddressAndPayment($token);

        $this->withToken($token)->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertOk();
        $product->update(['stock' => 0]);

        $this->withToken($token)->postJson('/api/checkout', [
            'address_id' => $addressId,
            'payment_method_id' => $paymentMethodId,
        ])->assertUnprocessable()->assertJsonValidationErrors('cart');

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseHas('cart_items', ['product_id' => $product->id, 'quantity' => 1]);
        $this->assertSame(0, $product->fresh()->stock);
    }

    public function test_guest_cart_merge_combines_matching_variants_and_deletes_the_guest_cart(): void
    {
        $category = Category::create(['name' => 'Audio', 'slug' => 'audio', 'sort_order' => 1]);
        $product = Product::create([
            'category_id' => $category->id,
            'title' => 'Merge Speaker',
            'price' => 30,
            'stock' => 5,
            'status' => 'active',
        ]);
        $guestCart = $this->postJson('/api/cart')->assertCreated();
        $guestToken = $guestCart->headers->get('X-Cart-Token');
        $this->withHeader('X-Cart-Token', $guestToken)->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
            'variant_color' => 'black',
        ])->assertOk();

        $token = $this->registerCustomer('merge-buyer@example.test');
        $this->withToken($token)->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
            'variant_color' => 'black',
        ])->assertOk();

        $this->withToken($token)->withHeader('X-Cart-Token', $guestToken)->postJson('/api/cart/merge')
            ->assertOk()->assertJsonPath('data.items.0.quantity', 3);

        $this->assertDatabaseMissing('carts', ['session_token' => $guestToken]);
    }

    public function test_cancelling_a_placed_order_restores_stock(): void
    {
        $category = Category::create(['name' => 'Audio', 'slug' => 'audio', 'sort_order' => 1]);
        $product = Product::create([
            'category_id' => $category->id,
            'title' => 'Cancel Speaker',
            'price' => 40,
            'stock' => 3,
            'status' => 'active',
        ]);
        $token = $this->registerCustomer('cancel-buyer@example.test');
        [$addressId, $paymentMethodId] = $this->createAddressAndPayment($token);
        $this->withToken($token)->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ])->assertOk();
        $checkout = $this->withToken($token)->postJson('/api/checkout', [
            'address_id' => $addressId,
            'payment_method_id' => $paymentMethodId,
        ])->assertCreated();
        $orderId = $checkout->json('data.id');
        $this->assertSame(1, $product->fresh()->stock);

        $this->withToken($token)->postJson('/api/orders/'.$orderId.'/cancel')
            ->assertOk()->assertJsonPath('data.status', 'cancelled');
        $this->assertSame(3, $product->fresh()->stock);
        $this->withToken($token)->postJson('/api/orders/'.$orderId.'/cancel')->assertStatus(409);
    }

    public function test_account_rows_are_scoped_and_payment_secrets_are_rejected(): void
    {
        $ownerToken = $this->registerCustomer('account-owner@example.test');
        $otherUser = User::create([
            'name' => 'Other Account',
            'email' => 'account-other@example.test',
            'password' => 'password123',
            'role' => 'customer',
            'auth_provider' => 'email',
        ]);
        $address = $this->withToken($ownerToken)->postJson('/api/addresses', [
            'label' => 'Home',
            'full_name' => 'Account Owner',
            'phone' => '555-0100',
            'line1' => '10 Main Street',
            'city' => 'Seattle',
            'postal_code' => '98101',
            'country' => 'US',
        ])->assertCreated();

        $this->withToken($ownerToken)->postJson('/api/payment-methods', [
            'brand' => 'Visa',
            'last4' => '4242',
            'exp_month' => 12,
            'exp_year' => (int) date('Y') + 1,
            'cardholder_name' => 'Account Owner',
            'card_number' => '4111111111111111',
            'card_cvv' => '123',
        ])->assertUnprocessable()->assertJsonValidationErrors(['card_number', 'card_cvv']);

        Sanctum::actingAs($otherUser);
        $this->getJson('/api/addresses')->assertOk()->assertJsonCount(0, 'data');
        $this->patchJson('/api/addresses/'.$address->json('data.id'), ['label' => 'Stolen'])
            ->assertNotFound();
    }

    private function registerCustomer(string $email): string
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Purchase Buyer',
            'email' => $email,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated();

        return $response->json('data.token');
    }

    /** @return array{int, int} */
    private function createAddressAndPayment(string $token): array
    {
        $address = $this->withToken($token)->postJson('/api/addresses', [
            'label' => 'Home',
            'full_name' => 'Purchase Buyer',
            'phone' => '555-0100',
            'line1' => '10 Main Street',
            'city' => 'Seattle',
            'state' => 'WA',
            'postal_code' => '98101',
            'country' => 'US',
        ])->assertCreated()->assertJsonPath('data.is_default', true);

        $paymentMethod = $this->withToken($token)->postJson('/api/payment-methods', [
            'brand' => 'Visa',
            'last4' => '4242',
            'exp_month' => 12,
            'exp_year' => (int) date('Y') + 1,
            'cardholder_name' => 'Purchase Buyer',
        ])->assertCreated()->assertJsonPath('data.is_default', true);

        return [$address->json('data.id'), $paymentMethod->json('data.id')];
    }
}
