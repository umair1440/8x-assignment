<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'buyer' => [
                'name' => $this->user->name,
            ],
            'shipping_address' => $this->shipping_address,
            'placed_at' => $this->placed_at,
            'items' => SellerOrderItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
