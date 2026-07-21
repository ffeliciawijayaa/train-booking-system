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
    public function getStation()
    {
        $stations = Station::orderBy('id', 'desc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $stations
        ]);
    }

    // API untuk mengambil semua data kereta
    public function getTrain()
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

    // 2. API Tambah Kereta Baru
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

    // 3. API Tambah Jadwal + Rute Sekaligus (Sudah Dikasih Proteksi Lapisan Baja)
    public function storeSchedule(Request $request)
    {
        // Poin 4: Validasi dasar, tanggal perjalanan minimal HARI INI, ga boleh masa lalu
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

        // Loop pertama khusus buat ngecek kevalidan logika rute sebelum masuk database
        foreach ($stops as $index => $stop) {
            $stationIds[] = $stop['station_id'];

            // Konversi string jam ke objek Carbon untuk perbandingan matematika waktu
            $arrival = $stop['arrival_time'] ? \Carbon\Carbon::parse($stop['arrival_time']) : null;
            $departure = $stop['departure_time'] ? \Carbon\Carbon::parse($stop['departure_time']) : null;

            // Poin 1 & 4: Cek jam tiba vs jam berangkat di STASIUN YANG SAMA
            if ($arrival && $departure && $arrival->greaterThanOrEqualTo($departure)) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Gagal di Urutan Ke-" . ($index + 1) . ": Jam tiba ({$stop['arrival_time']}) tidak boleh mendahului atau sama dengan jam berangkat ({$stop['departure_time']})!"
                ], 400);
            }

            // Cek urutan antar stasiun (Estafet Waktu)
            if ($index > 0) {
                $prevStop = $stops[$index - 1];
                $prevDeparture = $prevStop['departure_time'] ? \Carbon\Carbon::parse($prevStop['departure_time']) : null;

                // Jam tiba di stasiun sekarang minimal harus 30 menit setelah jam berangkat stasiun sebelumnya
                if ($arrival && $prevDeparture && $arrival->diffInMinutes($prevDeparture, false) > -30) {
                    return response()->json([
                        'status' => 'error',
                        'message' => "Gagal di Urutan Ke-" . ($index + 1) . ": Durasi perjalanan tidak logis! Jam tiba minimal harus 30 menit setelah jam keberangkatan dari stasiun sebelumnya ({$prevStop['departure_time']})."
                    ], 400);
                }
            }
        }

        // Poin 3: Proteksi jika ada ID stasiun yang kembar/sama di dalam rute perjalanan ini
        if (count($stationIds) !== count(array_unique($stationIds))) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rute tidak valid! Ada stasiun yang duplikat/sama dimasukkan lebih dari sekali.'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // 1. Simpan ke Tabel schedules
            $schedule = Schedule::create([
                'train_id' => $request->train_id,
                'journey_date' => $request->journey_date,
                'status' => 'scheduled'
            ]);

            // 2. Simpan ke Tabel route_stops
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

        // API untuk Mengubah Jadwal + Rute Transit Sekaligus
        public function updateSchedule(Request $request, $id)
        {
            // Validasi input
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

            // Validasi logika waktu dan duplikasi stasiun (Sama seperti storeSchedule)
            foreach ($stops as $index => $stop) {
                $stationIds[] = $stop['station_id'];

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

                // 1. Update data utama jadwal
                $schedule->update([
                    'train_id' => $request->train_id,
                    'journey_date' => $request->journey_date,
                ]);

                // 2. Hapus dulu rute transit yang lama biar ga bentrok
                RouteStop::where('schedule_id', $id)->delete();

                // 3. Masukkan rute transit baru hasil editan
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

        // API untuk Menghapus Jadwal Beserta Semua Rute Transitnya
        public function deleteSchedule($id)
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

            // 6. API untuk Update Data Kereta
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

        // 7. API untuk Hapus Data Kereta
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

        // =========================================================================
        // PROTECTIONS (ASURANSI)
        // =========================================================================

        public function getProtection()
        {
            $protections = \App\Models\Protection::orderBy('id', 'desc')->get();
            return response()->json([
                'status' => 'success',
                'data' => $protections
            ]);
        }

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

        // =========================================================================
        // PAYMENT METHODS (METODE PEMBAYARAN)
        // =========================================================================

        public function getPaymentMethod()
        {
            $methods = \App\Models\PaymentMethod::orderBy('id', 'desc')->get();
            return response()->json([
                'status' => 'success',
                'data' => $methods
            ]);
        }

        public function storePaymentMethod(Request $request)
        {
            $request->validate([
                'name' => 'required|string',
                'logo_url' => 'nullable|string',
                'instructions' => 'nullable|string',
                'is_active' => 'boolean'
            ]);

            $method = \App\Models\PaymentMethod::create([
                'name' => $request->name,
                'logo_url' => $request->logo_url,
                'instructions' => $request->instructions,
                'is_active' => $request->is_active ?? true
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Metode Pembayaran berhasil ditambahkan!',
                'data' => $method
            ], 201);
        }

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
                'is_active' => $request->is_active ?? true
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Metode Pembayaran berhasil diperbarui!',
                'data' => $method
            ]);
        }

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

        // =========================================================================
        // HISTORY TRANSAKSI / BOOKING HISTORY
        // =========================================================================

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

        // =========================
        // ADMIN MANAGEMENT
        // =========================

        // Menampilkan semua akun admin
        public function getAdmins()
        {
            $admins = \App\Models\User::where('role', 'admin')
                ->orderBy('id', 'desc')
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
                ->orderBy('id', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $users
            ]);
        }

        // Menambahkan admin baru
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

        // Mengubah data admin
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

        // Menghapus admin
        public function deleteAdmin($id)
        {
            $admin = \App\Models\User::findOrFail($id);

            // Jangan sampai admin menghapus dirinya sendiri
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
