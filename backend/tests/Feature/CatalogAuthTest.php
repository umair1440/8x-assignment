<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CatalogAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_register_and_receive_a_bearer_token(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Catalog Buyer',
            'email' => 'buyer@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '+1 415 555 0199',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.name', 'Catalog Buyer')
            ->assertJsonPath('data.user.email', 'buyer@example.test')
            ->assertJsonPath('data.user.role', 'customer')
            ->assertJsonPath('data.token_type', 'Bearer')
            ->assertJsonStructure(['data' => ['user', 'token', 'token_type']]);

        $this->assertDatabaseHas('users', ['email' => 'buyer@example.test', 'auth_provider' => 'email']);
    }

    public function test_customer_can_login_and_failed_login_is_generic(): void
    {
        User::create([
            'name' => 'Existing Buyer',
            'email' => 'existing@example.test',
            'password' => 'password123',
            'role' => 'customer',
            'auth_provider' => 'email',
        ]);

        $this->postJson('/api/auth/login', ['email' => 'existing@example.test', 'password' => 'password123'])
            ->assertOk()
            ->assertJsonPath('data.user.email', 'existing@example.test')
            ->assertJsonPath('data.token_type', 'Bearer');

        $this->postJson('/api/auth/login', ['email' => 'existing@example.test', 'password' => 'wrong-password'])
            ->assertUnauthorized()
            ->assertJsonPath('data.message', 'Invalid credentials.');
    }

    public function test_protected_user_endpoint_returns_json_401_without_a_token(): void
    {
        $response = $this->get('/api/user');

        $response->assertUnauthorized()
            ->assertHeader('content-type', 'application/json')
            ->assertJsonPath('message', 'Unauthenticated.');
    }

    public function test_product_filters_and_price_sort_are_applied(): void
    {
        $category = Category::create(['name' => 'Audio', 'slug' => 'audio', 'sort_order' => 1]);
        $this->createProduct($category, 'JBL Speaker', 'jbl-speaker', 'JBL', 150, 4.8);
        $this->createProduct($category, 'Sony Speaker', 'sony-speaker', 'Sony', 100, 4.5);
        $this->createProduct($category, 'JBL Table Speaker', 'jbl-table-speaker', 'JBL', 45, 4.9);

        $response = $this->getJson('/api/products?q=Speaker&category=audio&brand=JBL%2CSony&min=60&max=160&rating=4&sort=price_asc&per_page=48');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.title', 'Sony Speaker')
            ->assertJsonPath('data.1.title', 'JBL Speaker');
    }

    public function test_authenticated_customer_can_review_a_product_and_update_rating_aggregate(): void
    {
        $category = Category::create(['name' => 'Audio', 'slug' => 'audio', 'sort_order' => 1]);
        $product = $this->createProduct($category, 'Review Speaker', 'review-speaker', 'JBL', 99, 4);
        $user = User::create([
            'name' => 'Reviewer',
            'email' => 'reviewer@example.test',
            'password' => 'password123',
            'role' => 'customer',
            'auth_provider' => 'email',
        ]);
        Sanctum::actingAs($user);

        $this->postJson('/api/products/review-speaker/reviews', [
            'rating' => 5,
            'title' => 'Great sound',
            'body' => 'Clear audio and excellent battery life.',
        ])->assertCreated()->assertJsonPath('data.rating', 5);

        $this->assertDatabaseHas('reviews', ['product_id' => $product->id, 'user_id' => $user->id, 'rating' => 5]);
        $this->assertSame('5.00', $product->fresh()->rating_avg);
        $this->assertSame(1, $product->fresh()->rating_count);
    }

    private function createProduct(Category $category, string $title, string $slug, string $brand, float $price, float $rating): Product
    {
        return Product::create([
            'category_id' => $category->id,
            'title' => $title,
            'slug' => $slug,
            'price' => $price,
            'brand' => $brand,
            'stock' => 5,
            'rating_avg' => $rating,
            'rating_count' => 1,
            'status' => 'active',
        ]);
    }
}