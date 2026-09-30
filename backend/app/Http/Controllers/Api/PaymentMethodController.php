<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StorePaymentMethodRequest;
use App\Http\Resources\Api\ApiMessageResource;
use App\Http\Resources\Api\PaymentMethodResource;
use App\Models\PaymentMethod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class PaymentMethodController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return PaymentMethodResource::collection($request->user()->paymentMethods()->orderByDesc('is_default')->latest()->get());
    }

    public function store(StorePaymentMethodRequest $request): PaymentMethodResource|JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $method = DB::transaction(function () use ($user, $data): PaymentMethod {
            $user->newQuery()->whereKey($user->id)->lockForUpdate()->first();
            $isFirst = ! $user->paymentMethods()->exists();

            if ($isFirst) {
                $user->paymentMethods()->update(['is_default' => false]);
            }

            return $user->paymentMethods()->create([...$data, 'is_default' => $isFirst]);
        });

        return PaymentMethodResource::make($method)->response()->setStatusCode(201);
    }

    public function setDefault(Request $request, int $id): PaymentMethodResource
    {
        $user = $request->user();

        $method = DB::transaction(function () use ($user, $id): PaymentMethod {
            $user->newQuery()->whereKey($user->id)->lockForUpdate()->first();
            $method = $user->paymentMethods()->lockForUpdate()->findOrFail($id);
            $user->paymentMethods()->update(['is_default' => false]);
            $method->update(['is_default' => true]);

            return $method->refresh();
        });

        return PaymentMethodResource::make($method);
    }

    public function destroy(Request $request, int $id): ApiMessageResource
    {
        $user = $request->user();

        DB::transaction(function () use ($user, $id): void {
            $user->newQuery()->whereKey($user->id)->lockForUpdate()->first();
            $method = $user->paymentMethods()->lockForUpdate()->findOrFail($id);
            $wasDefault = $method->is_default;
            $method->delete();

            if ($wasDefault && ($replacement = $user->paymentMethods()->orderBy('id')->first())) {
                $replacement->update(['is_default' => true]);
            }
        });

        return ApiMessageResource::make(['message' => 'Payment method deleted.']);
    }
}
