<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\SellerProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RolesTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_is_forbidden_from_seller_and_admin_apis(): void
    {
        $customer = $this->user('customer');
        Sanctum::actingAs($customer);

        $this->getJson('/api/seller/summary')->assertForbidden();
        $this->getJson('/api/admin/summary')->assertForbidden();
    }

    public function test_customer_can_register_as_a_seller(): void
    {
        $customer = $this->user('customer');
        Sanctum::actingAs($customer);

        $this->postJson('/api/seller/register', ['store_name' => 'Northwind Audio'])
            ->assertCreated()
            ->assertJsonPath('data.store_name', 'Northwind Audio');

        $this->assertSame('seller', $customer->fresh()->role);
        $this->assertDatabaseHas('seller_profiles', ['user_id' => $customer->id, 'slug' => 'northwind-audio']);
    }

    public function test_seller_cannot_edit_another_sellers_product(): void
    {
        $sellerA = $this->user('seller');
        $sellerB = $this->user('seller');
        SellerProfile::create(['user_id' => $sellerA->id, 'store_name' => 'Seller A', 'slug' => 'seller-a']);
        SellerProfile::create(['user_id' => $sellerB->id, 'store_name' => 'Seller B', 'slug' => 'seller-b']);
        $category = Category::create(['name' => 'Audio', 'slug' => 'audio', 'sort_order' => 1]);
        $product = Product::create([
            'seller_id' => $sellerB->id,
            'category_id' => $category->id,
            'title' => 'Seller B Product',
            'price' => 20,
            'stock' => 2,
            'status' => 'active',
        ]);
        Sanctum::actingAs($sellerA);

        $this->patchJson('/api/seller/products/'.$product->id, ['title' => 'Stolen Update'])
            ->assertNotFound();

        $this->assertSame('Seller B Product', $product->fresh()->title);
    }

    public function test_seller_can_manage_only_its_store_and_products(): void
    {
        $sellerA = $this->seller('Original Store');
        $sellerB = $this->seller('Other Store');
        $category = Category::create(['name' => 'Audio', 'slug' => 'audio', 'sort_order' => 1]);
        $otherProduct = $this->product($category, $sellerB, 'Other Seller Product');
        Sanctum::actingAs($sellerA);

        $this->getJson('/api/seller/store')->assertOk()->assertJsonPath('data.store_name', 'Original Store');
        $this->patchJson('/api/seller/store', ['store_name' => 'Updated Store'])
            ->assertOk()->assertJsonPath('data.slug', 'updated-store');
        $this->postJson('/api/seller/products', [
            'seller_id' => $sellerB->id,
            'category_id' => $category->id,
            'title' => 'Invalid Seller Assignment',
            'price' => 10,
            'stock' => 3,
        ])->assertUnprocessable()->assertJsonValidationErrors('seller_id');

        $created = $this->postJson('/api/seller/products', [
            'category_id' => $category->id,
            'title' => 'Own Seller Product',
            'price' => 10,
            'stock' => 3,
            'status' => 'draft',
        ])->assertCreated()->assertJsonPath('data.status', 'draft');
        $productId = $created->json('data.id');
        $this->assertDatabaseHas('products', ['id' => $productId, 'seller_id' => $sellerA->id]);
        $this->getJson('/api/seller/products?q=Seller')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $productId);
        $this->patchJson('/api/seller/products/'.$productId, ['status' => 'active'])
            ->assertOk()->assertJsonPath('data.status', 'active');
        $this->deleteJson('/api/seller/products/'.$productId)->assertOk();
        $this->assertSoftDeleted('products', ['id' => $productId]);
        $this->assertDatabaseHas('products', ['id' => $otherProduct->id, 'seller_id' => $sellerB->id]);
    }

    public function test_admin_can_list_users(): void
    {
        $customer = $this->user('customer');
        $admin = $this->user('admin');
        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/users')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['email' => $customer->email]);
    }

    public function test_seller_order_items_are_scoped_and_follow_allowed_status_transitions(): void
    {
        $sellerA = $this->seller('Seller A');
        $sellerB = $this->seller('Seller B');
        $buyer = $this->user('customer');
        $category = Category::create(['name' => 'Audio', 'slug' => 'audio', 'sort_order' => 1]);
        $productA = $this->product($category, $sellerA, 'Seller A Headphones');
        $productB = $this->product($category, $sellerB, 'Seller B Headphones');
        $order = $this->order($buyer, 'ORD-SELLER-1');
        $itemA = $this->orderItem($order, $productA, $sellerA);
        $itemB = $this->orderItem($order, $productB, $sellerB);
        $otherSellerOrder = $this->order($buyer, 'ORD-SELLER-B-ONLY');
        $otherSellerItem = $this->orderItem($otherSellerOrder, $productB, $sellerB);
        Sanctum::actingAs($sellerA);

        $this->getJson('/api/seller/orders')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $itemA->id)
            ->assertJsonPath('data.0.order_number', 'ORD-SELLER-1')
            ->assertJsonPath('data.0.buyer.name', $buyer->name)
            ->assertJsonPath('data.0.shipping_address.line1', '10 Main Street');
        $this->getJson('/api/seller/orders/'.$order->id)
            ->assertOk()
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.items.0.id', $itemA->id);
        $this->getJson('/api/seller/orders/'.$otherSellerOrder->id)->assertNotFound();
        $this->patchJson('/api/seller/order-items/'.$itemB->id.'/status', ['status' => 'packed'])
            ->assertNotFound();
        $this->assertDatabaseHas('order_items', ['id' => $otherSellerItem->id, 'seller_id' => $sellerB->id, 'status' => 'placed']);
        $this->patchJson('/api/seller/order-items/'.$itemA->id.'/status', ['status' => 'shipped'])
            ->assertUnprocessable();

        $this->patchJson('/api/seller/order-items/'.$itemA->id.'/status', ['status' => 'packed'])
            ->assertOk()->assertJsonPath('data.status', 'packed');
        $this->patchJson('/api/seller/order-items/'.$itemA->id.'/status', ['status' => 'shipped'])
            ->assertOk()->assertJsonPath('data.status', 'shipped');
        $this->assertNotNull($itemA->fresh()->shipped_at);
        $this->patchJson('/api/seller/order-items/'.$itemA->id.'/status', ['status' => 'delivered'])
            ->assertOk()->assertJsonPath('data.status', 'delivered');
        $this->assertSame('placed', $order->fresh()->status);

        Sanctum::actingAs($sellerB);
        foreach (['packed', 'shipped', 'delivered'] as $status) {
            $this->patchJson('/api/seller/order-items/'.$itemB->id.'/status', ['status' => $status])->assertOk();
        }
        $this->assertNotNull($itemB->fresh()->delivered_at);
        $this->assertSame('delivered', $order->fresh()->status);
    }

    public function test_seller_summary_aggregates_only_the_authenticated_sellers_data(): void
    {
        $sellerA = $this->seller('Seller A');
        $sellerB = $this->seller('Seller B');
        $buyer = $this->user('customer');
        $category = Category::create(['name' => 'Audio', 'slug' => 'audio', 'sort_order' => 1]);
        $productA = $this->product($category, $sellerA, 'Low Stock Item', 4);
        $this->product($category, $sellerA, 'Healthy Stock Item', 8);
        $productB = $this->product($category, $sellerB, 'Other Seller Item', 1);
        $order = $this->order($buyer, 'ORD-SUMMARY-1', now()->subDays(2));
        $this->orderItem($order, $productA, $sellerA, 2, 10);
        $this->orderItem($order, $productB, $sellerB, 1, 90);
        Sanctum::actingAs($sellerA);

        $this->getJson('/api/seller/summary')
            ->assertOk()
            ->assertJsonPath('data.revenue', '20.00')
            ->assertJsonPath('data.order_item_count', 1)
            ->assertJsonPath('data.product_count', 2)
            ->assertJsonPath('data.low_stock_count', 1)
            ->assertJsonCount(7, 'data.revenue_last_7_days')
            ->assertJsonPath('data.revenue_last_7_days.4.revenue', '20.00')
            ->assertJsonPath('data.recent_order_items.0.order_number', 'ORD-SUMMARY-1');
    }

    public function test_admin_can_view_summaries_manage_orders_and_crud_products_across_sellers(): void
    {
        $admin = $this->user('admin');
        $buyer = $this->user('customer');
        $seller = $this->seller('Store Owner');
        $category = Category::create(['name' => 'Audio', 'slug' => 'audio', 'sort_order' => 1]);
        $existingProduct = $this->product($category, $seller, 'Existing Admin Product');
        $order = $this->order($buyer, 'ORD-ADMIN-1', now());
        $this->orderItem($order, $existingProduct, $seller);
        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/summary')
            ->assertOk()
            ->assertJsonPath('data.total_revenue', '100.00')
            ->assertJsonPath('data.orders_count', 1)
            ->assertJsonPath('data.users_count', 3)
            ->assertJsonPath('data.products_count', 1)
            ->assertJsonCount(7, 'data.revenue_last_7_days')
            ->assertJsonPath('data.latest_orders.0.order_number', 'ORD-ADMIN-1');
        $this->getJson('/api/admin/orders?q=ORD-ADMIN&status=placed')
            ->assertOk()->assertJsonPath('data.0.buyer.name', $buyer->name);
        $this->getJson('/api/admin/users?q='.urlencode($buyer->name))
            ->assertOk()
            ->assertJsonPath('data.0.orders_count', 1)
            ->assertJsonPath('data.0.total_spent', '100.00');
        $this->getJson('/api/admin/orders/'.$order->id)
            ->assertOk()->assertJsonCount(1, 'data.items');
        $this->patchJson('/api/admin/orders/'.$order->id.'/status', ['status' => 'shipped'])
            ->assertOk()->assertJsonPath('data.status', 'shipped');

        $created = $this->postJson('/api/admin/products', [
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'title' => 'Admin Created Product',
            'price' => 15,
            'stock' => 6,
            'status' => 'draft',
        ])->assertCreated()->assertJsonPath('data.seller.id', $seller->id);
        $productId = $created->json('data.id');
        $this->getJson('/api/admin/products?q=Admin+Created')
            ->assertOk()->assertJsonPath('data.0.id', $productId);
        $this->patchJson('/api/admin/products/'.$productId, ['title' => 'Admin Updated Product'])
            ->assertOk()->assertJsonPath('data.title', 'Admin Updated Product');
        $this->deleteJson('/api/admin/products/'.$productId)->assertOk();
        $this->assertSoftDeleted('products', ['id' => $productId]);
    }

    private function seller(string $storeName): User
    {
        $seller = $this->user('seller');
        SellerProfile::create([
            'user_id' => $seller->id,
            'store_name' => $storeName,
            'slug' => strtolower(str_replace(' ', '-', $storeName)),
        ]);

        return $seller;
    }

    private function product(Category $category, User $seller, string $title, int $stock = 5): Product
    {
        return Product::create([
            'seller_id' => $seller->id,
            'category_id' => $category->id,
            'title' => $title,
            'price' => 10,
            'stock' => $stock,
            'status' => 'active',
        ]);
    }

    private function order(User $buyer, string $orderNumber, $placedAt = null): Order
    {
        return Order::create([
            'user_id' => $buyer->id,
            'order_number' => $orderNumber,
            'status' => 'placed',
            'subtotal' => 100,
            'shipping_fee' => 0,
            'tax' => 0,
            'total' => 100,
            'currency' => 'USD',
            'shipping_address' => ['line1' => '10 Main Street'],
            'placed_at' => $placedAt ?? now(),
        ]);
    }

    private function orderItem(Order $order, Product $product, User $seller, int $quantity = 1, float $price = 10): OrderItem
    {
        return OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'seller_id' => $seller->id,
            'title_snapshot' => $product->title,
            'price_snapshot' => $price,
            'quantity' => $quantity,
            'status' => 'placed',
        ]);
    }

    private function user(string $role): User
    {
        return User::create([
            'name' => ucfirst($role),
            'email' => $role.'-'.uniqid().'@example.test',
            'password' => 'password123',
            'role' => $role,
            'auth_provider' => 'email',
        ]);
    }
}
