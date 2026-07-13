import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    // State buat ngontrol buka-tutup sidebar di layar kecil
    const [isOpen, setIsOpen] = useState(false);

    const handleExit = () => {
        if (window.confirm('Apakah Anda yakin ingin keluar dari Dashboard Admin?')) {
            // Karena tanpa login/token, langsung redirect saja ke halaman utama/awal
            navigate('/');
        }
    };

    const getLinkClass = (path) => {
        const baseClass = "block px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 mb-2";
        const activeClass = "bg-blue-600 text-white shadow-md shadow-blue-900/20";
        const inactiveClass = "text-slate-400 hover:bg-slate-800 hover:text-white";
        
        return `${baseClass} ${location.pathname === path ? activeClass : inactiveClass}`;
    };

    return (
        <>
            {/* Tombol Garis Tiga (Hanya muncul di layar kecil md ke bawah) */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between z-50 text-white">
                <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-blue-500 uppercase tracking-wider">KAI Admin</h3>
                </div>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg focus:outline-none"
                >
                    {isOpen ? (
                        // Icon silang (X) pas kebuka
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    ) : (
                        // Icon garis 3 (Hamburger) pas ketutup
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    )}
                </button>
            </div>

            {/* Overlay background hitam transparan pas menu kebuka di layar kecil */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* Sidebar Utama */}
            <div className={`w-60 bg-slate-900 h-screen p-6 fixed left-0 top-0 flex flex-col justify-between border-r border-slate-800 text-white select-none transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 z-40 md:z-auto`}
            >
                {/* Bagian Atas: Menu Navigasi */}
                <div className="mt-14 md:mt-0"> {/* Kasih jarak atas di mobile biar ga ketutupan header */}
                    <div className="px-2 mb-8">
                        <h3 className="text-lg font-bold tracking-wider text-blue-500 uppercase">
                            KAI Admin
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Management System</p>
                    </div>
                    
                    <nav>
                        <Link to="/admin/stations" onClick={() => setIsOpen(false)} className={getLinkClass('/admin/stations')}>
                            Kelola Stasiun
                        </Link>
                        <Link to="/admin/trains" onClick={() => setIsOpen(false)} className={getLinkClass('/admin/trains')}>
                            Kelola Kereta
                        </Link>
                        <Link to="/admin/schedules" onClick={() => setIsOpen(false)} className={getLinkClass('/admin/schedules')}>
                            Kelola Jadwal
                        </Link>
                        <Link to="/admin/bookings" onClick={() => setIsOpen(false)} className={getLinkClass('/admin/bookings')}>
                            Kelola Transaksi
                        </Link>
                        <Link to="/admin/protections" onClick={() => setIsOpen(false)} className={getLinkClass('/admin/protections')}>
                            Kelola Proteksi
                        </Link>
                        <Link to="/admin/payment-methods" onClick={() => setIsOpen(false)} className={getLinkClass('/admin/payment-methods')}>
                            Kelola Pembayaran
                        </Link>
                    </nav>
                </div>

                {/* Bagian Bawah: Tombol Keluar */}
                <div className="pt-4 border-t border-slate-800">
                    <button 
                        onClick={handleExit}
                        className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition-colors duration-200 text-left shadow-sm"
                    >
                        Keluar
                    </button>
                </div>
            </div>
        </>
    );
}

export default Navbar;