<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdminProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SellerController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Resources\Api\HealthResource;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => HealthResource::make(['status' => 'ok']));

Route::prefix('auth')->middleware('throttle:auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/demo-google', [AuthController::class, 'demoGoogle']);
});

Route::get('/cart', [CartController::class, 'show']);
Route::post('/cart', [CartController::class, 'initialize']);
Route::post('/cart/items', [CartController::class, 'storeItem']);
Route::patch('/cart/items/{id}', [CartController::class, 'updateItem']);
Route::delete('/cart/items/{id}', [CartController::class, 'destroyItem']);
Route::delete('/cart', [CartController::class, 'empty']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::patch('/user', [UserController::class, 'update']);
    Route::patch('/user/password', [UserController::class, 'updatePassword']);
    Route::post('/products/{slug}/reviews', [ReviewController::class, 'store']);
    Route::post('/cart/merge', [CartController::class, 'merge']);
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/{product_id}', [WishlistController::class, 'toggle']);
    Route::delete('/wishlist', [WishlistController::class, 'destroy']);
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::patch('/addresses/{id}', [AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);
    Route::get('/payment-methods', [PaymentMethodController::class, 'index']);
    Route::post('/payment-methods', [PaymentMethodController::class, 'store']);
    Route::patch('/payment-methods/{id}/default', [PaymentMethodController::class, 'setDefault']);
    Route::delete('/payment-methods/{id}', [PaymentMethodController::class, 'destroy']);
    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
});

Route::post('/seller/register', [SellerController::class, 'register'])
    ->middleware(['auth:sanctum', 'role:customer']);

Route::prefix('seller')->middleware(['auth:sanctum', 'role:seller,admin'])->group(function (): void {
    Route::get('/store', [SellerController::class, 'showStore']);
    Route::patch('/store', [SellerController::class, 'updateStore']);
    Route::get('/summary', [SellerController::class, 'summary']);
    Route::get('/products', [SellerController::class, 'indexProducts']);
    Route::post('/products', [SellerController::class, 'storeProduct']);
    Route::patch('/products/{id}', [SellerController::class, 'updateProduct']);
    Route::delete('/products/{id}', [SellerController::class, 'destroyProduct']);
    Route::get('/orders', [SellerController::class, 'indexOrders']);
    Route::get('/orders/{id}', [SellerController::class, 'showOrder']);
    Route::patch('/order-items/{id}/status', [SellerController::class, 'updateOrderItemStatus']);
});

Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function (): void {
    Route::get('/summary', [AdminController::class, 'summary']);
    Route::get('/users', [AdminController::class, 'indexUsers']);
    Route::get('/users/{id}', [AdminController::class, 'showUser']);
    Route::get('/orders', [AdminController::class, 'indexOrders']);
    Route::get('/orders/{id}', [AdminController::class, 'showOrder']);
    Route::patch('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);
    Route::get('/products', [AdminProductController::class, 'index']);
    Route::post('/products', [AdminProductController::class, 'store']);
    Route::patch('/products/{id}', [AdminProductController::class, 'update']);
    Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);
});

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/home', [HomeController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}/reviews', [ReviewController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
