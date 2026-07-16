import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function UserDashboard() {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [originId, setOriginId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [journeyDate, setJourneyDate] = useState("");

  const [tickets, setTickets] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(1);

  // Load daftar stasiun untuk dropdown pencarian:
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/user/stations")
      .then((res) => setStations(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  // FUNGSI LOGOUT
  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (originId === destinationId) {
      alert("Stasiun asal dan tujuan tidak boleh sama!");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://127.0.0.1:8000/api/user/search-tickets",
        {
          origin_id: originId,
          destination_id: destinationId,
          journey_date: journeyDate,
        },
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              }
            : {
                Accept: "application/json",
              },
        },
      );
      setTickets(response.data.data);
    } catch (error) {
      console.error("Gagal mencari tiket", error);
    }
    setLoading(false);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-screen pb-0">
      {/* HERO SECTION */}
      <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
        <img
          src="/images/train-hero.jpg"
          alt="Train Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1128] via-[#0a1128]/80 to-transparent"></div>

        {/* Navbar Overlay */}
        <div className="relative z-10 flex justify-between items-center px-6 md:px-12 py-6">
          <h1 className="text-2xl font-black text-white tracking-wide">
            Sobat <span className="text-blue-400">Rel</span>
          </h1>
          <div className="flex gap-4 items-center">
            {localStorage.getItem("token") ? (
              <>
                <button
                  onClick={() => navigate("/my-tickets")}
                  className="hidden sm:block text-white hover:text-blue-200 font-medium text-sm transition"
                >
                  Riwayat Tiket
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className="hidden sm:block text-white hover:text-blue-200 font-medium text-sm transition"
                >
                  Profil
                </button>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded text-sm font-bold backdrop-blur-md transition"
                >
                  Keluar
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2.5 bg-white text-blue-900 hover:bg-slate-100 rounded text-sm font-bold shadow transition"
              >
                Masuk / Daftar
              </button>
            )}
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 flex flex-col items-start justify-start pt-24 md:justify-center md:pt-0 h-full text-left px-6 md:px-28 lg:px-32 max-w-6xl md:-mt-40">
          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-2 md:mb-5 drop-shadow-lg">
            Jelajahi Nusantara <br className="hidden md:block" /> Dengan
            Kenyamanan
          </h2>
          <p className="text-sm sm:text-base md:text-xl text-slate-200 drop-shadow-md font-medium">
            Temukan dan pesan tiket kereta api Anda secara instan.
          </p>
        </div>

        {/* FLOATING SEARCH WIDGET (NOW INSIDE HERO) */}
        <div className="absolute bottom-4 md:bottom-32 left-0 right-0 z-20 w-full px-6 md:px-28 lg:px-32">
          <div className="bg-white rounded shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-4 md:p-6 border border-slate-100">
            <form
              onSubmit={handleSearch}
              className="flex flex-col md:flex-row gap-3 items-center"
            >
              <div className="w-full relative bg-slate-50 rounded hover:bg-slate-100 transition-colors">
                <label className="absolute top-3 left-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Keberangkatan
                </label>
                <select
                  value={originId}
                  onChange={(e) => setOriginId(e.target.value)}
                  required
                  className="w-full pl-4 pr-10 pt-7 pb-3 bg-transparent text-sm font-bold text-slate-800 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    Pilih Stasiun Asal
                  </option>
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.city} - {s.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-xs">▼</span>
                </div>
              </div>

              <div className="hidden md:flex items-center justify-center text-slate-300 mx-2">
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
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  ></path>
                </svg>
              </div>

              <div className="w-full relative bg-slate-50 rounded hover:bg-slate-100 transition-colors">
                <label className="absolute top-3 left-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Tujuan
                </label>
                <select
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  required
                  className="w-full pl-4 pr-10 pt-7 pb-3 bg-transparent text-sm font-bold text-slate-800 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    Pilih Stasiun Tujuan
                  </option>
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.city} - {s.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-xs">▼</span>
                </div>
              </div>

              <div className="w-full relative bg-slate-50 rounded hover:bg-slate-100 transition-colors">
                <label className="absolute top-3 left-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  min={today}
                  required
                  className="w-full px-4 pt-7 pb-3 bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
                />
              </div>

              <div className="w-full md:w-auto mt-2 md:mt-0">
                <button
                  type="submit"
                  className="w-full md:w-auto px-10 py-5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded shadow-lg shadow-blue-700/30 transition-all active:scale-[0.98] tracking-wide flex items-center justify-center h-full whitespace-nowrap"
                >
                  Cari Kereta
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* CLOSE HERO SECTION */}
      </div>

      {/* RESULTS SECTION */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-16 pb-20">
        {hasSearched && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Jadwal Keberangkatan
                </h3>
                <p className="text-slate-500 mt-1">
                  Ditemukan {tickets.length} kereta yang melayani rute Anda.
                </p>
              </div>
            </div>

            {loading && (
              <div className="p-12 text-center bg-white rounded border border-slate-100 shadow-sm">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded animate-spin mx-auto mb-4"></div>
                <div className="text-slate-500 font-medium">
                  Mencari tiket terbaik...
                </div>
              </div>
            )}

            {!loading && tickets.length === 0 && (
              <div className="p-16 text-center bg-white border border-slate-100 rounded shadow-sm">
                <span className="text-5xl block mb-4">📭</span>
                <h4 className="text-xl font-bold text-slate-800 mb-2">
                  Tiket Tidak Ditemukan
                </h4>
                <p className="text-slate-500">
                  Coba ganti stasiun keberangkatan, tujuan, atau tanggal
                  perjalanan Anda.
                </p>
              </div>
            )}

            {!loading && tickets.length > 0 && (
              <div className="space-y-5">
                {tickets.map((ticket, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 sm:p-8 rounded shadow-sm hover:shadow-lg hover:-translate-y-1 border border-slate-100 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                  >
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-3 mb-4">
                        <h4 className="text-xl font-bold text-slate-900">
                          {ticket.train_name}
                        </h4>
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded text-[10px] font-bold uppercase tracking-widest">
                          {ticket.class}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 sm:gap-8">
                        <div className="min-w-[80px]">
                          <div className="text-3xl font-black text-slate-800 tracking-tight">
                            {ticket.departure_time}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                            Berangkat
                          </div>
                        </div>

                        <div className="flex-1 flex items-center gap-3">
                          <div className="w-2 h-2 rounded bg-slate-300"></div>
                          <div className="flex-1 border-t-2 border-dashed border-slate-200 relative"></div>
                          <div className="w-2 h-2 rounded bg-slate-300"></div>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <div className="text-3xl font-black text-slate-800 tracking-tight">
                            {ticket.arrival_time}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                            Tiba
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="md:border-l border-slate-100 md:pl-8 w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end gap-4 pt-6 md:pt-0 border-t md:border-t-0">
                      <div className="text-left md:text-right">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Harga / Pax
                        </div>
                        <div className="text-2xl font-black text-blue-600 mt-1">
                          Rp{ticket.price.toLocaleString("id-ID")}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (!localStorage.getItem("token")) {
                            alert(
                              "Silakan masuk/login terlebih dahulu untuk memesan tiket.",
                            );
                            navigate("/login");
                            return;
                          }
                          navigate(
                            `/booking/${ticket.schedule_id || ticket.id}?board_order=${ticket.board_order}&alight_order=${ticket.alight_order}&qty=${qty}`,
                          );
                        }}
                        className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-sm font-bold shadow-lg transition-transform active:scale-95 whitespace-nowrap"
                      >
                        Pilih Tiket
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUPPORTING SECTIONS (SHOWN WHEN NO SEARCH) */}
        {!hasSearched && (
          <div className="mt-12">
            <div className="text-center mb-12">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                Kenapa Sobat Rel?
              </h3>
              <p className="text-slate-500 mt-3">
                Nikmati pengalaman pemesanan tiket kereta api terbaik dengan
                fitur unggulan kami.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded flex items-center justify-center text-2xl mb-6">
                  ⚡
                </div>
                <h4 className="font-bold text-lg text-slate-900 mb-2">
                  Booking Instan
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Lewati antrean panjang. Cari, pilih, dan pesan tiket Anda
                  dalam hitungan detik dari mana saja.
                </p>
              </div>
              <div className="bg-white p-8 rounded shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center text-2xl mb-6">
                  🛡️
                </div>
                <h4 className="font-bold text-lg text-slate-900 mb-2">
                  Pembayaran Fleksibel
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Transaksi aman dengan QRIS, Virtual Account, dan berbagai
                  metode pembayaran terpercaya lainnya.
                </p>
              </div>
              <div className="bg-white p-8 rounded shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded flex items-center justify-center text-2xl mb-6">
                  ✨
                </div>
                <h4 className="font-bold text-lg text-slate-900 mb-2">
                  Perjalanan Nyaman
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Nikmati fasilitas kelas dunia dengan asuransi perlindungan
                  ekstra untuk perjalanan terbaik Anda.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SIMPLE FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-12 text-center text-slate-500 text-sm mt-auto">
        <div className="font-black text-slate-900 text-xl mb-3">
          Sobat <span className="text-blue-600">Rel</span>
        </div>
        <p>&copy; 2026 Train Booking System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default UserDashboard;
