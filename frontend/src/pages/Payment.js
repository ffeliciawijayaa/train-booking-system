import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Payment() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    
    const [bookingData, setBookingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMethod, setSelectedMethod] = useState('QRIS');
    const [isProcessing, setIsProcessing] = useState(false);

    // Ambil Token dari localStorage
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchBookingDetail = async () => {
            if (!token) {
                alert("Anda belum login.");
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/bookings/${bookingId}`, {
                    // WAJIB: Masukkan token ke header
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookingData(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error("Gagal mengambil rincian booking", error);
                alert("Data pesanan tidak ditemukan atau sesi Anda habis.");
                setLoading(false);
                if (error.response?.status === 401) navigate('/login');
            }
        };
        fetchBookingDetail();
    }, [bookingId, token, navigate]);

    const handleProcessPayment = async () => {
        setIsProcessing(true);
        try {
            const response = await axios.post(`http://127.0.0.1:8000/api/bookings/${bookingId}/pay`, {
                payment_method: selectedMethod
            }, {
                // WAJIB: Masukkan token ke header
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert(response.data.message);
            // Pindahkan user ke halaman Riwayat / Tiket Saya setelah sukses lunas
            navigate('/my-tickets'); 
        } catch (error) {
            console.error("Pembayaran gagal", error);
            alert(error.response?.data?.message || "Terjadi kendala saat memproses pembayaran.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center font-semibold text-slate-600">Memuat rincian tagihan...</div>;
    if (!bookingData) return <div className="p-8 text-center text-red-500 font-semibold">Data transaksi tidak valid.</div>;

    // URL dinamis untuk membuat gambar QR Code
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=QRIS_KAI_${bookingData.booking_code}_${bookingData.total_price}`;

    return (
        <div className="p-4 sm:p-8 bg-slate-50 min-h-screen text-slate-800">
            <div className="max-w-4xl mx-auto">
                
                {/* Timer Warning Box */}
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6 flex items-center justify-between">
                    <div>
                        <h4 className="text-amber-800 font-bold text-sm">Selesaikan Pembayaran Anda</h4>
                        <p className="text-xs text-amber-700 mt-0.5">Kursi Anda telah dipesan sementara. Segera bayar sebelum batas waktu habis.</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-slate-500 block">Batas Waktu Dokumen</span>
                        <span className="text-sm font-mono font-bold text-amber-800">
                            {bookingData.payment?.expired_at ? new Date(bookingData.payment.expired_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* KIRI: REVIEW PERJALANAN & MANIFES */}
                    <div className="md:col-span-7 space-y-6">
                        
                        {/* Detail Rute Kereta */}
                        <div className="bg-white p-5 rounded-xl border shadow-sm">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {bookingData.schedule?.train?.class?.toUpperCase() || 'KERETA'}
                            </span>
                            <h3 className="text-lg font-bold text-slate-900 mt-2">{bookingData.schedule?.train?.name}</h3>
                            <p className="text-xs text-slate-400 font-mono mb-4">Kode Booking: {bookingData.booking_code}</p>
                            
                            <div className="border-t pt-4 space-y-3">
                                <div className="flex justify-between items-start text-sm">
                                    <div>
                                        <p className="font-bold text-slate-900">{bookingData.board_station?.name || 'Stasiun Asal'}</p>
                                        <p className="text-xs text-slate-500">Keberangkatan</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900">{bookingData.alight_station?.name || 'Stasiun Tujuan'}</p>
                                        <p className="text-xs text-slate-500">Kedatangan</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Manifes Daftar Penumpang */}
                        <div className="bg-white p-5 rounded-xl border shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 border-b pb-2">Detail Penumpang & Kursi</h3>
                            <div className="space-y-3">
                                {bookingData.booking_details?.map((detail, index) => (
                                    <div key={detail.id || index} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border text-xs">
                                        <div>
                                            <p className="font-bold text-slate-800">{detail.passenger_name} ({detail.passenger_gender === 'pria' ? 'L' : 'P'})</p>
                                            <p className="text-slate-400 font-mono mt-0.5">NIK: {detail.passenger_nik}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="bg-blue-600 text-white font-bold px-2.5 py-1 rounded-md">
                                                Gbg {detail.coach_number} - {detail.seat_number}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* KANAN: PILIH METODE BAYAR & TOTAL */}
                    <div className="md:col-span-5 space-y-6">
                        <div className="bg-white p-5 rounded-xl border shadow-sm sticky top-6">
                            <h3 className="text-sm font-bold text-slate-900 mb-4">Pilih Metode Pembayaran</h3>
                            
                            <div className="space-y-2 mb-6">
                                {['QRIS', 'BCA Virtual Account', 'Mandiri Virtual Account'].map((method) => (
                                    <label 
                                        key={method}
                                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                                            selectedMethod === method 
                                                ? 'border-blue-500 bg-blue-50/30 text-blue-700 ring-1 ring-blue-500' 
                                                : 'border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span>{method}</span>
                                        <input 
                                            type="radio" 
                                            name="payment" 
                                            value={method}
                                            checked={selectedMethod === method}
                                            onChange={() => setSelectedMethod(method)}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                        />
                                    </label>
                                ))}
                            </div>

                            {/* TAMPILAN QRIS DINAMIS */}
                            {selectedMethod === 'QRIS' && (
                                <div className="mb-6 p-4 border rounded-xl flex flex-col items-center bg-slate-50">
                                    <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Scan QRIS Berikut</p>
                                    <div className="p-2 bg-white rounded-xl shadow-sm border">
                                        <img src={qrCodeUrl} alt="QRIS Payment" className="w-40 h-40 object-contain" />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-3 text-center">Buka aplikasi m-banking atau e-wallet Anda untuk memindai.</p>
                                </div>
                            )}

                            {/* Ringkasan Biaya Final */}
                            <div className="border-t pt-4 bg-slate-50 -mx-5 px-5 pb-4 mb-4 rounded-b-xl">
                                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                                    <span>Total Tagihan ({bookingData.booking_details?.length || 0} Tiket)</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm font-bold text-slate-800">Total Bayar:</span>
                                    <span className="text-xl font-extrabold text-blue-600">
                                        Rp {parseInt(bookingData.total_price || 0).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                disabled={isProcessing}
                                onClick={handleProcessPayment}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow transition-colors disabled:opacity-50"
                            >
                                {isProcessing ? 'Memproses Transaksi...' : 'Konfirmasi Telah Bayar'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Payment;