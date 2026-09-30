<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreCartItemRequest;
use App\Http\Requests\Api\UpdateCartItemRequest;
use App\Http\Resources\Api\ApiMessageResource;
use App\Http\Resources\Api\CartResource;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    public function show(Request $request): CartResource
    {
        return CartResource::make($this->resolveCart($request)->load('items.product'));
    }

    public function initialize(Request $request): CartResource|JsonResponse
    {
        $createdToken = null;
        if (! $request->user('sanctum') && ! $request->header('X-Cart-Token')) {
            $createdToken = Str::random(64);
            $request->headers->set('X-Cart-Token', $createdToken);
        }

        $response = CartResource::make($this->resolveCart($request)->load('items.product'))->response();

        if ($createdToken !== null) {
            $response->headers->set('X-Cart-Token', $createdToken);
        }

        return $response;
    }

    public function storeItem(StoreCartItemRequest $request): CartResource
    {
        $cart = $this->resolveCart($request);
        $data = $request->validated();
        $color = $data['variant_color'] ?? '';
        $size = $data['variant_size'] ?? '';

        DB::transaction(function () use ($cart, $data, $color, $size): void {
            $product = Product::query()->whereKey($data['product_id'])->lockForUpdate()->first();
            $this->assertProductCanBePurchased($product, $data['quantity']);

            $item = $cart->items()
                ->where('product_id', $product->id)
                ->where('variant_color', $color)
                ->where('variant_size', $size)
                ->lockForUpdate()
                ->first();
            $quantity = ($item?->quantity ?? 0) + $data['quantity'];
            $cartQuantity = (int) $cart->items()->where('product_id', $product->id)->sum('quantity');
            $this->assertProductCanBePurchased($product, $cartQuantity + $data['quantity']);

            if ($item) {
                $item->update(['quantity' => $quantity]);
            } else {
                $cart->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'variant_color' => $color,
                    'variant_size' => $size,
                ]);
            }
        });

        return CartResource::make($cart->fresh()->load('items.product'));
    }

    public function updateItem(UpdateCartItemRequest $request, int $id): CartResource
    {
        $cart = $this->resolveCart($request);
        $item = $cart->items()->with('product')->findOrFail($id);
        $quantity = $request->validated('quantity');

        DB::transaction(function () use ($cart, $item, $quantity): void {
            $product = Product::query()->whereKey($item->product_id)->lockForUpdate()->first();
            $otherQuantity = (int) $cart->items()->where('product_id', $item->product_id)->whereKeyNot($item->id)->sum('quantity');
            $this->assertProductCanBePurchased($product, $otherQuantity + $quantity);
            $item->update(['quantity' => $quantity]);
        });

        return CartResource::make($cart->fresh()->load('items.product'));
    }

    public function destroyItem(Request $request, int $id): ApiMessageResource
    {
        $this->resolveCart($request)->items()->whereKey($id)->firstOrFail()->delete();

        return ApiMessageResource::make(['message' => 'Cart item removed.']);
    }

    public function empty(Request $request): ApiMessageResource
    {
        $this->resolveCart($request)->items()->delete();

        return ApiMessageResource::make(['message' => 'Cart emptied.']);
    }

    public function merge(Request $request): CartResource
    {
        $user = $request->user();
        $cart = $user->carts()->firstOrCreate(['user_id' => $user->id]);
        $token = $request->header('X-Cart-Token');

        if (! $token) {
            return CartResource::make($cart->load('items.product'));
        }

        DB::transaction(function () use ($cart, $token): void {
            $guestCart = Cart::query()->whereNull('user_id')->where('session_token', $token)->lockForUpdate()->first();
            if (! $guestCart) {
                return;
            }

            $guestItems = $guestCart->items()->orderBy('product_id')->orderBy('id')->get();
            $productIds = $guestItems->pluck('product_id')->unique()->sort()->values();
            $products = Product::query()->whereIn('id', $productIds)->orderBy('id')->lockForUpdate()->get()->keyBy('id');
            $totals = $guestItems->groupBy('product_id')->map(fn ($items): int => (int) $items->sum('quantity'));

            foreach ($totals as $productId => $quantity) {
                $existingQuantity = (int) $cart->items()->where('product_id', $productId)->sum('quantity');
                $this->assertProductCanBePurchased($products->get($productId), $existingQuantity + $quantity);
            }

            foreach ($guestItems as $guestItem) {
                $product = $products->get($guestItem->product_id);
                $item = $cart->items()
                    ->where('product_id', $guestItem->product_id)
                    ->where('variant_color', $guestItem->variant_color)
                    ->where('variant_size', $guestItem->variant_size)
                    ->lockForUpdate()
                    ->first();
                $quantity = ($item?->quantity ?? 0) + $guestItem->quantity;
                $this->assertProductCanBePurchased($product, $quantity);

                if ($item) {
                    $item->update(['quantity' => $quantity]);
                } else {
                    $cart->items()->create([
                        'product_id' => $guestItem->product_id,
                        'quantity' => $guestItem->quantity,
                        'variant_color' => $guestItem->variant_color,
                        'variant_size' => $guestItem->variant_size,
                    ]);
                }
            }

            $guestCart->delete();
        });

        return CartResource::make($cart->fresh()->load('items.product'));
    }

    private function resolveCart(Request $request): Cart
    {
        if ($user = $request->user('sanctum')) {
            return $user->carts()->firstOrCreate(['user_id' => $user->id]);
        }

        $token = $request->header('X-Cart-Token');
        if (! $token) {
            throw ValidationException::withMessages(['X-Cart-Token' => 'Initialize a guest cart first.']);
        }

        return Cart::query()->firstOrCreate(['session_token' => $token], ['user_id' => null]);
    }

    private function assertProductCanBePurchased(?Product $product, int $quantity): void
    {
        if (! $product || $product->status !== 'active') {
            throw ValidationException::withMessages(['product_id' => 'This product is not available.']);
        }

        if ($quantity > $product->stock) {
            throw ValidationException::withMessages(['quantity' => 'The requested quantity exceeds available stock.']);
        }
    }
}
