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
        Schema::create('route_stops', function (Blueprint $table) {
            $table->id();
            // Menghubungkan ke jadwal dan stasiun
            $table->foreignId('schedule_id')->constrained('schedules')->onDelete('cascade');
            $table->foreignId('station_id')->constrained('stations')->onDelete('cascade');
            
            $table->integer('stop_order'); // Angka urutan (1, 2, 3, dst)
            $table->dateTime('arrival_time')->nullable();   // Jam tiba (bisa kosong untuk stasiun pertama)
            $table->dateTime('departure_time')->nullable(); // Jam berangkat (bisa kosong untuk stasiun terakhir)
            $table->decimal('price_from_start', 10, 2);     // Patokan harga dari stasiun awal
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('route_stops');
    }
};
