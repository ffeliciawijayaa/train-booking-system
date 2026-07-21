import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Stations from './pages/Stations';
import Trains from './pages/Trains';
import Login from './pages/Login'; 
import Register from './pages/Register'; 
import ProtectedRoute from './components/ProtectedRoute'; 
import Schedules from './pages/Schedules';
import UserDashboard from './pages/UserDashboard';
import PassengerSeatSelection from './pages/PassengerSeatSelection';
import Payment from './pages/Payment';
import MyTickets from './pages/MyTickets';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import AdminProtections from './pages/AdminProtections';
import AdminPaymentMethods from './pages/AdminPaymentMethods';
import AdminBookings from './pages/AdminBookings';
import AdminAccounts from "./pages/AdminAccounts";
import ForgotPassword from "./pages/ForgotPassword";
import AdminUsers from "./pages/AdminUsers";
import AdminDashboard from "./pages/AdminDashboard";

function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex-1 md:ml-60 pt-16 md:pt-0 box-border w-full">
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
        <Route path="/" element={<Navigate to="/search" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Rute pencarian jadwal sekarang menjadi publik */}
        <Route path="/search" element={<UserDashboard />} />


        {/* ==================== 2. RUTE KHUSUS USER / PENUMPANG ==================== */}

        <Route path="/booking/:scheduleId" element={<PassengerSeatSelection />} />
        
        <Route path="/payment/:bookingId" element={
          <ProtectedRoute allowedRole="user">
            <Payment />
          </ProtectedRoute>
        } />

        <Route path="/my-tickets" element={
          <ProtectedRoute allowedRole="user">
            <MyTickets />
          </ProtectedRoute>
        } />

        <Route path="/cart" element={
          <ProtectedRoute allowedRole="user">
            <Cart />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute allowedRole="user">
            <Profile />
          </ProtectedRoute>
        } />

        {/* ==================== 3. RUTE KHUSUS ADMIN ==================== */}
        {/* Ditambahkan allowedRole="admin" agar user biasa tidak bisa nembak ke sini */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout><AdminDashboard /></AdminLayout>
          </ProtectedRoute>
        } />
        
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

        <Route path="/admin/protections" element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout><AdminProtections /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/bookings" element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout><AdminBookings /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/payment-methods" element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout><AdminPaymentMethods /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/admins" element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout><AdminAccounts /></AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/admin/users" element={
              <ProtectedRoute allowedRole="admin">
                  <AdminLayout><AdminUsers /></AdminLayout>
              </ProtectedRoute>
          }
        />

        {/* Jika rute tidak ditemukan, tendang ke login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;