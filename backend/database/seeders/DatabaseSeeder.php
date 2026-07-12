<?php
namespace Database\Seeders;

use App\Models\User;
use App\Models\Station;
use App\Models\Train;
use App\Models\Schedule;
use App\Models\RouteStop;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Membuat Akun Tester (Admin & User)
        User::create([
            'name' => 'Admin KAI',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'nik' => '3273012345678901',
            'phone_number' => '08123456789',
            'gender' => 'pria',
        ]);

        // 2. Membuat Data Master Stasiun
        $gambir = Station::create(['station_code' => 'GMR', 'name' => 'Gambir', 'city' => 'Jakarta']);
        $cirebon = Station::create(['station_code' => 'CN', 'name' => 'Cirebon', 'city' => 'Cirebon']);
        $semarang = Station::create(['station_code' => 'SMT', 'name' => 'Semarang Tawang', 'city' => 'Semarang']);
        $surabaya = Station::create(['station_code' => 'SBI', 'name' => 'Surabaya Pasarturi', 'city' => 'Surabaya']);

        // 3. Membuat Data Master Kereta
        $argoBromo = Train::create([
            'train_code' => 'ARG-01',
            'name' => 'Argo Bromo Anggrek',
            'class' => 'executive',
            'total_coaches' => 5, // Kita set 5 gerbong dulu untuk contoh
        ]);

        // 4. Membuat "Bungkus" Jadwal Kereta (Untuk tanggal di masa depan)
        $schedule = Schedule::create([
            'train_id' => $argoBromo->id,
            'journey_date' => '2026-08-20', // Tanggal perjalanan contoh
            'status' => 'scheduled',
        ]);

        // 5. Membuat "Penggaris" Rute Pemberhentian (Jantung Fitur Overlap)
        // Jalur: Gambir -> Cirebon -> Semarang -> Surabaya
        RouteStop::create([
            'schedule_id' => $schedule->id,
            'station_id' => $gambir->id,
            'stop_order' => 1, // Stasiun ke-1
            'arrival_time' => null, // Awal berangkat tidak punya jam tiba
            'departure_time' => '2026-08-20 08:00:00',
            'price_from_start' => 0,
        ]);

        RouteStop::create([
            'schedule_id' => $schedule->id,
            'station_id' => $cirebon->id,
            'stop_order' => 2, // Stasiun ke-2
            'arrival_time' => '2026-08-20 11:00:00',
            'departure_time' => '2026-08-20 11:15:00',
            'price_from_start' => 150000, // Harga Jakarta -> Cirebon
        ]);

        RouteStop::create([
            'schedule_id' => $schedule->id,
            'station_id' => $semarang->id,
            'stop_order' => 3, // Stasiun ke-3
            'arrival_time' => '2026-08-20 14:00:00',
            'departure_time' => '2026-08-20 14:15:00',
            'price_from_start' => 300000, // Harga Jakarta -> Semarang
        ]);

        RouteStop::create([
            'schedule_id' => $schedule->id,
            'station_id' => $surabaya->id,
            'stop_order' => 4, // Stasiun ke-4 (Terakhir)
            'arrival_time' => '2026-08-20 18:00:00',
            'departure_time' => null, // Akhir tujuan tidak punya jam berangkat lagi
            'price_from_start' => 500000, // Harga Jakarta -> Surabaya
        ]);
    }
}