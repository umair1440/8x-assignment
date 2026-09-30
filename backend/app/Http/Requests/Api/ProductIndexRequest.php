<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class ProductIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $brandRules = ['sometimes'];
        if (is_array($this->query('brand'))) {
            $brandRules[] = 'array';
        } else {
            $brandRules[] = 'string';
        }

        return [
            'q' => ['sometimes', 'string', 'max:150'],
            'category' => ['sometimes', 'string', 'max:150'],
            'brand' => $brandRules,
            'brand.*' => ['string', 'max:100'],
            'min' => ['sometimes', 'numeric', 'min:0'],
            'max' => ['sometimes', 'numeric', 'min:0'],
            'rating' => ['sometimes', 'numeric', 'between:0,5'],
            'in_stock' => ['sometimes', 'boolean'],
            'stock' => ['sometimes', 'boolean'],
            'deal' => ['sometimes', 'boolean'],
            'featured' => ['sometimes', 'boolean'],
            'sort' => ['sometimes', 'string', 'in:featured,price_asc,price_desc,rating,newest,price-low,price-high'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:48'],
        ];
    }
}