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
            'birth_date' => '1990-01-01',
        ]);

        User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'nik' => '3273012345678901',
            'phone_number' => '08123456789',
            'gender' => 'pria',
            'birth_date' => '1995-05-15',
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
        $argoLawu = Train::create([
            'train_code' => 'ARG-02',
            'name' => 'Argo Lawu',
            'class' => 'executive',
            'total_coaches' => 6,
        ]);

        $matarmaja = Train::create([
            'train_code' => 'MTR-01',
            'name' => 'Matarmaja',
            'class' => 'economy',
            'total_coaches' => 7,
        ]);

        $taksaka = Train::create([
            'train_code' => 'TKS-01',
            'name' => 'Taksaka',
            'class' => 'economy',
            'total_coaches' => 6,
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

        // 6. Membuat Data Payment Method
        \App\Models\PaymentMethod::create([
            'name' => 'BCA Virtual Account',
            'code' => 'bca_va',
            'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg',
            'instructions' => "1. Masuk ke m-BCA. \n 2. Pilih Transfer > BCA Virtual Account. \n3. Masukkan nomor VA lalu konfirmasi.",
            'is_active' => true
        ]);
        \App\Models\PaymentMethod::create([
            'name' => 'Mandiri Virtual Account',
            'code' => 'mandiri_va',
            'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg',
            'instructions' => "1. Masuk ke Livin by Mandiri. \n2. Pilih Bayar > Multi Payment. \n3. Masukkan kode perusahaan dan nomor VA.",
            'is_active' => true
        ]);
        \App\Models\PaymentMethod::create([
            'name' => 'GoPay',
            'code' => 'gopay',
            'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg',
            'instructions' => "1. Buka aplikasi GoPay. \n2. Scan QR Code pada layar. \n3. Masukkan PIN untuk konfirmasi.",
            'is_active' => true
        ]);
        \App\Models\PaymentMethod::create([
            'name' => 'OVO',
            'code' => 'ovo',
            'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg',
            'instructions' => "1. Masukkan nomor HP OVO Anda. \n2. Buka notifikasi aplikasi OVO. \n3. Klik Bayar untuk menyelesaikan.",
            'is_active' => true
        ]);
        \App\Models\PaymentMethod::create([
            'name' => 'QRIS',
            'code' => 'qris',
            'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/e/e1/QRIS_logo.svg',
            'instructions' => "1. Buka aplikasi m-banking / e-wallet. \n2. Scan QRIS yang tampil di layar. \n3. Masukkan PIN dan bayar.",
            'is_active' => true
        ]);

        // 7. Membuat Data Protection (Asuransi)
        \App\Models\Protection::create(['name' => 'Asuransi Perjalanan Standard', 'description' => 'Kompensasi keterlambatan dan kecelakaan ringan.', 'price' => 15000, 'is_active' => true]);
        \App\Models\Protection::create(['name' => 'Asuransi Perjalanan Premium', 'description' => 'Kompensasi penuh untuk pembatalan, keterlambatan, dan medis.', 'price' => 35000, 'is_active' => true]);
    }
}
