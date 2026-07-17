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
    }

    public function register(Request $request)
    {
        // Validasi input data pendaftaran sesuai skema tabel kelompokmu
        $request->validate([
            'nik' => 'required|string|size:16|unique:users,nik',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'phone_number' => 'required|string',
            'gender' => 'required|in:pria,wanita',
            'birth_date' => 'required|date',
        ]);

        // Simpan data user baru ke database
        $user = User::create([
            'nik' => $request->nik,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Password di-hash biar aman
            'phone_number' => $request->phone_number,
            'gender' => $request->gender,
            'birth_date' => $request->birth_date,
            'role' => 'user', // Default langsung diset sebagai user biasa
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Registrasi berhasil! Silakan masuk (login) untuk menggunakan akun Anda.',
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ]
        ], 201);
    }

    public function resetPassword(Request $request)
    {
        // Validasi input
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6|confirmed',
        ]);

        // Cari user berdasarkan email
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email tidak ditemukan.'
            ], 404);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Password berhasil diubah.'
        ]);
    }
}
