<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\OrderIndexRequest;
use App\Http\Resources\Api\ApiMessageResource;
use App\Http\Resources\Api\OrderResource;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(OrderIndexRequest $request): AnonymousResourceCollection
    {
        $perPage = (int) $request->validated('per_page', 20);

        return OrderResource::collection(
            $request->user()->orders()->latest('placed_at')->paginate($perPage)->withQueryString(),
        );
    }

    public function show(Request $request, int $id): OrderResource
    {
        $order = $request->user()->orders()->with('items')->findOrFail($id);

        return OrderResource::make($order);
    }

    public function cancel(Request $request, int $id): OrderResource|JsonResponse
    {
        $user = $request->user();
        $cancelled = DB::transaction(function () use ($user, $id): ?Order {
            $order = $user->orders()->lockForUpdate()->findOrFail($id);
            $items = $order->items()->lockForUpdate()->get();

            if ($items->isEmpty() || $items->contains(fn ($item): bool => $item->status !== 'placed')) {
                return null;
            }

            $quantities = $items->whereNotNull('product_id')->groupBy('product_id')
                ->map(fn ($productItems): int => (int) $productItems->sum('quantity'));
            $products = Product::withTrashed()
                ->whereIn('id', $quantities->keys())
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($quantities as $productId => $quantity) {
                if ($product = $products->get($productId)) {
                    $product->update(['stock' => $product->stock + $quantity]);
                }
            }

            $order->items()->update(['status' => 'cancelled']);
            $order->update(['status' => 'cancelled']);

            return $order->load('items');
        });

        if (! $cancelled) {
            return ApiMessageResource::make(['message' => 'This order can no longer be cancelled.'])
                ->response()->setStatusCode(409);
        }

        return OrderResource::make($cancelled);
    }
}
