import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function AdminAccounts() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        email: '',
        password: '',
        nik: '',
        phone_number: '',
        gender: ''
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
            password: '',
            nik: admin.nik || '',
            phone_number: admin.phone_number || '',
            gender: admin.gender || ''
        });
        setIsFormOpen(true);
    };

    const handleClose = () => {
        setFormData({
            id: null,
            name: '',
            email: '',
            password: '',
            nik: '',
            phone_number: '',
            gender: ''
        });

        setIsFormOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        // Validasi NIK
        if (formData.nik && formData.nik.length !== 16) {
            alert("NIK harus terdiri dari 16 digit.");
            return;
        }
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
        <div className="p-6 max-w-6xl mx-auto font-sans text-slate-800">
            <div className="flex justify-between items-center mb-6">
                <div>
                   <h1 className="text-2xl font-bold text-slate-900">Kelola Admin</h1>
                    <p className="text-slate-500 text-sm mt-1">Tambah, ubah, dan hapus akun admin.</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/admin/schedules" className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors text-sm">
                        Kembali ke Dashboard
                    </Link>
                    <button 
                        onClick={() => {
                            handleClose();
                            setIsFormOpen(true);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm shadow-md"
                    >
                        + Tambah Admin
                    </button>
                </div>
            </div>

            {isFormOpen && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                    <h2 className="text-lg font-bold mb-4">{formData.id ? 'Edit Admin' : 'Tambah Admin'}</h2>
                    <form onSubmit={handleSubmit} autoComplete="off" className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="col-span-1">
                            <label className="block text-sm font-semibold mb-1">
                                NIK
                            </label>

                            <input
                                type="text"
                                name="nik"
                                value={formData.nik}
                                onChange={handleChange}
                                maxLength={16}
                                className="w-full border p-2 rounded-lg text-sm"
                                placeholder="Masukkan NIK"
                            />
                        </div>

                        <div className="col-span-1">
                            <label className="block text-sm font-semibold mb-1">
                                Nomor HP
                            </label>

                            <input
                                type="text"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg text-sm"
                                placeholder="Masukkan nomor HP"
                            />
                        </div>

                        <div className="col-span-1">
                            <label className="block text-sm font-semibold mb-1">
                                Gender
                            </label>

                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg text-sm"
                            >
                                <option value="">Pilih Gender</option>
                                <option value="pria">Pria</option>
                                <option value="wanita">Wanita</option>
                            </select>
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
                            <th className="p-4 border-b font-bold">Nama</th>
                            <th className="p-4 border-b font-bold">Email</th>
                            <th className="p-4 border-b font-bold">NIK</th>
                            <th className="p-4 border-b font-bold">Nomor HP</th>
                            <th className="p-4 border-b font-bold">Gender</th>
                            <th className="p-4 border-b font-bold text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
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
                            admins.map((admin) => (
                                <tr
                                    key={admin.id}
                                    className="hover:bg-slate-50 border-b last:border-0 transition-colors"
                                >
                                    <td className="p-4 text-sm font-semibold">
                                        {admin.id}
                                    </td>

                                    <td className="p-4 text-sm font-bold text-blue-600">
                                        {admin.name}
                                    </td>

                                    <td className="p-4 text-sm">
                                        {admin.email}
                                    </td>

                                    <td className="p-4 text-sm">
                                        {admin.nik || "-"}
                                    </td>

                                    <td className="p-4 text-sm">
                                        {admin.phone_number || "-"}
                                    </td>

                                    <td className="p-4 text-sm">
                                        {admin.gender || "-"}
                                    </td>

                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(admin)}
                                                className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded font-semibold text-xs"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDelete(admin.id)}
                                                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded font-semibold text-xs"
                                            >
                                                Hapus
                                            </button>
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

export default AdminAccounts;
