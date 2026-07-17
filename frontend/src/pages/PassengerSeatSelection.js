import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserNavbar from "../components/UserNavbar";
import Footer from "../components/Footer";
import ProgressSteps from '../components/ProgressSteps';
import { Trash2 } from 'lucide-react';

function PassengerSeatSelection() {
    const { scheduleId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const boardOrder = searchParams.get('board_order');
    const alightOrder = searchParams.get('alight_order');
    const qtyAwal = parseInt(searchParams.get('qty')) || 1;

    const [scheduleDetail, setScheduleDetail] = useState(null);
    const [occupiedSeats, setOccupiedSeats] = useState([]);
    const [currentCoach, setCurrentCoach] = useState(1);
    const [loading, setLoading] = useState(true);

    // Simpan gender user yang login untuk coloring logic (masih berlaku untuk Penumpang 1)
    const [userGender, setUserGender] = useState('pria');

    const [passengers, setPassengers] = useState(
        Array.from({ length: qtyAwal }, () => ({ name: '', nik: '', gender: 'pria', type: 'dewasa', seat_number: '', birth_date: '' }))
    );

    const [activePassengerIndex, setActivePassengerIndex] = useState(0);

    // --- Ambil data user yang login untuk Auto-fill Penumpang 1 ---
    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await axios.get('http://127.0.0.1:8000/api/user', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    });

                    setUserGender(res.data.gender || 'pria');

                    setPassengers(prev => {
                        const updated = [...prev];
                        updated[0] = {
                            ...updated[0],
                            name: res.data.name || '',
                            nik: res.data.nik || '',
                            gender: res.data.gender || 'pria' // tetapkan dari profil, hidden dari UI
                        };
                        return updated;
                    });
                } catch (error) {
                    console.error("Gagal mengambil data profil user:", error);
                }
            }
        };
        fetchUserProfile();
    }, []);

    // Ambil Detail Jadwal & Data Kursi
    useEffect(() => {
        const fetchData = async () => {
            try {
                const resSchedule = await axios.get(`http://127.0.0.1:8000/api/schedules/${scheduleId}/detail`, {
                    params: { board_order: boardOrder, alight_order: alightOrder }
                });
                setScheduleDetail(resSchedule.data.data);

                const resSeats = await axios.get(`http://127.0.0.1:8000/api/schedules/${scheduleId}/occupied-seats`, {
                    params: { board_order: boardOrder, alight_order: alightOrder }
                });
                setOccupiedSeats(resSeats.data.occupied_seats || []);
                setLoading(false);
            } catch (err) {
                console.error("Gagal memuat data booking", err);
                setLoading(false);
            }
        };
        fetchData();
    }, [scheduleId, boardOrder, alightOrder]);

    if (loading) return <div className="p-8 text-center font-semibold text-slate-600">Memuat denah kursi...</div>;

    const calculateDuration = (start, end) => {
        if (!start || !end) return "";
        const [startH, startM] = start.split(":").map(Number);
        const [endH, endM] = end.split(":").map(Number);
        let startTotalMins = startH * 60 + startM;
        let endTotalMins = endH * 60 + endM;
        if (endTotalMins < startTotalMins) endTotalMins += 24 * 60;
        const diffMins = endTotalMins - startTotalMins;
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        if (hours > 0 && mins > 0) return `${hours}j ${mins < 10 ? '0' : ''}${mins}m`;
        if (hours > 0) return `${hours}j`;
        return `${mins}m`;
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return "";
        const timePart = timeStr.includes(" ") ? timeStr.split(" ")[1] : timeStr;
        return timePart.split(":").slice(0, 2).join(".");
    };

    const formattedJourneyDate = scheduleDetail?.journey_date
        ? new Date(scheduleDetail.journey_date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).replace(/ /g, " ")
        : "";

    const trainClass = (scheduleDetail?.train?.class || scheduleDetail?.train_class || 'economy').toLowerCase();
    const totalCoaches = scheduleDetail?.train?.total_coaches || 2;

    let rows = 16;
    let seatLetters = ['A', 'B', 'C', 'D', 'E'];

    if (trainClass === 'executive') {
        rows = 12;
        seatLetters = ['A', 'B', 'C', 'D'];
    } else if (trainClass === 'business') {
        rows = 16;
        seatLetters = ['A', 'B', 'C', 'D'];
    }

    const addPassenger = () => {
        setPassengers([...passengers, { name: '', nik: '', gender: 'pria', type: 'dewasa', seat_number: '', birth_date: '' }]);
        setActivePassengerIndex(passengers.length);
    };

    const removePassenger = (indexToRemove, e) => {
        e.stopPropagation();
        if (passengers.length === 1) return;

        const updated = passengers.filter((_, idx) => idx !== indexToRemove);
        setPassengers(updated);

        if (activePassengerIndex >= updated.length) {
            setActivePassengerIndex(updated.length - 1);
        } else if (activePassengerIndex === indexToRemove && indexToRemove > 0) {
            setActivePassengerIndex(indexToRemove - 1);
        }
    };

    const handlePassengerInfoChange = (index, field, value) => {
        if (field === 'type' && value === 'infant') {
            const adults = passengers.filter((p, i) => i !== index && p.type === 'dewasa').length;
            const infants = passengers.filter((p, i) => i !== index && p.type === 'infant').length;
            if (infants >= adults) {
                alert("Jumlah bayi tidak boleh melebihi jumlah penumpang dewasa.");
                return;
            }
        }

        const updated = [...passengers];
        updated[index][field] = value;
        if (field === 'type' && value === 'infant') {
            updated[index].seat_number = '';
        }
        setPassengers(updated);
    };

    const handleSeatClick = (seatCode) => {
        if (passengers[activePassengerIndex].type === 'infant') {
            alert("Penumpang bayi tidak mendapatkan kursi. Silakan pilih tab penumpang dewasa terlebih dahulu.");
            return;
        }

        const isSeatTakenByUs = passengers.some((p, idx) => p.seat_number === seatCode && idx !== activePassengerIndex);
        if (isSeatTakenByUs) {
            alert("Kursi ini sudah dipilih oleh penumpang lain di pesanan Anda.");
            return;
        }

        const updated = [...passengers];
        updated[activePassengerIndex].seat_number = seatCode;
        setPassengers(updated);

        // Auto-advance ke penumpang dewasa berikutnya jika ada
        let nextIndex = activePassengerIndex + 1;
        while (nextIndex < passengers.length && passengers[nextIndex].type === 'infant') {
            nextIndex++;
        }
        if (nextIndex < passengers.length) {
            setActivePassengerIndex(nextIndex);
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();

        const niks = [];
        for (let p of passengers) {
            if (!p.name || !p.nik || (p.type === 'dewasa' && !p.seat_number)) {
                alert("Mohon lengkapi semua data diri penumpang dan pilih nomor kursi untuk penumpang dewasa!");
                return;
            }
            if (p.type === 'infant' && !p.birth_date) {
                alert(`Mohon lengkapi tanggal lahir untuk penumpang bayi: ${p.name || 'Tanpa Nama'}!`);
                return;
            }
            if (p.nik.length !== 16) {
                alert(`NIK untuk ${p.name} harus 16 digit!`);
                return;
            }
            if (niks.includes(p.nik)) {
                alert(`NIK "${p.nik}" diinput lebih dari sekali. NIK setiap penumpang harus berbeda!`);
                return;
            }
            niks.push(p.nik);
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert("Sesi Anda telah habis atau belum login. Silakan login kembali.");
            navigate('/login');
            return;
        }

        try {
            const payloadData = {
                schedule_id: parseInt(scheduleId),
                departure_station_id: scheduleDetail?.departure_station_id,
                arrival_station_id: scheduleDetail?.arrival_station_id,
                board_station_id: scheduleDetail?.departure_station_id,
                alight_station_id: scheduleDetail?.arrival_station_id,
                board_order: parseInt(boardOrder),
                alight_order: parseInt(alightOrder),
                coach_number: currentCoach,
                passengers: passengers
            };

            const response = await axios.post('http://127.0.0.1:8000/api/tickets/booking', payloadData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const bookingId = response.data?.booking_id || response.data?.data?.id;
            if (bookingId) navigate(`/payment/${bookingId}`);
            else navigate('/');

        } catch (error) {
            console.error("Detail Error:", error.response?.data);
            if (error.response?.status === 401) {
                alert("Sesi login tidak valid. Silakan login ulang.");
                navigate('/login');
            } else if (error.response?.data?.errors) {
                const msg = Object.values(error.response.data.errors).flat().join("\n");
                alert(`Gagal Validasi Backend:\n${msg}`);
            } else {
                alert(error.response?.data?.message || "Gagal melakukan booking tiket.");
            }
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
            <UserNavbar variant="white" />
            <div className="flex-1 pt-32 pb-24 w-full">
                <div className="max-w-[1400px] mx-auto px-6 md:px-28 lg:px-32 space-y-8">

                    <div className="max-w-3xl mx-auto mb-16 px-4">
                        <ProgressSteps currentStep={1} />
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 mb-8 mt-8">Data Penumpang</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* ================= BARIS KIRI: FORM DATA PENUMPANG ================= */}
                        <div className="lg:col-span-5 space-y-6">
                            <form onSubmit={handleCheckout} className="bg-white p-6 rounded shadow-sm border border-slate-200">
                                <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
                                    <h3 className="text-lg font-bold text-slate-900">Informasi Penumpang</h3>
                                    <button
                                        type="button"
                                        onClick={addPassenger}
                                        className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-bold rounded border border-blue-200 transition-colors"
                                    >
                                        + Tambah Orang
                                    </button>
                                </div>

                                {passengers.map((passenger, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setActivePassengerIndex(index)}
                                        className={`p-4 rounded border mb-4 cursor-pointer transition-all ${activePassengerIndex === index
                                            ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/10'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-blue-600">
                                                    Penumpang {index + 1} {passenger.type === 'infant' && '(Bayi)'}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                {passenger.type === 'infant' ? (
                                                    <span className="text-xs px-2.5 py-1 rounded font-bold bg-slate-100 text-slate-500">
                                                        Tanpa Kursi
                                                    </span>
                                                ) : (
                                                    <span className={`text-xs px-2.5 py-1 rounded font-bold ${passenger.seat_number ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                                        Kursi: {passenger.seat_number || 'Belum Pilih'}
                                                    </span>
                                                )}
                                                
                                                {passengers.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => removePassenger(index, e)}
                                                        className="text-red-500 hover:text-red-600 transition-colors ml-1 p-1"
                                                        title="Hapus Penumpang"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1">Tipe Penumpang</label>
                                                <select
                                                    value={passenger.type}
                                                    onChange={(e) => handlePassengerInfoChange(index, 'type', e.target.value)}
                                                    className="appearance-none w-full px-3 py-2 pr-8 border border-slate-200 rounded text-sm bg-white focus:outline-blue-500 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.5rem_center]"
                                                >
                                                    <option value="dewasa">Dewasa</option>
                                                    <option value="infant">Bayi (&lt; 3 Tahun)</option>
                                                </select>
                                            </div>

                                            {passenger.type === 'infant' && (
                                                <div className="p-3 bg-slate-100 rounded text-xs font-medium text-slate-600 leading-relaxed mb-2">
                                                    Peraturan: <br></br>Bayi/Infant tidak dikenakan biaya tiket dan tidak mendapatkan kursi.
                                                </div>
                                            )}

                                            {passenger.type === 'infant' && (
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Lahir Bayi</label>
                                                    <input
                                                        type="date"
                                                        required
                                                        max={new Date().toISOString().split("T")[0]}
                                                        min={new Date(new Date().setFullYear(new Date().getFullYear() - 3)).toISOString().split("T")[0]}
                                                        value={passenger.birth_date || ''}
                                                        onChange={(e) => handlePassengerInfoChange(index, 'birth_date', e.target.value)}
                                                        className="w-full px-3 py-2 border rounded text-sm bg-white focus:outline-blue-500 text-slate-700"
                                                    />
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap (Sesuai KTP)</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={passenger.name}
                                                    onChange={(e) => handlePassengerInfoChange(index, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 border rounded text-sm bg-white focus:outline-blue-500"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-600 mb-1">NIK (16 Digit)</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        maxLength={16}
                                                        value={passenger.nik}
                                                        onChange={(e) => handlePassengerInfoChange(index, 'nik', e.target.value.replace(/[^0-9]/g, ''))}
                                                        className="w-full px-3 py-2 border rounded text-sm bg-white focus:outline-blue-500"
                                                    />
                                                </div>
                                                {passenger.type === 'dewasa' && (
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Kelamin</label>
                                                        <select
                                                            value={passenger.gender}
                                                            onChange={(e) => handlePassengerInfoChange(index, 'gender', e.target.value)}
                                                            className="w-full appearance-none px-3 py-2 pr-8 border border-slate-300 rounded text-sm text-slate-800 bg-white focus:outline-blue-500 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.75rem_center]"
                                                        >
                                                            <option value="pria">Laki-laki</option>
                                                            <option value="wanita">Perempuan</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {scheduleDetail?.price && (() => {
                                    const adultCount = passengers.filter(p => p.type === 'dewasa').length;
                                    return (
                                        <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200 text-sm space-y-1.5">
                                            <div className="flex justify-between text-slate-600">
                                                <span>Harga per tiket</span>
                                                <span className="font-semibold text-slate-800">Rp {scheduleDetail.price.toLocaleString('id-ID')}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-600">
                                                <span>Jumlah Penumpang Dewasa</span>
                                                <span className="font-semibold text-slate-800">{adultCount}x</span>
                                            </div>
                                            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-dashed">
                                                <span>Total Bayar:</span>
                                                <span className="text-blue-600">Rp {(scheduleDetail.price * adultCount).toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                    );
                                })()}

                                <button
                                    type="submit"
                                    className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded transition-colors"
                                >
                                    Lanjut Pembayaran
                                </button>
                            </form>
                        </div>

                        {/* ================= BARIS KANAN: DENAH KURSI DINAMIS ================= */}
                        <div className="lg:col-span-7 bg-white p-6 rounded shadow-sm border border-slate-200">
                            <div className="flex flex-wrap justify-between items-center border-b border-slate-200 pb-4 mb-6 gap-3">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Denah Sisi Dalam Gerbong</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Kereta <span className="font-semibold text-slate-800">{scheduleDetail?.train?.name}</span> ({trainClass.charAt(0).toUpperCase() + trainClass.slice(1)})
                                    </p>
                                    <div className="mt-3">
                                        <div className="text-xs font-medium text-slate-500 mb-1">
                                            {formattedJourneyDate || '-'}
                                        </div>
                                        <div className="flex items-start gap-5 mt-1">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold text-slate-900 leading-tight">{formatTime(scheduleDetail?.departure_time)}</span>
                                                <span className="text-[13px] text-slate-500 mt-0.5">{scheduleDetail?.departure_station_name} ({scheduleDetail?.departure_station_code})</span>
                                            </div>
                                            <div className="text-slate-400 text-sm font-bold mt-1">
                                                →
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold text-slate-900 leading-tight">{formatTime(scheduleDetail?.arrival_time)}</span>
                                                <span className="text-[13px] text-slate-500 mt-0.5">{scheduleDetail?.arrival_station_name} ({scheduleDetail?.arrival_station_code})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-bold text-slate-600">Pilih Gerbong:</label>
                                    <select
                                        value={currentCoach}
                                        onChange={(e) => {
                                            setCurrentCoach(parseInt(e.target.value));
                                            // Reset kursi jika pindah gerbong karena 1 transaksi = 1 gerbong (saat ini)
                                            setPassengers(passengers.map(p => ({ ...p, seat_number: '' })));
                                        }}
                                        className="appearance-none px-3 py-2 pr-8 border border-slate-200 rounded text-xs font-semibold bg-white focus:outline-blue-500 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.5rem_center]"
                                    >
                                        {Array.from({ length: totalCoaches }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>Gerbong {i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 justify-center text-xs mb-6 font-medium text-slate-600 bg-slate-50 p-3 rounded border">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-4 h-4 bg-emerald-500 rounded border"></span> Tersedia
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-4 h-4 bg-blue-500 rounded border"></span> Pilihanmu
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-4 h-4 bg-slate-300 rounded border"></span> Sudah Terisi
                                </div>
                                {userGender === 'wanita' && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-4 h-4 bg-pink-100 rounded border border-pink-200 text-pink-500 flex items-center justify-center font-bold text-[8px]">W</span> Sudah Terisi (Wanita)
                                    </div>
                                )}
                            </div>

                            <div className="border border-slate-200 rounded p-6 bg-slate-50/50">
                                <div className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 border-b border-dashed pb-2">
                                    Arah Depan
                                </div>

                                <div className="space-y-3">
                                    {Array.from({ length: rows }, (_, rowIndex) => {
                                        const rowNum = rowIndex + 1;
                                        return (
                                            <div key={rowNum} className="flex justify-center items-center gap-3">
                                                <span className="w-6 text-center text-xs font-bold text-slate-400">{rowNum}</span>

                                                {seatLetters.map((letter, letterIdx) => {
                                                    const seatCode = `${rowNum}${letter}`;

                                                    const occupiedSeat = occupiedSeats.find(
                                                        (s) => parseInt(s.coach_number) === currentCoach && s.seat_number === seatCode
                                                    );

                                                    const isOccupied = !!occupiedSeat;
                                                    const isOccupiedFemale = isOccupied && occupiedSeat.passenger_gender === 'wanita';
                                                    const showPinkOccupied = userGender === 'wanita' && isOccupiedFemale;

                                                    const selectedIndex = passengers.findIndex(p => p.seat_number === seatCode);
                                                    const isSelectedByUs = selectedIndex !== -1;

                                                    let seatClass = 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300';
                                                    if (isOccupied) {
                                                        if (showPinkOccupied) {
                                                            seatClass = 'bg-pink-50 border-pink-200 text-pink-500 cursor-not-allowed';
                                                        } else {
                                                            seatClass = 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed';
                                                        }
                                                    } else if (isSelectedByUs) {
                                                        seatClass = 'bg-blue-600 border-blue-700 text-white shadow-md ring-2 ring-blue-300 ring-offset-1';
                                                    }

                                                    return (
                                                        <React.Fragment key={letter}>
                                                            {((trainClass !== 'economy' && letterIdx === 2) || (trainClass === 'economy' && letterIdx === 3)) && (
                                                                <div className="w-6"></div> // Lorong jalan yang bersih (tanpa kotak 'jln')
                                                            )}

                                                            <button
                                                                type="button"
                                                                disabled={isOccupied}
                                                                onClick={() => handleSeatClick(seatCode)}
                                                                className={`w-11 h-11 rounded text-xs font-bold transition-all border flex flex-col items-center justify-center ${seatClass}`}
                                                            >
                                                                <span>{seatCode}</span>
                                                                {isSelectedByUs && <span className="text-[9px] font-medium opacity-90 mt-0.5">P{selectedIndex + 1}</span>}
                                                            </button>
                                                        </React.Fragment>
                                                    );
                                                })}
                                                <span className="w-6 text-center text-xs font-bold text-slate-400">{rowNum}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default PassengerSeatSelection;