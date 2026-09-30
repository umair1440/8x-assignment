<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'revenue' => $this['revenue'],
            'order_item_count' => $this['order_item_count'],
            'product_count' => $this['product_count'],
            'low_stock_count' => $this['low_stock_count'],
            'revenue_last_7_days' => $this['revenue_last_7_days'],
            'recent_order_items' => SellerOrderItemResource::collection($this['recent_order_items']),
        ];
    }
}
