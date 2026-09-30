<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'subtotal' => $this->subtotal,
            'shipping_fee' => $this->shipping_fee,
            'tax' => $this->tax,
            'total' => $this->total,
            'currency' => $this->currency,
            'shipping_address' => $this->shipping_address,
            'payment' => [
                'brand' => $this->payment_brand,
                'last4' => $this->payment_last4,
            ],
            'payment_status' => $this->payment_status,
            'placed_at' => $this->placed_at,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
