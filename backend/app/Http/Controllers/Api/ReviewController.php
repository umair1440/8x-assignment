<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ReviewIndexRequest;
use App\Http\Requests\Api\StoreReviewRequest;
use App\Http\Resources\Api\ApiMessageResource;
use App\Http\Resources\Api\ReviewResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    public function index(ReviewIndexRequest $request, string $slug): AnonymousResourceCollection
    {
        $product = Product::query()->where('status', 'active')->where('slug', $slug)->firstOrFail();
        $perPage = min((int) $request->validated('per_page', 20), 48);

        return ReviewResource::collection($product->reviews()->with('user')->latest()->paginate($perPage)->withQueryString());
    }

    public function store(StoreReviewRequest $request, string $slug): JsonResponse
    {
        $product = Product::query()->where('status', 'active')->where('slug', $slug)->firstOrFail();

        if ($product->reviews()->where('user_id', $request->user()->id)->exists()) {
            return ApiMessageResource::make(['message' => 'You have already reviewed this product.'])->response()->setStatusCode(409);
        }

        return DB::transaction(function () use ($request, $product): JsonResponse {
            $review = $product->reviews()->create([
                ...$request->validated(),
                'user_id' => $request->user()->id,
            ]);

            $ratings = $product->reviews()->pluck('rating');
            $product->forceFill([
                'rating_count' => $ratings->count(),
                'rating_avg' => round((float) $ratings->avg(), 2),
            ])->save();

            return ReviewResource::make($review->load('user'))->response()->setStatusCode(201);
        });
    }
}