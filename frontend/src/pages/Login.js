import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login', {
                email: email,
                password: password
            });

            if (response.data.status === 'success') {
                // 1. Simpan Token dan Role ke LocalStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.user.role);

                alert(response.data.message);

                // 2. LOGIKA PENGARAHAN OTOMATIS BERDASARKAN ROLE
                if (response.data.user.role === 'admin') {
                    window.location.href = '/admin/schedules'; // Admin ke panel kendali
                } else {
                    window.location.href = '/search'; // User biasa ke halaman cari tiket
                }
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Terjadi kesalahan saat login.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f7fb', fontFamily: 'Arial' }}>
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '350px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#333' }}>🚄 KAI Login Sistem</h2>
                
                {error && <div style={{ color: 'red', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}
                
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Email:</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Password:</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2f55d4', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                        Masuk Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;