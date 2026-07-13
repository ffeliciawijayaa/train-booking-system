import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function MyTickets() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('aktif'); // 'aktif' atau 'riwayat'
    
    useEffect(() => {
        const fetchBookings = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const res = await axios.get('http://127.0.0.1:8000/api/user/bookings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(res.data.data);
            } catch (err) {
                console.error("Gagal mengambil riwayat tiket", err);
                if (err.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [navigate]);

    // Memisahkan tiket aktif dan riwayat
    const activeTickets = [];
    const historyTickets = [];

    bookings.forEach(booking => {
        // Asumsi format tanggal YYYY-MM-DD
        const journeyDate = new Date(booking.schedule?.journey_date);
        journeyDate.setHours(23, 59, 59, 999); // Akhir hari dari jadwal
        const isPast = journeyDate < new Date();
        const isCanceled = booking.status === 'canceled';

        if (isPast || isCanceled) {
            historyTickets.push(booking);
        } else {
            activeTickets.push(booking);
        }
    });

    const displayTickets = activeTab === 'aktif' ? activeTickets : historyTickets;

    const renderTicketCard = (booking) => {
        // Status di backend adalah 'completed' jika sudah dibayar
        const isPaid = booking.status === 'completed'; 
        const isCanceled = booking.status === 'canceled';
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=KAI_${booking.booking_code}`;

        return (
            <div key={booking.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 mb-4">
                <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="font-bold text-lg text-slate-800">{booking.schedule?.train?.name || 'Kereta'}</span>
                            <div className="text-sm text-slate-500 mt-1">
                                Kode Booking: <span className="font-bold text-slate-800">{booking.booking_code}</span>
                                <span className="mx-2 hidden sm:inline">•</span>
                                <br className="sm:hidden" />
                                Berangkat: <span className="font-bold text-slate-800">{booking.schedule?.journey_date || '-'}</span>
                            </div>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide 
                            ${isPaid ? 'bg-green-100 text-green-700' 
                            : isCanceled ? 'bg-red-100 text-red-700' 
                            : 'bg-amber-100 text-amber-700'}`}>
                            {isPaid ? 'Lunas / Aktif' : isCanceled ? 'Dibatalkan' : 'Menunggu Pembayaran'}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-slate-700">
                        <div className="font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">{booking.board_station?.name}</div>
                        <span className="text-slate-400">&rarr;</span>
                        <div className="font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">{booking.alight_station?.name}</div>
                    </div>
                    
                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="font-semibold mb-2 text-slate-800">Daftar Penumpang:</div>
                        <ul className="space-y-1">
                            {booking.booking_details?.map((detail, idx) => (
                                <li key={idx} className="flex justify-between border-b border-slate-200 border-dashed pb-1 last:border-0 last:pb-0">
                                    <span>{detail.passenger_name} ({detail.passenger_type})</span>
                                    <span className="font-medium">Gerbong {detail.coach_number} - Kursi {detail.seat_number}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex flex-col items-center justify-center text-center">
                    {isPaid ? (
                        <>
                            <div className="text-xs text-slate-500 mb-2 font-semibold">Tunjukkan QR ini saat boarding</div>
                            <img src={qrCodeUrl} alt="QR Code Boarding" className="w-32 h-32 border border-slate-200 p-2 rounded-xl mb-3 shadow-sm" />
                            <div className="text-xs text-slate-400">Scan QR Code</div>
                        </>
                    ) : isCanceled ? (
                        <div className="text-red-500 font-bold mb-4">Tiket ini telah dibatalkan.</div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full w-full">
                            <div className="text-sm text-slate-500 mb-1">Total Tagihan</div>
                            <div className="text-2xl font-extrabold text-amber-600 mb-4">
                                Rp {parseInt(booking.total_price).toLocaleString('id-ID')}
                            </div>
                            <Link to={`/payment/${booking.id}`} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-amber-500/20 transition-all w-full">
                                Lanjutkan Pembayaran
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-800">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <span>🎫</span> Tiket Saya
                    </h1>
                    <Link to="/search" className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 transition-colors">
                        &larr; Cari Tiket Lain
                    </Link>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 border-b border-slate-200 pb-px">
                    <button 
                        onClick={() => setActiveTab('aktif')}
                        className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-colors ${activeTab === 'aktif' ? 'bg-white text-blue-600 border-t border-l border-r border-slate-200' : 'text-slate-500 hover:bg-white/50'}`}
                    >
                        Tiket Aktif ({activeTickets.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('riwayat')}
                        className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-colors ${activeTab === 'riwayat' ? 'bg-white text-blue-600 border-t border-l border-r border-slate-200' : 'text-slate-500 hover:bg-white/50'}`}
                    >
                        Riwayat Perjalanan ({historyTickets.length})
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-slate-500 animate-pulse font-semibold">Memuat data tiket...</div>
                ) : displayTickets.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-slate-100">
                        <div className="text-slate-300 mb-4 text-6xl">🎟️</div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Tidak ada tiket</h3>
                        <p className="text-slate-500 text-sm">Anda tidak memiliki {activeTab === 'aktif' ? 'tiket aktif' : 'riwayat perjalanan'}.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayTickets.map(renderTicketCard)}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyTickets;
