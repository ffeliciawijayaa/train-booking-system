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

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/register', {
                nik: formData.nik,
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone_number: formData.phone_number,
                gender: formData.gender
            });
            
            // Simpan token ke localStorage mirip seperti proses login
            localStorage.setItem('token', response.data.token);
            alert(response.data.message);
            navigate('/'); // Lempar ke homepage
        } catch (error) {
            alert(error.response?.data?.message || 'Registrasi gagal, periksa kembali data Anda.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Daftar Akun KAI</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                    <input type="text" placeholder="Nama Lengkap" className="w-full p-3 border rounded-xl" 
                        onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    
                    <input type="text" placeholder="NIK (16 Digit)" maxLength={16} className="w-full p-3 border rounded-xl" 
                        onChange={(e) => setFormData({...formData, nik: e.target.value})} required />
                    
                    <input type="email" placeholder="Email" className="w-full p-3 border rounded-xl" 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    
                    <input type="password" placeholder="Password" className="w-full p-3 border rounded-xl" 
                        onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                    
                    <input type="text" placeholder="No. Telepon" className="w-full p-3 border rounded-xl" 
                        onChange={(e) => setFormData({...formData, phone_number: e.target.value})} required />
                    
                    <select className="w-full p-3 border rounded-xl" 
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                        <option value="pria">Pria</option>
                        <option value="wanita">Wanita</option>
                    </select>

                    <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">
                        Daftar
                    </button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Sudah punya akun? <Link to="/login" className="text-blue-600 font-bold">Masuk di sini</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;