import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserNavbar from "../components/UserNavbar";
import Footer from "../components/Footer";
import ProgressSteps from '../components/ProgressSteps';
import { usePopup } from '../components/PopupContext';
import { formatTime } from '../utils/dateUtils';
import { getCoachLayout } from '../utils/seatLayoutUtils';
import SeatMapGrid from '../components/booking/SeatMapGrid';
import PassengerFormSection from '../components/booking/PassengerFormSection';

function PassengerSeatSelection() {
    const { showPopup } = usePopup();
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




    const formattedJourneyDate = scheduleDetail?.journey_date
        ? new Date(scheduleDetail.journey_date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).replace(/ /g, " ")
        : "";

    const trainClass = (scheduleDetail?.train?.class || scheduleDetail?.train_class || 'economy').toLowerCase();
    const totalCoaches = scheduleDetail?.train?.total_coaches || 2;

    const { rows, seatLetters, aisleIndex } = getCoachLayout(trainClass);

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
                showPopup("Jumlah bayi tidak boleh melebihi jumlah penumpang dewasa.");
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
            showPopup("Penumpang bayi tidak mendapatkan kursi. Silakan pilih tab penumpang dewasa terlebih dahulu.");
            return;
        }

        const isSeatTakenByUs = passengers.some((p, idx) => p.seat_number === seatCode && idx !== activePassengerIndex);
        if (isSeatTakenByUs) {
            showPopup("Kursi ini sudah dipilih oleh penumpang lain di pesanan Anda.");
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
                showPopup("Mohon lengkapi semua data diri penumpang dan pilih nomor kursi untuk penumpang dewasa!");
                return;
            }
            if (p.type === 'infant' && !p.birth_date) {
                showPopup(`Mohon lengkapi tanggal lahir untuk penumpang bayi: ${p.name || 'Tanpa Nama'}!`);
                return;
            }
            if (p.nik.length !== 16) {
                showPopup(`NIK untuk ${p.name} harus 16 digit!`);
                return;
            }
            if (niks.includes(p.nik)) {
                showPopup(`NIK "${p.nik}" diinput lebih dari sekali. NIK setiap penumpang harus berbeda!`);
                return;
            }
            niks.push(p.nik);
        }

        const token = localStorage.getItem('token');
        if (!token) {
            showPopup("Sesi Anda telah habis atau belum login. Silakan login kembali.");
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
                showPopup("Sesi login tidak valid. Silakan login ulang.");
                navigate('/login');
            } else if (error.response?.data?.errors) {
                const msg = Object.values(error.response.data.errors).flat().join("\n");
                showPopup(`Gagal Validasi Backend:\n${msg}`);
            } else {
                showPopup(error.response?.data?.message || "Gagal melakukan booking tiket.");
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
                        <PassengerFormSection
                            passengers={passengers}
                            activePassengerIndex={activePassengerIndex}
                            setActivePassengerIndex={setActivePassengerIndex}
                            onAddPassenger={addPassenger}
                            onRemovePassenger={removePassenger}
                            onPassengerChange={handlePassengerInfoChange}
                            scheduleDetail={scheduleDetail}
                            onSubmit={handleCheckout}
                        />

                        {/* ================= BARIS KANAN: DENAH KURSI DINAMIS ================= */}
                        <SeatMapGrid
                            scheduleDetail={scheduleDetail}
                            formattedJourneyDate={formattedJourneyDate}
                            trainClass={trainClass}
                            totalCoaches={totalCoaches}
                            currentCoach={currentCoach}
                            onCoachChange={(coachNum) => {
                                setCurrentCoach(coachNum);
                                setPassengers(passengers.map(p => ({ ...p, seat_number: '' })));
                            }}
                            userGender={userGender}
                            rows={rows}
                            seatLetters={seatLetters}
                            aisleIndex={aisleIndex}
                            occupiedSeats={occupiedSeats}
                            passengers={passengers}
                            onSeatClick={handleSeatClick}
                        />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default PassengerSeatSelection;