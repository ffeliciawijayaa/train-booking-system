import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import { usePopup } from '../components/PopupContext';

function AdminAccounts() {
    const [admins, setAdmins] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        email: '',
        password: ''
    });

    const fetchAdmins = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://127.0.0.1:8000/api/admin/admins', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAdmins(res.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Gagal mengambil data metode pembayaran:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleEdit = (admin) => {
        setFormData({
             id: admin.id,
            name: admin.name || '',
            email: admin.email || '',
            password: ''
    });
        setIsFormOpen(true);
    };

    const handleClose = () => {
        setFormData({
            id: null,
            name: '',
            email: '',
            password: ''
    });

        setIsFormOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        
        try {
            if (formData.id) {
                await axios.put(`http://127.0.0.1:8000/api/admin/admins/${formData.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Admin berhasil diupdate!');
            } else {
                await axios.post('http://127.0.0.1:8000/api/admin/admins', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Admin berhasil ditambahkan!');
            }
            handleClose();
            fetchAdmins();
        } catch (error) {
            console.error('Gagal menyimpan Admin:', error);
            alert('Gagal menyimpan data Admin.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus Admin ini?')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://127.0.0.1:8000/api/admin/admins/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Admin berhasil dihapus!');
            fetchAdmins();
        } catch (error) {
            console.error('Gagal menghapus Admin:', error);
            alert('Gagal menghapus Admin.');
        }
    };

    return (
        <div className="p-6 md:p-8 font-sans text-slate-800">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">Kelola Admin</h2>
                    <p className="text-slate-500 text-sm">Kelola data akun administrator sistem.</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ id: null, name: '', email: '', password: '' });
                        setIsFormOpen(true);
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 bg-[#1800ad] hover:bg-[#11007a] text-white font-bold rounded-lg transition-all text-sm shadow-sm shadow-[#1800ad]/20"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Tambah Admin
                </button>
            </div>


            <Modal isOpen={isFormOpen} onClose={handleClose} maxWidth="max-w-xl" title={formData.id ? "Edit Admin" : "Tambah Admin"}>
<form onSubmit={handleSubmit} autoComplete="off">
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="col-span-1">
                            <label className="block text-sm font-semibold mb-1">Nama</label>
                            <input 
                                type="text" name="name" required value={formData.name} onChange={handleChange} 
                                className="w-full border p-2 rounded-lg text-sm" placeholder="Masukkan nama admin"
                            />
                        </div>

                        {!formData.id && (
                                <div className="col-span-1">
                                    <label className="block text-sm font-semibold mb-1">
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        className="w-full border p-2 rounded-lg text-sm"
                                        placeholder="Masukkan password"
                                    />
                                </div>
                            )}
                        <div className="col-span-1">
                            <label className="block text-sm font-semibold mb-1">Email</label>
                             <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="off"
                                className="w-full border p-2 rounded-lg text-sm"
                                placeholder="Masukkan email admin"
                                required
                            />
                        </div>
                        

                        

                        
                        
                        </div><div className="flex gap-3 pt-4 border-t border-slate-100"><button type="submit" className="flex-1 py-2.5 bg-[#1800ad] hover:bg-[#11007a] text-white font-bold text-sm rounded-lg transition-colors">Simpan</button><button type="button" onClick={handleClose} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-lg transition-colors">Batal</button></div></form></Modal>

            
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden mb-12">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-lg font-bold text-slate-800">Daftar Admin</h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari admin..."
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
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center pr-6">Aksi</th>
                            </tr>

                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="p-4 text-center text-slate-500">
                                    Memuat data...
                                </td>
                            </tr>
                        ) : admins.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-4 text-center text-slate-500">
                                    Belum ada admin terdaftar.
                                </td>
                            </tr>
                        ) : (
                            
                            admins.filter(a => (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (a.email || '').toLowerCase().includes(searchTerm.toLowerCase())).map((admin) => (
                                <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-4 pl-6 text-sm font-semibold text-slate-800">{admin.id}</td>
                                    <td className="p-4 text-sm font-bold text-[#1800ad]">{admin.name}</td>
                                    <td className="p-4 text-sm text-slate-600">{admin.email}</td>
                                    <td className="p-4 pr-6 flex gap-2 justify-center items-center">
                                            <button onClick={() => handleEdit(admin)} className="px-3 py-1.5 bg-[#1800ad]/10 text-[#1800ad] hover:bg-[#1800ad]/20 rounded-lg text-xs font-bold transition-colors">Edit</button>
                                            <button onClick={() => handleDelete(admin.id)} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors">Hapus</button>
                                        
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

export default AdminAccounts;
