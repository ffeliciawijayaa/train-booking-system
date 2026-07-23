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
    //untuk mengambil semua data stasiun
    public function getStation()
    {
        $stations = Station::orderBy('id', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $stations
        ]);
    }

    //untuk mengambil semua data kereta
    public function getTrain()
    {
        $trains = Train::orderBy('id', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $trains
        ]);
    }
    //tambah stasiun
    public function storeStation(Request $request)
    {
        $request->validate([
            'station_code' => 'required|string|unique:stations,station_code',
            'name' => 'required|string',
            'city' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $data = $request->all();
        $data['is_active'] = $request->has('is_active') ? filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN) : true;

        $station = Station::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Stasiun berhasil ditambahkan!',
            'data' => $station
        ], 201);
    }

    //tambah kereta
    public function storeTrain(Request $request)
    {
        $request->validate([
            'train_code' => 'required|string|unique:trains,train_code',
            'name' => 'required|string',
            'class' => 'required|in:executive,business,economy',
            'total_coaches' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $data = $request->all();
        $data['is_active'] = $request->has('is_active') ? filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN) : true;

        $train = Train::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Kereta berhasil ditambahkan!',
            'data' => $train
        ], 201);
    }

    //tambah jadwal + rute
    public function storeSchedule(Request $request)
    {
        //validasi dasar, tanggal perjalanan
        $request->validate([
            'train_id' => 'required|exists:trains,id',
            'journey_date' => 'required|date|after_or_equal:today',
            'route_stops' => 'required|array|min:2',
            'route_stops.*.station_id' => 'required|exists:stations,id',
            'route_stops.*.arrival_time' => 'nullable',
            'route_stops.*.departure_time' => 'nullable',
            'route_stops.*.price_from_start' => 'required|numeric|min:0',
        ]);

        $stops = $request->route_stops;
        $stationIds = [];

        foreach ($stops as $index => $stop) {
            $stationIds[] = $stop['station_id'];

            if ($index > 0) {
                $prevPrice = (float) ($stops[$index - 1]['price_from_start'] ?? 0);
                $currentPrice = (float) ($stop['price_from_start'] ?? 0);
                if ($currentPrice <= $prevPrice) {
                    return response()->json([
                        'status' => 'error',
                        'message' => "Gagal di Urutan Ke-" . ($index + 1) . ": Harga dari awal (Rp " . number_format($currentPrice, 0, ',', '.') . ") harus lebih besar dari stasiun sebelumnya (Rp " . number_format($prevPrice, 0, ',', '.') . ")!"
                    ], 422);
                }
            }

            $arrival = $stop['arrival_time'] ? \Carbon\Carbon::parse($stop['arrival_time']) : null;
            $departure = $stop['departure_time'] ? \Carbon\Carbon::parse($stop['departure_time']) : null;

            //cek jam tiba vs jam berangkat
            if ($arrival && $departure && $arrival->greaterThanOrEqualTo($departure)) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Gagal di Urutan Ke-" . ($index + 1) . ": Jam tiba ({$stop['arrival_time']}) tidak boleh mendahului atau sama dengan jam berangkat ({$stop['departure_time']})!"
                ], 400);
            }

            //cek urutan antar stasiun
            if ($index > 0) {
                $prevStop = $stops[$index - 1];
                $prevDeparture = $prevStop['departure_time'] ? \Carbon\Carbon::parse($prevStop['departure_time']) : null;

                //jam tiba di stasiun sekarang minimal harus 30 menit setelah jam berangkat stasiun sebelumnya
                if ($arrival && $prevDeparture && $arrival->diffInMinutes($prevDeparture, false) > -30) {
                    return response()->json([
                        'status' => 'error',
                        'message' => "Gagal di Urutan Ke-" . ($index + 1) . ": Durasi perjalanan tidak logis! Jam tiba minimal harus 30 menit setelah jam keberangkatan dari stasiun sebelumnya ({$prevStop['departure_time']})."
                    ], 400);
                }
            }
        }

        //proteksi jika ada id stasiun yang kembar
        if (count($stationIds) !== count(array_unique($stationIds))) {
            return response()->json([
                'status' => 'error',
                'message' => 'rute tidak valid! Ada stasiun yang duplikat/sama dimasukkan lebih dari sekali.'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $schedule = Schedule::create([
                'train_id' => $request->train_id,
                'journey_date' => $request->journey_date,
                'status' => 'scheduled'
            ]);

            foreach ($stops as $index => $stop) {
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


    //get schedule
    public function getSchedules()
    {
        // mengambil jadwal, sekalian narik data kereta dan stasiun pemberhentiannya
        $schedules = Schedule::with(['train', 'routeStops.station'])->get();

        return response()->json([
            'status' => 'success',
            'data' => $schedules
        ]);
    }

        //update stasiun
        public function updateStation(Request $request, $id)
        {
            $request->validate([
                'station_code' => 'required|unique:stations,station_code,' . $id,
                'name' => 'required',
                'city' => 'required',
                'is_active' => 'boolean',
            ]);

            $station = Station::find($id);
            if (!$station) {
                return response()->json(['status' => 'error', 'message' => 'Stasiun tidak ditemukan.'], 404);
            }

            $station->update([
                'station_code' => $request->station_code,
                'name' => $request->name,
                'city' => $request->city,
                'is_active' => $request->has('is_active') ? filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN) : $station->is_active,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Data stasiun berhasil diperbarui!'
            ]);
        }

        //mengubah jadwal + rute transit
        public function updateSchedule(Request $request, $id)
        {
            $request->validate([
                'train_id' => 'required|exists:trains,id',
                'journey_date' => 'required|date|after_or_equal:today',
                'route_stops' => 'required|array|min:2',
                'route_stops.*.station_id' => 'required|exists:stations,id',
                'route_stops.*.arrival_time' => 'nullable',
                'route_stops.*.departure_time' => 'nullable',
                'route_stops.*.price_from_start' => 'required|numeric|min:0',
            ]);

            $schedule = Schedule::find($id);
            if (!$schedule) {
                return response()->json(['status' => 'error', 'message' => 'Jadwal tidak ditemukan.'], 404);
            }

            $stops = $request->route_stops;
            $stationIds = [];

            foreach ($stops as $index => $stop) {
                $stationIds[] = $stop['station_id'];

                if ($index > 0) {
                    $prevPrice = (float) ($stops[$index - 1]['price_from_start'] ?? 0);
                    $currentPrice = (float) ($stop['price_from_start'] ?? 0);
                    if ($currentPrice <= $prevPrice) {
                        return response()->json([
                            'status' => 'error',
                            'message' => "Gagal di Urutan Ke-" . ($index + 1) . ": Harga dari awal (Rp " . number_format($currentPrice, 0, ',', '.') . ") harus lebih besar dari stasiun sebelumnya (Rp " . number_format($prevPrice, 0, ',', '.') . ")!"
                        ], 422);
                    }
                }

                $arrival = $stop['arrival_time'] ? \Carbon\Carbon::parse($stop['arrival_time']) : null;
                $departure = $stop['departure_time'] ? \Carbon\Carbon::parse($stop['departure_time']) : null;

                if ($arrival && $departure && $arrival->greaterThanOrEqualTo($departure)) {
                    return response()->json([
                        'status' => 'error',
                        'message' => "Gagal di Urutan Ke-" . ($index + 1) . ": Jam tiba ({$stop['arrival_time']}) tidak boleh mendahului atau sama dengan jam berangkat ({$stop['departure_time']})!"
                    ], 400);
                }

                if ($index > 0) {
                    $prevStop = $stops[$index - 1];
                    $prevDeparture = $prevStop['departure_time'] ? \Carbon\Carbon::parse($prevStop['departure_time']) : null;

                    if ($arrival && $prevDeparture && $arrival->lessThanOrEqualTo($prevDeparture)) {
                        return response()->json([
                            'status' => 'error',
                            'message' => "Gagal di Urutan Ke-" . ($index + 1) . ": Jam tiba kereta harus lebih maju dari jam keberangkatan stasiun sebelumnya ({$prevStop['departure_time']})!"
                        ], 400);
                    }
                }
            }

            if (count($stationIds) !== count(array_unique($stationIds))) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Rute tidak valid! Ada stasiun yang duplikat/sama dimasukkan lebih dari sekali.'
                ], 400);
            }

            try {
                DB::beginTransaction();

                $schedule->update([
                    'train_id' => $request->train_id,
                    'journey_date' => $request->journey_date,
                ]);

                RouteStop::where('schedule_id', $id)->delete();

                foreach ($stops as $index => $stop) {
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
                    'message' => 'Jadwal perjalanan dan rute berhasil diperbarui!'
                ]);

            } catch (\Exception $e) {
                DB::rollback();
                return response()->json([
                    'status' => 'error',
                    'message' => 'Sistem gagal memperbarui: ' . $e->getMessage()
                ], 500);
            }
        }

        //delete schedule
        public function deleteSchedule($id)
        {
            try {
                DB::beginTransaction();

                $schedule = Schedule::find($id);
                if (!$schedule) {
                    return response()->json(['status' => 'error', 'message' => 'Jadwal tidak ditemukan.'], 404);
                }

                RouteStop::where('schedule_id', $id)->delete();

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

        //delete station
        public function deleteStation($id)
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

        //update train
        public function updateTrain(Request $request,$id)
        {
            $request->validate([
                'train_code' => 'required|unique:trains,train_code,' . $id,
                'name' => 'required',
                'class' => 'required|in:executive,business,economy',
                'total_coaches' => 'required|integer|min:1',
                'is_active' => 'boolean',
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
                'is_active' => $request->has('is_active') ? filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN) : $train->is_active,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Data armada kereta berhasil diperbarui!'
            ]);
        }

        //delete train
        public function deleteTrain($id)
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

        //get proteksi 
        public function getProtection()
        {
            $protections = \App\Models\Protection::orderBy('id', 'asc')->get();
            return response()->json([
                'status' => 'success',
                'data' => $protections
            ]);
        }

        //store proteksi
        public function storeProtection(Request $request)
        {
            $request->validate([
                'name' => 'required|string',
                'description' => 'required|string',
                'price' => 'required|numeric|min:0',
                'is_active' => 'boolean'
            ]);

            $protection = \App\Models\Protection::create([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'is_active' => $request->is_active ?? true
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Proteksi berhasil ditambahkan!',
                'data' => $protection
            ], 201);
        }

        //update proteksi
        public function updateProtection(Request $request, $id)
        {
            $request->validate([
                'name' => 'required|string',
                'description' => 'required|string',
                'price' => 'required|numeric|min:0',
                'is_active' => 'boolean'
            ]);

            $protection = \App\Models\Protection::find($id);
            if (!$protection) {
                return response()->json(['status' => 'error', 'message' => 'Proteksi tidak ditemukan.'], 404);
            }

            $protection->update([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'is_active' => $request->is_active ?? true
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Data proteksi berhasil diperbarui!',
                'data' => $protection
            ]);
        }

        //delete proteksi
        public function deleteProtection($id)
        {
            $protection = \App\Models\Protection::find($id);
            if (!$protection) {
                return response()->json(['status' => 'error', 'message' => 'Proteksi tidak ditemukan.'], 404);
            }

            $protection->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Proteksi berhasil dihapus dari sistem!'
            ]);
        }

        //payment method
        public function getPaymentMethod()
        {
            $methods = \App\Models\PaymentMethod::orderBy('id', 'asc')->get();
            return response()->json([
                'status' => 'success',
                'data' => $methods
            ]);
        }

        //store payment method
        public function storePaymentMethod(Request $request)
        {
            $request->validate([
                'name' => 'required|string',
                'code' => 'nullable|string',
                'logo_url' => 'nullable|string',
                'instructions' => 'nullable|string',
                'is_active' => 'boolean'
            ]);

            $code = $request->code ?: \Illuminate\Support\Str::slug($request->name, '_');
            $baseCode = $code;
            $count = 1;
            while (\App\Models\PaymentMethod::where('code', $code)->exists()) {
                $code = $baseCode . '_' . $count++;
            }

            $method = \App\Models\PaymentMethod::create([
                'name' => $request->name,
                'code' => $code,
                'logo_url' => $request->logo_url,
                'instructions' => $request->instructions,
                'is_active' => $request->has('is_active') ? filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN) : true
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Metode Pembayaran berhasil ditambahkan!',
                'data' => $method
            ], 201);
        }

        //update payment method
        public function updatePaymentMethod(Request $request, $id)
        {
            $request->validate([
                'name' => 'required|string',
                'logo_url' => 'nullable|string',
                'instructions' => 'nullable|string',
                'is_active' => 'boolean'
            ]);

            $method = \App\Models\PaymentMethod::find($id);
            if (!$method) {
                return response()->json(['status' => 'error', 'message' => 'Metode Pembayaran tidak ditemukan.'], 404);
            }

            $method->update([
                'name' => $request->name,
                'logo_url' => $request->logo_url,
                'instructions' => $request->instructions,
                'is_active' => $request->has('is_active') ? filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN) : $method->is_active
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Metode Pembayaran berhasil diperbarui!',
                'data' => $method
            ]);
        }

        //delete payment method
        public function deletePaymentMethod($id)
        {
            $method = \App\Models\PaymentMethod::find($id);
            if (!$method) {
                return response()->json(['status' => 'error', 'message' => 'Metode Pembayaran tidak ditemukan.'], 404);
            }

            $method->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Metode Pembayaran berhasil dihapus dari sistem!'
            ]);
        }

        //history transaksi
        public function getBookingHistory()
        {
            $bookings = \App\Models\Booking::with([
                'user',
                'schedule.train',
                'boardStation',
                'alightStation',
                'bookingDetails',
                'payment'
            ])->orderBy('id', 'desc')->get();

            return response()->json([
                'status' => 'success',
                'data' => $bookings
            ]);
        }

        //get all admin
        public function getAdmins()
        {
            $admins = \App\Models\User::where('role', 'admin')
                ->orderBy('id', 'asc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $admins
            ]);
        }

        public function getUsers()
        {
            $users = \App\Models\User::where('role', 'user')
                ->select(
                    'id',
                    'name',
                    'email',
                    'phone_number',
                    'gender'
                )
                ->orderBy('id', 'asc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $users
            ]);
        }

        //add admin baru
        public function storeAdmin(Request $request)
        {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|min:6',
            ]);

            $admin = \App\Models\User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => \Illuminate\Support\Facades\Hash::make($request->password),
                'role' => 'admin',
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Admin berhasil ditambahkan.',
                'data' => $admin
            ], 201);
        }

        //update data admin
        public function updateAdmin(Request $request, $id)
        {
            $admin = \App\Models\User::findOrFail($id);

            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $admin->id,
            ]);

            $admin->update([
                'name' => $request->name,
                'email' => $request->email,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Data admin berhasil diperbarui.',
                'data' => $admin
            ]);
        }

        //delete admin
        public function deleteAdmin($id)
        {
            $admin = \App\Models\User::findOrFail($id);

            if (auth()->id() == $admin->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak dapat menghapus akun sendiri.'
                ], 400);
            }

            $admin->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Admin berhasil dihapus.'
            ]);
        }
}
