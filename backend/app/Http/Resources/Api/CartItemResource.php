<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $price = (int) round((float) $this->product->price * 100);

        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'title' => $this->product->title,
            'image_url' => $this->product->image_url,
            'unit_price' => number_format($price / 100, 2, '.', ''),
            'quantity' => $this->quantity,
            'variant_color' => $this->variant_color,
            'variant_size' => $this->variant_size,
            'line_total' => number_format(($price * $this->quantity) / 100, 2, '.', ''),
        ];
    }
}
