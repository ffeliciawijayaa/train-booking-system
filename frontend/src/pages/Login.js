import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login", {
        email: email,
        password: password,
      });

      if (response.data.status === "success") {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.user.role);
        
        if (response.data.user.role === "admin") {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/search";
        }
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Terjadi kesalahan saat login.",
      );
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden">
        <img
          src="/images/train1.jpg"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1128] via-[#0a1128]/80 to-transparent"></div>
        <div className="relative z-10 p-12 flex flex-col w-full h-full text-white">
          <Link
            to="/"
            className="text-white hover:text-white/80 transition-colors w-fit"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <div className="mt-24">
            <h1 className="text-5xl font-bold leading-tight max-w-lg">
              Selamat Datang Kembali.
            </h1>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white min-h-screen">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Masuk</h2>
            <p className="text-sm text-gray-500">Silakan masuk ke akun Anda.</p>
          </div>

          {error && (
            <div className="text-red-700 bg-red-50 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan Email Anda"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-1 focus:ring-[#1800ad] focus:border-[#1800ad] outline-none transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-1 focus:ring-[#1800ad] focus:border-[#1800ad] outline-none transition-colors text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-gray-400 hover:text-[#1800ad] transition-colors"
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-right mt-2">
                <Link
                  to="/forgot-password"
                  className="text-xs text-gray-500 hover:text-[#1800ad] transition-colors"
                >
                  Lupa Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1800ad] hover:bg-[#11007a] text-white font-bold rounded-md transition-colors text-sm mt-2 shadow-lg shadow-[#1800ad]/30"
            >
              Masuk
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="text-gray-900 font-bold hover:underline"
            >
              Daftar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
