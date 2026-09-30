<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerOrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'order_number' => $this->order?->order_number,
            'order_status' => $this->order?->status,
            'buyer' => [
                'name' => $this->order?->user?->name,
            ],
            'shipping_address' => $this->order?->shipping_address,
            'product_id' => $this->product_id,
            'title' => $this->title_snapshot,
            'image_url' => $this->image_snapshot,
            'price' => $this->price_snapshot,
            'quantity' => $this->quantity,
            'variant_color' => $this->variant_color,
            'variant_size' => $this->variant_size,
            'status' => $this->status,
            'shipped_at' => $this->shipped_at,
            'delivered_at' => $this->delivered_at,
            'placed_at' => $this->order?->placed_at,
        ];
    }
}
