<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\BookingDetail;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'origin_id' => 'required|exists:stations,id',
            'destination_id' => 'required|exists:stations,id',
            'journey_date' => 'required|date',
        ]);

        $departureId = $request->origin_id;
        $arrivalId = $request->destination_id;
        $date = $request->journey_date;

        $schedules = Schedule::select('schedules.*')
            ->join('route_stops as departure_stop', function($join) use ($departureId) {
                $join->on('schedules.id', '=', 'departure_stop.schedule_id')
                     ->where('departure_stop.station_id', $departureId);
            })
            ->join('route_stops as arrival_stop', function($join) use ($arrivalId) {
                $join->on('schedules.id', '=', 'arrival_stop.schedule_id')
                     ->where('arrival_stop.station_id', $arrivalId);
            })
            ->whereColumn('departure_stop.stop_order', '<', 'arrival_stop.stop_order')
            ->where('schedules.journey_date', $date)
            ->with(['train', 'routeStops.station'])
            ->get();

        $results = $schedules->map(function($schedule) use ($departureId, $arrivalId) {
            $depStop = $schedule->routeStops->firstWhere('station_id', $departureId);
            $arrStop = $schedule->routeStops->firstWhere('station_id', $arrivalId);

            $finalPrice = $arrStop->price_from_start - $depStop->price_from_start;

            return [
                'schedule_id' => $schedule->id,
                'train_name' => $schedule->train->name,
                'train_code' => $schedule->train->train_code,
                'class' => $schedule->train->class,
                'departure_time' => substr($depStop->departure_time, 11, 5),
                'arrival_time' => substr($arrStop->arrival_time, 11, 5),
                'price' => $finalPrice,
                'board_order' => $depStop->stop_order,
                'alight_order' => $arrStop->stop_order
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $results
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
        ->get(['coach_number', 'seat_number', 'passenger_gender']); // Cukup ambil nomor gerbong, kursi, dan gender

        return response()->json([
            'occupied_seats' => $occupiedSeats
        ]);
    }

    public function getScheduleDetail(Request $request, $id)
    {
        $schedule = Schedule::with(['train', 'routeStops.station'])->findOrFail($id);

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
                'journey_date' => $schedule->journey_date,
                'train' => [
                    'name' => $schedule->train->name,
                    'class' => $schedule->train->class,
                    'total_coaches' => $schedule->train->total_coaches,
                ],
                'departure_station_id' => $depStop ? $depStop->station_id : null,
                'arrival_station_id' => $arrStop ? $arrStop->station_id : null,
                'departure_station_name' => $depStop && $depStop->station ? $depStop->station->name : null,
                'departure_station_code' => $depStop && $depStop->station ? $depStop->station->station_code : null,
                'arrival_station_name' => $arrStop && $arrStop->station ? $arrStop->station->name : null,
                'arrival_station_code' => $arrStop && $arrStop->station ? $arrStop->station->station_code : null,
                'departure_time' => $depStop ? $depStop->departure_time : null,
                'arrival_time' => $arrStop ? $arrStop->arrival_time : null,
                'price' => $price, // <--- Data harga sekarang ikut dikirim
            ]
        ]);
    }
}
