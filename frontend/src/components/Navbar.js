import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate(); // Untuk navigasi setelah logout

    // Fungsi untuk menghapus token dan keluar sistem
    const handleLogout = () => {
        if (window.confirm('Apakah Anda yakin ingin keluar dari Dashboard Admin?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            navigate('/login'); // Tendang ke halaman login
        }
    };

    const linkStyle = (path) => ({
        padding: '10px 15px',
        color: location.pathname === path ? '#ffffff' : '#a0aec0',
        backgroundColor: location.pathname === path ? '#2f55d4' : 'transparent',
        textDecoration: 'none',
        borderRadius: '6px',
        fontWeight: '600',
        fontSize: '14px',
        transition: '0.3s',
        display: 'block',
        marginBottom: '8px'
    });

    return (
        <div style={{ 
            width: '240px', 
            backgroundColor: '#1a202c', 
            minHeight: '100vh', 
            padding: '25px 15px', 
            boxSizing: 'border-box',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'between' // Membuat konten terbagi atas dan bawah
        }}>
            {/* Bagian Atas: Menu Navigasi */}
            <div style={{ flex: 1 }}>
                <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '30px', paddingLeft: '10px', letterSpacing: '1px' }}>
                    🚂 KAI ADMIN
                </h3>
                
                <nav>
                    <Link to="/admin/stations" style={linkStyle('/admin/stations')}>
                        📍 Kelola Stasiun
                    </Link>
                    <Link to="/admin/trains" style={linkStyle('/admin/trains')}>
                        🎚️ Kelola Kereta
                    </Link>
                    <Link to="/admin/schedules" style={linkStyle('/admin/schedules')}>
                        📅 Kelola Jadwal
                    </Link>
                </nav>
            </div>

            {/* Bagian Bawah: Tombol Logout Resmi */}
            <div style={{ borderTop: '1px solid #2d3748', paddingTop: '15px' }}>
                <button 
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        padding: '10px 15px',
                        backgroundColor: '#e53e3e', // Warna merah tegas
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: '0.3s'
                    }}
                >
                    🚪 Keluar / Logout
                </button>
            </div>
        </div>
    );
}

export default Navbar;