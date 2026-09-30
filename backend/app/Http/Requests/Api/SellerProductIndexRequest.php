<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class SellerProductIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['seller', 'admin'], true);
    }

    public function rules(): array
    {
        return [
            'q' => ['sometimes', 'string', 'max:150'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'between:1,100'],
        ];
    }
}
