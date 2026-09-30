<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSellerProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['seller', 'admin'], true);
    }

    public function rules(): array
    {
        $profile = $this->user()->sellerProfile;

        return [
            'store_name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('seller_profiles', 'store_name')->ignore($profile?->id)],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'logo_url' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'contact_email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:40'],
        ];
    }
}
