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
        Schema::create('booking_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            
            //data penumpang
            //nik misal user yang tdk login kan ttp bisa ditambahkan sbg penumpang
            $table->string('passenger_nik', 16);
            $table->string('passenger_name');
            $table->enum('passenger_gender', ['pria', 'wanita']);
            
            //posisi Duduk
            $table->integer('coach_number'); 
            $table->string('seat_number', 5); 
            
            $table->decimal('ticket_price', 10, 2);
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_details');
    }
};
