<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\HomeResource;
use App\Models\Category;
use App\Models\Product;

class HomeController extends Controller
{
    public function index(): HomeResource
    {
        $featured = Product::query()
            ->where('status', 'active')
            ->where('is_featured', true)
            ->with(['category', 'seller.sellerProfile'])
            ->orderByDesc('rating_avg')
            ->limit(8)
            ->get();

        $deals = Product::query()
            ->where('status', 'active')
            ->where('is_deal', true)
            ->where(fn ($query) => $query->whereNull('deal_ends_at')->orWhere('deal_ends_at', '>', now()))
            ->with(['category', 'seller.sellerProfile'])
            ->orderBy('deal_ends_at')
            ->limit(12)
            ->get();

        $categories = Category::query()
            ->whereNull('parent_id')
            ->withCount(['products' => fn ($query) => $query->where('status', 'active')])
            ->orderByDesc('products_count')
            ->limit(8)
            ->get();

        return HomeResource::make([
            'featured_products' => $featured,
            'deals' => $deals,
            'top_categories' => $categories,
        ]);
    }
}