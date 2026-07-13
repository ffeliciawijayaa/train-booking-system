import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

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

    const [passengers, setPassengers] = useState(
        Array.from({ length: qtyAwal }, () => ({ name: '', nik: '', gender: 'pria', seat_number: '' }))
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
                            'Accept': 'application/json' // <-- PERBAIKAN: Wajib untuk Laravel Sanctum
                        }
                    });
                    
                    setPassengers(prev => {
                        const updated = [...prev];
                        updated[0] = {
                            ...updated[0],
                            name: res.data.name || '',
                            nik: res.data.nik || '',
                            gender: res.data.gender || 'pria'
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
                // Endpoint publik (biasanya tidak butuh token/accept, tapi tidak masalah jika tidak diubah)
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
        setPassengers([...passengers, { name: '', nik: '', gender: 'pria', seat_number: '' }]);
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
        const updated = [...passengers];
        updated[index][field] = value;
        setPassengers(updated);
    };

    const handleSeatClick = (seatCode) => {
        const isSeatTakenByUs = passengers.some((p, idx) => p.seat_number === seatCode && idx !== activePassengerIndex);
        if (isSeatTakenByUs) {
            alert("Kursi ini sudah dipilih oleh penumpang lain di pesanan Anda.");
            return;
        }

        const updated = [...passengers];
        updated[activePassengerIndex].seat_number = seatCode;
        setPassengers(updated);

        if (activePassengerIndex < passengers.length - 1) {
            setActivePassengerIndex(activePassengerIndex + 1);
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();

        const niks = [];
        for (let p of passengers) {
            if (!p.name || !p.nik || !p.seat_number) {
                alert("Mohon lengkapi semua data diri penumpang dan pilih nomor kursi!");
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
                    'Accept': 'application/json' // <-- PERBAIKAN: Mencegah redirect ke HTML Login
                }
            });

            alert("Booking Berhasil Dibuat! Alihkan ke Halaman Pembayaran.");
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
        <div className="p-4 sm:p-8 bg-slate-50 min-h-screen text-slate-800">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-950 mb-2">Data Penumpang & Pemilihan Kursi</h2>
                <p className="text-sm text-slate-500 mb-6">
                    Kereta: <span className="font-semibold text-slate-800">{scheduleDetail?.train?.name}</span> ({trainClass.toUpperCase()})
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* ================= BARIS KIRI: FORM DATA PENUMPANG ================= */}
                    <div className="lg:col-span-5 space-y-6">
                        <form onSubmit={handleCheckout} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h3 className="text-lg font-bold text-slate-900">Informasi Penumpang</h3>
                                <button 
                                    type="button"
                                    onClick={addPassenger}
                                    className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-lg border border-blue-200 transition-colors"
                                >
                                    + Tambah Orang
                                </button>
                            </div>
                            
                            {passengers.map((passenger, index) => (
                                <div 
                                    key={index} 
                                    onClick={() => setActivePassengerIndex(index)}
                                    className={`p-4 rounded-xl border mb-4 cursor-pointer transition-all ${
                                        activePassengerIndex === index 
                                            ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/10' 
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-blue-600">Penumpang #{index + 1}</span>
                                            {passengers.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => removePassenger(index, e)}
                                                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                                                >
                                                    (Hapus)
                                                </button>
                                            )}
                                        </div>
                                        <span className={`text-xs px-2.5 py-1 rounded-md font-bold ${passenger.seat_number ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                            Kursi: {passenger.seat_number || 'Belum Pilih'}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap (Sesuai KTP):</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={passenger.name} 
                                                onChange={(e) => handlePassengerInfoChange(index, 'name', e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">NIK (16 Digit Nomor KTP):</label>
                                            <input 
                                                type="text" 
                                                required
                                                maxLength={16}
                                                value={passenger.nik} 
                                                onChange={(e) => handlePassengerInfoChange(index, 'nik', e.target.value.replace(/[^0-9]/g, ''))}
                                                className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Kelamin:</label>
                                            <select 
                                                value={passenger.gender} 
                                                onChange={(e) => handlePassengerInfoChange(index, 'gender', e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-blue-500"
                                            >
                                                <option value="pria">Pria</option>
                                                <option value="wanita">Wanita</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {scheduleDetail?.price && (
                                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm space-y-1.5">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Harga per tiket:</span>
                                        <span className="font-semibold text-slate-800">Rp {scheduleDetail.price.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Jumlah Penumpang:</span>
                                        <span className="font-semibold text-slate-800">{passengers.length}x</span>
                                    </div>
                                    <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-dashed">
                                        <span>Total Bayar:</span>
                                        <span className="text-blue-600">Rp {(scheduleDetail.price * passengers.length).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow transition-colors"
                            >
                                Kunci Kursi & Lanjut Pembayaran
                            </button>
                        </form>
                    </div>

                    {/* ================= BARIS KANAN: DENAH KURSI DINAMIS ================= */}
                    <div className="lg:col-span-7 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex flex-wrap justify-between items-center border-b pb-4 mb-6 gap-3">
                            <h3 className="text-lg font-bold text-slate-900">Denah Sisi Dalam Gerbong</h3>
                            
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-bold text-slate-600">Pilih Gerbong:</label>
                                <select 
                                    value={currentCoach} 
                                    onChange={(e) => setCurrentCoach(parseInt(e.target.value))}
                                    className="px-3 py-1.5 border rounded-lg text-xs font-semibold bg-white focus:outline-blue-500"
                                >
                                    {Array.from({ length: totalCoaches }, (_, i) => (
                                        <option key={i+1} value={i+1}>Gerbong {i+1}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center text-xs mb-6 font-medium text-slate-600 bg-slate-50 p-3 rounded-lg border">
                            <div className="flex items-center gap-1.5">
                                <span className="w-4 h-4 bg-emerald-500 rounded border"></span> Tersedia
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-4 h-4 bg-blue-500 rounded border"></span> Pilihanmu
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-4 h-4 bg-slate-300 rounded border"></span> Sudah Terisi
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 max-h-[500px] overflow-y-auto">
                            <div className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-dashed pb-2">
                                Arah Depan / Lokomotif
                            </div>
                            
                            <div className="space-y-2">
                                {Array.from({ length: rows }, (_, rowIndex) => {
                                    const rowNum = rowIndex + 1;
                                    return (
                                        <div key={rowNum} className="flex justify-center items-center gap-2">
                                            <span className="w-6 text-center text-xs font-bold text-slate-400">{rowNum}</span>
                                            
                                            {seatLetters.map((letter, letterIdx) => {
                                                const seatCode = `${rowNum}${letter}`;
                                                
                                                const isOccupied = occupiedSeats.some(
                                                    (s) => s.coach_number === currentCoach && s.seat_number === seatCode
                                                );

                                                const selectedIndex = passengers.findIndex(p => p.seat_number === seatCode);
                                                const isSelectedByUs = selectedIndex !== -1;

                                                return (
                                                    <React.Fragment key={letter}>
                                                        {((trainClass !== 'economy' && letterIdx === 2) || (trainClass === 'economy' && letterIdx === 3)) && (
                                                            <div className="w-8 h-8 flex items-center justify-center text-[10px] font-bold text-slate-300 bg-slate-200/40 rounded border border-dashed uppercase">
                                                                Jln
                                                            </div>
                                                        )}

                                                        <button
                                                            type="button"
                                                            disabled={isOccupied}
                                                            onClick={() => handleSeatClick(seatCode)}
                                                            className={`w-10 h-10 rounded-lg text-xs font-bold transition-all border flex flex-col items-center justify-center ${
                                                                isOccupied 
                                                                    ? 'bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed shadow-inner' 
                                                                    : isSelectedByUs
                                                                        ? 'bg-blue-500 border-blue-600 text-white shadow ring-2 ring-blue-300'
                                                                        : 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600'
                                                            }`}
                                                        >
                                                            <span>{seatCode}</span>
                                                            {isSelectedByUs && <span className="text-[9px] font-medium opacity-80">P{selectedIndex + 1}</span>}
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
    );
}

export default PassengerSeatSelection;