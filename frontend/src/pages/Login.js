import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Tambahin Link

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State baru buat toggle
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login', {
                email: email,
                password: password
            });

            if (response.data.status === 'success') {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.user.role);
                alert(response.data.message);
                if (response.data.user.role === 'admin') {
                    window.location.href = '/admin/schedules';
                } else {
                    window.location.href = '/search';
                }
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Terjadi kesalahan saat login.');
        }

    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">KAI Login</h2>
                    <p className="text-sm text-slate-500">Sistem Manajemen Perjalanan</p>
                </div>

                {error && <div className="text-red-700 bg-red-50 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} // Logic toggle
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                            {/* Tombol Toggle Eye */}
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5 text-xs font-bold text-blue-600"
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>
                    <div className="text-right">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Lupa Password?
                        </Link>
                    </div>
                    
                    <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
                        Masuk
                    </button>
                </form>

                {/* Tambahan Link Register */}
                <div className="mt-6 text-center text-sm text-slate-600">
                    Belum punya akun? {' '}
                    <Link to="/register" className="text-blue-600 font-bold hover:underline">
                        Daftar sekarang
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;