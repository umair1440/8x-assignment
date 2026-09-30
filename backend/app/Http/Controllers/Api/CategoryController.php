<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\CategoryResource;
use App\Models\Category;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $activeProducts = fn (Builder $query) => $query->where('status', 'active');
        $categories = Category::query()
            ->whereNull('parent_id')
            ->withCount(['products' => $activeProducts])
            ->with(['children' => fn (Builder $query) => $query
                ->withCount(['products' => $activeProducts])
                ->orderBy('sort_order')
                ->orderBy('name')])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return CategoryResource::collection($categories);
    }
}