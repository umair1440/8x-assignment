<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'total_revenue' => $this['total_revenue'],
            'orders_count' => $this['orders_count'],
            'users_count' => $this['users_count'],
            'products_count' => $this['products_count'],
            'revenue_last_7_days' => $this['revenue_last_7_days'],
            'latest_orders' => AdminOrderResource::collection($this['latest_orders']),
        ];
    }
}
