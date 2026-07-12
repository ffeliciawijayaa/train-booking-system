import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role'); // Pastikan saat login, kamu menyimpan role admin/user di localStorage

    // 1. Cek apakah sudah login (punya token)
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 2. Cek apakah rolenya sesuai (misal: halaman admin cuma boleh dibuka oleh role 'admin')
    if (allowedRole && userRole !== allowedRole) {
        alert("Anda tidak memiliki akses ke halaman ini!");
        return <Navigate to={userRole === 'user' ? '/dashboard' : '/login'} replace />;
    }

    // Jika aman, tampilkan halamannya
    return children;
};

export default ProtectedRoute;