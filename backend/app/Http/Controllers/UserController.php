<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Schedule;
use App\Models\RouteStop;
use App\Models\Station;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    // 1. API Mendapatkan List Stasiun untuk Dropdown Pencarian
    public function getStations()
    {
        return response()->json([
            'status' => 'success',
            'data' => Station::all()
        ]);
    }

    // 3. API Mendapatkan List Proteksi
    public function getProtections()
    {
        return response()->json([
            'status' => 'success',
            'data' => \App\Models\Protection::where('is_active', true)->get()
        ]);
    }

    // 4. API Mendapatkan List Metode Pembayaran
    public function getPaymentMethods()
    {
        return response()->json([
            'status' => 'success',
            'data' => \App\Models\PaymentMethod::where('is_active', true)->get()
        ]);
    }

    // 5. API Mendapatkan Riwayat Tiket User
    public function getUserBookings(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $bookings = \App\Models\Booking::with([
            'schedule.train',
            'boardStation',
            'alightStation',
            'payment',
            'bookingDetails'
        ])
        ->where('user_id', $user->id)
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json([
            'status' => 'success',
            'data' => $bookings
        ]);
    }

    // 6. API Update Profil User
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'nik' => 'nullable|string|size:16',
            'phone_number' => 'nullable|string|max:15',
            'gender' => 'nullable|in:pria,wanita',
            'birth_date' => 'nullable|date',
            // Email biasanya tidak diubah sembarangan atau harus cek unique
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);

        $user->update([
            'name' => $request->name,
            'nik' => $request->nik,
            'phone_number' => $request->phone_number,
            'gender' => $request->gender,
            'birth_date' => $request->birth_date,
            'email' => $request->email,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil diperbarui.',
            'data' => $user
        ]);
    }
}
