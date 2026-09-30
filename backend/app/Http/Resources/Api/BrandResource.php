<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BrandResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'brand' => $this['brand'],
            'name' => $this['brand'],
            'count' => $this['count'],
        ];
    }
}