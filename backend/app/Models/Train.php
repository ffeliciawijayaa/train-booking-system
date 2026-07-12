<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Train extends Model
{
    protected $fillable = ['train_code', 'name', 'class', 'total_coaches'];

    // Relasi: Satu kereta bisa punya banyak jadwal perjalanan
    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }
}
