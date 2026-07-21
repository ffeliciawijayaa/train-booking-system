import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserRound } from 'lucide-react';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import { usePopup } from '../components/PopupContext';

function Profile() {
    const { showPopup } = usePopup();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        nik: '',
        phone_number: '',
        gender: '',
        birth_date: ''
    });

    // Backup data for canceling edit
    const [originalData, setOriginalData] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Controls the modal

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
                    gender: user.gender || '',
                    birth_date: user.birth_date || ''
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
            showPopup(res.data.message || 'Profil berhasil diperbarui!');
            setOriginalData(formData);
            setIsEditing(false); // Close modal on success
        } catch (err) {
            console.error("Gagal mengupdate profil", err);
            showPopup(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan profil.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">
            <UserNavbar variant="white" />

            <div className="flex-1 pt-32 pb-24 w-full">
                <div className="max-w-[1400px] mx-auto px-6 md:px-28 lg:px-32 space-y-8">
                    {/* PAGE TITLE */}
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-black text-[#1800ad]">Profil Saya</h1>

                    </div>

                    {loading ? (
                        <div className="text-center py-10 text-slate-500 animate-pulse font-semibold">Memuat profil...</div>
                    ) : (
                        <>
                            {/* HEADER CARD */}
                            <div className="bg-white rounded shadow-sm border border-slate-200 p-6 flex items-center gap-6">
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 flex-shrink-0 ${formData.gender === 'wanita'
                                        ? 'bg-pink-100 border-pink-50 text-pink-500'
                                        : 'bg-[#1800ad]/10 border-blue-50 text-[#1800ad]'
                                    }`}>
                                    <UserRound size={48} strokeWidth={2} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-[#1800ad]">{formData.name || 'User'}</h2>
                                    <p className="text-slate-500 mt-1">{formData.email}</p>
                                </div>
                            </div>

                            {/* PERSONAL INFORMATION CARD */}
                            <div className="bg-white rounded shadow-sm border border-slate-200 p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-xl font-bold text-[#1800ad]">Informasi Pribadi</h2>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-[#1800ad] hover:bg-[#11007a] text-white px-5 py-2 rounded font-bold text-sm shadow-md transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        Ubah Data
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                    <div>
                                        <div className="text-sm font-semibold text-slate-400 mb-1">Nama Lengkap</div>
                                        <div className="font-bold text-slate-800">{formData.name || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-400 mb-1">NIK</div>
                                        <div className="font-bold text-slate-800">{formData.nik || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-400 mb-1">Email</div>
                                        <div className="font-bold text-slate-800">{formData.email || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-400 mb-1">Nomor Telepon</div>
                                        <div className="font-bold text-slate-800">{formData.phone_number || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-400 mb-1">Tanggal Lahir</div>
                                        <div className="font-bold text-slate-800">
                                            {formData.birth_date
                                                ? new Date(formData.birth_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
                                                : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-400 mb-1">Jenis Kelamin</div>
                                        <div className={`font-bold capitalize ${formData.gender === 'wanita' ? 'text-pink-500' : formData.gender === 'pria' ? 'text-[#1800ad]' : 'text-slate-800'}`}>
                                            {formData.gender || '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <Footer />

            {/* EDIT MODAL */}
            <Modal
                isOpen={isEditing}
                onClose={handleCancel}
                title="Edit Informasi Pribadi"
                maxWidth="max-w-lg"
            >
                        <div className="max-h-[70vh] overflow-y-auto">
                            <form onSubmit={handleSubmit} id="editProfileForm" className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1800ad]/20 focus:border-[#1800ad] transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">NIK</label>
                                    <input
                                        type="text"
                                        name="nik"
                                        value={formData.nik}
                                        onChange={handleChange}
                                        minLength="16"
                                        maxLength="16"
                                        pattern="\d{16}"
                                        title="NIK harus tepat 16 digit angka"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1800ad]/20 focus:border-[#1800ad] transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1800ad]/20 focus:border-[#1800ad] transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nomor Telepon</label>
                                    <input
                                        type="text"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1800ad]/20 focus:border-[#1800ad] transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                                        <input
                                            type="date"
                                            name="birth_date"
                                            value={formData.birth_date}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1800ad]/20 focus:border-[#1800ad] transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                                        <div className="relative">
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className="appearance-none w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1800ad]/20 focus:border-[#1800ad] transition-colors bg-white pr-10"
                                            >
                                                <option value="">Pilih...</option>
                                                <option value="pria">Pria</option>
                                                <option value="wanita">Wanita</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={saving}
                                className="px-5 py-2 rounded bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                form="editProfileForm"
                                disabled={saving}
                                className={`px-5 py-2 rounded text-white font-bold shadow-md transition-colors ${saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#1800ad] hover:bg-[#11007a]'}`}
                            >
                                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
            </Modal>
        </div>
    );
}

export default Profile;
