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

Route::get('/tickets/search', [TicketController::class, 'search']);
Route::get('/tickets/seats', [TicketController::class, 'getAvailableSeats']);
Route::get('/schedules/{id}/occupied-seats', [TicketController::class, 'getOccupiedSeats']);
Route::get('/schedules/{id}/detail', [TicketController::class, 'getScheduleDetail']);

// Rute Publik untuk Dropdown dan Pencarian Rute
Route::get('/user/stations', [UserController::class, 'getStations']);
Route::post('/user/search-tickets', [UserController::class, 'searchTickets']);


// ========================================================================


// 2. RUTE KHUSUS USER LOGIN (User biasa maupun admin wajib login pakai Token)
Route::middleware('auth:sanctum')->group(function () {

    // Rute untuk mengambil profil user yang sedang login (Dipakai auto-fill form penumpang React)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // --- PROSES BOOKING DAN PEMBAYARAN (PINDAH KE SINI YA!) ---
    Route::post('/tickets/booking', [BookingController::class, 'store']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::post('/bookings/{id}/pay', [BookingController::class, 'pay']);
});


// =========================================================================


// 3. RUTE KHUSUS ADMIN (Wajib login DAN rolenya harus admin)
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/stations', [AdminController::class, 'indexStation']);
    Route::post('/admin/stations', [AdminController::class, 'storeStation']);
    Route::put('/admin/stations/{id}', [AdminController::class, 'updateStation']);
    Route::delete('/admin/stations/{id}', [AdminController::class, 'destroyStation']);

    Route::get('/admin/trains', [AdminController::class, 'indexTrain']);
    Route::post('/admin/trains', [AdminController::class, 'storeTrain']);
    Route::put('/admin/trains/{id}', [AdminController::class, 'updateTrain']);
    Route::delete('/admin/trains/{id}', [AdminController::class, 'destroyTrain']);

    Route::get('/admin/schedules', [AdminController::class, 'getSchedules']);
    Route::post('/admin/schedules', [AdminController::class, 'storeSchedule']);
    Route::put('admin/schedules/{id}', [AdminController::class, 'updateSchedule']);
    Route::delete('/admin/schedules/{id}', [AdminController::class, 'destroySchedule']);
});
