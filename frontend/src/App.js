import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Stations from './pages/Stations';
import Trains from './pages/Trains';
import Login from './pages/Login'; 
import ProtectedRoute from './components/ProtectedRoute'; 
import Schedules from './pages/Schedules';
import UserDashboard from './pages/UserDashboard';

function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex' }}>
      <Navbar />
      <div style={{ flex: 1, marginLeft: '240px', boxSizing: 'border-box' }}>
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* ==================== 1. RUTE PUBLIK UMUM ==================== */}
        <Route path="/login" element={<Login />} />


        {/* ==================== 2. RUTE KHUSUS USER / PENUMPANG ==================== */}
        {/* Sekarang rute search diproteksi khusus untuk role 'user' */}
        <Route path="/search" element={
          <ProtectedRoute allowedRole="user">
            <UserDashboard />
          </ProtectedRoute>
        } />


        {/* ==================== 3. RUTE KHUSUS ADMIN ==================== */}
        {/* Ditambahkan allowedRole="admin" agar user biasa tidak bisa nembak ke sini */}
        <Route path="/admin/stations" element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout><Stations /></AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/trains" element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout><Trains /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/schedules" element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout><Schedules /></AdminLayout>
          </ProtectedRoute>
        } />

        {/* Jika rute tidak ditemukan, tendang ke login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;