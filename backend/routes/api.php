<?php

use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserController;

//autentikasi
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

//informasi jadwal dan kursi
Route::get('/schedules/{id}/occupied-seats', [TicketController::class, 'getOccupiedSeats']);
Route::get('/schedules/{id}/detail', [TicketController::class, 'getScheduleDetail']);

//pencarian stasiun dan tiket
Route::get('/user/stations', [UserController::class, 'getStations']);
Route::get('/tickets/search', [TicketController::class, 'search']);


//rute khusus user
Route::middleware('auth:sanctum')->group(function () {
    //profile
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::put('/user/profile', [UserController::class, 'updateProfile']);

    //metode pembayaran dan proteksi
    Route::get('/protections', [UserController::class, 'getProtections']);
    Route::get('/payment-methods', [UserController::class, 'getPaymentMethods']);

    //proses pemesanan tiket
    Route::post('/tickets/booking', [BookingController::class, 'store']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::post('/bookings/{id}/pay', [BookingController::class, 'pay']);
    Route::get('/bookings/{id}/ticket', [BookingController::class, 'ticket']);
    
    //riwayat pemesanan
    Route::get('/user/bookings', [UserController::class, 'getUserBookings']);
});


//rute khusus admin
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    
    //crud stasiun
    Route::get('/admin/stations', [AdminController::class, 'getStation']);
    Route::post('/admin/stations', [AdminController::class, 'storeStation']);
    Route::put('/admin/stations/{id}', [AdminController::class, 'updateStation']);
    Route::delete('/admin/stations/{id}', [AdminController::class, 'deleteStation']);

    //crud kereta
    Route::get('/admin/trains', [AdminController::class, 'getTrain']);
    Route::post('/admin/trains', [AdminController::class, 'storeTrain']);
    Route::put('/admin/trains/{id}', [AdminController::class, 'updateTrain']);
    Route::delete('/admin/trains/{id}', [AdminController::class, 'deleteTrain']);

    //crud jadwal
    Route::get('/admin/schedules', [AdminController::class, 'getSchedules']);
    Route::post('/admin/schedules', [AdminController::class, 'storeSchedule']);
    Route::put('admin/schedules/{id}', [AdminController::class, 'updateSchedule']);
    Route::delete('/admin/schedules/{id}', [AdminController::class, 'deleteSchedule']);

    //crud protections
    Route::get('/admin/protections', [AdminController::class, 'getProtection']);
    Route::post('/admin/protections', [AdminController::class, 'storeProtection']);
    Route::put('/admin/protections/{id}', [AdminController::class, 'updateProtection']);
    Route::delete('/admin/protections/{id}', [AdminController::class, 'deleteProtection']);

    //crud metode pembayaran
    Route::get('/admin/payment-methods', [AdminController::class, 'getPaymentMethod']);
    Route::post('/admin/payment-methods', [AdminController::class, 'storePaymentMethod']);
    Route::put('/admin/payment-methods/{id}', [AdminController::class, 'updatePaymentMethod']);
    Route::delete('/admin/payment-methods/{id}', [AdminController::class, 'deletePaymentMethod']);

    //riwayat transaksi
    Route::get('/admin/bookings', [AdminController::class, 'getBookingHistory']);

    //manajemen user dan admin
    Route::get('/admin/admins', [AdminController::class, 'getAdmins']);
    Route::get('/admin/users', [AdminController::class, 'getUsers']);
    Route::post('/admin/admins', [AdminController::class, 'storeAdmin']);
    Route::put('/admin/admins/{id}', [AdminController::class, 'updateAdmin']);
    Route::delete('/admin/admins/{id}', [AdminController::class, 'deleteAdmin']);
});
