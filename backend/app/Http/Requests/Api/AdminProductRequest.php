<?php

namespace App\Http\Requests\Api;

class AdminProductRequest extends ProductDataRequest
{
    protected function allowsSellerAssignment(): bool
    {
        return true;
    }
}
