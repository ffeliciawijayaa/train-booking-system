import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://127.0.0.1:8000/api/admin/bookings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(res.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Gagal mengambil data transaksi:', error);
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
            case 'paid':
                return <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-700">SUKSES</span>;
            case 'pending':
                return <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-amber-100 text-amber-700">PENDING</span>;
            case 'cancelled':
                return <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-red-100 text-red-700">BATAL</span>;
            default:
                return <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700 uppercase">{status}</span>;
        }
    };

    return (
        <div className="p-6 max-w-[1400px] mx-auto font-sans text-slate-800">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Kelola Transaksi</h1>
                <p className="text-slate-500 text-sm mt-1">Daftar semua riwayat pemesanan tiket kereta api.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                                <th className="p-4 border-b font-bold">Waktu Transaksi</th>
                                <th className="p-4 border-b font-bold">Booking Code</th>
                                <th className="p-4 border-b font-bold">Pemesan</th>
                                <th className="p-4 border-b font-bold">Kereta & Rute</th>
                                <th className="p-4 border-b font-bold">Penumpang</th>
                                <th className="p-4 border-b font-bold text-right">Total Harga</th>
                                <th className="p-4 border-b font-bold">Pembayaran</th>
                                <th className="p-4 border-b font-bold text-center">Status Transaksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="p-8 text-center text-slate-500">Memuat data transaksi...</td></tr>
                            ) : bookings.length === 0 ? (
                                <tr><td colSpan="8" className="p-8 text-center text-slate-500">Belum ada transaksi.</td></tr>
                            ) : (
                                bookings.map((b) => (
                                    <tr key={b.id} className="hover:bg-slate-50 border-b last:border-0 transition-colors">
                                        <td className="p-4 text-sm text-slate-500">
                                            {formatDate(b.created_at)}
                                        </td>
                                        <td className="p-4">
                                            <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                {b.booking_code}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="font-bold text-slate-800">{b.user?.name || '-'}</div>
                                            <div className="text-xs text-slate-500">{b.user?.email || '-'}</div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="font-bold text-slate-800">{b.schedule?.train?.name || '-'}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                {b.board_station?.name} &rarr; {b.alight_station?.name}
                                            </div>
                                            <div className="text-xs text-amber-600 font-medium mt-0.5">
                                                Brgkt: {b.schedule?.journey_date}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-700 font-medium">
                                            {b.booking_details?.length || 0} Orang
                                        </td>
                                        <td className="p-4 text-sm font-bold text-slate-800 text-right">
                                            Rp {parseInt(b.total_price).toLocaleString('id-ID')}
                                        </td>
                                        <td className="p-4 text-sm">
                                            {b.payment ? (
                                                <>
                                                    <div className="font-bold text-slate-800">{b.payment.payment_method?.name || b.payment.payment_method_name || b.payment.payment_method || 'Transfer'}</div>
                                                    <div className="mt-1">{getStatusBadge(b.payment.status)}</div>
                                                </>
                                            ) : (
                                                <span className="text-slate-400 italic text-xs">Belum ada metode</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {getStatusBadge(b.status)}
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

export default AdminBookings;
