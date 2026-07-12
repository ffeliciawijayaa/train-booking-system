<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Station extends Model
{
    protected $fillable = ['station_code', 'name', 'city'];

    // Relasi: Satu stasiun bisa dipakai di banyak rute pemberhentian
    public function routeStops(): HasMany
    {
        return $this->hasMany(RouteStop::class);
    }
}
