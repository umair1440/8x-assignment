<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'orders_count' => $this->orders_count ?? 0,
            'total_spent' => number_format((float) ($this->total_spent ?? 0), 2, '.', ''),
            'created_at' => $this->created_at,
        ];
    }
}
