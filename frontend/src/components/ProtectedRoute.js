import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePopup } from './PopupContext';

const ProtectedRoute = ({ children, allowedRole, allowGuest = false }) => {
    const { showPopup } = usePopup();

    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    // Jika belum login (guest)
    if (!token) {
        if (allowGuest) {
            return children;
        }
        return <Navigate to="/login" replace />;
    }

    // Jika sudah login tetapi role tidak sesuai
    if (allowedRole && userRole !== allowedRole) {
        if (userRole === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        showPopup("Anda tidak memiliki akses ke halaman ini!");
        return <Navigate to={userRole === 'user' ? '/search' : '/login'} replace />;
    }

    return children;
};

export default ProtectedRoute;