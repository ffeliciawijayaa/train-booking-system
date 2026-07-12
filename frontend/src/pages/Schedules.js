import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Schedules() {
    const [trains, setTrains] = useState([]);
    const [stations, setStations] = useState([]);
    const [schedulesList, setSchedulesList] = useState([]);

    const [selectedTrain, setSelectedTrain] = useState('');
    const [journeyDate, setJourneyDate] = useState('');
    const [message, setMessage] = useState('');

    const [routeStops, setRouteStops] = useState([
        { station_id: '', arrival_time: '', departure_time: '', price_from_start: 0 },
        { station_id: '', arrival_time: '', departure_time: '', price_from_start: 0 }
    ]);

    // Fungsi pembantu token admin
    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    // 1. Fungsi mengambil data jadwal dengan Token
    const fetchSchedules = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/schedules', getAuthHeader());
            setSchedulesList(response.data.data);
        } catch (err) {
            console.error("Gagal memuat daftar jadwal", err);
        }
    };

    // Load semua data master & jadwal dengan Token
    useEffect(() => {
        const fetchMaster = async () => {
            try {
                const resTrains = await axios.get('http://127.0.0.1:8000/api/admin/trains', getAuthHeader());
                const resStations = await axios.get('http://127.0.0.1:8000/api/admin/stations', getAuthHeader());
                setTrains(resTrains.data.data);
                setStations(resStations.data.data);
            } catch (err) {
                console.error("Gagal memuat data master", err);
            }
        };
        fetchMaster();
        fetchSchedules();
    }, []);

    const handleStopChange = (index, field, value) => {
        const updatedStops = [...routeStops];
        updatedStops[index][field] = value;
        setRouteStops(updatedStops);
    };

    const addStopRow = () => {
        setRouteStops([...routeStops, { station_id: '', arrival_time: '', departure_time: '', price_from_start: 0 }]);
    };

    const removeStopRow = (index) => {
        if (routeStops.length > 2) {
            const updatedStops = routeStops.filter((_, i) => i !== index);
            setRouteStops(updatedStops);
        } else {
            alert("Minimal harus ada stasiun awal dan akhir!");
        }
    };

    // POST Jadwal Baru dengan Token
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/admin/schedules', {
                train_id: selectedTrain,
                journey_date: journeyDate,
                route_stops: routeStops
            }, getAuthHeader());

            setMessage(response.data.message);
            
            setSelectedTrain('');
            setJourneyDate('');
            setRouteStops([
                { station_id: '', arrival_time: '', departure_time: '', price_from_start: 0 },
                { station_id: '', arrival_time: '', departure_time: '', price_from_start: 0 }
            ]);
            fetchSchedules(); 
        } catch (error) {
            setMessage(error.response?.data?.message || 'Gagal menyimpan jadwal.');
        }
    };

    // DELETE Jadwal dengan Token
    const handleDeleteClick = async (id) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus jadwal perjalanan dengan ID #${id}? Semua rute transit terkait akan ikut terhapus.`)) {
            try {
                const response = await axios.delete(`http://127.0.0.1:8000/api/admin/schedules/${id}`, getAuthHeader());
                setMessage(response.data.message);
                fetchSchedules();
            } catch (error) {
                setMessage('Gagal menghapus jadwal perjalanan.');
            }
        }
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f5f7fb', minHeight: '100vh' }}>
            <h2>Dashboard Admin - Pembuatan Jadwal</h2>
            <p style={{ color: '#777' }}>Kelola perjalanan kereta dan rute transit secara real-time.</p>
            <hr style={{ border: '0', height: '1px', backgroundColor: '#ddd', marginBottom: '30px' }} />

            {message && (
                <div style={{ padding: '12px 20px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '5px', marginBottom: '20px' }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'flex', gap: '30px', flexDirection: 'column' }}>
                
                <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '35px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Pilih Kereta:</label>
                            <select value={selectedTrain} onChange={(e) => setSelectedTrain(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}>
                                <option value="">-- Pilih Kereta --</option>
                                {trains.map(t => <option key={t.id} value={t.id}>{t.name} ({t.train_code})</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Tanggal Perjalanan:</label>
                            <input type="date" value={journeyDate} onChange={(e) => setJourneyDate(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                    </div>

                    <h3 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '10px', color: '#444' }}>📐 Penggaris Rute (route_stops)</h3>
                    
                    {routeStops.map((stop, index) => (
                        <div key={index} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', backgroundColor: '#f9fafb', padding: '15px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
                            <div style={{ flex: '2', minWidth: '180px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600' }}>
                                    Urutan Ke-{index + 1} ({index === 0 ? "Stasiun Awal" : index === routeStops.length - 1 ? "Stasiun Akhir" : "Transit"})
                                </label>
                                <select value={stop.station_id} onChange={(e) => handleStopChange(index, 'station_id', e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                                    <option value="">-- Pilih Stasiun --</option>
                                    {stations.map(s => <option key={s.id} value={s.id}>{s.name} ({s.station_code})</option>)}
                                </select>
                            </div>
                            <div style={{ flex: '1', minWidth: '90px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>Jam Tiba:</label>
                                <input type="time" value={stop.arrival_time} onChange={(e) => handleStopChange(index, 'arrival_time', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} disabled={index === 0} />
                            </div>
                            <div style={{ flex: '1', minWidth: '90px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>Jam Berangkat:</label>
                                <input type="time" value={stop.departure_time} onChange={(e) => handleStopChange(index, 'departure_time', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} disabled={index === routeStops.length - 1} />
                            </div>
                            <div style={{ flex: '1.5', minWidth: '150px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>Harga Dari Awal (Rp):</label>
                                <input type="number" min="0" value={stop.price_from_start} onChange={(e) => handleStopChange(index, 'price_from_start', e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                            </div>
                            <div>
                                <button type="button" onClick={() => removeStopRow(index)} style={{ padding: '9px 15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Hapus</button>
                            </div>
                        </div>
                    ))}

                    <button type="button" onClick={addStopRow} style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', marginRight: '15px', marginTop: '10px' }}>➕ Tambah Stasiun Transit</button>
                    <button type="submit" style={{ padding: '12px 30px', backgroundColor: '#2f55d4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>Simpan Jadwal Utama & Rute</button>
                </form>

                <div style={{ backgroundColor: 'white', padding: '35px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginTop: '0', color: '#444', marginBottom: '20px' }}>📋 Jadwal Perjalanan Aktif</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '12px' }}>ID</th>
                                <th style={{ padding: '12px' }}>Tanggal</th>
                                <th style={{ padding: '12px' }}>Kereta</th>
                                <th style={{ padding: '12px' }}>Rute Perjalanan (Urutan Stasiun)</th>
                                <th style={{ padding: '12px' }}>Status</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedulesList.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Belum ada jadwal perjalanan yang dibuat.</td>
                                </tr>
                            ) : (
                                schedulesList.map((sch) => (
                                    <tr key={sch.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{sch.id}</td>
                                        <td style={{ padding: '12px' }}>{sch.journey_date}</td>
                                        <td style={{ padding: '12px', fontWeight: '600' }}>{sch.train?.name || `ID Kereta: ${sch.train_id}`}</td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                                                {sch.route_stops?.map((stop, i) => (
                                                    <span key={i} style={{ fontSize: '12px' }}>
                                                        {stop.station?.name || `Stasiun ID: ${stop.station_id}`}
                                                        {i < sch.route_stops.length - 1 ? ' ➡️ ' : ''}
                                                    </span>
                                                )) || <span style={{ color: '#999' }}>Rute tidak terbaca</span>}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ padding: '4px 8px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                                                {sch.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <button onClick={() => handleDeleteClick(sch.id)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                                                Hapus
                                            </button>
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

export default Schedules;