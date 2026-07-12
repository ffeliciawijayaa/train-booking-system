<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Schedule extends Model
{
    protected $fillable = ['train_id', 'journey_date', 'status'];

    // Relasi: Jadwal ini milik kereta mana?
    public function train(): BelongsTo
    {
        return $this->belongsTo(Train::class);
    }

    // Relasi: Jadwal ini punya banyak titik pemberhentian stasiun (penggaris rute)
    public function routeStops(): HasMany
    {
        return $this->hasMany(RouteStop::class)->orderBy('stop_order', 'asc'); 
        // Ditambahkan orderBy agar otomatis urut dari stasiun awal ke akhir
    }

    // Relasi: Jadwal ini punya banyak pesanan tiket
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
