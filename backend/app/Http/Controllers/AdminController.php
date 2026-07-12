<?php

namespace App\Http\Controllers;

use App\Models\Station;
use App\Models\Train;
use App\Models\Schedule;
use App\Models\RouteStop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    // API untuk mengambil semua data stasiun
    public function indexStation()
    {
        $stations = Station::orderBy('id', 'desc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $stations
        ]);
    }

    // API untuk mengambil semua data kereta
    public function indexTrain()
    {
        $trains = Train::orderBy('id', 'desc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $trains
        ]);
    }
    // 1. API Tambah Stasiun Baru
    public function storeStation(Request $request)
    {
        $request->validate([
            'station_code' => 'required|string|unique:stations,station_code',
            'name' => 'required|string',
            'city' => 'required|string',
        ]);

        $station = Station::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Stasiun berhasil ditambahkan!',
            'data' => $station
        ], 201);
    }

    // 2. API Tambah Kereta Baru
    public function storeTrain(Request $request)
    {
        $request->validate([
            'train_code' => 'required|string|unique:trains,train_code',
            'name' => 'required|string',
            'class' => 'required|in:executive,business,economy',
            'total_coaches' => 'required|integer|min:1',
        ]);

        $train = Train::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Kereta berhasil ditambahkan!',
            'data' => $train
        ], 201);
    }

    // 3. API Tambah Jadwal + Rute Sekaligus (Fitur Paling Juara)
    public function storeSchedule(Request $request)
    {
        $request->validate([
            'train_id' => 'required|exists:trains,id',
            'journey_date' => 'required|date',
            'route_stops' => 'required|array|min:2', 
            'route_stops.*.station_id' => 'required|exists:stations,id',
            'route_stops.*.arrival_time' => 'nullable', 
            'route_stops.*.departure_time' => 'nullable', 
            'route_stops.*.price_from_start' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // 1. Simpan ke Tabel 4: schedules
            $schedule = Schedule::create([
                'train_id' => $request->train_id,
                'journey_date' => $request->journey_date,
                'status' => 'scheduled'
            ]);

            // 2. Simpan ke Tabel 5: route_stops
            foreach ($request->route_stops as $index => $stop) {
                RouteStop::create([
                    'schedule_id' => $schedule->id,
                    'station_id' => $stop['station_id'],
                    'stop_order' => $index + 1,
                    'arrival_time' => $stop['arrival_time'] ? $request->journey_date . ' ' . $stop['arrival_time'] : null,
                    'departure_time' => $stop['departure_time'] ? $request->journey_date . ' ' . $stop['departure_time'] : null,
                    'price_from_start' => $stop['price_from_start'],
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Jadwal perjalanan dan rute penggaris berhasil disimpan!'
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'status' => 'error',
                'message' => 'Sistem gagal menyimpan: ' . $e->getMessage()
            ], 500);
        }
    }

    //GET SCHEDULE
    // API untuk Mengambil Semua Data Jadwal beserta Rutenya
    public function getSchedules()
    {
        // Mengambil jadwal, sekalian narik data kereta dan stasiun pemberhentiannya
        $schedules = Schedule::with(['train', 'routeStops.station'])->get();

        return response()->json([
            'status' => 'success',
            'data' => $schedules
        ]);
    }

        // 4. API untuk Update Data Stasiun
        public function updateStation(Request $request, $id)
        {
            $request->validate([
                'station_code' => 'required|unique:stations,station_code,' . $id,
                'name' => 'required',
                'city' => 'required',
            ]);

            $station = Station::find($id);
            if (!$station) {
                return response()->json(['status' => 'error', 'message' => 'Stasiun tidak ditemukan.'], 404);
            }

            $station->update([
                'station_code' => $request->station_code,
                'name' => $request->name,
                'city' => $request->city,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Data stasiun berhasil diperbarui!'
            ]);
        }

        // API untuk Menghapus Jadwal Beserta Semua Rute Transitnya
        public function destroySchedule($id)
        {
            try {
                DB::beginTransaction();

                $schedule = Schedule::find($id);
                if (!$schedule) {
                    return response()->json(['status' => 'error', 'message' => 'Jadwal tidak ditemukan.'], 404);
                }

                // 1. Hapus dulu semua anak rutenya di tabel route_stops
                RouteStop::where('schedule_id', $id)->delete();

                // 2. Hapus bungkus utamanya di tabel schedules
                $schedule->delete();

                DB::commit();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Jadwal perjalanan dan seluruh rute transitnya berhasil dihapus!'
                ]);

            } catch (\Exception $e) {
                DB::rollback();
                return response()->json([
                    'status' => 'error',
                    'message' => 'Gagal menghapus jadwal: ' . $e->getMessage()
                ], 500);
            }
        }

        // 5. API untuk Hapus Data Stasiun
        public function destroyStation($id)
        {
            $station = Station::find($id);
            if (!$station) {
                return response()->json(['status' => 'error', 'message' => 'Stasiun tidak ditemukan.'], 404);
            }

            $station->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Stasiun berhasil dihapus dari sistem!'
            ]);
        }

            // 6. API untuk Update Data Kereta
        public function updateTrain(Request $request,$id)
        {
            $request->validate([
                'train_code' => 'required|unique:trains,train_code,' . $id,
                'name' => 'required',
                'class' => 'required|in:executive,business,economy',
                'total_coaches' => 'required|integer|min:1',
            ]);

            $train = Train::find($id);
            if (!$train) {
                return response()->json(['status' => 'error', 'message' => 'Kereta tidak ditemukan.'], 404);
            }

            $train->update([
                'train_code' => $request->train_code,
                'name' => $request->name,
                'class' => $request->class,
                'total_coaches' => $request->total_coaches,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Data armada kereta berhasil diperbarui!'
            ]);
        }

        // 7. API untuk Hapus Data Kereta
        public function destroyTrain($id)
        {
            $train = Train::find($id);
            if (!$train) {
                return response()->json(['status' => 'error', 'message' => 'Kereta tidak ditemukan.'], 404);
            }

            $train->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Armada kereta berhasil dihapus dari sistem!'
            ]);
        }
}