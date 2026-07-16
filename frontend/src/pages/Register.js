import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        nik: '',
        email: '',
        password: '',
        phone_number: '',
        gender: 'pria'
    });
    const navigate = useNavigate();
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (formData.password !== confirmPassword) {
            alert('Konfirmasi kata sandi tidak cocok.');
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/register', {
                nik: formData.nik,
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone_number: formData.phone_number,
                gender: formData.gender
            });

            localStorage.setItem('token', response.data.token);
            alert(response.data.message);
            navigate('/');
        } catch (error) {
            alert(error.response?.data?.message || 'Registrasi gagal, periksa kembali data Anda.');
        }
    };

    return (
        <div className="flex min-h-screen font-sans">

            <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden">
                <img
                    src="/images/train2.jpg"
                    alt="Hero"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a1128] via-[#0a1128]/80 to-transparent"></div>
                <div className="relative z-10 p-12 flex flex-col w-full h-full text-white">
                    <Link to="/" className="text-white hover:text-blue-200 transition-colors w-fit">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div className="mt-24">
                        <h1 className="text-5xl font-bold leading-tight max-w-lg">Siap Memulai Perjalanan Anda?</h1>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white min-h-screen">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Buat Akun Baru</h2>
                        <p className="text-sm text-gray-500">Nikmati pengalaman booking kereta yang lebih cepat dan nyaman.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Nama Lengkap</label>
                            <input type="text" placeholder="Masukkan Nama Lengkap Anda" className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors text-sm"
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">NIK (16 Digit)</label>
                            <input type="text" placeholder="Masukkan NIK Anda" maxLength={16} className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors text-sm"
                                onChange={(e) => setFormData({ ...formData, nik: e.target.value })} required />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Email</label>
                            <input type="email" placeholder="Masukkan Email Anda" className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors text-sm"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Kata Sandi</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Minimal 8 karakter"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors text-sm pr-12"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3 text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Konfirmasi Kata Sandi</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Ulangi kata sandi"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors text-sm pr-12"
                                    onChange={(e) => setConfirmPassword(e.target.value)} required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-3 text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">No. Telepon</label>
                                <input type="text" placeholder="No Telepon" className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors text-sm"
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Jenis Kelamin</label>
                                <div className="relative">
                                    <select className="appearance-none w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors text-sm bg-white pr-10"
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                                        <option value="pria">Pria</option>
                                        <option value="wanita">Wanita</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="w-full py-3 bg-blue-700 text-white font-bold rounded-md hover:bg-blue-800 transition-colors text-sm mt-6 shadow-lg shadow-blue-700/30">
                            Buat Akun
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Sudah punya akun? <Link to="/login" className="text-gray-900 font-bold hover:underline">Masuk</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;