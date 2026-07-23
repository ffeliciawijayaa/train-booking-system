<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingDetail extends Model
{
    protected $fillable = [
        'booking_id',
        'passenger_nik',
        'passenger_name',
        'passenger_gender',
        'coach_number',
        'seat_number',
        'ticket_price'
    ];

    //detail penumpang ini merujuk ke struk booking yang mana?
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
