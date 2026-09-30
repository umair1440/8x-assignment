<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\ApiMessageResource;
use App\Http\Resources\Api\WishlistResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class WishlistController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return WishlistResource::collection($request->user()->wishlists()->with('product')->latest()->get());
    }

    public function toggle(Request $request, int $product_id): WishlistResource|ApiMessageResource|JsonResponse
    {
        $product = Product::query()->findOrFail($product_id);
        $wishlist = $request->user()->wishlists()->where('product_id', $product->id)->first();

        if ($wishlist) {
            $wishlist->delete();

            return ApiMessageResource::make(['message' => 'Product removed from wishlist.']);
        }

        $wishlist = $request->user()->wishlists()->create(['product_id' => $product->id]);

        return WishlistResource::make($wishlist->load('product'))->response()->setStatusCode(201);
    }

    public function destroy(Request $request): ApiMessageResource
    {
        $request->user()->wishlists()->delete();

        return ApiMessageResource::make(['message' => 'Wishlist cleared.']);
    }
}
