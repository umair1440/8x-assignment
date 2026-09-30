<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\Review;
use App\Models\SellerProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StoreSeeder extends Seeder
{
    private array $categoryDefinitions = [
        ['name' => 'Electronics', 'slug' => 'electronics', 'source' => ['laptops']],
        ['name' => 'Mobile Accessories', 'slug' => 'mobile-accessories', 'source' => ['mobile-accessories']],
        ['name' => "Men's Shirts", 'slug' => 'mens-shirts', 'source' => ['mens-shirts']],
        ['name' => "Men's Shoes", 'slug' => 'mens-shoes', 'source' => ['mens-shoes']],
        ['name' => "Men's Watches", 'slug' => 'mens-watches', 'source' => ['mens-watches']],
        ['name' => 'Beauty & Fragrance', 'slug' => 'beauty-fragrance', 'source' => ['beauty', 'fragrances']],
        ['name' => 'Home & Furniture', 'slug' => 'home-furniture', 'source' => ['furniture', 'home-decoration']],
        ['name' => 'Kitchen & Dining', 'slug' => 'kitchen-dining', 'source' => ['kitchen-accessories']],
        ['name' => 'Groceries', 'slug' => 'groceries', 'source' => ['groceries']],
    ];

    public function run(): void
    {
        $datasetPath = database_path('seeders/data/products.json');

        if (! File::exists($datasetPath)) {
            throw new \RuntimeException('Missing offline product snapshot at database/seeders/data/products.json.');
        }

        $dataset = json_decode(File::get($datasetPath), true, 512, JSON_THROW_ON_ERROR);
        $sourceProducts = $dataset['products'] ?? [];

        if (count($sourceProducts) < 100) {
            throw new \RuntimeException('The offline product snapshot must contain at least 100 products.');
        }

        $users = $this->seedUsers();
        $seller = $users['seller'];
        $categoryMap = $this->seedCategories($sourceProducts);
        $products = $this->seedProducts($sourceProducts, $categoryMap, $seller);
        $this->seedReviews($sourceProducts, $products, $users['reviewers']);
        $this->seedCustomerDetails($users['customer']);
        $this->seedCustomerOrders($users['customer'], $products);
        $this->seedAdditionalCustomerOrders($users['extraCustomers'], $products);
    }

    private function seedUsers(): array
    {
        $password = Hash::make('password');

        $admin = User::updateOrCreate(
            ['email' => 'admin@elite.test'],
            ['name' => 'Elite Admin', 'password' => $password, 'role' => 'admin', 'auth_provider' => 'email', 'email_verified_at' => now()],
        );

        $seller = User::updateOrCreate(
            ['email' => 'seller@elite.test'],
            ['name' => 'Elite Seller', 'password' => $password, 'role' => 'seller', 'auth_provider' => 'email', 'email_verified_at' => now()],
        );

        SellerProfile::updateOrCreate(
            ['user_id' => $seller->id],
            [
                'store_name' => 'Elite Audio Market',
                'slug' => 'elite-audio-market',
                'description' => 'Curated audio, accessories, and everyday essentials.',
                'logo_url' => 'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp',
                'contact_email' => 'seller@elite.test',
                'phone' => '+1 415 555 0100',
                'status' => 'active',
            ],
        );

        $customer = User::updateOrCreate(
            ['email' => 'customer@elite.test'],
            ['name' => 'Casey Customer', 'password' => $password, 'role' => 'customer', 'auth_provider' => 'email', 'email_verified_at' => now()],
        );

        $extraCustomers = [];
        for ($index = 1; $index <= 20; $index++) {
            $extraCustomers[] = User::updateOrCreate(
                ['email' => sprintf('customer%02d@elite.test', $index)],
                [
                    'name' => sprintf('Demo Customer %02d', $index),
                    'password' => $password,
                    'phone' => sprintf('+1 415 555 %04d', 2000 + $index),
                    'role' => 'customer',
                    'auth_provider' => 'email',
                    'email_verified_at' => now()->subDays($index),
                ],
            );
        }

        return [
            'admin' => $admin,
            'seller' => $seller,
            'customer' => $customer,
            'extraCustomers' => $extraCustomers,
            'reviewers' => array_merge([$customer], $extraCustomers),
        ];
    }

    private function seedCategories(array $sourceProducts): array
    {
        $categoryMap = [];

        foreach ($this->categoryDefinitions as $definition) {
            $categorySource = collect($sourceProducts)->first(
                fn (array $product) => in_array($product['category'] ?? '', $definition['source'], true),
            );

            $category = Category::updateOrCreate(
                ['slug' => $definition['slug']],
                [
                    'parent_id' => null,
                    'name' => $definition['name'],
                    'image_url' => $categorySource['thumbnail'] ?? null,
                    'sort_order' => count($categoryMap),
                ],
            );

            foreach ($definition['source'] as $sourceCategory) {
                $categoryMap[$sourceCategory] = $category;
            }
        }

        return $categoryMap;
    }

    private function seedProducts(array $sourceProducts, array $categoryMap, User $seller): array
    {
        $products = [];

        foreach ($sourceProducts as $index => $source) {
            $sourceCategory = $source['category'] ?? '';
            $category = $categoryMap[$sourceCategory] ?? reset($categoryMap);
            $title = trim($source['title'] ?? 'Store product');
            $sku = $source['sku'] ?? sprintf('DUMMY-%04d', $source['id'] ?? $index + 1);
            $existingProduct = Product::where('sku', $sku)->first();
            $slug = $existingProduct?->slug ?? $this->uniqueSlug(
                $source['slug'] ?? Str::slug($title),
                (int) ($source['id'] ?? $index + 1),
            );
            $price = max(0.01, (float) ($source['price'] ?? 0));
            $discount = min(80, max(1, (float) ($source['discountPercentage'] ?? 15)));
            $oldPrice = round($price / (1 - ($discount / 100)), 2);
            $stock = strtolower($source['availabilityStatus'] ?? '') === 'out of stock'
                ? 0
                : max(0, (int) ($source['stock'] ?? 0));
            $isWearable = in_array($sourceCategory, ['mens-shirts', 'mens-shoes', 'mens-watches'], true);

            $product = Product::updateOrCreate(
                ['sku' => $sku],
                [
                    'seller_id' => $index < 15 ? $seller->id : null,
                    'category_id' => $category->id,
                    'title' => $title,
                    'slug' => $slug,
                    'description' => $source['description'] ?? null,
                    'price' => $price,
                    'old_price' => $oldPrice,
                    'brand' => $source['brand'] ?? null,
                    'stock' => $stock,
                    'image_url' => $source['thumbnail'] ?? ($source['images'][0] ?? null),
                    'images' => array_values($source['images'] ?? []),
                    'colors' => $isWearable ? ['Black', 'Blue', 'White'] : [],
                    'sizes' => $sourceCategory === 'mens-shirts' ? ['S', 'M', 'L', 'XL'] : ($sourceCategory === 'mens-shoes' ? ['7', '8', '9', '10', '11'] : []),
                    'rating_avg' => 0,
                    'rating_count' => 0,
                    'status' => 'active',
                    'is_featured' => $index < 10,
                    'is_deal' => $index < 12,
                    'deal_ends_at' => $index < 12 ? now()->addDays(3 + ($index % 5)) : null,
                ],
            );

            $products[] = $product;
        }

        return $products;
    }

    private function uniqueSlug(string $baseSlug, int $sourceId): string
    {
        $baseSlug = Str::slug($baseSlug) ?: 'product-'.$sourceId;
        $slug = $baseSlug;
        $suffix = $sourceId;

        while (Product::where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$suffix++;
        }

        return $slug;
    }

    private function seedReviews(array $sourceProducts, array $products, array $reviewers): void
    {
        foreach ($products as $index => $product) {
            $source = $sourceProducts[$index];
            $sourceReviews = $source['reviews'] ?? [];
            $reviewTotal = 2 + ($index % 4);
            $reviewerIds = [];

            for ($reviewIndex = 0; $reviewIndex < $reviewTotal; $reviewIndex++) {
                $reviewer = $reviewers[($index * 5 + $reviewIndex) % count($reviewers)];
                $reviewerIds[] = $reviewer->id;
                $sourceReview = $sourceReviews[$reviewIndex % max(1, count($sourceReviews))] ?? [];
                $rating = (int) ($sourceReview['rating'] ?? round((float) ($source['rating'] ?? 4)));
                $rating = min(5, max(1, $rating));

                Review::updateOrCreate(
                    ['product_id' => $product->id, 'user_id' => $reviewer->id],
                    [
                        'rating' => $rating,
                        'title' => sprintf('Demo review %d', $reviewIndex + 1),
                        'body' => $sourceReview['comment'] ?? 'A helpful demo review for this product.',
                    ],
                );
            }

            $product->reviews()->where('title', 'like', 'Demo review %')->whereNotIn('user_id', $reviewerIds)->delete();
            $product->rating_count = $product->reviews()->count();
            $product->rating_avg = (float) ($product->reviews()->avg('rating') ?? 0);
            $product->save();
        }
    }

    private function seedCustomerDetails(User $customer): void
    {
        Address::updateOrCreate(
            ['user_id' => $customer->id, 'label' => 'Home'],
            ['full_name' => $customer->name, 'phone' => '+1 415 555 0198', 'line1' => '58 Market Street', 'line2' => null, 'city' => 'San Francisco', 'state' => 'CA', 'postal_code' => '94105', 'country' => 'United States', 'is_default' => true],
        );

        Address::updateOrCreate(
            ['user_id' => $customer->id, 'label' => 'Work'],
            ['full_name' => $customer->name, 'phone' => '+1 415 555 0198', 'line1' => '400 Howard Street', 'line2' => 'Suite 220', 'city' => 'San Francisco', 'state' => 'CA', 'postal_code' => '94105', 'country' => 'United States', 'is_default' => false],
        );

        PaymentMethod::updateOrCreate(
            ['user_id' => $customer->id, 'brand' => 'Visa', 'last4' => '4242'],
            ['exp_month' => 12, 'exp_year' => now()->year + 3, 'cardholder_name' => $customer->name, 'is_default' => true],
        );
    }

    private function seedCustomerOrders(User $customer, array $products): void
    {
        $scenarios = [
            ['number' => 'EL-2026-1001', 'status' => 'delivered', 'days' => 22, 'item_status' => 'delivered'],
            ['number' => 'EL-2026-1002', 'status' => 'shipped', 'days' => 7, 'item_status' => 'shipped'],
            ['number' => 'EL-2026-1003', 'status' => 'placed', 'days' => 1, 'item_status' => 'packed'],
        ];

        foreach ($scenarios as $index => $scenario) {
            $placedAt = now()->subDays($scenario['days']);
            $items = [
                [$products[$index], $index + 1],
                [$products[($index + 5) % count($products)], 1],
            ];
            $this->createOrder($customer, $scenario['number'], $scenario['status'], $placedAt, $items, $scenario['item_status']);
        }
    }

    private function seedAdditionalCustomerOrders(array $customers, array $products): void
    {
        $statuses = ['placed', 'packed', 'shipped', 'delivered', 'cancelled'];

        foreach ($customers as $customerIndex => $customer) {
            $orderCount = $customerIndex % 4;

            for ($orderIndex = 0; $orderIndex < $orderCount; $orderIndex++) {
                $orderNumber = sprintf('EL-DEMO-%02d-%02d', $customerIndex + 1, $orderIndex + 1);
                $status = $statuses[($customerIndex + $orderIndex) % count($statuses)];
                $placedAt = now()->subDays(2 + ($customerIndex * 3) + ($orderIndex * 8));
                $items = [
                    [$products[($customerIndex * 3 + $orderIndex) % count($products)], 1 + (($customerIndex + $orderIndex) % 2)],
                    [$products[($customerIndex * 7 + $orderIndex + 9) % count($products)], 1],
                ];

                $this->createOrder($customer, $orderNumber, $status === 'packed' ? 'placed' : $status, $placedAt, $items, $status);
            }
        }
    }

    private function createOrder(User $user, string $number, string $status, $placedAt, array $items, string $itemStatus): Order
    {
        $subtotal = collect($items)->sum(fn (array $line) => (float) $line[0]->price * $line[1]);
        $shippingFee = $subtotal >= 75 ? 0 : 6.99;
        $address = [
            'full_name' => $user->name,
            'phone' => $user->phone ?? '+1 415 555 0100',
            'line1' => '58 Market Street',
            'line2' => null,
            'city' => 'San Francisco',
            'state' => 'CA',
            'postal_code' => '94105',
            'country' => 'United States',
        ];
        $order = Order::updateOrCreate(
            ['order_number' => $number],
            [
                'user_id' => $user->id,
                'status' => $status,
                'subtotal' => $subtotal,
                'shipping_fee' => $shippingFee,
                'tax' => 0,
                'total' => $subtotal + $shippingFee,
                'currency' => 'USD',
                'shipping_address' => $address,
                'payment_brand' => 'Visa',
                'payment_last4' => '4242',
                'payment_status' => $status === 'cancelled' ? 'refunded' : 'paid',
                'placed_at' => $placedAt,
            ],
        );

        $order->items()->delete();
        foreach ($items as [$product, $quantity]) {
            $order->items()->create([
                'product_id' => $product->id,
                'seller_id' => $product->seller_id,
                'title_snapshot' => $product->title,
                'image_snapshot' => $product->image_url,
                'price_snapshot' => $product->price,
                'quantity' => $quantity,
                'variant_color' => '',
                'variant_size' => '',
                'status' => $itemStatus,
                'shipped_at' => in_array($itemStatus, ['shipped', 'delivered'], true) ? $placedAt->copy()->addDay() : null,
                'delivered_at' => $itemStatus === 'delivered' ? $placedAt->copy()->addDays(3) : null,
            ]);
        }

        return $order;
    }
}