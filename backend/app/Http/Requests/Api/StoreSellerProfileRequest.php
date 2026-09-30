<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSellerProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'customer';
    }

    public function rules(): array
    {
        return [
            'store_name' => ['required', 'string', 'max:255', Rule::unique('seller_profiles', 'store_name')],
            'description' => ['nullable', 'string', 'max:5000'],
            'logo_url' => ['nullable', 'string', 'max:2048'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
        ];
    }
}
