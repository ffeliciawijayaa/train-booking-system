<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    protected $fillable = [
        'booking_code',
        'user_id',
        'schedule_id',
        'board_station_id',
        'alight_station_id',
        'board_order',
        'alight_order',
        'status',
        'total_price',
        'booking_date'
    ];

    // Relasi: Pesanan ini dibuat oleh user mana?
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Relasi: Pesanan ini untuk jadwal perjalanan yang mana?
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    // Relasi: Pesanan ini naik di stasiun mana?
    public function boardStation(): BelongsTo
    {
        return $this->belongsTo(Station::class, 'board_station_id');
    }

    // Relasi: Pesanan ini turun di stasiun mana?
    public function alightStation(): BelongsTo
    {
        return $this->belongsTo(Station::class, 'alight_station_id');
    }

    // Relasi: Satu struk booking memiliki banyak detail penumpang di dalamnya
    public function details(): HasMany
    {
        return $this->hasMany(BookingDetail::class);
    }

    // Relasi: Satu struk booking memiliki satu catatan pembayaran
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }
}
