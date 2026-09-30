<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentMethodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'brand' => ['required', 'string', 'max:50'],
            'last4' => ['required', 'string', 'regex:/^\d{4}$/'],
            'exp_month' => ['required', 'integer', 'between:1,12'],
            'exp_year' => ['required', 'integer', 'min:'.(int) date('Y'), 'max:'.((int) date('Y') + 30)],
            'cardholder_name' => ['required', 'string', 'max:255'],
            'card_number' => ['prohibited'],
            'cardNumber' => ['prohibited'],
            'number' => ['prohibited'],
            'pan' => ['prohibited'],
            'cvv' => ['prohibited'],
            'cvc' => ['prohibited'],
            'security_code' => ['prohibited'],
            'securityCode' => ['prohibited'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            foreach (array_keys($this->all()) as $field) {
                if (preg_match('/(?:card.?number|full.?number|card.?cvv|card.?cvc|(?:^|[^a-z])(?:number|pan|cvv|cvc|security.?code|security.?value|card.?verification.?value)(?:$|[^a-z]))/i', $field)) {
                    $validator->errors()->add($field, 'Full card numbers and security codes are not accepted.');
                }
            }
        });
    }
}
