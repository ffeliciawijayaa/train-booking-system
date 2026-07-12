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
        // 1. Validasi input pesanan dari frontend
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'departure_station_id' => 'required|exists:stations,id',
            'arrival_station_id' => 'required|exists:stations,id',
            'coach_number' => 'required|integer',
            'seat_number' => 'required|string',
            'passenger_nik' => 'required|string|size:16',
            'passenger_name' => 'required|string',
            'passenger_gender' => 'required|in:pria,wanita',
        ]);

        // 2. Ambil data urutan stasiun (angka penggaris)
        $schedule = Schedule::with('routeStops')->findOrFail($request->schedule_id);
        $depStop = $schedule->routeStops->firstWhere('station_id', $request->departure_station_id);
        $arrStop = $schedule->routeStops->firstWhere('station_id', $request->arrival_station_id);

        $userDepOrder = $depStop->stop_order;
        $userArrOrder = $arrStop->stop_order;

        // Hitung harga tiket otomatis
        $ticketPrice = $arrStop->price_from_start - $depStop->price_from_start;

        // 3. PROTEKSI BENTROK: Cek sekali lagi apakah kursi ini sudah diambil orang lain di rute irisan
        $isOccupied = BookingDetail::join('bookings', 'booking_details.booking_id', '=', 'bookings.id')
            ->where('bookings.schedule_id', $request->schedule_id)
            ->where('booking_details.coach_number', $request->coach_number)
            ->where('booking_details.seat_number', $request->seat_number)
            ->whereIn('bookings.status', ['pending', 'completed'])
            ->where(function($query) use ($userDepOrder, $userArrOrder) {
                $query->where('bookings.board_order', '<', $userArrOrder)
                      ->where('bookings.alight_order', '>', $userDepOrder);
            })
            ->exists();

        if ($isOccupied) {
            return response()->json([
                'status' => 'error',
                'message' => 'Maaf, kursi ini sudah dipesan oleh penumpang lain di rute pilihan Anda.'
            ], 422);
        }

        // 4. TRANSACTION BLOCK: Menyimpan ke 3 tabel sekaligus secara aman
        DB::beginTransaction();
        try {
            // A. Simpan ke tabel bookings
            $booking = Booking::create([
                'booking_code' => 'KAI-' . strtoupper(Str::random(8)),
                'user_id' => 2, // Sementara kita hardcode ke ID 2 (Budi dari seeder) karena belum setup token login
                'schedule_id' => $request->schedule_id,
                'board_station_id' => $request->departure_station_id,
                'alight_station_id' => $request->arrival_station_id,
                'board_order' => $userDepOrder,
                'alight_order' => $userArrOrder,
                'status' => 'pending',
                'total_price' => $ticketPrice,
                'booking_date' => now(),
            ]);

            // B. Simpan ke tabel booking_details
            BookingDetail::create([
                'booking_id' => $booking->id,
                'passenger_nik' => $request->passenger_nik,
                'passenger_name' => $request->passenger_name,
                'passenger_gender' => $request->passenger_gender,
                'coach_number' => $request->coach_number,
                'seat_number' => $request->seat_number,
                'ticket_price' => $ticketPrice,
            ]);

            // C. Simpan ke tabel payments (Batas bayar 1 jam dari sekarang)
            Payment::create([
                'booking_id' => $booking->id,
                'payment_method' => 'QRIS',
                'payment_status' => 'pending',
                'expired_at' => now()->addHour(),
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Booking berhasil dibuat! Silahkan lakukan pembayaran.',
                'data' => [
                    'booking_code' => $booking->booking_code,
                    'total_price' => $booking->total_price,
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
}