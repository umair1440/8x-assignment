<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ProductIndexRequest;
use App\Http\Resources\Api\ProductResource;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function index(ProductIndexRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $query = Product::query()
            ->where('status', 'active')
            ->with(['category', 'seller.sellerProfile']);

        if (filled($filters['q'] ?? null)) {
            $term = '%'.$filters['q'].'%';
            $query->where(function (Builder $query) use ($term): void {
                $query->where('title', 'like', $term)
                    ->orWhere('brand', 'like', $term)
                    ->orWhereHas('category', fn (Builder $category) => $category->where('name', 'like', $term));
            });
        }

        if (filled($filters['category'] ?? null)) {
            $query->whereHas('category', fn (Builder $category) => $category->where('slug', $filters['category']));
        }

        $brands = $filters['brand'] ?? [];
        $brands = is_array($brands) ? $brands : explode(',', $brands);
        $brands = array_values(array_filter(array_map('trim', $brands)));
        if ($brands !== []) {
            $query->whereIn('brand', $brands);
        }

        if (array_key_exists('min', $filters)) {
            $query->where('price', '>=', $filters['min']);
        }
        if (array_key_exists('max', $filters)) {
            $query->where('price', '<=', $filters['max']);
        }
        if (array_key_exists('rating', $filters)) {
            $query->where('rating_avg', '>=', $filters['rating']);
        }
        if ($request->boolean('in_stock') || $request->boolean('stock')) {
            $query->where('stock', '>', 0);
        }
        if ($request->boolean('deal')) {
            $query->where('is_deal', true)->where(fn (Builder $query) => $query->whereNull('deal_ends_at')->orWhere('deal_ends_at', '>', now()));
        }
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        match ($filters['sort'] ?? 'featured') {
            'price_asc', 'price-low' => $query->orderBy('price'),
            'price_desc', 'price-high' => $query->orderByDesc('price'),
            'rating' => $query->orderByDesc('rating_avg')->orderByDesc('rating_count'),
            'newest' => $query->orderByDesc('created_at'),
            default => $query->orderByDesc('is_featured')->orderByDesc('created_at'),
        };

        return ProductResource::collection($query->paginate(min((int) ($filters['per_page'] ?? 24), 48))->withQueryString());
    }

    public function show(string $slug): ProductResource
    {
        $product = Product::query()
            ->where('status', 'active')
            ->with(['category', 'seller.sellerProfile'])
            ->where('slug', $slug)
            ->firstOrFail();

        $related = Product::query()
            ->where('status', 'active')
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['category', 'seller.sellerProfile'])
            ->orderByDesc('is_featured')
            ->orderByDesc('rating_avg')
            ->limit(8)
            ->get();

        $product->setRelation('relatedProducts', $related);

        return ProductResource::make($product);
    }
}