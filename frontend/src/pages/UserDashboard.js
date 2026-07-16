import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CalendarCheck, TrainFront, Banknote, PlusCircle, MinusCircle, Mail, ArrowRight, Search } from "lucide-react";

const StationSearchDropdown = ({ label, value, onChange, stations, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredStations = stations.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.city.toLowerCase().includes(search.toLowerCase()) ||
        s.station_code.toLowerCase().includes(search.toLowerCase())
    );

    const selectedStation = stations.find(s => s.id == value);

    return (
        <div className="w-full relative bg-slate-50 rounded hover:bg-slate-100 transition-colors" ref={dropdownRef}>
            <label className="absolute top-3 left-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10 pointer-events-none">
                {label}
            </label>
            <div
                className="w-full pl-4 pr-10 pt-7 pb-3 bg-transparent text-sm font-bold text-slate-800 cursor-pointer text-left h-full flex items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedStation ? `${selectedStation.name} (${selectedStation.station_code})` : placeholder}
            </div>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <span className="text-slate-400 text-xs">▼</span>
            </div>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden min-w-[300px]">
                    <div className="p-4 border-b border-slate-100">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Masukkan kota atau nama stasiun"
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="max-h-32 overflow-y-auto p-2 custom-scrollbar">
                        {filteredStations.length > 0 ? filteredStations.map(s => (
                            <div
                                key={s.id}
                                className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                                onClick={() => {
                                    onChange(s.id);
                                    setIsOpen(false);
                                    setSearch("");
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <TrainFront className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm">{s.name}</div>
                                        <div className="text-slate-500 text-xs">{s.city}</div>
                                    </div>
                                </div>
                                <div className="bg-slate-100 px-2 py-1 rounded text-xs font-semibold text-slate-600">
                                    {s.station_code}
                                </div>
                            </div>
                        )) : (
                            <div className="p-4 text-center text-slate-500 text-sm">Stasiun tidak ditemukan</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

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

    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        { question: "Bagaimana cara memesan tiket di Sobat Rel?", answer: "Pilih jadwal perjalanan, isi data penumpang, lakukan pembayaran, dan tiket siap digunakan." },
        { question: "Apakah ada biaya tambahan untuk pemesanan?", answer: "Tidak ada. Harga yang tertera sudah termasuk pajak dan biaya layanan, sehingga Anda tidak perlu membayar biaya tambahan." },
        { question: "Apakah saya perlu membuat akun untuk memesan tiket?", answer: "Ya, akun diperlukan supaya Anda dapat mengelola pemesanan dan melihat riwayat perjalanan." },

        { question: "Bagaimana jika saya terlambat?", answer: "Tiket akan hangus jika Anda tertinggal kereta. Pastikan Anda tiba di stasiun setidaknya 30 menit sebelum jadwal keberangkatan." },
        { question: "Metode pembayaran apa saja yang tersedia?", answer: "Kami menerima pembayaran melalui transfer bank, QRIS, kartu kredit, dan berbagai e-wallet terkemuka." },
        { question: "Bagaimana cara melihat tiket yang sudah dipesan?", answer: "Tiket yang berhasil dibeli dapat dilihat melalui halaman tiket saya." },
    ];

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

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
            setTimeout(() => {
                document.getElementById("scroll-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        } catch (error) {
            console.error("Gagal mencari tiket", error);
        }
        setLoading(false);
    };

    const calculateDuration = (start, end) => {
        if (!start || !end) return "";
        const [startH, startM] = start.split(":").map(Number);
        const [endH, endM] = end.split(":").map(Number);
        
        let startTotalMins = startH * 60 + startM;
        let endTotalMins = endH * 60 + endM;
        
        if (endTotalMins < startTotalMins) {
            endTotalMins += 24 * 60; // Crosses midnight
        }
        
        const diffMins = endTotalMins - startTotalMins;
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        
        if (hours > 0 && mins > 0) return `${hours}j ${mins}m`;
        if (hours > 0) return `${hours}j`;
        return `${mins}m`;
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return "";
        return timeStr.split(":").slice(0, 2).join(":");
    };

    const today = new Date().toISOString().split("T")[0];

    const originStation = stations.find(s => s.id == originId);
    const destinationStation = stations.find(s => s.id == destinationId);
    const formattedJourneyDate = journeyDate ? new Date(journeyDate).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' }) : "";

    return (
        <div className="font-sans text-slate-800 bg-slate-50 min-h-screen pb-0">
            {/* HERO SECTION */}
            <div className="relative w-full h-screen bg-slate-900">
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


                <div id="search-form" className="absolute bottom-4 md:bottom-32 left-0 right-0 z-20 w-full px-6 md:px-28 lg:px-32">
                    <div className="bg-white rounded shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-4 md:p-6 border border-slate-100">
                        <form
                            onSubmit={handleSearch}
                            className="flex flex-col md:flex-row gap-3 items-center"
                        >
                            <StationSearchDropdown
                                label="Keberangkatan"
                                value={originId}
                                onChange={setOriginId}
                                stations={stations}
                                placeholder="Pilih Stasiun Asal"
                            />

                            <div className="hidden md:flex items-center justify-center text-slate-300 mx-2">
                                <ArrowRight className="w-5 h-5 text-slate-300" strokeWidth={2.5} />
                            </div>

                            <StationSearchDropdown
                                label="Tujuan"
                                value={destinationId}
                                onChange={setDestinationId}
                                stations={stations}
                                placeholder="Pilih Stasiun Tujuan"
                            />

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
                                    className="w-full px-4 pt-7 pb-3 bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer relative z-10"
                                />
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none z-0">
                                    <CalendarCheck className="w-4 h-4 text-slate-400" />
                                </div>
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


            </div >

            <div id="scroll-anchor"></div>

            <div className="w-full px-6 md:px-28 lg:px-32 mt-16 pb-20">
                {hasSearched && (
                    <div id="search-results" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Search Summary Bar */}
                        {originStation && destinationStation && (
                            <div className="flex items-center gap-4 mb-10 bg-white py-3 px-6 rounded-md shadow-sm border border-slate-100 w-max">
                                <div className="text-lg font-bold text-[#0a1128]">
                                    {originStation.city} {originStation.name} ({originStation.station_code})
                                </div>
                                <div className="bg-slate-50 p-2 rounded-md border border-slate-200 flex items-center justify-center">
                                    <ArrowRight className="w-4 h-4 text-slate-500" strokeWidth={2.5} />
                                </div>
                                <div className="text-lg font-bold text-[#0a1128]">
                                    {destinationStation.city} {destinationStation.name} ({destinationStation.station_code})
                                </div>
                                <div className="w-px h-6 bg-slate-300 mx-2"></div>
                                <div className="text-lg font-bold text-[#0a1128]">
                                    {formattedJourneyDate}
                                </div>
                            </div>
                        )}

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
                            <div className="p-16 text-center bg-white border border-slate-100 rounded shadow-sm flex flex-col items-center">
                                <div className="bg-slate-50 p-6 rounded-full mb-6">
                                    <TrainFront className="w-12 h-12 text-slate-300" strokeWidth={1.5} />
                                </div>
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

                                            <div className="flex items-center gap-4 sm:gap-8 mt-4 w-full md:w-auto">
                                                <div className="min-w-[100px]">
                                                    <div className="text-3xl font-black text-slate-800 tracking-tight">
                                                        {formatTime(ticket.departure_time)}
                                                    </div>
                                                    <div className="text-sm font-medium text-slate-500 mt-1">
                                                        {originStation?.name} ({originStation?.station_code})
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-[100px] flex items-center gap-2">
                                                    <div className="w-3.5 h-3.5 rounded-full border-[3px] border-slate-300 bg-white"></div>
                                                    <div className="flex-1 border-t-2 border-solid border-slate-300 relative flex justify-center">
                                                        <span className="absolute -top-3 bg-white px-2 text-xs font-bold text-slate-400 tracking-wide">
                                                            {calculateDuration(ticket.departure_time, ticket.arrival_time)}
                                                        </span>
                                                    </div>
                                                    <div className="w-3.5 h-3.5 rounded-full bg-slate-300"></div>
                                                </div>

                                                <div className="text-right min-w-[100px]">
                                                    <div className="text-3xl font-black text-slate-800 tracking-tight">
                                                        {formatTime(ticket.arrival_time)}
                                                    </div>
                                                    <div className="text-sm font-medium text-slate-500 mt-1">
                                                        {destinationStation?.name} ({destinationStation?.station_code})
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


                {!hasSearched && (
                    <div className="mt-20 md:mt-24 relative">
                        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-slate-100 rounded-full blur-3xl opacity-60 -z-10 translate-x-1/4 -translate-y-1/4"></div>

                        <div className="max-w-4xl mb-16 text-left relative z-10">
                            <h3 className="text-4xl md:text-5xl font-medium text-slate-900 mb-6 tracking-tight">
                                Mengapa <span className="font-black">Sobat <span className="text-blue-600">Rel</span></span>?
                            </h3>
                            <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                                Nikmati pengalaman perjalanan kereta yang lebih mudah, cepat, dan nyaman dengan layanan kami.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 relative z-10 md:divide-x md:divide-slate-200">

                            <div className="pb-12 md:pb-0 md:pr-12 border-b border-slate-200 md:border-b-0">
                                <div className="relative w-16 h-16 mb-8">
                                    <div className="absolute top-1 left-1 w-16 h-16 bg-blue-50 rounded-full"></div>
                                    <div className="absolute top-0 left-0 w-16 h-16 bg-white rounded-full border-2 border-blue-900 flex items-center justify-center z-10">
                                        <CalendarCheck className="w-7 h-7 text-blue-900 stroke-[1.5]" />
                                    </div>
                                </div>
                                <div className="text-slate-400 text-xs font-bold mb-3 tracking-widest uppercase">01</div>
                                <h4 className="font-bold text-lg text-slate-900 mb-3">
                                    Booking Instan
                                </h4>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Lewati antrean panjang. Cari, pilih, dan pesan tiket Anda
                                    dalam hitungan detik dari mana saja.
                                </p>
                            </div>


                            <div className="py-12 md:py-0 md:px-12 border-b border-slate-200 md:border-b-0">
                                <div className="relative w-16 h-16 mb-8">
                                    <div className="absolute top-1 left-1 w-16 h-16 bg-blue-50 rounded-full"></div>
                                    <div className="absolute top-0 left-0 w-16 h-16 bg-white rounded-full border-2 border-blue-900 flex items-center justify-center z-10">
                                        <Banknote className="w-7 h-7 text-blue-900 stroke-[1.5]" />
                                    </div>
                                </div>
                                <div className="text-slate-400 text-xs font-bold mb-3 tracking-widest uppercase">02</div>
                                <h4 className="font-bold text-lg text-slate-900 mb-3">
                                    Pembayaran Fleksibel
                                </h4>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Transaksi aman dengan QRIS, Virtual Account, dan berbagai
                                    metode pembayaran terpercaya lainnya.
                                </p>
                            </div>


                            <div className="pt-12 md:pt-0 md:pl-12">
                                <div className="relative w-16 h-16 mb-8">
                                    <div className="absolute top-1 left-1 w-16 h-16 bg-blue-50 rounded-full"></div>
                                    <div className="absolute top-0 left-0 w-16 h-16 bg-white rounded-full border-2 border-blue-900 flex items-center justify-center z-10">
                                        <TrainFront className="w-7 h-7 text-blue-900 stroke-[1.5]" />
                                    </div>
                                </div>
                                <div className="text-slate-400 text-xs font-bold mb-3 tracking-widest uppercase">03</div>
                                <h4 className="font-bold text-lg text-slate-900 mb-3">
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

            {/* FAQ SECTION */}
            {!hasSearched && (
                <div className="w-full bg-slate-50 pb-20 px-6 md:px-28 lg:px-32">
                    <div className="max-w-[1400px] mx-auto pt-16 md:pt-20 border-t border-slate-200 flex flex-col lg:flex-row gap-12 lg:gap-20">

                        <div className="lg:w-1/3 text-left">
                            <h3 className="text-4xl md:text-5xl font-medium text-slate-900 mb-6 tracking-tight">FAQs</h3>
                            <p className="text-slate-600 text-base leading-relaxed">
                                Semua yang perlu Anda ketahui tentang pemesanan dan layanan kami. Tidak dapat menemukan jawaban yang Anda cari? Silakan hubungi tim kami.
                            </p>
                        </div>

                        {/* FAQs Grid */}
                        <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 items-start">
                            {/* Column 1 */}
                            <div className="space-y-2">
                                {faqs.slice(0, 3).map((faq, index) => (
                                    <div key={index} className="border-b border-slate-200/80 pb-4 mb-4">
                                        <button
                                            onClick={() => toggleFaq(index)}
                                            className="w-full flex justify-between items-center text-left py-2 gap-4 outline-none group"
                                        >
                                            <span className="font-bold text-slate-800 text-[15px] group-hover:text-blue-600 transition-colors">{faq.question}</span>
                                            {openFaq === index ? (
                                                <MinusCircle className="w-5 h-5 text-slate-400 shrink-0" />
                                            ) : (
                                                <PlusCircle className="w-5 h-5 text-slate-400 shrink-0" />
                                            )}
                                        </button>
                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
                                            <div className="text-slate-600 text-sm leading-relaxed pr-8 pb-2">
                                                {faq.answer}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Column 2 */}
                            <div className="space-y-2">
                                {faqs.slice(3, 6).map((faq, index) => (
                                    <div key={index + 3} className="border-b border-slate-200/80 pb-4 mb-4">
                                        <button
                                            onClick={() => toggleFaq(index + 3)}
                                            className="w-full flex justify-between items-center text-left py-2 gap-4 outline-none group"
                                        >
                                            <span className="font-bold text-slate-800 text-[15px] group-hover:text-blue-600 transition-colors">{faq.question}</span>
                                            {openFaq === index + 3 ? (
                                                <MinusCircle className="w-5 h-5 text-slate-400 shrink-0" />
                                            ) : (
                                                <PlusCircle className="w-5 h-5 text-slate-400 shrink-0" />
                                            )}
                                        </button>
                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index + 3 ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
                                            <div className="text-slate-600 text-sm leading-relaxed pr-8 pb-2">
                                                {faq.answer}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {!hasSearched && (
                <div className="relative w-full py-12 md:py-20 overflow-hidden">
                    <img
                        src="/images/train2.jpg"
                        alt="Join Sobat Rel"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a1128] via-[#0a1128]/90 to-[#0a1128]/40"></div>

                    <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-28 lg:px-32 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                        <div className="md:w-2/3">
                            <h3 className="text-2xl md:text-4xl font-extrabold text-white mb-3 drop-shadow-md">
                                Siap Memulai Perjalanan Anda?
                            </h3>
                            <p className="text-slate-200 text-sm md:text-base mb-0 font-medium max-w-xl">
                                Daftar sekarang dan nikmati kemudahan memesan tiket kereta api dengan aman dan nyaman bersama Sobat Rel.
                            </p>
                        </div>
                        <div className="md:w-1/3 flex justify-center md:justify-end">
                            <button
                                onClick={() => navigate("/register")}
                                className="px-6 py-3 bg-white text-[#0a1128] hover:bg-slate-100 rounded font-bold shadow-lg shadow-black/20 transition-all active:scale-95 whitespace-nowrap"
                            >
                                Daftar Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <footer className="border-t border-slate-200 bg-white pt-16 pb-8 mt-auto">
                <div className="max-w-[1400px] mx-auto px-6 md:px-28 lg:px-32">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-16">

                        <div className="md:col-span-5 lg:col-span-4">
                            <div className="font-black text-slate-900 text-2xl mb-4">
                                Sobat <span className="text-blue-600">Rel</span>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                                Platform pemesanan tiket kereta api terpercaya yang memberikan kemudahan dan kenyamanan untuk setiap perjalanan Anda di seluruh nusantara.
                            </p>
                        </div>


                        <div className="md:col-span-3 lg:col-span-4 lg:flex lg:justify-center">
                            <div>
                                <h4 className="font-bold text-slate-800 text-base mb-6">Keanggotaan</h4>
                                <ul className="space-y-4">
                                    <li>
                                        <button onClick={() => navigate("/login")} className="text-slate-500 hover:text-blue-600 text-sm transition-colors">
                                            Masuk
                                        </button>
                                    </li>
                                    <li>
                                        <button onClick={() => navigate("/register")} className="text-slate-500 hover:text-blue-600 text-sm transition-colors">
                                            Daftar Akun
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>


                        <div className="md:col-span-4 lg:col-span-4 lg:flex lg:justify-end">
                            <div>
                                <h4 className="font-bold text-slate-800 text-base mb-6">Kontak</h4>
                                <ul className="space-y-4">
                                    <li>
                                        <a href="mailto:info@sobatrel.id" className="flex items-center text-slate-500 hover:text-blue-600 text-sm transition-colors group">
                                            <Mail className="w-4 h-4 mr-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                            info@sobatrel.id
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-slate-500 hover:text-blue-600 text-sm transition-colors group">
                                            <svg className="w-4 h-4 mr-3 text-slate-400 group-hover:text-blue-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                            </svg>
                                            @sobatrel.id
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-slate-500 hover:text-blue-600 text-sm transition-colors group">
                                            <svg className="w-4 h-4 mr-3 text-slate-400 group-hover:text-blue-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        </div >
    );
}

export default UserDashboard;
