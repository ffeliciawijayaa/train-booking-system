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
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('protection_id')->nullable()->constrained('protections')->nullOnDelete();
            $table->decimal('protection_price', 10, 2)->default(0)->after('protection_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['protection_id']);
            $table->dropColumn(['protection_id', 'protection_price']);
        });
    }
};
