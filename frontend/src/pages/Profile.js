import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Profile() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        nik: '',
        phone_number: '',
        gender: ''
    });
    
    // Backup data for canceling edit
    const [originalData, setOriginalData] = useState(null);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const res = await axios.get('http://127.0.0.1:8000/api/user', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const user = res.data;
                const userData = {
                    name: user.name || '',
                    email: user.email || '',
                    nik: user.nik || '',
                    phone_number: user.phone_number || '',
                    gender: user.gender || ''
                };
                setFormData(userData);
                setOriginalData(userData);
            } catch (err) {
                console.error("Gagal memuat profil", err);
                if (err.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Khusus NIK, hanya boleh angka dan maksimal 16 digit
        if (name === 'nik') {
            const onlyNums = value.replace(/[^0-9]/g, '');
            if (onlyNums.length <= 16) {
                setFormData({ ...formData, [name]: onlyNums });
            }
            return;
        }
        
        setFormData({ ...formData, [name]: value });
    };

    const handleCancel = () => {
        setFormData(originalData);
        setIsEditing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('http://127.0.0.1:8000/api/user/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(res.data.message || 'Profil berhasil diperbarui!');
            setOriginalData(formData); // Update original data after save
            setIsEditing(false); // Back to read-only view
        } catch (err) {
            console.error("Gagal mengupdate profil", err);
            alert(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan profil.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-800">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <span>👤</span> Profil Saya
                    </h1>
                    <Link to="/search" className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 transition-colors">
                        &larr; Kembali ke Dashboard
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-slate-500 animate-pulse font-semibold">Memuat profil...</div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        {/* HEADER PROFIL */}
                        <div className="bg-slate-100/50 p-6 flex justify-between items-center border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Data Diri</h2>
                                <p className="text-sm text-slate-500">Kelola informasi pribadi Anda.</p>
                            </div>
                            {!isEditing && (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors border border-blue-200 shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    Edit Profil
                                </button>
                            )}
                        </div>

                        <div className="p-6 md:p-8">
                            {!isEditing ? (
                                /* VIEW MODE (Read-only) */
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-slate-100 pb-4">
                                        <div className="text-sm font-semibold text-slate-500">Nama Lengkap</div>
                                        <div className="sm:col-span-2 font-medium">{formData.name || '-'}</div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-slate-100 pb-4">
                                        <div className="text-sm font-semibold text-slate-500">Email</div>
                                        <div className="sm:col-span-2 font-medium">{formData.email || '-'}</div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-slate-100 pb-4">
                                        <div className="text-sm font-semibold text-slate-500">NIK</div>
                                        <div className="sm:col-span-2 font-medium">{formData.nik || '-'}</div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-slate-100 pb-4">
                                        <div className="text-sm font-semibold text-slate-500">Nomor Telepon</div>
                                        <div className="sm:col-span-2 font-medium">{formData.phone_number || '-'}</div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-2">
                                        <div className="text-sm font-semibold text-slate-500">Jenis Kelamin</div>
                                        <div className="sm:col-span-2 font-medium capitalize">{formData.gender || '-'}</div>
                                    </div>
                                </div>
                            ) : (
                                /* EDIT MODE (Form) */
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
                                        <input 
                                            type="text" 
                                            name="name" 
                                            value={formData.name} 
                                            onChange={handleChange} 
                                            required 
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            value={formData.email} 
                                            onChange={handleChange} 
                                            required 
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">NIK (Nomor Induk Kependudukan)</label>
                                        <input 
                                            type="text" 
                                            name="nik" 
                                            value={formData.nik} 
                                            onChange={handleChange}
                                            minLength="16"
                                            maxLength="16"
                                            pattern="\d{16}"
                                            title="NIK harus tepat 16 digit angka"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Harus tepat 16 digit angka.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Telepon</label>
                                        <input 
                                            type="text" 
                                            name="phone_number" 
                                            value={formData.phone_number} 
                                            onChange={handleChange} 
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Kelamin</label>
                                        <select 
                                            name="gender" 
                                            value={formData.gender} 
                                            onChange={handleChange} 
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        >
                                            <option value="">Pilih Jenis Kelamin</option>
                                            <option value="pria">Pria</option>
                                            <option value="wanita">Wanita</option>
                                        </select>
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <button 
                                            type="button" 
                                            onClick={handleCancel}
                                            disabled={saving}
                                            className="flex-1 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={saving}
                                            className={`flex-1 py-3 rounded-xl text-white font-bold shadow-md transition-all ${saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'}`}
                                        >
                                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;
