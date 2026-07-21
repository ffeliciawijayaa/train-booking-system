<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\Payment;
use App\Models\Schedule;
use App\Models\Protection;
use App\Models\PaymentMethod;
use App\Services\FareService;
use App\Services\SeatAvailabilityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingController extends Controller
{

    //dropdown fe
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


//endpoint transaksi
    public function store(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'departure_station_id' => 'required|exists:stations,id',
            'arrival_station_id' => 'required|exists:stations,id',
            'coach_number' => 'required|integer',
            'passengers' => 'required|array|min:1',
            'passengers.*.name' => 'required|string',
            'passengers.*.nik' => 'required|string|size:16',
            'passengers.*.gender' => 'required|in:pria,wanita',
            'passengers.*.type' => 'required|in:dewasa,infant',
            'passengers.*.seat_number' => 'nullable|string',
            'passengers.*.birth_date' => 'nullable|date',
        ]);

        //ambil data urutan stasiun
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
        $ticketPricePerPassenger = FareService::calculateFare($depStop, $arrStop);
        
        $adultPassengers = collect($request->passengers)->where('type', 'dewasa');
        $infantPassengers = collect($request->passengers)->where('type', 'infant');

        if ($infantPassengers->count() > $adultPassengers->count()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Jumlah penumpang bayi tidak boleh melebihi jumlah penumpang dewasa.'
            ], 422);
        }

        $seatNumbers = $adultPassengers->pluck('seat_number')->filter()->toArray();

        //proteksi bentrok
        $occupiedSeats = SeatAvailabilityService::getConflictingSeats(
            $request->schedule_id,
            $request->coach_number,
            $seatNumbers,
            $userDepOrder,
            $userArrOrder
        );

        if (!empty($seatNumbers) && !empty($occupiedSeats)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Maaf, kursi berikut sudah dipesan oleh penumpang lain: ' . implode(', ', $occupiedSeats)
            ], 422);
        }

        //nik unik
        $niks = collect($request->passengers)->pluck('nik')->toArray();
        
        if (count($niks) !== count(array_unique($niks))) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terdapat NIK ganda pada formulir. 1 NIK hanya bisa digunakan 1 kali per perjalanan.'
            ], 422);
        }


        $duplicateNiks = SeatAvailabilityService::getConflictingNiks(
            $request->schedule_id,
            $niks,
            $userDepOrder,
            $userArrOrder
        );

        if (!empty($duplicateNiks)) {
            return response()->json([
                'status' => 'error',
                'message' => 'NIK berikut sudah terdaftar pada jadwal kereta ini: ' . implode(', ', array_unique($duplicateNiks)) . '. Satu NIK hanya boleh membeli tiket satu kali per jadwal.'
            ], 422);
        }
   

        $totalPassengers = count($request->passengers);
        $totalAdults = $adultPassengers->count();
        $totalPrice = $ticketPricePerPassenger * $totalAdults;

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
                $isInfant = $passenger['type'] === 'infant';
                BookingDetail::create([
                    'booking_id' => $booking->id,
                    'passenger_nik' => $passenger['nik'],
                    'passenger_name' => $passenger['name'],
                    'passenger_gender' => $passenger['gender'],
                    'passenger_type' => $passenger['type'],
                    'passenger_birth_date' => $isInfant ? ($passenger['birth_date'] ?? null) : null,
                    'coach_number' => $isInfant ? null : $request->coach_number,
                    'seat_number' => $isInfant ? null : $passenger['seat_number'],
                    'ticket_price' => $isInfant ? 0 : $ticketPricePerPassenger,
                ]);
            }

            Payment::create([
                'booking_id' => $booking->id,
                'payment_status' => 'pending',
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
            'schedule.routeStops',
            'bookingDetails',
            'payment',
            'boardStation', 
            'alightStation',
            'protection' 
        ])->findOrFail($id);

        if ($booking->user_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke pesanan ini.'
            ], 403);
        }


        $routeStops = collect($booking->schedule->routeStops ?? []);
        $boardStop = $routeStops->firstWhere('stop_order', $booking->board_order);
        $alightStop = $routeStops->firstWhere('stop_order', $booking->alight_order);

        if ($booking->schedule) {
            $booking->schedule->departure_time = $boardStop ? $boardStop->departure_time : null;
            $booking->schedule->arrival_time = $alightStop ? $alightStop->arrival_time : null;
            

            unset($booking->schedule->routeStops);
        }

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

        if ($booking->user_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke pesanan ini.'
            ], 403);
        }

        if ($booking->status === 'canceled') {
            return response()->json([
                'status' => 'error',
                'message' => 'Pesanan telah dibatalkan.'
            ], 422);
        }

        if ($booking->status === 'completed') {
            return response()->json([
                'status' => 'error',
                'message' => 'Pesanan ini sudah dibayar.'
            ], 400);
        }

        //pembatalan otomatis jika batas waktu 15 menit terlewati
        if ($booking->status === 'pending' && now()->greaterThan($booking->payment->expired_at)) {
            $booking->update(['status' => 'canceled']);
            return response()->json([
                'status' => 'error',
                'message' => 'Waktu pembayaran telah habis. Pesanan dibatalkan dan kursi telah dirilis kembali.'
            ], 422);
        }

        //kalkulasi jika penumpang memilih asuransi perjalanan
        $protectionPrice = 0;
        if ($request->protection_id) {
            $protection = Protection::where('id', $request->protection_id)->where('is_active', true)->first();
            if ($protection) {
                $paxCount = $booking->bookingDetails()->where('passenger_type', 'dewasa')->count() ?: 1;
                $booking->protection_id = $protection->id;
                $protectionPrice = $protection->price * $paxCount;
                $booking->protection_price = $protectionPrice;
                $booking->total_price = $booking->total_price + $protectionPrice; 
            }
        }

        DB::beginTransaction();
        try {
            //uppdate status booking (dan total harga baru jika pakai asuransi)
            $booking->status = 'completed';
            $booking->save();

            //update log pembayaran
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

    public function ticket($id)
    {
        $booking = Booking::with([
            'schedule.train',
            'schedule.routeStops',
            'bookingDetails',
            'payment',
            'boardStation',
            'alightStation',
            'protection'
        ])->findOrFail($id);

        if ($booking->user_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke tiket ini.'
            ], 403);
        }

        $routeStops = collect($booking->schedule->routeStops ?? []);
        $boardStop = $routeStops->firstWhere('stop_order', $booking->board_order);
        $alightStop = $routeStops->firstWhere('stop_order', $booking->alight_order);

        if ($booking->schedule) {
            $booking->schedule->departure_time = $boardStop ? $boardStop->departure_time : null;
            $booking->schedule->arrival_time = $alightStop ? $alightStop->arrival_time : null;
            unset($booking->schedule->routeStops);
        }

        return response()->json([
            'status' => 'success',
            'data' => $booking
        ]);
    }
}