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
        Schema::table('booking_details', function (Blueprint $table) {
            $table->enum('passenger_type', ['dewasa', 'infant'])->default('dewasa')->after('passenger_gender');
            $table->string('seat_number', 5)->nullable()->change();
            $table->integer('coach_number')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_details', function (Blueprint $table) {
            $table->dropColumn('passenger_type');
            $table->string('seat_number', 5)->nullable(false)->change();
            $table->integer('coach_number')->nullable(false)->change();
        });
    }
};
