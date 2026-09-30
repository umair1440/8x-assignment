<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSellerOrderItemStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['seller', 'admin'], true);
    }

    public function rules(): array
    {
        return ['status' => ['required', 'string', Rule::in(['packed', 'shipped', 'delivered', 'cancelled'])]];
    }
}
