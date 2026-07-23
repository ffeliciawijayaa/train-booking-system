import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { usePopup } from "./PopupContext";
import axios from "axios";
import {
  LayoutDashboard,
  MapPin,
  Train,
  Calendar,
  Ticket,
  ShieldCheck,
  CreditCard,
  Users,
  UserCog,
  LogOut,
  UserCircle,
} from "lucide-react";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showConfirm } = usePopup();
  const [isOpen, setIsOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const fetchAdminProfile = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axios.get("http://127.0.0.1:8000/api/user", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAdminName(res.data.name || "Admin");
        } catch (err) {
          console.error("Gagal memuat profil admin", err);
        }
      }
    };
    fetchAdminProfile();
  }, []);

  const handleExit = async () => {
    if (
      await showConfirm("Apakah Anda yakin ingin keluar dari Dashboard Admin?")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/search");
    }
  };

  const getLinkClass = (path) => {
    const baseClass =
      "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 mb-1.5";
    const activeClass = "bg-[#1800ad] text-white shadow-md shadow-[#1800ad]/20";
    const inactiveClass =
      "text-slate-500 hover:bg-[#1800ad]/10 hover:text-[#1800ad]";

    return `${baseClass} ${location.pathname === path ? activeClass : inactiveClass}`;
  };

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between z-50 text-slate-800">
        <div className="flex items-center">
          <img
            src="/images/logo-black.png"
            alt="SobatRel Logo"
            className="h-auto w-28 object-contain"
          />
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 rounded-lg focus:outline-none"
        >
          {isOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <div
        className={`w-64 bg-white h-screen p-5 fixed left-0 top-0 flex flex-col justify-between border-r border-slate-100 text-slate-800 select-none transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                md:translate-x-0 z-40 md:z-auto overflow-y-auto overflow-x-hidden scrollbar-hide`}
      >
        <div className="mt-14 md:mt-0 flex flex-col h-full">
          <div className="px-3 mb-8 mt-4">
            <img
              src="/images/logo-black.png"
              alt="SobatRel Logo"
              className="h-auto w-40 object-contain"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 pb-4">
            {/*group manajemen*/}
            <div className="mb-6">
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                Manajemen
              </p>
              <nav>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className={getLinkClass("/admin/dashboard")}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/admin/stations"
                  onClick={() => setIsOpen(false)}
                  className={getLinkClass("/admin/stations")}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Stasiun</span>
                </Link>
                <Link
                  to="/admin/trains"
                  onClick={() => setIsOpen(false)}
                  className={getLinkClass("/admin/trains")}
                >
                  <Train className="w-4 h-4" />
                  <span>Kereta</span>
                </Link>
                <Link
                  to="/admin/schedules"
                  onClick={() => setIsOpen(false)}
                  className={getLinkClass("/admin/schedules")}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Jadwal</span>
                </Link>
                <Link
                  to="/admin/bookings"
                  onClick={() => setIsOpen(false)}
                  className={getLinkClass("/admin/bookings")}
                >
                  <Ticket className="w-4 h-4" />
                  <span>Transaksi</span>
                </Link>
                <Link
                  to="/admin/protections"
                  onClick={() => setIsOpen(false)}
                  className={getLinkClass("/admin/protections")}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Proteksi</span>
                </Link>
                <Link
                  to="/admin/payment-methods"
                  onClick={() => setIsOpen(false)}
                  className={getLinkClass("/admin/payment-methods")}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pembayaran</span>
                </Link>
              </nav>
            </div>

            {/*group pengguna*/}
            <div className="mb-2">
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                Pengguna
              </p>
              <nav>
                <Link
                  to="/admin/users"
                  onClick={() => setIsOpen(false)}
                  className={getLinkClass("/admin/users")}
                >
                  <Users className="w-4 h-4" />
                  <span>Pelanggan</span>
                </Link>
                <Link
                  to="/admin/admins"
                  onClick={() => setIsOpen(false)}
                  className={getLinkClass("/admin/admins")}
                >
                  <UserCog className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              </nav>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 mt-auto flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <UserCircle className="w-9 h-9 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 line-clamp-1">
                  {adminName}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Administrator
                </span>
              </div>
            </div>

            <button
              onClick={handleExit}
              title="Keluar"
              className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
