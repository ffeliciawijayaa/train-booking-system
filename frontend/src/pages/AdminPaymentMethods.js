import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function AdminPaymentMethods() {
    const [methods, setMethods] = useState([]);
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
                alert('Metode Pembayaran berhasil diupdate!');
            } else {
                await axios.post('http://127.0.0.1:8000/api/admin/payment-methods', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Metode Pembayaran berhasil ditambahkan!');
            }
            handleClose();
            fetchMethods();
        } catch (error) {
            console.error('Gagal menyimpan metode pembayaran:', error);
            alert('Gagal menyimpan data metode pembayaran.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus metode pembayaran ini?')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://127.0.0.1:8000/api/admin/payment-methods/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Metode Pembayaran berhasil dihapus!');
            fetchMethods();
        } catch (error) {
            console.error('Gagal menghapus metode pembayaran:', error);
            alert('Gagal menghapus metode pembayaran.');
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
        <div className="p-6 max-w-6xl mx-auto font-sans text-slate-800">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Kelola Metode Pembayaran</h1>
                    <p className="text-slate-500 text-sm mt-1">Atur opsi pembayaran untuk penumpang.</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/admin/schedules" className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors text-sm">
                        Kembali ke Dashboard
                    </Link>
                    <button 
                        onClick={() => setIsFormOpen(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm shadow-md"
                    >
                        + Tambah Metode
                    </button>
                </div>
            </div>

            {isFormOpen && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                    <h2 className="text-lg font-bold mb-4">{formData.id ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-semibold mb-1">Nama Metode (ex: BCA Virtual Account)</label>
                            <input 
                                type="text" name="name" required value={formData.name} onChange={handleChange} 
                                className="w-full border p-2 rounded-lg text-sm" placeholder="Misal: Mandiri VA" 
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-semibold mb-1">Logo URL (Opsional)</label>
                            <input 
                                type="text" name="logo_url" value={formData.logo_url} onChange={handleChange} 
                                className="w-full border p-2 rounded-lg text-sm" placeholder="https://.../logo.png" 
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold mb-1">Instruksi Pembayaran</label>
                            <textarea 
                                name="instructions" value={formData.instructions} onChange={handleChange} rows="3"
                                className="w-full border p-2 rounded-lg text-sm" placeholder="1. Buka m-banking... 2. Pilih bayar..." 
                            ></textarea>
                        </div>
                        <div className="col-span-1 md:col-span-2 flex items-center gap-2 mt-2">
                            <input 
                                type="checkbox" name="is_active" id="is_active"
                                checked={formData.is_active} onChange={handleChange} 
                                className="w-4 h-4 text-blue-600"
                            />
                            <label htmlFor="is_active" className="text-sm font-semibold cursor-pointer">Aktif (Tersedia saat checkout)</label>
                        </div>
                        <div className="col-span-1 md:col-span-2 flex gap-3 mt-4">
                            <button type="button" onClick={handleClose} className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-sm">Batal</button>
                            <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm shadow-md">Simpan Data</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-100 text-slate-600 text-sm">
                            <th className="p-4 border-b font-bold">ID</th>
                            <th className="p-4 border-b font-bold">Logo</th>
                            <th className="p-4 border-b font-bold">Nama Metode</th>
                            <th className="p-4 border-b font-bold">Instruksi</th>
                            <th className="p-4 border-b font-bold">Status</th>
                            <th className="p-4 border-b font-bold text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="p-4 text-center text-slate-500">Memuat data...</td></tr>
                        ) : methods.length === 0 ? (
                            <tr><td colSpan="6" className="p-4 text-center text-slate-500">Belum ada metode pembayaran terdaftar.</td></tr>
                        ) : (
                            methods.map((method) => {
                                const isExpanded = expandedRow === method.id;
                                return (
                                    <tr key={method.id} className="hover:bg-slate-50 border-b last:border-0 transition-colors">
                                        <td className="p-4 text-sm font-semibold">{method.id}</td>
                                        <td className="p-4">
                                            {method.logo_url ? (
                                                <img src={method.logo_url} alt={method.name} className="h-8 object-contain" />
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Tidak ada logo</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-blue-600">{method.name}</td>
                                        
                                        {/* kolom buka tutup instructions */}
                                        <td className="p-4 text-sm text-slate-600 max-w-xs">
                                            <div className={`${isExpanded ? 'whitespace-pre-line text-slate-900 bg-slate-50 p-2 rounded-lg border border-slate-200' : 'truncate max-w-[200px]'}`}>
                                                {method.instructions || '-'}
                                            </div>
                                            {method.instructions && (
                                                <button 
                                                    onClick={() => toggleRow(method.id)}
                                                    className="text-[11px] text-blue-600 font-bold hover:underline mt-1 block"
                                                >
                                                    {isExpanded ? '▲ Tutup Langkah' : '▼ Lihat Langkah'}
                                                </button>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-md ${method.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {method.is_active ? 'AKTIF' : 'NONAKTIF'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleEdit(method)} className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded font-semibold text-xs transition-colors">Edit</button>
                                                <button onClick={() => handleDelete(method.id)} className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded font-semibold text-xs transition-colors">Hapus</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminPaymentMethods;
