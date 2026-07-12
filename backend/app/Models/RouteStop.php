<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteStop extends Model
{
    protected $fillable = [
        'schedule_id', 
        'station_id', 
        'stop_order', 
        'arrival_time', 
        'departure_time', 
        'price_from_start'
    ];

    // Relasi: Titik rute ini milik jadwal mana?
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    // Relasi: Titik rute ini merujuk ke stasiun mana?
    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }
}
