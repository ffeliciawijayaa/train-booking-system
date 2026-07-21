import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, MapPin, Train, Calendar, TrendingUp, Package } from 'lucide-react';

function AdminDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        stations: 0,
        trains: 0,
        schedules: 0,
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Fetch data in parallel
                const [resUsers, resStations, resTrains, resSchedules, resBookings] = await Promise.all([
                    axios.get('http://127.0.0.1:8000/api/admin/users', config),
                    axios.get('http://127.0.0.1:8000/api/admin/stations', config),
                    axios.get('http://127.0.0.1:8000/api/admin/trains', config),
                    axios.get('http://127.0.0.1:8000/api/admin/schedules', config),
                    axios.get('http://127.0.0.1:8000/api/admin/bookings', config)
                ]);

                setStats({
                    users: resUsers.data.data.length,
                    stations: resStations.data.data.length,
                    trains: resTrains.data.data.length,
                    schedules: resSchedules.data.data.length,
                });

                //ambil 5 pemesanan terbaru
                const bookingsData = resBookings.data.data;
                const sortedBookings = bookingsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setRecentBookings(sortedBookings.slice(0, 5));

                setLoading(false);
            } catch (err) {
                console.error("Gagal memuat data dashboard:", err);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };



    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-[#1800ad] font-bold animate-pulse">Memuat Dashboard...</div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-950">Dashboard</h2>
                    <p className="text-sm text-slate-500 mt-1">Pantau statistik dan aktivitas terbaru dari SobatRel.</p>
                </div>
            </div>
            <hr className="border-slate-200 mb-8" />

            {/* Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Users Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-semibold text-slate-500">Total Pengguna</span>
                        <div className="p-2 bg-[#1800ad]/10 rounded-full border border-[#1800ad]/20">
                            <Users className="w-5 h-5 text-[#1800ad]" />
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-3xl font-black text-slate-800">{stats.users}</div>
                    </div>
                </div>

                {/* Stations Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-semibold text-slate-500">Total Stasiun</span>
                        <div className="p-2 bg-[#1800ad]/10 rounded-full border border-[#1800ad]/20">
                            <MapPin className="w-5 h-5 text-[#1800ad]" />
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-3xl font-black text-slate-800">{stats.stations}</div>
                    </div>
                </div>

                {/* Trains Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-semibold text-slate-500">Total Kereta</span>
                        <div className="p-2 bg-[#1800ad]/10 rounded-full border border-[#1800ad]/20">
                            <Train className="w-5 h-5 text-[#1800ad]" />
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-3xl font-black text-slate-800">{stats.trains}</div>
                    </div>
                </div>

                {/* Schedules Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-semibold text-slate-500">Jadwal Perjalanan</span>
                        <div className="p-2 bg-[#1800ad]/10 rounded-full border border-[#1800ad]/20">
                            <Calendar className="w-5 h-5 text-[#1800ad]" />
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-3xl font-black text-slate-800">{stats.schedules}</div>
                    </div>
                </div>
            </div>


            {/* Recent Bookings Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden mb-12">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-lg font-bold text-slate-800">Pemesanan Terbaru</h3>
                    {/* Search removed */}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider pl-6">Booking ID</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pelanggan</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rute</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider pr-6 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500 text-sm">Tidak ada pesanan terbaru.</td>
                                </tr>
                            ) : (
                                recentBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4 pl-6 text-sm font-semibold text-slate-800">
                                            #{booking.booking_code || booking.id}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {formatDate(booking.created_at)}
                                        </td>
                                        <td className="p-4 text-sm font-medium text-slate-800">
                                            {booking.user?.name || 'Guest'}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {booking.board_station?.name || booking.boardStation?.name || '-'} <span className="text-slate-400 mx-1">→</span> {booking.alight_station?.name || booking.alightStation?.name || '-'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${booking.status === 'completed' || booking.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                                booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {booking.status === 'completed' || booking.status === 'paid' ? 'Paid' : booking.status === 'pending' ? 'Pending' : 'Canceled'}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-sm font-bold text-slate-800 text-right">
                                            {formatCurrency(booking.total_price)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
