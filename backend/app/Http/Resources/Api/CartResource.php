<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $subtotal = $this->items->sum(fn ($item): int => (int) round((float) $item->product->price * 100) * $item->quantity);

        return [
            'id' => $this->id,
            'items' => CartItemResource::collection($this->items),
            'subtotal' => number_format($subtotal / 100, 2, '.', ''),
        ];
    }
}
