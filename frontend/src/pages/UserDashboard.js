import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserDashboard() {
    const [stations, setStations] = useState([]);
    const [originId, setOriginId] = useState('');
    const [destinationId, setDestinationId] = useState('');
    const [journeyDate, setJourneyDate] = useState('');
    
    const [tickets, setTickets] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    // Load daftar stasiun untuk dropdown pencarian:
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/user/stations')
            .then(res => setStations(res.data.data))
            .catch(err => console.error(err));
    }, []);

    // FUNGSI LOGOUT
    const handleLogout = () => {
        if (window.confirm("Apakah Anda yakin ingin keluar?")) {
            // 1. Hapus token dari localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('role'); // jika ada role yang disimpan
            
            // 2. Tendang user ke halaman login awal
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
            const response = await axios.post('http://127.0.0.1:8000/api/user/search-tickets', {
                origin_id: originId,
                destination_id: destinationId,
                journey_date: journeyDate
            });
            setTickets(response.data.data);
        } catch (error) {
            console.error("Gagal mencari tiket", error);
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
            
            {/* Header Brand dengan Tombol Logout */}
            <div style={{ 
                backgroundColor: '#2f55d4', 
                padding: '20px 40px', 
                borderRadius: '10px', 
                color: 'white', 
                marginBottom: '30px', 
                display: 'flex', 
                justifyContent: 'space-between', // Diubah menjadi space-between agar tombol terdorong ke kanan
                alignItems: 'center' 
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px' }}>🚄 KAI E-Ticket System</h1>
                    <p style={{ margin: '5px 0 0 0', opacity: 0.8 }}>Selamat datang, Penumpang! Cari tiket kereta apimu di sini.</p>
                </div>
                
                {/* TOMBOL LOGOUT */}
                <button 
                    onClick={handleLogout}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(239,68,68,0.3)',
                        transition: '0.2s'
                    }}
                >
                    🚪 Keluar / Logout
                </button>
            </div>

            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* WIDGET PANEL 1: FORM PENCARIAN TIKET */}
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', flex: '1', minWidth: '320px' }}>
                    <h3 style={{ marginTop: 0, color: '#333', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>🔍 Cari Tiket Kereta</h3>
                    <form onSubmit={handleSearch}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Stasiun Asal / Keberangkatan:</label>
                            <select value={originId} onChange={(e) => setOriginId(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}>
                                <option value="">-- Pilih Stasiun Asal --</option>
                                {stations.map(s => <option key={s.id} value={s.id}>{s.name} ({s.station_code}) - {s.city}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Stasiun Tujuan / Kedatangan:</label>
                            <select value={destinationId} onChange={(e) => setDestinationId(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}>
                                <option value="">-- Pilih Stasiun Tujuan --</option>
                                {stations.map(s => <option key={s.id} value={s.id}>{s.name} ({s.station_code}) - {s.city}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Tanggal Keberangkatan:</label>
                            <input type="date" value={journeyDate} onChange={(e) => setJourneyDate(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>

                        <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 3px 6px rgba(255,152,0,0.3)' }}>
                            CARI JADWAL KERETA
                        </button>
                    </form>
                </div>

                {/* WIDGET PANEL 2: HASIL PENCARIAN TIKET */}
                <div style={{ flex: '2', minWidth: '500px' }}>
                    <h3 style={{ marginTop: 0, color: '#333' }}>🎫 Jadwal Tersedia ({tickets.length})</h3>
                    
                    {loading && <p style={{ color: '#666' }}>Sedang mencari rute terbaik untukmu...</p>}

                    {!hasSearched && !loading && (
                        <div style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '30px', borderRadius: '8px', textAlign: 'center', fontWeight: '500' }}>
                            👋 Silakan isi stasiun asal, tujuan, dan tanggal keberangkatan di panel sebelah kiri untuk memunculkan tiket aktif.
                        </div>
                    )}

                    {hasSearched && !loading && tickets.length === 0 && (
                        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '30px', borderRadius: '8px', textAlign: 'center', fontWeight: '500' }}>
                            😢 Maaf, tidak ada kereta yang melayani rute tersebut pada tanggal yang Anda pilih. Coba tanggal atau stasiun transit lain!
                        </div>
                    )}

                    {hasSearched && !loading && tickets.map((ticket, index) => (
                        <div key={index} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.04)', borderLeft: '6px solid #2f55d4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ padding: '3px 8px', backgroundColor: '#f3f4f6', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', color: '#555', textTransform: 'uppercase' }}>
                                    {ticket.class}
                                </span>
                                <h4 style={{ margin: '8px 0 4px 0', fontSize: '18px', color: '#222' }}>{ticket.train_name} <span style={{ color: '#777', fontSize: '14px', fontWeight: 'normal' }}>({ticket.train_code})</span></h4>
                                
                                <div style={{ display: 'flex', gap: '20px', marginTop: '15px', color: '#555', fontSize: '14px' }}>
                                    <div>🛫 **{ticket.departure_time}** (Naik - Stop #{ticket.board_order})</div>
                                    <div>➡️</div>
                                    <div>🛬 **{ticket.arrival_time}** (Turun - Stop #{ticket.alight_order})</div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '12px', color: '#777', marginBottom: '2px' }}>Harga Per Orang</div>
                                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#e65100', marginBottom: '10px' }}>
                                    Rp {ticket.price.toLocaleString('id-ID')}
                                </div>
                                <button onClick={() => alert(`Melanjutkan pemesanan tiket kereta ${ticket.train_name}!`)} style={{ padding: '8px 20px', backgroundColor: '#2f55d4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
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