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

    // 1. GET DATA KERETA
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

    // 2. SUBMIT FORM (TAMBAH / UPDATE)
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

    // 4. FUNGSI HAPUS DIKLIK
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
            executive: 'bg-blue-50 text-blue-600 border border-blue-100',
            business: 'bg-orange-50 text-orange-600 border border-orange-100',
            economy: 'bg-green-50 text-green-600 border border-green-100'
        };
        const currentStyle = styles[cls] || 'bg-slate-50 text-slate-600 border border-slate-100';
        return (
            <span className={`px-2.5 py-1 rounded-lg font-bold text-xs tracking-wide uppercase ${currentStyle}`}>
                {cls}
            </span>
        );
    };

    return (
        <div className="p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
            {/* Header Title */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Dashboard Admin</h2>
                <p className="text-sm text-slate-500 mt-0.5">Manajemen Data Master Kereta Api</p>
            </div>
            
            <hr className="border-slate-200 mb-8" />

            {/* Alert Message Box */}
            {message && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl mb-6 text-sm font-medium shadow-sm">
                    {message}
                </div>
            )}

            {/* Grid Layout Utama */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* PANEL KIRI: FORM */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className={`text-lg font-bold mb-6 ${isEditing ? 'text-amber-500' : 'text-slate-800'}`}>
                        {isEditing ? '✏️ Edit Data Kereta' : '➕ Tambah Kereta Baru'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Kode Kereta:</label>
                            <input 
                                type="text" 
                                value={trainCode} 
                                onChange={(e) => setTrainCode(e.target.value)} 
                                required 
                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Kereta:</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required 
                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Kelas Kereta:</label>
                            <select 
                                value={trainClass} 
                                onChange={(e) => setTrainClass(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            >
                                <option value="executive">Executive</option>
                                <option value="business">Business</option>
                                <option value="economy">Economy</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Jumlah Gerbong:</label>
                            <input 
                                type="number" 
                                min="1" 
                                value={totalCoaches} 
                                onChange={(e) => setTotalCoaches(e.target.value)} 
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
                                {isEditing ? 'Perbarui Kereta' : 'Simpan Kereta'}
                            </button>

                            {isEditing && (
                                <button 
                                    type="button" 
                                    onClick={handleCancelEdit} 
                                    className="w-full py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-bold text-sm rounded-xl transition-all shadow-sm active:scale-[0.99]"
                                >
                                    Batal
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* PANEL KANAN: TABEL */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">📋 Daftar Armada Kereta</h3>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="p-4 font-semibold text-slate-600">ID</th>
                                    <th className="p-4 font-semibold text-slate-600">Kode</th>
                                    <th className="p-4 font-semibold text-slate-600">Nama Kereta</th>
                                    <th className="p-4 font-semibold text-slate-600">Kelas</th>
                                    <th className="p-4 font-semibold text-slate-600">Gerbong</th>
                                    <th className="p-4 font-semibold text-slate-600 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {trainsList.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">
                                            Belum ada data armada kereta.
                                        </td>
                                    </tr>
                                ) : (
                                    trainsList.map((train, index) => (
                                        <tr key={train.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 font-bold text-slate-400">{train.id}</td>
                                            <td className="p-4 text-slate-800 font-bold tracking-wider">{train.train_code}</td>
                                            <td className="p-4 text-slate-800 font-medium">{train.name}</td>
                                            <td className="p-4">{renderClassBadge(train.class)}</td>
                                            <td className="p-4 text-slate-600 font-medium">{train.total_coaches} Gerbong</td>
                                            <td className="p-4 flex gap-2 justify-center items-center">
                                                <button 
                                                    onClick={() => handleEditClick(train)} 
                                                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteClick(train.id, train.name)} 
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

export default Trains;