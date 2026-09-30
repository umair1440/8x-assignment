<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'image_url' => $this->image_url,
            'sort_order' => $this->sort_order,
            'products_count' => $this->whenCounted('products'),
            'children' => $this->whenLoaded('children', fn () => self::collection($this->children)),
        ];
    }
}