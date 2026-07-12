<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
 public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    // Cari user berdasarkan email
    $user = \App\Models\User::where('email', $request->email)->first();

    // Validasi user dan password
    if (!$user || !\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
        return response()->json([
            'status' => 'error',
            'message' => 'Email atau password salah.'
        ], 401);
    }
    // Buat token baru menggunakan Sanctum
    $token = $user->createToken('auth_token')->plainTextToken;

    // KUNCI UTAMA: Kirimkan token, name, beserta ROLE-nya ke Frontend
    return response()->json([
        'status' => 'success',
        'message' => 'Login berhasil!',
        'token' => $token,
        'user' => [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role // Mengembalikan 'admin' atau 'user'
        ]
    ]);
}}