<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'booking_id',
        'payment_method',
        'payment_status',
        'expired_at',
        'paid_at'
    ];

    // Relasi: Pembayaran ini untuk struk booking yang mana?
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}