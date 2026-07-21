import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart } from 'lucide-react';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import useCountdownTimer from '../hooks/useCountdownTimer';

const CartItemCard = ({ booking }) => {
    const { timeLeft, isExpired } = useCountdownTimer(booking.payment?.expired_at);

    if (isExpired) return null;

    return (
        <div key={booking.id} className="bg-white p-6 rounded shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 mb-4 relative overflow-hidden transition hover:shadow-md">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
            <div className="flex-1 space-y-4 pl-2">
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
                    <span className="text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wide bg-amber-100 text-amber-700">
                        Menunggu Pembayaran
                    </span>
                </div>
                
                <div className="flex items-center gap-3 text-slate-700">
                    <div className="font-semibold text-[#11007a] bg-[#1800ad]/5 px-3 py-1.5 rounded border border-blue-100">{booking.board_station?.name}</div>
                    <span className="text-slate-400">&rarr;</span>
                    <div className="font-semibold text-[#11007a] bg-[#1800ad]/5 px-3 py-1.5 rounded border border-blue-100">{booking.alight_station?.name}</div>
                </div>
            </div>

            <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex flex-col items-center justify-center text-center">
                <div className="flex flex-col items-center justify-center h-full w-full">
                    <div className="text-sm text-slate-500 mb-1">Total Tagihan</div>
                    <div className="text-2xl font-black text-amber-600 mb-2">
                        Rp {parseInt(booking.total_price).toLocaleString('id-ID')}
                    </div>
                    <div className="text-xs text-red-500 font-bold mb-3 flex flex-col items-center">
                        <span>Sisa Waktu:</span>
                        <span className="text-lg bg-red-100 text-red-600 px-3 py-1 rounded mt-1 font-mono">{timeLeft}</span>
                    </div>
                    <Link to={`/payment/${booking.id}`} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded text-sm font-bold shadow-md shadow-amber-500/20 transition-all w-full">
                        Bayar Sekarang
                    </Link>
                </div>
            </div>
        </div>
    );
};

function Cart() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

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
                console.error("Gagal mengambil keranjang", err);
                if (err.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [navigate]);

    const cartTickets = bookings.filter(booking => {
        // 1. Status harus pending
        if (booking.status !== 'pending') return false;

        // 2. Tidak expired
        let isExpired = false;
        if (booking.payment?.expired_at) {
            const expiredTime = new Date(booking.payment.expired_at.replace(/-/g, "/")).getTime();
            if (expiredTime < new Date().getTime()) {
                isExpired = true;
            }
        }
        
        // 3. Tidak lewat jadwal perjalanan
        const journeyDate = new Date(booking.schedule?.journey_date);
        journeyDate.setHours(23, 59, 59, 999); 
        const isPast = journeyDate.getTime() < new Date().getTime();

        return !isExpired && !isPast;
    });

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">
            <UserNavbar variant="white" />
            <div className="flex-1 pt-32 pb-24 w-full">
                <div className="max-w-[1400px] mx-auto px-6 md:px-28 lg:px-32 space-y-8">
                    <div className="flex flex-col mb-4">
                        <h1 className="text-2xl font-black text-[#1800ad] flex items-center gap-2">
                            Keranjang Belanja
                        </h1>
                    </div>

                    {loading ? (
                        <div className="text-center py-10 text-slate-500 animate-pulse font-semibold">Memuat keranjang...</div>
                    ) : cartTickets.length === 0 ? (
                        <div className="bg-white py-16 px-6 rounded shadow-sm text-center border border-slate-100 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <ShoppingCart className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Keranjang Kosong</h3>
                            <p className="text-slate-500 text-sm">Tidak ada tiket yang menunggu pembayaran.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cartTickets.map((booking) => (
                                <CartItemCard key={booking.id} booking={booking} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Cart;
