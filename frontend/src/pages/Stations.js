import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { usePopup } from '../components/PopupContext';
import Modal from '../components/Modal';


function Stations() {
    const { showConfirm } = usePopup();

    const [stationCode, setStationCode] = useState('');
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [message, setMessage] = useState('');
    const [stationsList, setStationsList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    //get
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
        if (message) {
            const timer = setTimeout(() => setMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        fetchStations();
    }, []);

    //submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            if (isEditing) {
                //edit
                const response = await axios.put(
                    `http://127.0.0.1:8000/api/admin/stations/${editId}`,
                    { station_code: stationCode, name: name, city: city, is_active: isActive },
                    getAuthHeader()
                );
                setMessage(response.data.message);
            } else {
                //tambah
                const response = await axios.post(
                    'http://127.0.0.1:8000/api/admin/stations',
                    { station_code: stationCode, name: name, city: city, is_active: isActive },
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
        setIsActive(station.is_active === 1 || station.is_active === true);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setIsEditing(false);
        setEditId(null);
        setStationCode('');
        setName('');
        setCity('');
        setIsActive(true);
        setIsModalOpen(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        setStationCode('');
        setName('');
        setCity('');
        setIsActive(true);
        setIsModalOpen(false);
    };

    //delete
    const handleDeleteClick = async (id, stationName) => {
        if (await showConfirm(`Apakah Anda yakin ingin menghapus stasiun "${stationName}"?`)) {
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
        <div className="p-6 md:p-8 font-sans text-slate-800">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-950">Kelola Stasiun</h2>
                    <p className="text-sm text-slate-500 mt-1">Manajemen Data Master Stasiun Kereta Api</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="px-4 py-2 bg-[#1800ad] hover:bg-[#11007a] text-white font-bold rounded-lg transition-colors text-sm"
                >
                    + Tambah Data
                </button>
            </div>

            <hr className="border-slate-200 mb-8" />

            {/*alert message toast*/}
            {message && (
                <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-700 text-white border border-emerald-800 rounded-xl text-sm font-semibold shadow-xl transition-all">
                    {message}
                </div>
            )}

            <Modal 
                isOpen={isModalOpen} 
                title={isEditing ? 'Edit Data Stasiun' : 'Tambah Stasiun'}
                onClose={handleCancelEdit}
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Kode Stasiun:</label>
                        <input
                            type="text"
                            value={stationCode}
                            onChange={(e) => setStationCode(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1800ad]/100 focus:bg-white transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Stasiun:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1800ad]/100 focus:bg-white transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Kota:</label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
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
                            className="flex-1 py-2.5 bg-[#1800ad] hover:bg-[#11007a] text-white font-bold text-sm rounded-lg transition-colors"
                        >
                            Simpan
                        </button>
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-lg transition-colors"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </Modal>

            {/*list data */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden mb-12">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-lg font-bold text-slate-800">Daftar Stasiun</h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari nama stasiun..."
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
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Stasiun</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kota</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center pr-6">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {stationsList.filter(s => (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500 text-sm">
                                        Tidak ada stasiun ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                stationsList.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((station, index) => (
                                    <tr key={station.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4 pl-6 text-sm font-semibold text-slate-800">{station.id}</td>
                                        <td className="p-4 text-sm font-bold tracking-wider text-slate-800">{station.station_code}</td>
                                        <td className="p-4 text-sm font-medium text-slate-800">{station.name}</td>
                                        <td className="p-4 text-sm text-slate-600">{station.city}</td>
                                        <td className="p-4">
                                            <span className={`inline-block px-2.5 py-1 text-xs font-bold tracking-wide uppercase rounded-lg border ${station.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                {station.is_active ? 'AKTIF' : 'NONAKTIF'}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 flex gap-2 justify-center items-center">
                                            <button
                                                onClick={() => handleEditClick(station)}
                                                className="px-3 py-1.5 bg-[#1800ad]/10 text-[#1800ad] hover:bg-[#1800ad]/20 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(station.id, station.name)}
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

export default Stations;