<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UpdatePasswordRequest;
use App\Http\Requests\Api\UpdateUserRequest;
use App\Http\Resources\Api\ApiMessageResource;
use App\Http\Resources\Api\UserResource;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function update(UpdateUserRequest $request): UserResource
    {
        $user = $request->user();
        $user->fill($request->validated())->save();

        return UserResource::make($user->refresh());
    }

    public function updatePassword(UpdatePasswordRequest $request): ApiMessageResource|JsonResponse
    {
        $user = $request->user();
        $user->forceFill(['password' => $request->validated('password')])->save();

        return ApiMessageResource::make(['message' => 'Password updated.']);
    }
}