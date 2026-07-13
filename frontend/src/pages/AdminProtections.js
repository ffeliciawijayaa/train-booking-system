import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function AdminProtections() {
    const [protections, setProtections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        description: '',
        price: '',
        is_active: true
    });

    const fetchProtections = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://127.0.0.1:8000/api/admin/protections', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProtections(res.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Gagal mengambil data proteksi:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProtections();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleEdit = (prot) => {
        setFormData({
            id: prot.id,
            name: prot.name,
            description: prot.description,
            price: prot.price,
            is_active: prot.is_active === 1 || prot.is_active === true
        });
        setIsFormOpen(true);
    };

    const handleClose = () => {
        setFormData({ id: null, name: '', description: '', price: '', is_active: true });
        setIsFormOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            if (formData.id) {
                await axios.put(`http://127.0.0.1:8000/api/admin/protections/${formData.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Proteksi berhasil diupdate!');
            } else {
                await axios.post('http://127.0.0.1:8000/api/admin/protections', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Proteksi berhasil ditambahkan!');
            }
            handleClose();
            fetchProtections();
        } catch (error) {
            console.error('Gagal menyimpan proteksi:', error);
            alert('Gagal menyimpan data proteksi.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus proteksi ini?')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://127.0.0.1:8000/api/admin/protections/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Proteksi berhasil dihapus!');
            fetchProtections();
        } catch (error) {
            console.error('Gagal menghapus proteksi:', error);
            alert('Gagal menghapus proteksi.');
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto font-sans text-slate-800">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Kelola Proteksi & Asuransi</h1>
                    <p className="text-slate-500 text-sm mt-1">Atur asuransi yang bisa dibeli penumpang.</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/admin" className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors text-sm">
                        Kembali ke Dashboard
                    </Link>
                    <button 
                        onClick={() => setIsFormOpen(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm shadow-md"
                    >
                        + Tambah Proteksi
                    </button>
                </div>
            </div>

            {isFormOpen && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                    <h2 className="text-lg font-bold mb-4">{formData.id ? 'Edit Proteksi' : 'Tambah Proteksi Baru'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-semibold mb-1">Nama Proteksi</label>
                            <input 
                                type="text" name="name" required value={formData.name} onChange={handleChange} 
                                className="w-full border p-2 rounded-lg text-sm" placeholder="Misal: Asuransi Keterlambatan" 
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-semibold mb-1">Harga (Rp)</label>
                            <input 
                                type="number" name="price" required value={formData.price} onChange={handleChange} 
                                className="w-full border p-2 rounded-lg text-sm" placeholder="10000" 
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold mb-1">Deskripsi Singkat</label>
                            <input 
                                type="text" name="description" required value={formData.description} onChange={handleChange} 
                                className="w-full border p-2 rounded-lg text-sm" placeholder="Jaminan 100% uang kembali jika terlambat." 
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2 flex items-center gap-2 mt-2">
                            <input 
                                type="checkbox" name="is_active" id="is_active"
                                checked={formData.is_active} onChange={handleChange} 
                                className="w-4 h-4 text-blue-600"
                            />
                            <label htmlFor="is_active" className="text-sm font-semibold cursor-pointer">Aktif (Tersedia untuk dibeli)</label>
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
                            <th className="p-4 border-b font-bold">Nama Proteksi</th>
                            <th className="p-4 border-b font-bold">Deskripsi</th>
                            <th className="p-4 border-b font-bold">Harga</th>
                            <th className="p-4 border-b font-bold">Status</th>
                            <th className="p-4 border-b font-bold text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="p-4 text-center text-slate-500">Memuat data...</td></tr>
                        ) : protections.length === 0 ? (
                            <tr><td colSpan="6" className="p-4 text-center text-slate-500">Belum ada proteksi terdaftar.</td></tr>
                        ) : (
                            protections.map((prot) => (
                                <tr key={prot.id} className="hover:bg-slate-50 border-b last:border-0 transition-colors">
                                    <td className="p-4 text-sm font-semibold">{prot.id}</td>
                                    <td className="p-4 text-sm font-bold text-blue-600">{prot.name}</td>
                                    <td className="p-4 text-sm text-slate-600">{prot.description}</td>
                                    <td className="p-4 text-sm font-semibold text-amber-600">Rp {parseInt(prot.price).toLocaleString('id-ID')}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-md ${prot.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {prot.is_active ? 'AKTIF' : 'NONAKTIF'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => handleEdit(prot)} className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded font-semibold text-xs transition-colors">Edit</button>
                                            <button onClick={() => handleDelete(prot.id)} className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded font-semibold text-xs transition-colors">Hapus</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminProtections;
