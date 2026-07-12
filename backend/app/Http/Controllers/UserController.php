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
            'journey_date' => 'required|date',
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
}