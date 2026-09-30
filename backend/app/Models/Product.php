<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

#[Fillable([
    'seller_id', 'category_id', 'title', 'slug', 'description', 'price', 'old_price', 'brand', 'sku',
    'stock', 'image_url', 'images', 'colors', 'sizes', 'rating_avg', 'rating_count', 'status',
    'is_featured', 'is_deal', 'deal_ends_at',
])]
class Product extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'old_price' => 'decimal:2',
            'rating_avg' => 'decimal:2',
            'rating_count' => 'integer',
            'stock' => 'integer',
            'images' => 'array',
            'colors' => 'array',
            'sizes' => 'array',
            'is_featured' => 'boolean',
            'is_deal' => 'boolean',
            'deal_ends_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Product $product): void {
            if (filled($product->slug)) {
                return;
            }

            $baseSlug = Str::slug($product->title) ?: 'product';
            $slug = $baseSlug;
            $suffix = 2;

            while (static::withTrashed()->where('slug', $slug)->exists()) {
                $slug = $baseSlug.'-'.$suffix++;
            }

            $product->slug = $slug;
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}