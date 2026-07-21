import Modal from '../components/Modal';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { usePopup } from '../components/PopupContext';

function AdminPaymentMethods() {    const { showPopup, showConfirm } = usePopup();

    const [methods, setMethods] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        logo_url: '',
        instructions: '',
        is_active: true
    });

    const fetchMethods = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://127.0.0.1:8000/api/admin/payment-methods', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMethods(res.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Gagal mengambil data metode pembayaran:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMethods();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleEdit = (method) => {
        setFormData({
            id: method.id,
            name: method.name,
            logo_url: method.logo_url || '',
            instructions: method.instructions || '',
            is_active: method.is_active === 1 || method.is_active === true
        });
        setIsFormOpen(true);
    };

    const handleClose = () => {
        setFormData({ id: null, name: '', logo_url: '', instructions: '', is_active: true });
        setIsFormOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            if (formData.id) {
                await axios.put(`http://127.0.0.1:8000/api/admin/payment-methods/${formData.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showPopup('Metode Pembayaran berhasil diupdate!');
            } else {
                await axios.post('http://127.0.0.1:8000/api/admin/payment-methods', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showPopup('Metode Pembayaran berhasil ditambahkan!');
            }
            handleClose();
            fetchMethods();
        } catch (error) {
            console.error('Gagal menyimpan metode pembayaran:', error);
            showPopup('Gagal menyimpan data metode pembayaran.');
        }
    };

    const handleDelete = async (id) => {
        if (!await showConfirm('Yakin ingin menghapus metode pembayaran ini?')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://127.0.0.1:8000/api/admin/payment-methods/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showPopup('Metode Pembayaran berhasil dihapus!');
            fetchMethods();
        } catch (error) {
            console.error('Gagal menghapus metode pembayaran:', error);
            showPopup('Gagal menghapus metode pembayaran.');
        }
    };

    //toggle buka-tutup baris instruksi
    const toggleRow = (id) => {
        if (expandedRow === id) {
            setExpandedRow(null);
        } else {

            setExpandedRow(id);
        }
    }

    return (
        <div className="p-6 md:p-8 font-sans text-slate-800">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">Metode Pembayaran</h2>
                    <p className="text-slate-500 text-sm">Kelola metode pembayaran yang tersedia.</p>
                </div>
                <button 
                    onClick={() => {
                        setFormData({
                        id: null,
                        name: '',
                        logo_url: '',
                        instructions: '',
                        is_active: true
                    });
                        setIsFormOpen(true);
                    }} 
                    className="inline-flex items-center justify-center px-4 py-2 bg-[#1800ad] hover:bg-[#11007a] text-white font-bold rounded-lg transition-all text-sm shadow-sm shadow-[#1800ad]/20"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Tambah Data
                </button>
            </div>

            <Modal isOpen={isFormOpen} onClose={handleClose} maxWidth="max-w-md" title={formData.id ? "Edit Metode Pembayaran" : "Tambah Metode Pembayaran"}>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Metode (ex: BCA Virtual Account):</label>
                                <input 
                                    type="text" name="name" required value={formData.name} onChange={handleChange} 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1800ad]/100 focus:bg-white transition-colors" placeholder="Misal: Mandiri VA" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Logo URL (Opsional):</label>
                                <input 
                                    type="text" name="logo_url" value={formData.logo_url} onChange={handleChange} 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1800ad]/100 focus:bg-white transition-colors" placeholder="https://.../logo.png" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Instruksi Pembayaran:</label>
                                <textarea 
                                    name="instructions" value={formData.instructions} onChange={handleChange} rows="3"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1800ad]/100 focus:bg-white transition-colors" placeholder="1. Buka m-banking... 2. Pilih bayar..." 
                                ></textarea>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <input 
                                    type="checkbox" name="is_active" id="is_active"
                                    checked={formData.is_active} onChange={handleChange} 
                                    className="w-4 h-4 text-[#1800ad] rounded border-slate-300"
                                />
                                <label htmlFor="is_active" className="text-sm font-semibold text-slate-700 cursor-pointer">Aktif (Tersedia saat checkout)</label>
                            </div>
                            <div className="flex flex-row gap-3 pt-4">
                                <button type="submit" className="flex-1 py-2.5 bg-[#1800ad] hover:bg-[#11007a] text-white font-bold text-sm rounded-lg transition-colors">Simpan</button>
                                <button type="button" onClick={handleClose} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-lg transition-colors">Batal</button>
                            </div>
                        </form>
            </Modal>

            <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden mb-12">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Daftar Metode Pembayaran</h3>
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
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Logo</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Metode</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Instruksi</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center pr-6">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500 text-sm">Memuat data...</td></tr>
                            ) : methods.filter(s => (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500 text-sm">Belum ada metode pembayaran terdaftar.</td></tr>
                            ) : (
                                methods.map((method) => {
                                    const isExpanded = expandedRow === method.id;
                                    return (
                                        <tr key={method.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-4 pl-6 text-sm font-semibold text-slate-800">{method.id}</td>
                                            <td className="p-4">
                                                {method.logo_url ? (
                                                    <img src={method.logo_url} alt={method.name} className="h-8 object-contain" />
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Tidak ada logo</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm font-bold text-slate-800">{method.name}</td>
                                            
                                            <td className="p-4 text-sm text-slate-600 max-w-xs">
                                                <div className={`${isExpanded ? 'whitespace-pre-line text-slate-900 bg-slate-50 p-2 rounded-lg border border-slate-200' : 'truncate max-w-[200px]'}`}>
                                                    {method.instructions || '-'}
                                                </div>
                                                {method.instructions && (
                                                    <button 
                                                        onClick={() => toggleRow(method.id)}
                                                        className="text-[11px] text-[#1800ad] font-bold hover:underline mt-1 block"
                                                    >
                                                        {isExpanded ? '▲ Tutup Langkah' : '▼ Lihat Langkah'}
                                                    </button>
                                                )}
                                            </td>

                                            <td className="p-4">
                                                <span className={`inline-block px-2.5 py-1 text-xs font-bold tracking-wide uppercase rounded-lg border ${method.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                    {method.is_active ? 'AKTIF' : 'NONAKTIF'}
                                                </span>
                                            </td>
                                            <td className="p-4 pr-6 flex gap-2 justify-center items-center">
                                                    <button onClick={() => handleEdit(method)} className="px-3 py-1.5 bg-[#1800ad]/10 text-[#1800ad] hover:bg-[#1800ad]/20 rounded-lg text-xs font-bold transition-colors">Edit</button>
                                                    <button onClick={() => handleDelete(method.id)} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors">Hapus</button>
                                                
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminPaymentMethods;
