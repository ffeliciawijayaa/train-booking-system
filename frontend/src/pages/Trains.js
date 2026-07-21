import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { usePopup } from '../components/PopupContext';

function Trains() {
    const { showConfirm } = usePopup();

    const [trainCode, setTrainCode] = useState('');
    const [name, setName] = useState('');
    const [trainClass, setTrainClass] = useState('executive');
    const [totalCoaches, setTotalCoaches] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [message, setMessage] = useState('');
    const [trainsList, setTrainsList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // STATE UNTUK EDIT DATA
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                    total_coaches: totalCoaches,
                    is_active: isActive
                }, getAuthHeader());
                setMessage(response.data.message);
            } else {
                // Mode Tambah Baru
                const response = await axios.post('http://127.0.0.1:8000/api/admin/trains', {
                    train_code: trainCode,
                    name: name,
                    class: trainClass,
                    total_coaches: totalCoaches,
                    is_active: isActive
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
        setIsActive(train.is_active === 1 || train.is_active === true);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setIsEditing(false);
        setEditId(null);
        setTrainCode('');
        setName('');
        setTrainClass('executive');
        setTotalCoaches('');
        setIsActive(true);
        setIsModalOpen(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        setTrainCode('');
        setName('');
        setTrainClass('executive');
        setTotalCoaches('');
        setIsActive(true);
        setIsModalOpen(false);
    };

    // 4. FUNGSI HAPUS DIKLIK
    const handleDeleteClick = async (id, trainName) => {
        if (await showConfirm(`Apakah Anda yakin ingin menghapus kereta "${trainName}"?`)) {
            try {
                const response = await axios.delete(`http://127.0.0.1:8000/api/admin/trains/${id}`, getAuthHeader());
                setMessage(response.data.message);
                fetchTrains();
            } catch (error) {
                setMessage('Gagal menghapus kereta.');
            }
        }
    };

    const renderClassBadge = (cls) => {
        const styles = {
            executive: 'bg-[#1800ad]/10 text-[#1800ad] border border-[#1800ad]/20',
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
        <div className="p-6 md:p-8 font-sans text-slate-800">
            {/* Header Title */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Kelola Kereta
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Tambah, ubah, dan hapus data kereta.
                    </p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="px-4 py-2 bg-[#1800ad] hover:bg-[#11007a] text-white font-bold rounded-lg transition-colors text-sm"
                >
                    + Tambah Data
                </button>
            </div>

            <hr className="border-slate-200 mb-8" />

            {/* Alert Message Box */}
            {message && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl mb-6 text-sm font-medium shadow-sm">
                    {message}
                </div>
            )}

            {/* Modal Form */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCancelEdit}
                title={isEditing ? 'Edit Data Kereta' : 'Tambah Kereta Baru'}
            >

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Kode Kereta:</label>
                                <input
                                    type="text"
                                    value={trainCode}
                                    onChange={(e) => setTrainCode(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1800ad]/100 focus:bg-white transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Kereta:</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1800ad]/100 focus:bg-white transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Kelas Kereta:</label>
                                <select
                                    value={trainClass}
                                    onChange={(e) => setTrainClass(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1800ad]/100 focus:bg-white transition-colors"
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
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1800ad]/100 focus:bg-white transition-colors"
                                />
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                                <input 
                                    type="checkbox" id="is_active"
                                    checked={isActive} onChange={(e) => setIsActive(e.target.checked)} 
                                    className="w-4 h-4 text-[#1800ad] rounded border-slate-300"
                                />
                                <label htmlFor="is_active" className="text-sm font-semibold text-slate-700 cursor-pointer">Aktif</label>
                            </div>

                            <div className="flex flex-row gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-[#1800ad] hover:bg-[#11007a] text-white font-bold text-sm rounded-lg transition-colors shadow-sm"
                                >
                                    Simpan
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-lg transition-colors shadow-sm"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
            </Modal>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden mb-12">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Daftar Kereta</h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari nama..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1800ad] focus:bg-white transition-colors"
                        />
                        <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider pl-6">ID</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kode</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Kereta</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kelas</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah Gerbong</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center pr-6">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {trainsList.filter(s => (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-500 text-sm">
                                        Belum ada data armada kereta.
                                    </td>
                                </tr>
                            ) : (
                                trainsList.filter(s => (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map((train, index) => (
                                    <tr key={train.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4 pl-6 text-sm font-semibold text-slate-800">{train.id}</td>
                                        <td className="p-4 text-sm font-bold tracking-wider text-slate-800">{train.train_code}</td>
                                        <td className="p-4 text-sm font-medium text-slate-800">{train.name}</td>
                                        <td className="p-4">{renderClassBadge(train.class)}</td>
                                        <td className="p-4 text-sm font-medium text-slate-600">{train.total_coaches} Gerbong</td>
                                        <td className="p-4">
                                            <span className={`inline-block px-2.5 py-1 text-xs font-bold tracking-wide uppercase rounded-lg border ${train.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                {train.is_active ? 'AKTIF' : 'NONAKTIF'}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 flex gap-2 justify-center items-center">
                                            <button
                                                onClick={() => handleEditClick(train)}
                                                className="px-3 py-1.5 bg-[#1800ad]/10 text-[#1800ad] hover:bg-[#1800ad]/20 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(train.id, train.name)}
                                                className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
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
    );
}

export default Trains;