<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\Payment;
use App\Models\Schedule;
use App\Models\Protection;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    // =========================================================================
    // 1. ENDPOINT MASTER DATA (Untuk dropdown/pilihan di Frontend)
    // =========================================================================
    
    public function getPaymentMethods()
    {
        $methods = PaymentMethod::where('is_active', true)->get();
        return response()->json(['status' => 'success', 'data' => $methods]);
    }

    public function getProtections()
    {
        $protections = Protection::where('is_active', true)->get();
        return response()->json(['status' => 'success', 'data' => $protections]);
    }

    // =========================================================================
    // 2. ENDPOINT TRANSAKSI UTAMA
    // =========================================================================

    public function store(Request $request)
    {
        // 1. Validasi input pesanan awal (Fokus pada data penumpang dan kursi saja)
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
        $ticketPricePerPassenger = $arrStop->price_from_start - $depStop->price_from_start;
        $seatNumbers = collect($request->passengers)->pluck('seat_number')->toArray();

        // 3. PROTEKSI BENTROK
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

        if (!empty($occupiedSeats)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Maaf, kursi berikut sudah dipesan oleh penumpang lain: ' . implode(', ', $occupiedSeats)
            ], 422);
        }

        // --- TAMBAHAN PROTEKSI NIK ---
        $niks = collect($request->passengers)->pluck('nik')->toArray();
        
        // 1. Cek apakah ada NIK yang dobel di input saat ini
        if (count($niks) !== count(array_unique($niks))) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terdapat NIK ganda pada formulir. 1 NIK hanya bisa digunakan 1 kali per perjalanan.'
            ], 422);
        }

        // 2. Cek apakah NIK sudah pernah memesan jadwal yang sama dan belum dibatalkan
        $duplicateNiks = BookingDetail::join('bookings', 'booking_details.booking_id', '=', 'bookings.id')
            ->where('bookings.schedule_id', $request->schedule_id)
            ->whereIn('booking_details.passenger_nik', $niks)
            ->whereIn('bookings.status', ['pending', 'completed'])
            ->pluck('booking_details.passenger_nik')
            ->toArray();

        if (!empty($duplicateNiks)) {
            return response()->json([
                'status' => 'error',
                'message' => 'NIK berikut sudah terdaftar pada jadwal kereta ini: ' . implode(', ', array_unique($duplicateNiks)) . '. Satu NIK hanya boleh membeli tiket satu kali per jadwal.'
            ], 422);
        }
        // -----------------------------

        $totalPassengers = count($request->passengers);
        $totalPrice = $ticketPricePerPassenger * $totalPassengers;

        // 4. TRANSACTION BLOCK: Menyimpan data secara atomik
        DB::beginTransaction();
        try {
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

            Payment::create([
                'booking_id' => $booking->id,
                'payment_status' => 'pending',
                // Batas waktu pemesanan diset 15 menit sesuai alur
                'expired_at' => now()->addMinutes(15), 
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

    public function show($id)
    {
        $booking = Booking::with([
            'schedule.train',
            'bookingDetails',
            'payment',
            'boardStation', 
            'alightStation',
            'protection' // Relasi proteksi diload agar tampil di review pesanan
        ])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $booking
        ]);
    }

    public function pay(Request $request, $id)
    {
        $request->validate([
            'payment_method' => 'required|string|exists:payment_methods,code',
            'protection_id' => 'nullable|exists:protections,id'
        ]);

        $booking = Booking::with('payment')->findOrFail($id);

        // Validasi pembatalan otomatis jika batas waktu 15 menit terlewati
        if ($booking->status !== 'pending' || now()->greaterThan($booking->payment->expired_at)) {
            $booking->update(['status' => 'canceled']);
            return response()->json([
                'status' => 'error',
                'message' => 'Waktu pembayaran telah habis. Pesanan dibatalkan dan kursi telah dirilis kembali.'
            ], 422);
        }

        // Kalkulasi dinamis jika penumpang memilih asuransi perjalanan
        $protectionPrice = 0;
        if ($request->protection_id) {
            $protection = Protection::where('id', $request->protection_id)->where('is_active', true)->first();
            if ($protection) {
                $paxCount = $booking->details()->count() ?: 1;
                $booking->protection_id = $protection->id;
                $protectionPrice = $protection->price * $paxCount;
                $booking->protection_price = $protectionPrice;
                $booking->total_price = $booking->total_price + $protectionPrice; 
            }
        }

        DB::beginTransaction();
        try {
            // Update status booking (dan total harga baru jika pakai asuransi)
            $booking->status = 'completed';
            $booking->save();

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