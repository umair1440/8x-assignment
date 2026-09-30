<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\AdminProductIndexRequest;
use App\Http\Requests\Api\AdminProductRequest;
use App\Http\Resources\Api\ApiMessageResource;
use App\Http\Resources\Api\ProductResource;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminProductController extends Controller
{
    public function index(AdminProductIndexRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $query = Product::query()->with(['category', 'seller.sellerProfile']);
        if (filled($filters['q'] ?? null)) {
            $term = '%'.$filters['q'].'%';
            $query->where(fn (Builder $products) => $products
                ->where('title', 'like', $term)
                ->orWhere('brand', 'like', $term)
                ->orWhere('sku', 'like', $term));
        }

        return ProductResource::collection($query->latest()->paginate((int) ($filters['per_page'] ?? 20))->withQueryString());
    }

    public function store(AdminProductRequest $request): ProductResource|JsonResponse
    {
        $product = Product::create($request->validated());

        return ProductResource::make($product->load(['category', 'seller.sellerProfile']))->response()->setStatusCode(201);
    }

    public function update(AdminProductRequest $request, int $id): ProductResource
    {
        $product = Product::query()->findOrFail($id);
        $product->fill($request->validated())->save();

        return ProductResource::make($product->refresh()->load(['category', 'seller.sellerProfile']));
    }

    public function destroy(int $id): ApiMessageResource
    {
        Product::query()->findOrFail($id)->delete();

        return ApiMessageResource::make(['message' => 'Product deleted.']);
    }
}
