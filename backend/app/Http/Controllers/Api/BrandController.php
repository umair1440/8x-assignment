<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\BrandResource;
use App\Models\Product;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BrandController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $brands = Product::query()
            ->where('status', 'active')
            ->whereNotNull('brand')
            ->get(['brand'])
            ->groupBy('brand')
            ->map(fn ($products, $brand) => ['brand' => $brand, 'count' => $products->count()])
            ->sortBy('brand')
            ->values();

        return BrandResource::collection($brands);
    }
}