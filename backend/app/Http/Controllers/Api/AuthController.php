<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\DemoGoogleRequest;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Resources\Api\ApiMessageResource;
use App\Http\Resources\Api\AuthSessionResource;
use App\Http\Resources\Api\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['email'] = Str::lower($data['email']);
        $user = User::create([
            ...$data,
            'role' => 'customer',
            'auth_provider' => 'email',
        ]);

        return AuthSessionResource::make([
            'user' => $user,
            'token' => $user->createToken('api')->plainTextToken,
        ])->response()->setStatusCode(201);
    }

    public function login(LoginRequest $request): AuthSessionResource|JsonResponse
    {
        $credentials = $request->validated();
        $user = User::where('email', Str::lower($credentials['email']))->first();

        if (! $user || $user->auth_provider !== 'email' || ! $user->password || ! Hash::check($credentials['password'], $user->password)) {
            return ApiMessageResource::make(['message' => 'Invalid credentials.'])->response()->setStatusCode(401);
        }

        return AuthSessionResource::make([
            'user' => $user,
            'token' => $user->createToken('api')->plainTextToken,
        ]);
    }

    public function demoGoogle(DemoGoogleRequest $request): AuthSessionResource|JsonResponse
    {
        $data = $request->validated();
        $data['email'] = Str::lower($data['email']);
        $user = User::where('email', $data['email'])->first();

        if ($user && $user->auth_provider !== 'google') {
            return ApiMessageResource::make(['message' => 'This email is registered with a different sign-in method.'])->response()->setStatusCode(409);
        }

        $user ??= User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => null,
            'role' => 'customer',
            'auth_provider' => 'google',
        ]);

        return AuthSessionResource::make([
            'user' => $user,
            'token' => $user->createToken('api')->plainTextToken,
        ]);
    }

    public function logout(): ApiMessageResource
    {
        request()->user()->currentAccessToken()?->delete();

        return ApiMessageResource::make(['message' => 'Signed out.']);
    }

    public function user(): UserResource
    {
        return UserResource::make(request()->user());
    }
}