import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Stations() {
    const [stationCode, setStationCode] = useState('');
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [message, setMessage] = useState('');
    const [stationsList, setStationsList] = useState([]);

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // Fungsi pembantu untuk mengambil token yang sedang aktif
    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    // 1. GET DATA (Sudah diperbaiki dari '->' menjadi '.' dan ditambahkan token)
    const fetchStations = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/stations', getAuthHeader());
            setStationsList(response.data.data);
        } catch (error) {
            console.error('Gagal mengambil data:', error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                setMessage('Sesi Anda habis atau Anda bukan admin. Silakan login kembali.');
            }
        }
    };

    useEffect(() => {
        fetchStations();
    }, []);

    // 2. SUBMIT FORM (POST/PUT dengan Token)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            if (isEditing) {
                // JIKA EDIT (PUT)
                const response = await axios.put(
                    `http://127.0.0.1:8000/api/admin/stations/${editId}`, 
                    { station_code: stationCode, name: name, city: city },
                    getAuthHeader()
                );
                setMessage(response.data.message);
            } else {
                // JIKA TAMBAH BARU (POST)
                const response = await axios.post(
                    'http://127.0.0.1:8000/api/admin/stations', 
                    { station_code: stationCode, name: name, city: city },
                    getAuthHeader()
                );
                setMessage(response.data.message);
            }

            handleCancelEdit();
            fetchStations();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Terjadi kesalahan sistem.');
        }
    };

    const handleEditClick = (station) => {
        setIsEditing(true);
        setEditId(station.id);
        setStationCode(station.station_code);
        setName(station.name);
        setCity(station.city);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        setStationCode('');
        setName('');
        setCity('');
    };

    // 4. DELETE DATA (DELETE dengan Token)
    const handleDeleteClick = async (id, stationName) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus stasiun "${stationName}"?`)) {
            try {
                const response = await axios.delete(`http://127.0.0.1:8000/api/admin/stations/${id}`, getAuthHeader());
                setMessage(response.data.message);
                fetchStations();
            } catch (error) {
                setMessage('Gagal menghapus data.');
            }
        }
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f5f7fb', minHeight: '100vh' }}>
            <h2 style={{ color: '#333', marginBottom: '5px' }}>Dashboard Admin</h2>
            <p style={{ color: '#777', marginTop: '0', marginBottom: '25px' }}>Manajemen Data Master Stasiun Kereta Api</p>
            <hr style={{ border: '0', height: '1px', backgroundColor: '#ddd', marginBottom: '30px' }} />

            {message && (
                <div style={{ padding: '12px 20px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '5px', marginBottom: '20px', fontWeight: '500' }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                
                {/* PANEL KIRI: FORM */}
                <div style={{ flex: '1', minWidth: '300px', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginTop: '0', color: isEditing ? '#f59e0b' : '#444', marginBottom: '20px' }}>
                        {isEditing ? '✏️ Edit Data Stasiun' : '+ Tambah Stasiun'}
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Kode Stasiun:</label>
                            <input type="text" value={stationCode} onChange={(e) => setStationCode(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Nama Stasiun:</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Kota:</label>
                            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                        </div>

                        <button type="submit" style={{ padding: '12px', backgroundColor: isEditing ? '#f59e0b' : '#2f55d4', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                            {isEditing ? 'Perbarui Data' : 'Simpan Ke Database'}
                        </button>

                        {isEditing && (
                            <button type="button" onClick={handleCancelEdit} style={{ padding: '10px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Batal Edit
                            </button>
                        )}
                    </form>
                </div>

                {/* PANEL KANAN: TABEL */}
                <div style={{ flex: '2', minWidth: '500px', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginTop: '0', color: '#444', marginBottom: '20px' }}>📋 Daftar Stasiun Aktif</h3>
                    
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '12px', color: '#666' }}>ID</th>
                                <th style={{ padding: '12px', color: '#666' }}>Kode</th>
                                <th style={{ padding: '12px', color: '#666' }}>Nama Stasiun</th>
                                <th style={{ padding: '12px', color: '#666' }}>Kota</th>
                                <th style={{ padding: '12px', color: '#666', textAlign: 'center' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stationsList.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Belum ada data stasiun.</td>
                                </tr>
                            ) : (
                                stationsList.map((station, index) => (
                                    <tr key={station.id} style={{ borderBottom: '1px solid #eee', backgroundColor: index % 2 === 0 ? '#fff' : '#fdfdfd' }}>
                                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#777' }}>{station.id}</td>
                                        <td style={{ padding: '12px' }}><span style={{ backgroundColor: '#eef2ff', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontWeight: '600', fontSize: '13px' }}>{station.station_code}</span></td>
                                        <td style={{ padding: '12px', color: '#333' }}>{station.name}</td>
                                        <td style={{ padding: '12px', color: '#555' }}>{station.city}</td>
                                        <td style={{ padding: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button onClick={() => handleEditClick(station)} style={{ padding: '6px 12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeleteClick(station.id, station.name)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
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

export default Stations;