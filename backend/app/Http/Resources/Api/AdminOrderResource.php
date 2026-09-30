<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminOrderResource extends JsonResource
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
            'payment_brand' => $this->payment_brand,
            'payment_last4' => $this->payment_last4,
            'payment_status' => $this->payment_status,
            'placed_at' => $this->placed_at,
            'buyer' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
