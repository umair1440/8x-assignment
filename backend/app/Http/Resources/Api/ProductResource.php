<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $price = (float) $this->price;
        $oldPrice = $this->old_price === null ? null : (float) $this->old_price;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'name' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => number_format($price, 2, '.', ''),
            'old_price' => $oldPrice === null ? null : number_format($oldPrice, 2, '.', ''),
            'discount' => $oldPrice && $oldPrice > $price ? '-'.(int) round((1 - ($price / $oldPrice)) * 100).'%' : null,
            'brand' => $this->brand,
            'sku' => $this->sku,
            'stock' => $this->stock,
            'in_stock' => $this->stock > 0,
            'inStock' => $this->stock > 0,
            'image_url' => $this->image_url,
            'image' => $this->image_url,
            'images' => $this->images ?? [],
            'colors' => $this->colors ?? [],
            'sizes' => $this->sizes ?? [],
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => $this->category?->name),
            'category_data' => $this->when($this->relationLoaded('category'), fn () => CategoryResource::make($this->category)),
            'seller' => $this->whenLoaded('seller', function () {
                if (! $this->seller) {
                    return null;
                }

                return [
                    'id' => $this->seller->id,
                    'name' => $this->seller->sellerProfile?->store_name ?? $this->seller->name,
                    'store_name' => $this->seller->sellerProfile?->store_name,
                    'store_slug' => $this->seller->sellerProfile?->slug,
                ];
            }),
            'rating_avg' => (float) $this->rating_avg,
            'rating' => (float) $this->rating_avg,
            'rating_count' => $this->rating_count,
            'status' => $this->status,
            'is_featured' => $this->is_featured,
            'is_deal' => $this->is_deal,
            'deal_ends_at' => $this->deal_ends_at,
            'created_at' => $this->created_at,
            'related_products' => $this->when($this->relationLoaded('relatedProducts'), fn () => self::collection($this->relatedProducts)),
        ];
    }
}