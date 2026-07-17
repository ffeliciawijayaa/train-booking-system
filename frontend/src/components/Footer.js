import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-slate-200 bg-white pt-16 pb-8 mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 md:px-28 lg:px-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-16">
          <div className="md:col-span-5 lg:col-span-4">
            <div className="font-black text-slate-900 text-2xl mb-4">
              Sobat <span className="text-blue-600">Rel</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              Platform pemesanan tiket kereta api terpercaya yang memberikan
              kemudahan dan kenyamanan untuk setiap perjalanan Anda di seluruh
              nusantara.
            </p>
          </div>

          <div className="md:col-span-3 lg:col-span-4 lg:flex lg:justify-center">
            <div>
              <h4 className="font-bold text-slate-800 text-base mb-6">
                Keanggotaan
              </h4>
              <ul className="space-y-4">
                <li>
                  <button
                    onClick={() => navigate("/login")}
                    className="text-slate-500 hover:text-blue-600 text-sm transition-colors"
                  >
                    Masuk
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/register")}
                    className="text-slate-500 hover:text-blue-600 text-sm transition-colors"
                  >
                    Daftar Akun
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="md:col-span-4 lg:col-span-4 lg:flex lg:justify-end">
            <div>
              <h4 className="font-bold text-slate-800 text-base mb-6">
                Kontak
              </h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="mailto:info@sobatrel.id"
                    className="flex items-center text-slate-500 hover:text-blue-600 text-sm transition-colors group"
                  >
                    <Mail className="w-4 h-4 mr-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    info@sobatrel.id
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-slate-500 hover:text-blue-600 text-sm transition-colors group"
                  >
                    <svg
                      className="w-4 h-4 mr-3 text-slate-400 group-hover:text-blue-600 transition-colors"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="2"
                        y="2"
                        width="20"
                        height="20"
                        rx="5"
                        ry="5"
                      ></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    @sobatrel.id
                  </a>
                </li>
                <li>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-slate-500 hover:text-blue-600 text-sm transition-colors group"
                  >
                    <svg
                      className="w-4 h-4 mr-3 text-slate-400 group-hover:text-blue-600 transition-colors"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                    Sobat Rel
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-slate-400 text-xs text-center md:text-left w-full">
            &copy; 2026 Sobat Rel. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
