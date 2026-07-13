<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\BookingDetail;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function search(Request $request)
    {
        // 1. Validasi input dari frontend
        $request->validate([
            'departure_station_id' => 'required|exists:stations,id',
            'arrival_station_id' => 'required|exists:stations,id',
            'date' => 'required|date',
        ]);

        $departureId = $request->departure_station_id;
        $arrivalId = $request->arrival_station_id;
        $date = $request->date;

        // 2. Query Sakti: Mencari jadwal dengan logika "Penggaris Rute"
        $schedules = Schedule::select('schedules.*')
            // Gabungkan dengan tabel rute untuk stasiun NAIK
            ->join('route_stops as departure_stop', function($join) use ($departureId) {
                $join->on('schedules.id', '=', 'departure_stop.schedule_id')
                     ->where('departure_stop.station_id', $departureId);
            })
            // Gabungkan dengan tabel rute untuk stasiun TURUN
            ->join('route_stops as arrival_stop', function($join) use ($arrivalId) {
                $join->on('schedules.id', '=', 'arrival_stop.schedule_id')
                     ->where('arrival_stop.station_id', $arrivalId);
            })
            // SYARAT UTAMA: Urutan naik harus lebih kecil dari urutan turun (Penggaris tidak boleh mundur)
            ->whereColumn('departure_stop.stop_order', '<', 'arrival_stop.stop_order')
            // Filter berdasarkan tanggal perjalanan
            ->where('schedules.journey_date', $date)
            // Ambil data relasi kereta dan stasiunnya sekalian biar cepat (Eager Loading)
            ->with(['train', 'routeStops.station'])
            ->get();

        // 3. Modifikasi data sebelum dikirim ke frontend (menghitung harga & jam spesifik)
        $results = $schedules->map(function($schedule) use ($departureId, $arrivalId) {
            // Cari data rute spesifik naik dan turun untuk mengambil jam & harga patokan
            $depStop = $schedule->routeStops->firstWhere('station_id', $departureId);
            $arrStop = $schedule->routeStops->firstWhere('station_id', $arrivalId);

            // Rumus hitung harga parsial: Harga tujuan dikurangi harga asal
            $finalPrice = $arrStop->price_from_start - $depStop->price_from_start;

            return [
                'schedule_id' => $schedule->id,
                'train' => [
                    'name' => $schedule->train->name,
                    'class' => $schedule->train->class,
                    'total_coaches' => $schedule->train->total_coaches,
                ],
                'departure_station' => $depStop->station->name,
                'departure_time' => $depStop->departure_time,
                'arrival_station' => $arrStop->station->name,
                'arrival_time' => $arrStop->arrival_time,
                'price' => $finalPrice,
            ];
        });

        // 4. Kirim respons JSON ke Frontend (React/Vue/Postman)
        return response()->json([
            'status' => 'success',
            'message' => 'Jadwal kereta berhasil ditemukan.',
            'data' => $results
        ]);
    }

    public function getAvailableSeats(Request $request)
        {
        // 1. Validasi input dari frontend
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'departure_station_id' => 'required|exists:stations,id',
            'arrival_station_id' => 'required|exists:stations,id',
            'coach_number' => 'required|integer', // Gerbong berapa yang mau dilihat? (Misal: gerbong 1)
        ]);

        $scheduleId = $request->schedule_id;
        $departureId = $request->departure_station_id;
        $arrivalId = $request->arrival_station_id;
        $coachNumber = $request->coach_number;

        // 2. Cari tahu dulu "Angka Penggaris" (stop_order) untuk rute yang diminta user
        $schedule = Schedule::with('routeStops')->findOrFail($scheduleId);
        $userDepOrder = $schedule->routeStops->firstWhere('station_id', $departureId)->stop_order;
        $userArrOrder = $schedule->routeStops->firstWhere('station_id', $arrivalId)->stop_order;

        // 3. QUERY SAKTI: Cari kursi yang SUDAH TERISI (BENTROK) dengan rute user
        $occupiedSeats = \App\Models\BookingDetail::join('bookings', 'booking_details.booking_id', '=', 'bookings.id')
            ->where('bookings.schedule_id', $scheduleId)
            ->where('booking_details.coach_number', $coachNumber)
            // Hanya cek booking yang statusnya pending (sedang dipesan) atau completed (sudah dibayar)
            ->whereIn('bookings.status', ['pending', 'completed'])
            // INILAH RUMUS OVERLAP PENGGARIS KITA!
            ->where(function($query) use ($userDepOrder, $userArrOrder) {
                $query->where('bookings.board_order', '<', $userArrOrder)
                      ->where('bookings.alight_order', '>', $userDepOrder);
            })
            // Ambil nomor kursinya saja
            ->pluck('booking_details.seat_number')
            ->toArray();

        // 4. Kirim daftar nomor kursi yang SUDAH TERISI ke frontend
        // Nanti di React/Vue, kursi yang ada di list ini tinggal di-disable (warna hitam/abu-abu)
        return response()->json([
            'status' => 'success',
            'message' => 'Data kursi terisi berhasil diambil.',
            'data' => [
                'coach_number' => $coachNumber,
                'occupied_seats' => $occupiedSeats // Isinya list kursi terisi, misal: ["1A", "5B"]
            ]
        ]);
    }

    public function getOccupiedSeats(Request $request, $scheduleId)
    {
        // Tangkap order penggaris dari stasiun naik dan turun si user
        $userBoardOrder = $request->query('board_order');
        $userAlightOrder = $request->query('alight_order');

        // Cari kursi yang bentrok berdasarkan rumus penggaris
        $occupiedSeats = BookingDetail::whereHas('booking', function ($query) use ($scheduleId, $userBoardOrder, $userAlightOrder) {
            $query->where('schedule_id', $scheduleId)
                ->whereIn('status', ['pending', 'completed']) // Ambil yang sukses atau masih pending checkout
                ->where(function ($q) use ($userBoardOrder, $userAlightOrder) {
                    // Rumus Overlap: (Naik User < Turun Lama) DAN (Turun User > Naik Lama)
                    $q->where('board_order', '<', $userAlightOrder)
                        ->where('alight_order', '>', $userBoardOrder);
                });
        })
        ->get(['coach_number', 'seat_number']); // Cukup ambil nomor gerbong dan kursi

        return response()->json([
            'occupied_seats' => $occupiedSeats
        ]);
    }

    public function getScheduleDetail(Request $request, $id)
    {
        $schedule = Schedule::with(['train', 'routeStops'])->findOrFail($id);

        $boardOrder = $request->query('board_order');
        $alightOrder = $request->query('alight_order');

        $depStop = $schedule->routeStops->firstWhere('stop_order', $boardOrder);
        $arrStop = $schedule->routeStops->firstWhere('stop_order', $alightOrder);

        // Rumus hitung harga parsial (Sama seperti di fungsi search)
        $price = 0;
        if ($depStop && $arrStop) {
            $price = $arrStop->price_from_start - $depStop->price_from_start;
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'schedule_id' => $schedule->id,
                'train' => [
                    'name' => $schedule->train->name,
                    'class' => $schedule->train->class,
                    'total_coaches' => $schedule->train->total_coaches,
                ],
                'departure_station_id' => $depStop ? $depStop->station_id : null,
                'arrival_station_id' => $arrStop ? $arrStop->station_id : null,
                'price' => $price, // <--- Data harga sekarang ikut dikirim
            ]
        ]);
    }
}
