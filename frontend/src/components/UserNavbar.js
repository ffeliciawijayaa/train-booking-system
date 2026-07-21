import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, User } from 'lucide-react';
import { usePopup } from './PopupContext';

const UserNavbar = ({ variant = 'white' }) => {
  const navigate = useNavigate();
  const { showConfirm } = usePopup();
  const [isScrolled, setIsScrolled] = useState(variant === 'white');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (variant === 'white') {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [variant]);

  const handleLogout = async () => {
    if (await showConfirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
  };

  const navClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md text-slate-800' : 'bg-transparent text-white'
    }`;

  return (
    <nav className={navClasses}>
      <div className="flex justify-between items-center px-6 md:px-12 py-6 relative">
        <img
          src={isScrolled ? "/images/logo-black.png" : "/images/logo-white.png"}
          alt="SobatRel Logo"
          className="h-auto w-28 md:w-32 object-contain cursor-pointer z-10"
          onClick={() => navigate('/')}
        />

        <div className="flex items-center gap-6 z-10">
          {localStorage.getItem("token") ? (
            <>

              <div className="hidden md:flex items-center gap-6 mr-2">
                <button
                  onClick={() => navigate("/search")}
                  className={`font-bold text-sm transition ${isScrolled ? 'text-slate-700 hover:text-[#1800ad]' : 'text-white hover:text-white/80'
                    }`}
                >
                  Cari Tiket
                </button>
                <button
                  onClick={() => navigate("/my-tickets")}
                  className={`font-bold text-sm transition ${isScrolled ? 'text-slate-700 hover:text-[#1800ad]' : 'text-white hover:text-white/80'
                    }`}
                >
                  Tiket Saya
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/cart")}
                  className={`p-2 transition rounded-full ${isScrolled ? 'text-slate-600 hover:bg-slate-100 hover:text-[#1800ad]' : 'text-white hover:bg-white/20'
                    }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`p-2 transition rounded-full ${isScrolled ? 'text-slate-600 hover:bg-slate-100 hover:text-[#1800ad]' : 'text-white hover:bg-white/20'
                      } ${isDropdownOpen ? (isScrolled ? 'bg-slate-100 text-[#1800ad]' : 'bg-white/20') : ''}`}
                  >
                    <User className="w-5 h-5" />
                  </button>


                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-white border border-slate-100 rounded-lg shadow-xl py-2 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2">
                      <button
                        onClick={() => { setIsDropdownOpen(false); navigate("/profile"); }}
                        className="w-full text-left px-5 py-2.5 text-sm font-bold hover:bg-slate-50 transition-colors"
                      >
                        Profil Saya
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate("/search")}
                className={`hidden sm:block font-bold text-sm transition ${isScrolled ? 'text-slate-700 hover:text-[#1800ad]' : 'text-white hover:text-white/80'
                  }`}
              >
                Cari Tiket
              </button>
              <button
                onClick={() => navigate("/login")}
                className={`px-6 py-2.5 rounded-full text-sm font-bold shadow transition ${isScrolled
                    ? 'bg-[#1800ad] text-white hover:bg-[#11007a]'
                    : 'bg-white text-[#1800ad] hover:bg-slate-100'
                  }`}
              >
                Masuk / Daftar
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;
