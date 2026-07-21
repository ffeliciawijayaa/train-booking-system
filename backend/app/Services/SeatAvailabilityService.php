<?php

namespace App\Services;

use App\Models\BookingDetail;

class SeatAvailabilityService
{
    /**
     * Get list of occupied seats for a given schedule and segment overlap.
     *
     * @param int|string $scheduleId
     * @param int $boardOrder
     * @param int $alightOrder
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getOccupiedSeats($scheduleId, $boardOrder, $alightOrder)
    {
        return BookingDetail::whereHas('booking', function ($query) use ($scheduleId, $boardOrder, $alightOrder) {
            $query->where('schedule_id', $scheduleId)
                ->whereIn('status', ['pending', 'completed'])
                ->where(function ($q) use ($boardOrder, $alightOrder) {
                    $q->where('board_order', '<', $alightOrder)
                        ->where('alight_order', '>', $boardOrder);
                });
        })
        ->get(['coach_number', 'seat_number', 'passenger_gender']);
    }

    /**
     * Get conflicting seat numbers for a specific coach and requested seat list.
     *
     * @param int|string $scheduleId
     * @param int $coachNumber
     * @param array $seatNumbers
     * @param int $boardOrder
     * @param int $alightOrder
     * @return array
     */
    public static function getConflictingSeats($scheduleId, $coachNumber, array $seatNumbers, $boardOrder, $alightOrder)
    {
        if (empty($seatNumbers)) {
            return [];
        }

        return BookingDetail::join('bookings', 'booking_details.booking_id', '=', 'bookings.id')
            ->where('bookings.schedule_id', $scheduleId)
            ->where('booking_details.coach_number', $coachNumber)
            ->whereIn('booking_details.seat_number', $seatNumbers)
            ->whereIn('bookings.status', ['pending', 'completed'])
            ->where(function ($query) use ($boardOrder, $alightOrder) {
                $query->where('bookings.board_order', '<', $alightOrder)
                    ->where('bookings.alight_order', '>', $boardOrder);
            })
            ->pluck('booking_details.seat_number')
            ->toArray();
    }

    /**
     * Get conflicting passenger NIKs for a given schedule, segment overlap, and requested NIK list.
     * Only checks active bookings (status = 'completed' OR (status = 'pending' AND payment is not expired)).
     *
     * @param int|string $scheduleId
     * @param array $niks
     * @param int $boardOrder
     * @param int $alightOrder
     * @return array
     */
    public static function getConflictingNiks($scheduleId, array $niks, $boardOrder, $alightOrder)
    {
        if (empty($niks)) {
            return [];
        }

        return BookingDetail::join('bookings', 'booking_details.booking_id', '=', 'bookings.id')
            ->leftJoin('payments', 'payments.booking_id', '=', 'bookings.id')
            ->where('bookings.schedule_id', $scheduleId)
            ->whereIn('booking_details.passenger_nik', $niks)
            ->where(function ($query) use ($boardOrder, $alightOrder) {
                $query->where('bookings.board_order', '<', $alightOrder)
                    ->where('bookings.alight_order', '>', $boardOrder);
            })
            ->where(function ($query) {
                $query->where('bookings.status', 'completed')
                    ->orWhere(function ($q) {
                        $q->where('bookings.status', 'pending')
                            ->where('payments.expired_at', '>', now());
                    });
            })
            ->pluck('booking_details.passenger_nik')
            ->toArray();
    }
}
