<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreAddressRequest;
use App\Http\Requests\Api\UpdateAddressRequest;
use App\Http\Resources\Api\AddressResource;
use App\Http\Resources\Api\ApiMessageResource;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return AddressResource::collection($request->user()->addresses()->orderByDesc('is_default')->latest()->get());
    }

    public function store(StoreAddressRequest $request): AddressResource|JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $address = DB::transaction(function () use ($user, $data): Address {
            $user->newQuery()->whereKey($user->id)->lockForUpdate()->first();
            $isFirst = ! $user->addresses()->exists();
            $makeDefault = $isFirst || ($data['is_default'] ?? false);

            if ($makeDefault) {
                $user->addresses()->update(['is_default' => false]);
            }

            return $user->addresses()->create([...$data, 'is_default' => $makeDefault]);
        });

        return AddressResource::make($address)->response()->setStatusCode(201);
    }

    public function update(UpdateAddressRequest $request, int $id): AddressResource
    {
        $user = $request->user();
        $data = $request->validated();

        $address = DB::transaction(function () use ($user, $data, $id): Address {
            $user->newQuery()->whereKey($user->id)->lockForUpdate()->first();
            $address = $user->addresses()->lockForUpdate()->findOrFail($id);
            $wasDefault = $address->is_default;
            $requestedDefault = $data['is_default'] ?? null;
            $otherAddress = $user->addresses()->whereKeyNot($address->id)->first();

            if ($requestedDefault === true) {
                $user->addresses()->update(['is_default' => false]);
            }

            $address->fill($data);
            if ($requestedDefault === true || ! $otherAddress) {
                $address->is_default = true;
            } elseif ($requestedDefault === false && $wasDefault) {
                $address->is_default = false;
                $otherAddress->update(['is_default' => true]);
            }
            $address->save();

            return $address;
        });

        return AddressResource::make($address);
    }

    public function destroy(Request $request, int $id): ApiMessageResource
    {
        $user = $request->user();

        DB::transaction(function () use ($user, $id): void {
            $user->newQuery()->whereKey($user->id)->lockForUpdate()->first();
            $address = $user->addresses()->lockForUpdate()->findOrFail($id);
            $wasDefault = $address->is_default;
            $address->delete();

            if ($wasDefault && ($replacement = $user->addresses()->orderBy('id')->first())) {
                $replacement->update(['is_default' => true]);
            }
        });

        return ApiMessageResource::make(['message' => 'Address deleted.']);
    }
}
