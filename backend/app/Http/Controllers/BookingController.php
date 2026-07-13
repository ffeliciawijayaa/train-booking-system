<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\Payment;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validasi input pesanan dengan struktur array passengers
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'departure_station_id' => 'required|exists:stations,id',
            'arrival_station_id' => 'required|exists:stations,id',
            'coach_number' => 'required|integer',
            'passengers' => 'required|array|min:1',
            'passengers.*.name' => 'required|string',
            'passengers.*.nik' => 'required|string|size:16',
            'passengers.*.gender' => 'required|in:pria,wanita',
            'passengers.*.seat_number' => 'required|string',
        ]);

        // 2. Ambil data urutan stasiun (angka penggaris)
        $schedule = Schedule::with('routeStops')->findOrFail($request->schedule_id);
        $depStop = $schedule->routeStops->firstWhere('station_id', $request->departure_station_id);
        $arrStop = $schedule->routeStops->firstWhere('station_id', $request->arrival_station_id);

        if (!$depStop || !$arrStop) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rute stasiun tidak valid untuk jadwal ini.'
            ], 422);
        }

        $userDepOrder = $depStop->stop_order;
        $userArrOrder = $arrStop->stop_order;

        // Hitung harga per satu tiket
        $ticketPricePerPassenger = $arrStop->price_from_start - $depStop->price_from_start;

        // Ekstrak semua nomor kursi yang dikirim dari frontend untuk divalidasi massal
        $seatNumbers = collect($request->passengers)->pluck('seat_number')->toArray();

        // 3. PROTEKSI BENTROK: Cek apakah ada di antara kursi-kursi tersebut yang sudah terisi di rute irisan
        $occupiedSeats = BookingDetail::join('bookings', 'booking_details.booking_id', '=', 'bookings.id')
            ->where('bookings.schedule_id', $request->schedule_id)
            ->where('booking_details.coach_number', $request->coach_number)
            ->whereIn('booking_details.seat_number', $seatNumbers)
            ->whereIn('bookings.status', ['pending', 'completed'])
            ->where(function($query) use ($userDepOrder, $userArrOrder) {
                $query->where('bookings.board_order', '<', $userArrOrder)
                      ->where('bookings.alight_order', '>', $userDepOrder);
            })
            ->pluck('booking_details.seat_number')
            ->toArray();

        // Jika ada kursi yang bentrok, sebutkan nomor kursinya di response
        if (!empty($occupiedSeats)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Maaf, kursi berikut sudah dipesan oleh penumpang lain: ' . implode(', ', $occupiedSeats)
            ], 422);
        }

        // Hitung total harga berdasarkan jumlah penumpang
        $totalPassengers = count($request->passengers);
        $totalPrice = $ticketPricePerPassenger * $totalPassengers;

        // 4. TRANSACTION BLOCK: Menyimpan data secara atomik
        DB::beginTransaction();
        try {
            // A. Simpan ke tabel bookings (Induk)
            $booking = Booking::create([
                'booking_code' => 'KAI-' . strtoupper(Str::random(8)),
                'user_id' => auth()->id(),
                'schedule_id' => $request->schedule_id,
                'board_station_id' => $request->departure_station_id,
                'alight_station_id' => $request->arrival_station_id,
                'board_order' => $userDepOrder,
                'alight_order' => $userArrOrder,
                'status' => 'pending',
                'total_price' => $totalPrice,
                'booking_date' => now(),
            ]);

            // B. Looping untuk simpan semua penumpang ke tabel booking_details
            foreach ($request->passengers as $passenger) {
                BookingDetail::create([
                    'booking_id' => $booking->id,
                    'passenger_nik' => $passenger['nik'],
                    'passenger_name' => $passenger['name'],
                    'passenger_gender' => $passenger['gender'],
                    'coach_number' => $request->coach_number,
                    'seat_number' => $passenger['seat_number'],
                    'ticket_price' => $ticketPricePerPassenger,
                ]);
            }

            // C. Simpan ke tabel payments
            Payment::create([
                'booking_id' => $booking->id,
                'payment_method' => 'QRIS',
                'payment_status' => 'pending',
                'expired_at' => now()->addHour(),
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Booking kelompok berhasil dibuat! Silahkan lakukan pembayaran.',
                'booking_id' => $booking->id,
                'data' => [
                    'booking_code' => $booking->booking_code,
                    'total_price' => $booking->total_price,
                    'passenger_count' => $totalPassengers
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
    }

    // 1. Fungsi untuk mengambil detail review pesanan sebelum dibayar
    public function show($id)
    {
        $booking = Booking::with([
            'schedule.train',
            'bookingDetails',
            'payment',
            'boardStation', // Pastikan sudah set relasi belongsTo di model Booking
            'alightStation'
        ])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $booking
        ]);
    }

    // 2. Fungsi untuk menyelesaikan pembayaran secara instan
    public function pay(Request $request, $id)
    {
        $request->validate([
            'payment_method' => 'required|string'
        ]);

        $booking = Booking::with('payment')->findOrFail($id);

        if ($booking->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Pesanan ini tidak dapat dibayar karena berstatus ' . $booking->status
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Update status booking kepala struk
            $booking->update([
                'status' => 'completed'
            ]);

            // Update log pembayaran
            $booking->payment->update([
                'payment_method' => $request->payment_method,
                'payment_status' => 'paid',
                'paid_at' => now()
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Pembayaran sukses! Tiket Anda telah aktif.',
                'booking_code' => $booking->booking_code
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memproses pembayaran: ' . $e->getMessage()
            ], 500);
        }
    }
}
