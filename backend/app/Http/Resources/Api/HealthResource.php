<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HealthResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return ['status' => 'ok'];
    }
}