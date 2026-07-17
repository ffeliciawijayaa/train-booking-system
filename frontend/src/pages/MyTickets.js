import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Train, Ticket } from 'lucide-react';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';

function MyTickets() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('aktif');

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

    const activeTickets = [];
    const historyTickets = [];

    bookings.forEach(booking => {
        const journeyDate = new Date(booking.schedule?.journey_date);
        journeyDate.setHours(23, 59, 59, 999);
        const isPast = journeyDate < new Date();
        const isCanceled = booking.status === 'canceled';

        let isExpired = false;
        if (booking.payment?.expired_at) {
            const expired = new Date(booking.payment.expired_at.replace(/-/g, "/")).getTime();
            if (expired < new Date().getTime()) {
                isExpired = true;
            }
        }

        const isExpiredPending = booking.status === 'pending' && isExpired;

        if (isPast || isCanceled || isExpiredPending) {
            historyTickets.push(booking);
        } else {
            activeTickets.push(booking);
        }
    });

    const displayTickets = activeTab === 'aktif' ? activeTickets : historyTickets;

    const renderTicketCard = (booking) => {
        const isPaid = booking.status === 'completed';

        let isExpired = false;
        if (booking.payment?.expired_at) {
            const expired = new Date(booking.payment.expired_at.replace(/-/g, "/")).getTime();
            if (expired < new Date().getTime()) {
                isExpired = true;
            }
        }
        const isCanceled = booking.status === 'canceled' || (booking.status === 'pending' && isExpired);

        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=KAI_${booking.booking_code}`;

        return (
            <div key={booking.id} className="relative bg-white rounded-lg shadow-sm flex flex-col md:flex-row mb-6 transition hover:shadow-md border border-slate-100">
                <div className="flex-1 p-6 space-y-4">
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
                        <span className={`text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wide 
                            ${isPaid ? 'bg-green-100 text-green-700'
                                : isCanceled ? 'bg-slate-100 text-slate-600'
                                    : 'bg-amber-100 text-amber-700'}`}>
                            {isPaid ? 'Aktif' : isCanceled ? 'Dibatalkan' : 'Menunggu Pembayaran'}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-700">
                        <div className="font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded border border-blue-100">{booking.board_station?.name}</div>
                        <span className="text-slate-400">&rarr;</span>
                        <div className="font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded border border-blue-100">{booking.alight_station?.name}</div>
                    </div>

                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-100">
                        <div className="font-semibold mb-2 text-slate-800">Daftar Penumpang:</div>
                        <ul className="space-y-1">
                            {booking.booking_details?.map((detail, idx) => (
                                <li key={idx} className="flex justify-between border-b border-slate-200 border-dashed pb-1 last:border-0 last:pb-0">
                                    <span>{detail.passenger_name} {detail.passenger_type === 'infant' && <span className="text-emerald-600 font-bold ml-1 text-xs">(Bayi)</span>}</span>
                                    <span className="font-medium">
                                        {detail.passenger_type === 'infant' ? 'Tanpa Kursi' : `Gerbong ${detail.coach_number} - Kursi ${detail.seat_number}`}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* THE SEPARATOR WITH HOLES */}
                <div className="relative flex flex-col justify-center items-center w-full md:w-0 h-0 md:h-auto border-t md:border-t-0 md:border-l-2 border-dashed border-slate-200">
                    {/* Top Notch (Desktop) / Left Notch (Mobile) */}
                    <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 md:left-0 md:-translate-x-[calc(50%+1px)] w-8 h-8 bg-slate-50 rounded-full z-10" style={{ boxShadow: 'inset 0 -2px 4px 0 rgb(0 0 0 / 0.02)' }}></div>

                    {/* Bottom Notch (Desktop) / Right Notch (Mobile) */}
                    <div className="absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 md:left-0 md:-translate-x-[calc(50%+1px)] w-8 h-8 bg-slate-50 rounded-full z-10" style={{ boxShadow: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.02)' }}></div>
                </div>

                <div className="w-full md:w-64 p-6 pt-4 md:pt-6 flex flex-col items-center justify-center text-center">
                    {isPaid ? (
                        <>
                            <div className="text-xs text-slate-500 mb-2 font-semibold">Tunjukkan QR ini saat boarding</div>
                            <img src={qrCodeUrl} alt="QR Code Boarding" className="w-32 h-32 border border-slate-200 p-2 rounded mb-3 shadow-sm" />
                            <div className="text-xs text-slate-400">Scan QR Code</div>
                        </>
                    ) : (
                        <div className="text-slate-400 font-black text-xl uppercase tracking-widest">DIBATALKAN</div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">
            <UserNavbar variant="white" />
            <div className="flex-1 pt-32 pb-24 w-full">
                <div className="max-w-[1400px] mx-auto px-6 md:px-28 lg:px-32 space-y-8">

                    <div className="flex flex-col mb-4">
                        <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
                            Tiket Saya
                        </h1>
                    </div>


                    <div className="bg-slate-100 p-1.5 rounded flex w-full">
                        <button
                            onClick={() => setActiveTab('aktif')}
                            className={`flex-1 px-8 py-2.5 font-bold text-sm rounded transition-all duration-200 ${activeTab === 'aktif' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Tiket Aktif ({activeTickets.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('riwayat')}
                            className={`flex-1 px-8 py-2.5 font-bold text-sm rounded transition-all duration-200 ${activeTab === 'riwayat' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Riwayat Pembelian ({historyTickets.length})
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-10 text-slate-500 animate-pulse font-semibold">Memuat data tiket...</div>
                    ) : displayTickets.length === 0 ? (
                        <div className="bg-white py-16 px-6 rounded shadow-sm text-center border border-slate-100 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Train className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Tidak Ada Tiket</h3>
                            <p className="text-slate-500 text-sm">
                                {activeTab === 'aktif'
                                    ? 'Anda belum memiliki tiket aktif saat ini. Ayo pesan tiket pertamamu!'
                                    : 'Anda belum memiliki riwayat perjalanan tiket apapun.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {displayTickets.map(renderTicketCard)}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default MyTickets;
