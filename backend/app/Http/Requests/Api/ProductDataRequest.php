<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

abstract class ProductDataRequest extends FormRequest
{
    protected function allowsSellerAssignment(): bool
    {
        return false;
    }

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $required = $this->isMethod('POST') ? ['required'] : ['sometimes', 'required'];
        $productId = $this->route('id');
        $rules = [
            'category_id' => [...$required, 'integer', 'exists:categories,id'],
            'title' => [...$required, 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($productId)],
            'description' => ['sometimes', 'nullable', 'string'],
            'price' => [...$required, 'numeric', 'min:0'],
            'old_price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'brand' => ['sometimes', 'nullable', 'string', 'max:255'],
            'sku' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('products', 'sku')->ignore($productId)],
            'stock' => [...$required, 'integer', 'min:0'],
            'image_url' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'images' => ['sometimes', 'nullable', 'array'],
            'images.*' => ['string', 'max:2048'],
            'colors' => ['sometimes', 'nullable', 'array'],
            'colors.*' => ['string', 'max:100'],
            'sizes' => ['sometimes', 'nullable', 'array'],
            'sizes.*' => ['string', 'max:100'],
            'status' => ['sometimes', 'required', 'string', Rule::in(['active', 'draft'])],
            'is_featured' => ['sometimes', 'boolean'],
            'is_deal' => ['sometimes', 'boolean'],
            'deal_ends_at' => ['sometimes', 'nullable', 'date'],
        ];

        $rules['seller_id'] = $this->allowsSellerAssignment()
            ? ['sometimes', 'nullable', 'integer', Rule::exists('users', 'id')->where('role', 'seller')]
            : ['prohibited'];

        return $rules;
    }
}
