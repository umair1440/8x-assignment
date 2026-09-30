<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CheckoutRequest;
use App\Http\Resources\Api\OrderResource;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    public function store(CheckoutRequest $request): OrderResource|JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $order = DB::transaction(function () use ($user, $data): Order {
            $cart = $user->carts()->lockForUpdate()->firstOrCreate(['user_id' => $user->id]);
            $items = $cart->items()->orderBy('id')->lockForUpdate()->get();

            if ($items->isEmpty()) {
                throw ValidationException::withMessages(['cart' => 'Your cart is empty.']);
            }

            $productIds = $items->pluck('product_id')->unique()->sort()->values();
            $products = Product::query()
                ->whereIn('id', $productIds)
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');
            $quantities = $items->groupBy('product_id')->map(fn ($productItems): int => (int) $productItems->sum('quantity'));

            foreach ($quantities as $productId => $quantity) {
                $product = $products->get($productId);
                if (! $product || $product->status !== 'active') {
                    throw ValidationException::withMessages(['cart' => 'A product in your cart is no longer available.']);
                }
                if ($quantity > $product->stock) {
                    throw ValidationException::withMessages(['cart' => 'A product in your cart no longer has enough stock.']);
                }
            }

            $address = $user->addresses()->lockForUpdate()->findOrFail($data['address_id']);
            $paymentMethod = $user->paymentMethods()->lockForUpdate()->findOrFail($data['payment_method_id']);
            $subtotalCents = $items->sum(fn ($item): int => (int) round((float) $products->get($item->product_id)->price * 100) * $item->quantity);
            $shippingCents = $subtotalCents > 10000 ? 0 : 999;
            $taxCents = (int) round($subtotalCents * 0.08);

            $order = $user->orders()->create([
                'order_number' => 'ORD-'.Str::upper(Str::random(12)),
                'status' => 'placed',
                'subtotal' => $this->money($subtotalCents),
                'shipping_fee' => $this->money($shippingCents),
                'tax' => $this->money($taxCents),
                'total' => $this->money($subtotalCents + $shippingCents + $taxCents),
                'currency' => 'USD',
                'shipping_address' => $address->only([
                    'label', 'full_name', 'phone', 'line1', 'line2', 'city', 'state', 'postal_code', 'country',
                ]),
                'payment_brand' => $paymentMethod->brand,
                'payment_last4' => $paymentMethod->last4,
                'payment_status' => 'paid',
                'placed_at' => now(),
            ]);

            foreach ($items as $item) {
                $product = $products->get($item->product_id);
                $order->items()->create([
                    'product_id' => $product->id,
                    'seller_id' => $product->seller_id,
                    'title_snapshot' => $product->title,
                    'image_snapshot' => $product->image_url,
                    'price_snapshot' => $product->price,
                    'quantity' => $item->quantity,
                    'variant_color' => $item->variant_color,
                    'variant_size' => $item->variant_size,
                    'status' => 'placed',
                ]);
            }

            foreach ($quantities as $productId => $quantity) {
                $product = $products->get($productId);
                $product->update(['stock' => $product->stock - $quantity]);
            }

            $cart->items()->delete();

            return $order;
        });

        return OrderResource::make($order->load('items'))->response()->setStatusCode(201);
    }

    private function money(int $cents): string
    {
        return intdiv($cents, 100).'.'.str_pad((string) ($cents % 100), 2, '0', STR_PAD_LEFT);
    }
}
