<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code')->unique();
            
            // Relasi ke User dan Jadwal Utama
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('schedule_id')->constrained('schedules')->onDelete('cascade');
            
            // Relasi ke Stasiun Naik dan Turun
            $table->foreignId('board_station_id')->constrained('stations')->onDelete('cascade');
            $table->foreignId('alight_station_id')->constrained('stations')->onDelete('cascade');
            
            // Angka Penggaris untuk logika overlap
            $table->integer('board_order');
            $table->integer('alight_order');
            
            $table->enum('status', ['pending', 'completed', 'cancelled'])->default('pending');
            $table->decimal('total_price', 10, 2);
            $table->dateTime('booking_date');
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
