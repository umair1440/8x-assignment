<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\SellerProductIndexRequest;
use App\Http\Requests\Api\SellerProductRequest;
use App\Http\Requests\Api\StoreSellerProfileRequest;
use App\Http\Requests\Api\UpdateSellerOrderItemStatusRequest;
use App\Http\Requests\Api\UpdateSellerProfileRequest;
use App\Http\Resources\Api\ApiMessageResource;
use App\Http\Resources\Api\ProductResource;
use App\Http\Resources\Api\SellerOrderItemResource;
use App\Http\Resources\Api\SellerOrderResource;
use App\Http\Resources\Api\SellerProfileResource;
use App\Http\Resources\Api\SellerSummaryResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\SellerProfile;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SellerController extends Controller
{
    public function register(StoreSellerProfileRequest $request): SellerProfileResource|JsonResponse
    {
        $user = $request->user();
        if ($user->sellerProfile()->exists()) {
            return ApiMessageResource::make(['message' => 'A seller profile already exists.'])->response()->setStatusCode(409);
        }

        $data = $request->validated();
        $profile = DB::transaction(function () use ($user, $data): SellerProfile {
            $profile = $user->sellerProfile()->create([
                ...$data,
                'slug' => $this->uniqueStoreSlug($data['store_name']),
            ]);
            $user->update(['role' => 'seller']);

            return $profile;
        });

        return SellerProfileResource::make($profile)->response()->setStatusCode(201);
    }

    public function showStore(): SellerProfileResource
    {
        $profile = SellerProfile::query()->where('user_id', auth()->id())->firstOrFail();

        return SellerProfileResource::make($profile);
    }

    public function updateStore(UpdateSellerProfileRequest $request): SellerProfileResource
    {
        $profile = SellerProfile::query()->where('user_id', auth()->id())->firstOrFail();
        $data = $request->validated();
        if (isset($data['store_name']) && $data['store_name'] !== $profile->store_name) {
            $data['slug'] = $this->uniqueStoreSlug($data['store_name'], $profile->id);
        }
        $profile->fill($data)->save();

        return SellerProfileResource::make($profile->refresh());
    }

    public function summary(): SellerSummaryResource
    {
        $sellerId = auth()->id();
        $start = now()->startOfDay()->subDays(6);
        $end = now()->endOfDay();
        $dailyRows = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('order_items.seller_id', $sellerId)
            ->where('order_items.status', '!=', 'cancelled')
            ->whereBetween('orders.placed_at', [$start, $end])
            ->selectRaw('DATE(orders.placed_at) as revenue_date, SUM(order_items.price_snapshot * order_items.quantity) as revenue')
            ->groupByRaw('DATE(orders.placed_at)')
            ->pluck('revenue', 'revenue_date');
        $lastSevenDays = collect(range(0, 6))->map(function (int $offset) use ($dailyRows, $start): array {
            $date = $start->copy()->addDays($offset)->toDateString();

            return ['date' => $date, 'revenue' => number_format((float) ($dailyRows[$date] ?? 0), 2, '.', '')];
        });
        $recentOrderItems = OrderItem::query()
            ->where('seller_id', auth()->id())
            ->with(['order.user'])
            ->latest()
            ->limit(5)
            ->get();

        return SellerSummaryResource::make([
            'revenue' => number_format((float) OrderItem::query()
                ->where('seller_id', auth()->id())
                ->where('status', '!=', 'cancelled')
                ->sum(DB::raw('price_snapshot * quantity')), 2, '.', ''),
            'order_item_count' => OrderItem::query()->where('seller_id', auth()->id())->count(),
            'product_count' => Product::query()->where('seller_id', auth()->id())->count(),
            'low_stock_count' => Product::query()->where('seller_id', auth()->id())->where('stock', '<', 5)->count(),
            'revenue_last_7_days' => $lastSevenDays,
            'recent_order_items' => $recentOrderItems,
        ]);
    }

    public function indexProducts(SellerProductIndexRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $query = Product::query()->where('seller_id', auth()->id())->with('category');
        if (filled($filters['q'] ?? null)) {
            $term = '%'.$filters['q'].'%';
            $query->where(fn (Builder $products) => $products
                ->where('title', 'like', $term)
                ->orWhere('brand', 'like', $term)
                ->orWhere('sku', 'like', $term));
        }

        return ProductResource::collection($query->latest()->paginate((int) ($filters['per_page'] ?? 20))->withQueryString());
    }

    public function storeProduct(SellerProductRequest $request): ProductResource|JsonResponse
    {
        $product = Product::create([...$request->validated(), 'seller_id' => auth()->id()]);

        return ProductResource::make($product->load('category'))->response()->setStatusCode(201);
    }

    public function updateProduct(SellerProductRequest $request, int $id): ProductResource
    {
        $product = Product::query()->where('seller_id', auth()->id())->findOrFail($id);
        $product->fill($request->validated())->save();

        return ProductResource::make($product->refresh()->load('category'));
    }

    public function destroyProduct(int $id): ApiMessageResource
    {
        Product::query()->where('seller_id', auth()->id())->findOrFail($id)->delete();

        return ApiMessageResource::make(['message' => 'Product deleted.']);
    }

    public function indexOrders(): AnonymousResourceCollection
    {
        $items = OrderItem::query()
            ->where('seller_id', auth()->id())
            ->with(['order.user'])
            ->latest()
            ->paginate(20);

        return SellerOrderItemResource::collection($items);
    }

    public function showOrder(int $id): SellerOrderResource
    {
        $order = Order::query()
            ->whereHas('items', fn (Builder $items) => $items->where('seller_id', auth()->id()))
            ->with([
                'user',
                'items' => fn ($items) => $items->where('seller_id', auth()->id()),
            ])
            ->findOrFail($id);

        return SellerOrderResource::make($order);
    }

    public function updateOrderItemStatus(UpdateSellerOrderItemStatusRequest $request, int $id): SellerOrderItemResource
    {
        $item = DB::transaction(function () use ($request, $id): OrderItem {
            $item = OrderItem::query()->where('seller_id', auth()->id())->lockForUpdate()->findOrFail($id);
            $nextStatus = $request->validated('status');
            $allowed = [
                'placed' => ['packed', 'cancelled'],
                'packed' => ['shipped', 'cancelled'],
                'shipped' => ['delivered'],
            ];

            if (! in_array($nextStatus, $allowed[$item->status] ?? [], true)) {
                throw ValidationException::withMessages(['status' => 'This order item status transition is not allowed.']);
            }

            $changes = ['status' => $nextStatus];
            if ($nextStatus === 'shipped') {
                $changes['shipped_at'] = now();
            } elseif ($nextStatus === 'delivered') {
                $changes['delivered_at'] = now();
            }
            $item->update($changes);

            if ($nextStatus === 'delivered' && ! $item->order->items()->where('status', '!=', 'delivered')->exists()) {
                $item->order->update(['status' => 'delivered']);
            }

            return $item->load(['order.user']);
        });

        return SellerOrderItemResource::make($item);
    }

    private function uniqueStoreSlug(string $storeName, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($storeName) ?: 'store';
        $slug = $baseSlug;
        $suffix = 2;

        while (SellerProfile::query()->where('slug', $slug)->when($ignoreId, fn (Builder $query) => $query->whereKeyNot($ignoreId))->exists()) {
            $slug = $baseSlug.'-'.$suffix++;
        }

        return $slug;
    }
}
