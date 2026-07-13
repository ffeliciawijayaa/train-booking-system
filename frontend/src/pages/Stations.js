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

    // 1. GET DATA
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

    // 2. SUBMIT FORM (POST/PUT)
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

    // 4. DELETE DATA
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
        <div className="p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
            {/* Header Title */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Dashboard Admin</h2>
                <p className="text-sm text-slate-500 mt-0.5">Manajemen Data Master Stasiun Kereta Api</p>
            </div>
            
            <hr className="border-slate-200 mb-8" />

            {/* Alert Message Box */}
            {message && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl mb-6 text-sm font-medium shadow-sm">
                    {message}
                </div>
            )}

            {/* Layout Grid Layout Utama */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* PANEL KIRI: FORM */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className={`text-lg font-bold mb-6 ${isEditing ? 'text-amber-500' : 'text-slate-800'}`}>
                        {isEditing ? '✏️ Edit Data Stasiun' : '➕ Tambah Stasiun'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Kode Stasiun:</label>
                            <input 
                                type="text" 
                                value={stationCode} 
                                onChange={(e) => setStationCode(e.target.value)} 
                                required 
                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Stasiun:</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required 
                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Kota:</label>
                            <input 
                                type="text" 
                                value={city} 
                                onChange={(e) => setCity(e.target.value)} 
                                required 
                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <button 
                                type="submit" 
                                className={`w-full py-2.5 text-white font-bold text-sm rounded-xl transition-all shadow-sm active:scale-[0.99] ${
                                    isEditing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {isEditing ? 'Perbarui Data' : 'Simpan Ke Database'}
                            </button>

                            {isEditing && (
                                <button 
                                    type="button" 
                                    onClick={handleCancelEdit} 
                                    className="w-full py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-bold text-sm rounded-xl transition-all shadow-sm active:scale-[0.99]"
                                >
                                    Batal Edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* PANEL KANAN: TABEL */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">📋 Daftar Stasiun Aktif</h3>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="p-4 font-semibold text-slate-600">ID</th>
                                    <th className="p-4 font-semibold text-slate-600">Kode</th>
                                    <th className="p-4 font-semibold text-slate-600">Nama Stasiun</th>
                                    <th className="p-4 font-semibold text-slate-600">Kota</th>
                                    <th className="p-4 font-semibold text-slate-600 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {stationsList.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-400 font-medium">
                                            Belum ada data stasiun.
                                        </td>
                                    </tr>
                                ) : (
                                    stationsList.map((station, index) => (
                                        <tr key={station.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 font-bold text-slate-400">{station.id}</td>
                                            <td className="p-4">
                                                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-bold text-xs tracking-wide">
                                                    {station.station_code}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-800 font-medium">{station.name}</td>
                                            <td className="p-4 text-slate-600">{station.city}</td>
                                            <td className="p-4 flex gap-2 justify-center items-center">
                                                <button 
                                                    onClick={() => handleEditClick(station)} 
                                                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteClick(station.id, station.name)} 
                                                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95"
                                                >
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
        </div>
    );
}

export default Stations;