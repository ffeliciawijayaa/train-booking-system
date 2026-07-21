import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePopup } from './PopupContext';

const ProtectedRoute = ({ children, allowedRole }) => {
    const { showPopup } = usePopup();

    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRole && userRole !== allowedRole) {
        showPopup("Anda tidak memiliki akses ke halaman ini!");
        return <Navigate to={userRole === 'user' ? '/search' : '/login'} replace />;
    }

    return children;
};

export default ProtectedRoute;