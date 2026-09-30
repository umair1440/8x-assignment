<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HomeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'featured_products' => ProductResource::collection($this['featured_products']),
            'deals' => ProductResource::collection($this['deals']),
            'top_categories' => CategoryResource::collection($this['top_categories']),
        ];
    }
}