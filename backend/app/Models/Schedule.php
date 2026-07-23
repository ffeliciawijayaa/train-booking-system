<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Schedule extends Model
{
    protected $fillable = ['train_id', 'journey_date', 'status'];

    //jadwal ini milik kereta mana?
    public function train(): BelongsTo
    {
        return $this->belongsTo(Train::class);
    }

    //jadwal ini punya banyak titik pemberhentian stasiun 
    public function routeStops(): HasMany
    {
        return $this->hasMany(RouteStop::class)->orderBy('stop_order', 'asc'); 
    }

    //jadwal ini punya banyak pesanan tiket
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    // Accessor: Otomatis ubah status menjadi completed jika tanggal sudah lewat
    public function getStatusAttribute($value)
    {
        if ($this->journey_date < date('Y-m-d') && $value !== 'completed') {
            return 'completed';
        }
        
        return $value;
    }
}
