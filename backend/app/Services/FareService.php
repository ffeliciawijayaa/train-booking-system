<?php

namespace App\Services;

class FareService
{
    /**
     * Calculate partial fare between departure stop and arrival stop.
     *
     * @param object|null $departureStop
     * @param object|null $arrivalStop
     * @return float|int
     */
    public static function calculateFare($departureStop, $arrivalStop)
    {
        if (!$departureStop || !$arrivalStop) {
            return 0;
        }

        return $arrivalStop->price_from_start - $departureStop->price_from_start;
    }
}
