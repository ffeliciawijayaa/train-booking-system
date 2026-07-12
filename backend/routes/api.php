<?php

use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserController;

// 1. RUTE PUBLIK BEBAS (Siapa saja boleh akses tanpa login/tanpa middleware admin)
Route::post('/login', [AuthController::class, 'login']);

Route::get('/tickets/search', [TicketController::class, 'search']);
Route::get('/tickets/seats', [TicketController::class, 'getAvailableSeats']);
Route::post('/tickets/booking', [BookingController::class, 'store']);

// Rute Publik/User untuk Dropdown dan Pencarian Penggaris Rute
Route::get('/user/stations', [UserController::class, 'getStations']);
Route::post('/user/search-tickets', [UserController::class, 'searchTickets']);


// =========================================================================


// 2. RUTE KHUSUS ADMIN (DIKUNCI OLEH MIDDLEWARE 'admin')
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
    Route::delete('/admin/schedules/{id}', [AdminController::class, 'destroySchedule']);
    
});