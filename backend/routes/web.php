<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Rute untuk semua user yang sudah login (Admin & User biasa bisa akses)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');
});

// Rute KHUSUS ADMIN (Dilindungi oleh middleware 'admin')
Route::middleware(['auth', 'admin'])->group(function () {
    
    Route::get('/admin/dashboard', function () {
        return view('admin-dashboard');
    })->name('admin.dashboard');

    // Tempat untuk CRUD Kereta, CRUD Jadwal, dll nanti ditaruh di dalam sini
    
});

require __DIR__.'/auth.php';
