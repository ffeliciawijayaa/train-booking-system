import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Trains() {
    const [trainCode, setTrainCode] = useState('');
    const [name, setName] = useState('');
    const [trainClass, setTrainClass] = useState('executive');
    const [totalCoaches, setTotalCoaches] = useState('');
    const [message, setMessage] = useState('');
    const [trainsList, setTrainsList] = useState([]);

    // STATE UNTUK EDIT DATA
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // Fungsi pembantu untuk mengambil token admin
    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    // 1. GET DATA KERETA (Ditambahkan token)
    const fetchTrains = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/trains', getAuthHeader());
            setTrainsList(response.data.data);
        } catch (error) {
            console.error('Gagal mengambil data kereta:', error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                setMessage('Sesi Anda habis. Silakan login kembali sebagai Admin.');
            }
        }
    };

    useEffect(() => {
        fetchTrains();
    }, []);

    // 2. SUBMIT FORM (TAMBAH / UPDATE dengan Token)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            if (isEditing) {
                // Mode Update
                const response = await axios.put(`http://127.0.0.1:8000/api/admin/trains/${editId}`, {
                    train_code: trainCode,
                    name: name,
                    class: trainClass,
                    total_coaches: totalCoaches
                }, getAuthHeader());
                setMessage(response.data.message);
            } else {
                // Mode Tambah Baru
                const response = await axios.post('http://127.0.0.1:8000/api/admin/trains', {
                    train_code: trainCode,
                    name: name,
                    class: trainClass,
                    total_coaches: totalCoaches
                }, getAuthHeader());
                setMessage(response.data.message);
            }

            handleCancelEdit();
            fetchTrains();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Terjadi kesalahan sistem.');
        }
    };

    // 3. FUNGSI EDIT DIKLIK
    const handleEditClick = (train) => {
        setIsEditing(true);
        setEditId(train.id);
        setTrainCode(train.train_code);
        setName(train.name);
        setTrainClass(train.class);
        setTotalCoaches(train.total_coaches);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        setTrainCode('');
        setName('');
        setTrainClass('executive');
        setTotalCoaches('');
    };

    // 4. FUNGSI HAPUS DIKLIK (Ditambahkan token)
    const handleDeleteClick = async (id, trainName) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus armada kereta "${trainName}"?`)) {
            try {
                const response = await axios.delete(`http://127.0.0.1:8000/api/admin/trains/${id}`, getAuthHeader());
                setMessage(response.data.message);
                fetchTrains();
            } catch (error) {
                setMessage('Gagal menghapus armada kereta.');
            }
        }
    };

    const renderClassBadge = (cls) => {
        const styles = {
            executive: { bg: '#eef2ff', text: '#3b82f6' },
            business: { bg: '#fff7ed', text: '#f97316' },
            economy: { bg: '#f0fdf4', text: '#22c55e' }
        };
        const currentStyle = styles[cls] || { bg: '#eee', text: '#333' };
        return (
            <span style={{ backgroundColor: currentStyle.bg, color: currentStyle.text, padding: '4px 8px', borderRadius: '4px', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>
                {cls}
            </span>
        );
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f5f7fb', minHeight: '100vh' }}>
            <h2 style={{ color: '#333', marginBottom: '5px' }}>Dashboard Admin</h2>
            <p style={{ color: '#777', marginTop: '0', marginBottom: '25px' }}>Manajemen Data Master Kereta Api</p>
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
                        {isEditing ? '✏️ Edit Data Kereta' : '+ Tambah Kereta Baru'}
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Kode Kereta:</label>
                            <input type="text" value={trainCode} onChange={(e) => setTrainCode(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Nama Kereta:</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Kelas Kereta:</label>
                            <select value={trainClass} onChange={(e) => setTrainClass(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                                <option value="executive">Executive</option>
                                <option value="business">Business</option>
                                <option value="economy">Economy</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>Jumlah Gerbong:</label>
                            <input type="number" min="1" value={totalCoaches} onChange={(e) => setTotalCoaches(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                        </div>

                        <button type="submit" style={{ padding: '12px', backgroundColor: isEditing ? '#f59e0b' : '#008CBA', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                            {isEditing ? 'Perbarui Kereta' : 'Simpan Kereta'}
                        </button>

                        {isEditing && (
                            <button type="button" onClick={handleCancelEdit} style={{ padding: '10px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Batal
                            </button>
                        )}
                    </form>
                </div>

                {/* PANEL KANAN: TABEL */}
                <div style={{ flex: '2', minWidth: '500px', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginTop: '0', color: '#444', marginBottom: '20px' }}>📋 Daftar Armada Kereta</h3>
                    
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '12px', color: '#666' }}>ID</th>
                                <th style={{ padding: '12px', color: '#666' }}>Kode</th>
                                <th style={{ padding: '12px', color: '#666' }}>Nama Kereta</th>
                                <th style={{ padding: '12px', color: '#666' }}>Kelas</th>
                                <th style={{ padding: '12px', color: '#666' }}>Gerbong</th>
                                <th style={{ padding: '12px', color: '#666', textAlign: 'center' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trainsList.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Belum ada data armada kereta.</td>
                                </tr>
                            ) : (
                                trainsList.map((train, index) => (
                                    <tr key={train.id} style={{ borderBottom: '1px solid #eee', backgroundColor: index % 2 === 0 ? '#fff' : '#fdfdfd' }}>
                                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#777' }}>{train.id}</td>
                                        <td style={{ padding: '12px', fontWeight: '600', color: '#333' }}>{train.train_code}</td>
                                        <td style={{ padding: '12px', color: '#333' }}>{train.name}</td>
                                        <td style={{ padding: '12px' }}>{renderClassBadge(train.class)}</td>
                                        <td style={{ padding: '12px', color: '#555' }}>{train.total_coaches} Gerbong</td>
                                        <td style={{ padding: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button onClick={() => handleEditClick(train)} style={{ padding: '6px 12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeleteClick(train.id, train.name)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
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

export default Trains;