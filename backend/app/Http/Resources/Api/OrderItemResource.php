<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'seller_id' => $this->seller_id,
            'title' => $this->title_snapshot,
            'image_url' => $this->image_snapshot,
            'unit_price' => $this->price_snapshot,
            'quantity' => $this->quantity,
            'variant_color' => $this->variant_color,
            'variant_size' => $this->variant_size,
            'status' => $this->status,
            'line_total' => number_format(((int) round((float) $this->price_snapshot * 100) * $this->quantity) / 100, 2, '.', ''),
        ];
    }
}
