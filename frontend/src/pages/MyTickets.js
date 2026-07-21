import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Train } from 'lucide-react';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import TicketCard from '../components/TicketCard';

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

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">
            <UserNavbar variant="white" />
            <div className="flex-1 pt-32 pb-24 w-full">
                <div className="max-w-[1400px] mx-auto px-6 md:px-28 lg:px-32 space-y-8">

                    <div className="flex flex-col mb-4">
                        <h1 className="text-2xl font-black text-[#1800ad] flex items-center gap-2">
                            Tiket Saya
                        </h1>
                    </div>


                    <div className="bg-slate-100 p-1.5 rounded flex w-full">
                        <button
                            onClick={() => setActiveTab('aktif')}
                            className={`flex-1 px-8 py-2.5 font-bold text-sm rounded transition-all duration-200 ${activeTab === 'aktif' ? 'bg-white text-[#11007a] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Tiket Aktif ({activeTickets.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('riwayat')}
                            className={`flex-1 px-8 py-2.5 font-bold text-sm rounded transition-all duration-200 ${activeTab === 'riwayat' ? 'bg-white text-[#11007a] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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
                            {displayTickets.map((booking) => (
                                <TicketCard key={booking.id} booking={booking} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default MyTickets;
