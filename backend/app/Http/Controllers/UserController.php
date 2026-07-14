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

    // 2. LOGIKA JUARA: Mencari Jadwal Kereta Berdasarkan Rute Transit (Penggaris)
    public function searchTickets(Request $request)
    {
        $request->validate([
            'origin_id' => 'required|exists:stations,id',
            'destination_id' => 'required|exists:stations,id',
            'journey_date' => 'required|date|after_or_equal:today',
        ], [
            'journey_date.after_or_equal' => 'Tanggal perjalanan tidak boleh sebelum hari ini.',
        ]);

        $originId = $request->origin_id;
        $destinationId = $request->destination_id;
        $date = $request->journey_date;

        // Query mencari Jadwal yang memiliki stasiun asal DAN stasiun tujuan yang sesuai ketentuan penggaris
        $schedules = Schedule::with(['train'])
            ->where('journey_date', $date)
            ->whereHas('routeStops', function($query) use ($originId) {
                $query->where('station_id', $originId);
            })
            ->whereHas('routeStops', function($query) use ($destinationId) {
                $query->where('station_id', $destinationId);
            })
            ->get();

        $availableTickets = [];

        foreach ($schedules as $schedule) {
            // Ambil data penggaris spesifik untuk stasiun naik
            $originStop = RouteStop::where('schedule_id', $schedule->id)
                ->where('station_id', $originId)
                ->first();

            // Ambil data penggaris spesifik untuk stasiun turun
            $destinationStop = RouteStop::where('schedule_id', $schedule->id)
                ->where('station_id', $destinationId)
                ->first();

            // SYARAT MUTLAK: Urutan naik harus lebih kecil dari urutan turun (Tidak boleh jalan mundur)
            if ($originStop->stop_order < $destinationStop->stop_order) {
                
                // RUMUS MATEMATIKA HITUNG HARGA ADAPTIF
                $finalPrice = $destinationStop->price_from_start - $originStop->price_from_start;

                $availableTickets[] = [
                    'schedule_id' => $schedule->id,
                    'train_name' => $schedule->train->name,
                    'train_code' => $schedule->train->train_code,
                    'class' => $schedule->train->class,
                    'departure_time' => substr($originStop->departure_time, 11, 5), // Hanya ambil Jam:Menit
                    'arrival_time' => substr($destinationStop->arrival_time, 11, 5), // Hanya ambil Jam:Menit
                    'price' => $finalPrice,
                    'board_order' => $originStop->stop_order,
                    'alight_order' => $destinationStop->stop_order
                ];
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $availableTickets
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
            // Email biasanya tidak diubah sembarangan atau harus cek unique
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);

        $user->update([
            'name' => $request->name,
            'nik' => $request->nik,
            'phone_number' => $request->phone_number,
            'gender' => $request->gender,
            'email' => $request->email,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil diperbarui.',
            'data' => $user
        ]);
    }
}