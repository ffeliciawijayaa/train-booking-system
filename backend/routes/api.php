<?php

use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserController;

// 1. RUTE PUBLIK BEBAS (Siapa saja boleh akses tanpa login)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/tickets/search', [TicketController::class, 'search']);
Route::get('/tickets/seats', [TicketController::class, 'getAvailableSeats']);
Route::get('/schedules/{id}/occupied-seats', [TicketController::class, 'getOccupiedSeats']);
Route::get('/schedules/{id}/detail', [TicketController::class, 'getScheduleDetail']);

// Rute Publik untuk Dropdown dan Pencarian Rute
Route::get('/user/stations', [UserController::class, 'getStations']);
Route::post('/user/search-tickets', [UserController::class, 'searchTickets']);

// Rute Publik untuk Proteksi dan Metode Pembayaran
Route::get('/protections', [UserController::class, 'getProtections']);
Route::get('/payment-methods', [UserController::class, 'getPaymentMethods']);

// ========================================================================


// 2. RUTE KHUSUS USER LOGIN (User biasa maupun admin wajib login pakai Token)
Route::middleware('auth:sanctum')->group(function () {

    // Rute untuk mengambil profil user yang sedang login (Dipakai auto-fill form penumpang React)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Rute untuk update profil user
    Route::put('/user/profile', [UserController::class, 'updateProfile']);

    // --- PROSES BOOKING DAN PEMBAYARAN (PINDAH KE SINI YA!) ---
    Route::post('/tickets/booking', [BookingController::class, 'store']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::post('/bookings/{id}/pay', [BookingController::class, 'pay']);
    Route::get('/bookings/{id}/ticket', [BookingController::class, 'ticket']);
    
    // --- RIWAYAT TIKET (MY TICKETS) ---
    Route::get('/user/bookings', [UserController::class, 'getUserBookings']);
});


// =========================================================================


// 3. RUTE KHUSUS ADMIN (Wajib login DAN rolenya harus admin)
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/stations', [AdminController::class, 'getStation']);
    Route::post('/admin/stations', [AdminController::class, 'storeStation']);
    Route::put('/admin/stations/{id}', [AdminController::class, 'updateStation']);
    Route::delete('/admin/stations/{id}', [AdminController::class, 'deleteStation']);

    Route::get('/admin/trains', [AdminController::class, 'getTrain']);
    Route::post('/admin/trains', [AdminController::class, 'storeTrain']);
    Route::put('/admin/trains/{id}', [AdminController::class, 'updateTrain']);
    Route::delete('/admin/trains/{id}', [AdminController::class, 'deleteTrain']);

    Route::get('/admin/schedules', [AdminController::class, 'getSchedules']);
    Route::post('/admin/schedules', [AdminController::class, 'storeSchedule']);
    Route::put('admin/schedules/{id}', [AdminController::class, 'updateSchedule']);
    Route::delete('/admin/schedules/{id}', [AdminController::class, 'deleteSchedule']);

    // Admin Protections
    Route::get('/admin/protections', [AdminController::class, 'getProtection']);
    Route::post('/admin/protections', [AdminController::class, 'storeProtection']);
    Route::put('/admin/protections/{id}', [AdminController::class, 'updateProtection']);
    Route::delete('/admin/protections/{id}', [AdminController::class, 'deleteProtection']);

    // Admin Payment Methods
    Route::get('/admin/payment-methods', [AdminController::class, 'getPaymentMethod']);
    Route::post('/admin/payment-methods', [AdminController::class, 'storePaymentMethod']);
    Route::put('/admin/payment-methods/{id}', [AdminController::class, 'updatePaymentMethod']);
    Route::delete('/admin/payment-methods/{id}', [AdminController::class, 'deletePaymentMethod']);

    // Admin Bookings (History Transaksi)
    Route::get('/admin/bookings', [AdminController::class, 'getBookingHistory']);

    // Admin Management
    Route::get('/admin/admins', [AdminController::class, 'getAdmins']);
    Route::get('/admin/users', [AdminController::class, 'getUsers']);
    Route::post('/admin/admins', [AdminController::class, 'storeAdmin']);
    Route::put('/admin/admins/{id}', [AdminController::class, 'updateAdmin']);
    Route::delete('/admin/admins/{id}', [AdminController::class, 'deleteAdmin']);
});
