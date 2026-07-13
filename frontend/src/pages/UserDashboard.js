import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function UserDashboard() {
    const navigate = useNavigate();
    const [stations, setStations] = useState([]);
    const [originId, setOriginId] = useState('');
    const [destinationId, setDestinationId] = useState('');
    const [journeyDate, setJourneyDate] = useState('');
    
    const [tickets, setTickets] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [qty, setQty] = useState(1); // State untuk menampung jumlah tiket yang dipesan

    // Load daftar stasiun untuk dropdown pencarian:
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/user/stations')
            .then(res => setStations(res.data.data))
            .catch(err => console.error(err));
    }, []);

    // FUNGSI LOGOUT
    const handleLogout = () => {
        if (window.confirm("Apakah Anda yakin ingin keluar?")) {
            localStorage.removeItem('token');
            localStorage.removeItem('role'); 
            window.location.href = '/login'; 
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if(originId === destinationId) {
            alert("Stasiun asal dan tujuan tidak boleh sama!");
            return;
        }
        
        setLoading(true);
        setHasSearched(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://127.0.0.1:8000/api/user/search-tickets', {
                origin_id: originId,
                destination_id: destinationId,
                journey_date: journeyDate
            }, {
                headers: token ? { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json' 
                } : {
                    'Accept': 'application/json'
                }
            });
            setTickets(response.data.data);
        } catch (error) {
            console.error("Gagal mencari tiket", error);
        }
        setLoading(false);
    };

    return (
        <div className="p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
            
            {/* Header Brand dengan Tombol Logout */}
            <div className="bg-blue-600 p-6 md:px-10 rounded-2xl text-white mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md shadow-blue-600/10">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">KAI E-Ticket System</h1>
                    <p className="text-sm text-blue-100 mt-1">Selamat datang, Penumpang! Cari tiket kereta apimu di sini.</p>
                </div>
                
                <div className="flex gap-2 sm:gap-3 flex-wrap justify-end">
                    {localStorage.getItem('token') ? (
                        <>
                            <button 
                                onClick={() => navigate('/profile')}
                                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                            >
                                <span>👤</span> Profil
                            </button>
                            <button 
                                onClick={() => navigate('/my-tickets')}
                                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                            >
                                <span>🎫</span> Riwayat Tiket
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-red-500/20 transition-all active:scale-95"
                            >
                                Keluar
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => navigate('/login')}
                            className="px-4 py-2 sm:px-5 sm:py-2.5 bg-white text-blue-600 hover:bg-blue-50 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                        >
                            Masuk / Daftar
                        </button>
                    )}
                </div>
            </div>

            {/* Grid Layout Utama */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* WIDGET PANEL 1: FORM PENCARIAN TIKET */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-5">Cari Tiket Kereta</h3>
                    <form onSubmit={handleSearch} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Stasiun Asal / Keberangkatan:</label>
                            <select 
                                value={originId} 
                                onChange={(e) => setOriginId(e.target.value)} 
                                required 
                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            >
                                <option value="">-- Pilih Stasiun Asal --</option>
                                {stations.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.station_code}) - {s.city}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Stasiun Tujuan / Kedatangan:</label>
                            <select 
                                value={destinationId} 
                                onChange={(e) => setDestinationId(e.target.value)} 
                                required 
                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            >
                                <option value="">-- Pilih Stasiun Tujuan --</option>
                                {stations.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.station_code}) - {s.city}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Keberangkatan:</label>
                            <input 
                                type="date" 
                                value={journeyDate} 
                                onChange={(e) => setJourneyDate(e.target.value)} 
                                required 
                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-[0.99] tracking-wider"
                        >
                            CARI JADWAL KERETA
                        </button>
                    </form>
                </div>

                {/* WIDGET PANEL 2: HASIL PENCARIAN TIKET */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Jadwal Tersedia ({tickets.length})</h3>
                    
                    {loading && <p className="text-sm text-slate-500 animate-pulse">Sedang mencari rute terbaik untukmu...</p>}

                    {!hasSearched && !loading && (
                        <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 p-6 rounded-2xl text-center font-medium text-sm shadow-sm">
                            Silakan isi stasiun asal, tujuan, dan tanggal keberangkatan di panel sebelah kiri untuk memunculkan tiket aktif.
                        </div>
                    )}

                    {hasSearched && !loading && tickets.length === 0 && (
                        <div className="bg-red-50 border border-red-100 text-red-800 p-6 rounded-2xl text-center font-medium text-sm shadow-sm">
                            Maaf, tidak ada kereta yang melayani rute tersebut pada tanggal yang Anda pilih. Coba tanggal atau stasiun transit lain!
                        </div>
                    )}

                    {hasSearched && !loading && tickets.map((ticket, index) => (
                        <div 
                            key={index} 
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-blue-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
                        >
                            <div className="space-y-2">
                                <span className="inline-block px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 tracking-wide uppercase">
                                    {ticket.class}
                                </span>
                                <h4 className="text-xl font-bold text-slate-800">
                                    {ticket.train_name} <span className="text-sm text-slate-400 font-normal">({ticket.train_code})</span>
                                </h4>
                                
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-sm text-slate-600">
                                    <div><span className="font-bold text-slate-800">{ticket.departure_time}</span> <span className="text-xs text-slate-400">(Naik - Stop #{ticket.board_order})</span></div>
                                    <div className="text-slate-300 hidden sm:block">➔</div>
                                    <div><span className="font-bold text-slate-800">{ticket.arrival_time}</span> <span className="text-xs text-slate-400">(Turun - Stop #{ticket.alight_order})</span></div>
                                </div>
                            </div>

                            <div className="sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 flex sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-2">
                                <div>
                                    <div className="text-xs text-slate-400 mb-0.5">Harga Per Orang</div>
                                    <div className="text-xl font-bold text-orange-600">
                                        Rp {ticket.price.toLocaleString('id-ID')}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        if (!localStorage.getItem('token')) {
                                            alert("Silakan masuk/login terlebih dahulu untuk memesan tiket.");
                                            navigate('/login');
                                            return;
                                        }
                                        // Mengalihkan halaman ke rute booking sambil membawa query parameter rute penggaris
                                        navigate(`/booking/${ticket.schedule_id || ticket.id}?board_order=${ticket.board_order}&alight_order=${ticket.alight_order}&qty=${qty}`);
                                    }} 
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
                                >
                                    Pesan Tiket
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

export default UserDashboard;