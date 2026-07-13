<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Support\Facades\DB;

class ExpirePendingPayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:expire-payments';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Expire pending payments and release locked seats';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $expiredPayments = Payment::where('payment_status', 'pending')
            ->where('expired_at', '<', now())
            ->get();

        if ($expiredPayments->isEmpty()) {
            $this->info('No expired payments found.');
            return;
        }

        DB::beginTransaction();
        try {
            foreach ($expiredPayments as $payment) {
                // Update payment status
                $payment->update(['payment_status' => 'expired']);

                // Update booking status
                $booking = Booking::find($payment->booking_id);
                if ($booking) {
                    $booking->update(['status' => 'cancelled']);
                }
            }
            DB::commit();
            $this->info(count($expiredPayments) . ' payments expired successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Failed to expire payments: ' . $e->getMessage());
        }
    }
}
