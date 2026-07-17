import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserNavbar from "../components/UserNavbar";
import Footer from "../components/Footer";
import ProgressSteps from '../components/ProgressSteps';

function Payment() {
    const { bookingId } = useParams();
    const navigate = useNavigate();

    // State for Wizard Step
    const [currentStep, setCurrentStep] = useState(2); // Start at Step 2 (Proteksi Tambahan)

    const [bookingData, setBookingData] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [protections, setProtections] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [selectedProtection, setSelectedProtection] = useState(null);
    const [copiedText, setCopiedText] = useState('');

    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [timeLeft, setTimeLeft] = useState('--:--');
    const [isExpired, setIsExpired] = useState(false);

    const token = localStorage.getItem('token');

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(''), 2000);
    };

    // 1. Ambil Data Booking, Metode Bayar, dan Asuransi dari Backend
    useEffect(() => {
        const fetchAllData = async () => {
            if (!token) {
                alert("Anda belum login.");
                navigate('/login');
                return;
            }

            try {
                // Fetch paralel agar cepat
                const [resBooking, resPayments, resProtections] = await Promise.all([
                    axios.get(`http://127.0.0.1:8000/api/bookings/${bookingId}`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`http://127.0.0.1:8000/api/payment-methods`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`http://127.0.0.1:8000/api/protections`, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                setBookingData(resBooking.data.data);
                setPaymentMethods(resPayments.data.data);
                setProtections(resProtections.data.data);

                if (resPayments.data.data.length > 0) {
                    setSelectedMethod(resPayments.data.data[0].code);
                }
                setLoading(false);
            } catch (error) {
                console.error("Gagal mengambil data", error);
                alert("Data pesanan tidak ditemukan atau sesi Anda habis.");
                setLoading(false);
                if (error.response?.status === 401) navigate('/login');
            }
        };
        fetchAllData();
    }, [bookingId, token, navigate]);

    // 2. Logika Live Countdown
    useEffect(() => {
        if (!bookingData?.payment?.expired_at) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            // Pastikan format tanggal aman untuk berbagai browser
            const expired = new Date(bookingData.payment.expired_at.replace(/-/g, "/")).getTime();
            const distance = expired - now;

            if (distance <= 0) {
                clearInterval(interval);
                setTimeLeft("00:00");
                setIsExpired(true);
            } else {
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [bookingData]);

    // Efek otomatis menendang user jika waktu habis
    useEffect(() => {
        if (isExpired) {
            alert("Waktu pembayaran telah habis. Pesanan Anda dibatalkan.");
            navigate('/');
        }
    }, [isExpired, navigate]);

    // 3. Proses Pembayaran
    const handleProcessPayment = async () => {
        if (!selectedMethod) {
            alert("Silakan pilih metode pembayaran terlebih dahulu!");
            return;
        }

        setIsProcessing(true);
        try {
            const response = await axios.post(`http://127.0.0.1:8000/api/bookings/${bookingId}/pay`, {
                payment_method: selectedMethod,
                protection_id: selectedProtection ? selectedProtection.id : null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(response.data.message);
            navigate('/my-tickets');
        } catch (error) {
            console.error("Pembayaran gagal", error);
            alert(error.response?.data?.message || "Terjadi kendala saat memproses pembayaran.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center font-semibold text-slate-600">Memuat rincian tagihan...</div>;
    if (!bookingData) return <div className="p-8 text-center text-red-500 font-semibold">Data transaksi tidak valid.</div>;

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=QRIS_KAI_${bookingData.booking_code}_${bookingData.total_price}`;

    // Kalkulasi Total Real-time (Harga Tiket + Asuransi jika dipilih)
    const baseTotal = parseInt(bookingData.total_price || 0);
    const adultPaxCount = bookingData.booking_details?.filter(d => d.passenger_type === 'dewasa').length || bookingData.booking_details?.length || 1;
    const protectionCost = selectedProtection ? (parseInt(selectedProtection.price) * adultPaxCount) : 0;
    const finalTotal = baseTotal + protectionCost;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
            <UserNavbar variant="white" />
            <div className="flex-1 pt-32 pb-24 w-full">
                <div className="max-w-[1400px] mx-auto px-6 md:px-28 lg:px-32 space-y-8">

                    {/* PROGRESS STEPS */}
                    <div className="max-w-3xl mx-auto mb-12 px-4">
                        <ProgressSteps currentStep={currentStep} />
                    </div>

                    <div className="max-w-4xl mx-auto">
                        {/* Timer Warning Box dengan Live Countdown */}
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded mb-8 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm gap-4">
                            <div>
                                <h4 className="text-amber-800 font-bold text-sm">Selesaikan Pemesanan Anda</h4>
                                <p className="text-xs text-amber-700 mt-0.5">Kursi Anda telah dipesan sementara. Segera selsaikan pemesanan dan bayar sebelum batas waktu habis.</p>
                            </div>
                            <div className="text-left sm:text-right">
                                <span className="text-xs text-slate-500 block mb-1">Sisa Waktu Pembayaran</span>
                                <span className="text-lg font-mono font-extrabold text-white bg-amber-600 px-3 py-1.5 rounded shadow-inner inline-block">
                                    {timeLeft}
                                </span>
                            </div>
                        </div>


                        <div className="bg-white p-6 sm:p-8 rounded shadow-sm border border-slate-200">

                            {/* STEP 2: PROTEKSI TAMBAHAN */}
                            {currentStep === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="border-b border-slate-200 pb-4 mb-6">
                                        <h2 className="text-xl font-bold text-slate-900">Proteksi Tambahan</h2>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <label className={`flex items-start p-4 rounded border cursor-pointer transition-all ${!selectedProtection ? 'border-blue-500 bg-blue-50 text-blue-800 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300'}`}>
                                            <input type="radio" name="protection" className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                checked={!selectedProtection} onChange={() => setSelectedProtection(null)}
                                            />
                                            <div className="ml-4 text-sm">
                                                <span className="font-bold block text-base mb-0.5">Tanpa Perlindungan</span>
                                                <span className="text-xs text-slate-500">Risiko perjalanan sepenuhnya ditanggung penumpang.</span>
                                            </div>
                                        </label>

                                        {protections.map((prot) => (
                                            <label key={prot.id} className={`flex items-start p-4 rounded border cursor-pointer transition-all ${selectedProtection?.id === prot.id ? 'border-blue-500 bg-blue-50 text-blue-800 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>
                                                <input type="radio" name="protection" className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                    checked={selectedProtection?.id === prot.id} onChange={() => setSelectedProtection(prot)}
                                                />
                                                <div className="ml-4 flex-1 text-sm">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-slate-800 text-base">{prot.name}</span>
                                                        <span className="text-blue-600 font-bold">+Rp {parseInt(prot.price).toLocaleString('id-ID')}/pax</span>
                                                    </div>
                                                    <span className="text-xs text-slate-500 leading-relaxed block max-w-2xl">{prot.description}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="flex justify-between pt-4 border-t border-slate-100 mt-6">
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Yakin ingin membatalkan pesanan tiket ini?')) {
                                                    navigate('/');
                                                }
                                            }}
                                            className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-sm rounded transition-colors"
                                        >
                                            Kembali
                                        </button>
                                        <button
                                            onClick={() => setCurrentStep(3)}
                                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded shadow transition-colors"
                                        >
                                            Lanjut
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: REVIEW */}
                            {currentStep === 3 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="border-b border-slate-200 pb-4 mb-6">
                                        <h2 className="text-xl font-bold text-slate-900">Review</h2>
                                    </div>

                                    <div className="flex flex-col gap-6">
                                        {/* Rute & Kereta */}
                                        <div className="bg-slate-50 p-5 rounded border border-slate-200">
                                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                {bookingData.schedule?.train?.class?.toUpperCase() || 'KERETA'}
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-900 mt-3 mb-4">{bookingData.schedule?.train?.name}</h3>

                                            <div className="border-t border-slate-200 pt-4">
                                                <div className="flex justify-between items-start text-sm">
                                                    <div>
                                                        <p className="text-lg font-bold text-slate-900">{bookingData.schedule?.departure_time ? (bookingData.schedule.departure_time.includes(' ') ? bookingData.schedule.departure_time.split(' ')[1] : bookingData.schedule.departure_time).split(':').slice(0, 2).join('.') : '--.--'}</p>
                                                        <p className="font-bold text-slate-700 mt-1">{bookingData.board_station?.name || 'Stasiun Asal'}</p>
                                                        <p className="text-xs text-slate-500">Keberangkatan</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-slate-900">{bookingData.schedule?.arrival_time ? (bookingData.schedule.arrival_time.includes(' ') ? bookingData.schedule.arrival_time.split(' ')[1] : bookingData.schedule.arrival_time).split(':').slice(0, 2).join('.') : '--.--'}</p>
                                                        <p className="font-bold text-slate-700 mt-1">{bookingData.alight_station?.name || 'Stasiun Tujuan'}</p>
                                                        <p className="text-xs text-slate-500">Kedatangan</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Daftar Penumpang */}
                                        <div className="bg-slate-50 p-5 rounded border border-slate-200">
                                            <h3 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Data penumpang</h3>
                                            <div className="space-y-3">
                                                {bookingData.booking_details?.map((detail, index) => (
                                                    <div key={detail.id || index} className="flex justify-between items-center bg-white p-3 rounded border border-slate-200 text-xs shadow-sm">
                                                        <div>
                                                            <p className="font-bold text-slate-800">
                                                                {detail.passenger_name}
                                                                {detail.passenger_type === 'infant' && <span className="text-emerald-600 ml-1.5 text-[10px] uppercase font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block align-middle">Bayi</span>}
                                                            </p>
                                                            <p className="text-slate-400 font-mono mt-0.5">NIK: {detail.passenger_nik}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            {detail.passenger_type === 'infant' ? (
                                                                <span className="bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded text-xs border border-slate-200">
                                                                    Tanpa Kursi
                                                                </span>
                                                            ) : (
                                                                <span className="bg-blue-600 text-white font-bold px-2.5 py-1 rounded text-xs">
                                                                    Gerbong {detail.coach_number} - {detail.seat_number}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ringkasan Biaya Sementara */}
                                    <div className="border-t border-slate-100 pt-6">
                                        <div className="bg-slate-50 p-5 rounded border border-slate-200">
                                            <div className="flex justify-between text-sm text-slate-600 mb-2">
                                                <span>Total Tiket (Dewasa {adultPaxCount}x)</span>
                                                <span>Rp {baseTotal.toLocaleString('id-ID')}</span>
                                            </div>
                                            {selectedProtection && (
                                                <div className="flex justify-between text-sm text-slate-600 mb-2">
                                                    <span>Biaya Proteksi ({selectedProtection.name})</span>
                                                    <span>Rp {protectionCost.toLocaleString('id-ID')}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-baseline mt-4 pt-4 border-t border-slate-200 border-dashed">
                                                <span className="text-base font-bold text-slate-800">Total Tagihan</span>
                                                <span className="text-xl font-extrabold text-amber-600">
                                                    Rp {finalTotal.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-4 border-t border-slate-100 mt-6">
                                        <button
                                            onClick={() => setCurrentStep(2)}
                                            className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-sm rounded transition-colors"
                                        >
                                            Kembali
                                        </button>
                                        <button
                                            onClick={() => setCurrentStep(4)}
                                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded shadow transition-colors"
                                        >
                                            Lanjut ke Pembayaran
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: PEMBAYARAN */}
                            {currentStep === 4 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="border-b pb-4 mb-6 flex justify-between items-end">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">Metode Pembayaran</h2>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-slate-500 mb-1">Total Tagihan</div>
                                            <div className="text-2xl font-black text-amber-600">Rp {finalTotal.toLocaleString('id-ID')}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-bold text-slate-800 mb-3">Pilihan Pembayaran</h3>
                                            {paymentMethods.map((method) => (
                                                <label
                                                    key={method.code}
                                                    className={`flex items-center justify-between p-4 rounded border cursor-pointer text-sm font-medium transition-all ${selectedMethod === method.code
                                                        ? 'border-blue-500 bg-blue-50/50 text-blue-800 ring-1 ring-blue-500'
                                                        : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <span className="font-bold">{method.name}</span>
                                                    <input
                                                        type="radio"
                                                        name="payment"
                                                        value={method.code}
                                                        checked={selectedMethod === method.code}
                                                        onChange={() => setSelectedMethod(method.code)}
                                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </label>
                                            ))}
                                        </div>

                                        <div className="flex flex-col h-full">
                                            <h3 className="text-sm font-bold text-slate-800 mb-3">Instruksi Pembayaran</h3>
                                            <div className="flex-1 bg-slate-50 border border-slate-200 p-6 rounded flex flex-col items-center justify-center text-center shadow-sm">
                                                {selectedMethod ? (
                                                    selectedMethod.toLowerCase() === 'qris' ? (
                                                        <>
                                                            <p className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">Scan QRIS Berikut</p>
                                                            <div className="p-3 bg-white rounded-xl shadow border border-slate-100 mb-4">
                                                                <img src={qrCodeUrl} alt="QRIS Payment" className="w-48 h-48 object-contain" />
                                                            </div>
                                                            <p className="text-xs text-slate-500 max-w-[250px]">Buka aplikasi m-banking atau e-wallet Anda dan scan QR di atas.</p>
                                                        </>
                                                    ) : selectedMethod.toLowerCase().includes('va') || selectedMethod.toLowerCase().includes('bca') || selectedMethod.toLowerCase().includes('mandiri') || selectedMethod.toLowerCase().includes('bni') || selectedMethod.toLowerCase().includes('bri') ? (
                                                        <div className="w-full text-left space-y-4">
                                                            <div className="bg-white p-4 rounded border border-slate-200 text-center">
                                                                <p className="text-xs text-slate-500 mb-1">Nomor Virtual Account {selectedMethod.toUpperCase()}</p>
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <p className="text-xl font-bold text-slate-800 tracking-wider font-mono">
                                                                        1234567890123456
                                                                    </p>
                                                                    <button 
                                                                        onClick={() => handleCopy(`1234567890123456`)}
                                                                        className="text-slate-400 hover:text-blue-600 transition-colors"
                                                                        title="Salin"
                                                                    >
                                                                        {copiedText === `1234567890123456` ? (
                                                                            <span className="text-xs text-emerald-600 font-bold">Tersalin!</span>
                                                                        ) : (
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside text-left">
                                                                <li>Login ke aplikasi m-banking atau ATM {selectedMethod.toUpperCase()}.</li>
                                                                <li>Pilih menu Transfer &gt; Virtual Account.</li>
                                                                <li>Masukkan nomor Virtual Account di atas.</li>
                                                                <li>Pastikan nominal tagihan sesuai (<strong>Rp {finalTotal.toLocaleString('id-ID')}</strong>).</li>
                                                                <li>Selesaikan transaksi menggunakan PIN Anda.</li>
                                                            </ol>
                                                        </div>
                                                    ) : selectedMethod.toLowerCase().includes('mart') ? (
                                                        <div className="w-full text-left space-y-4">
                                                            <div className="bg-white p-4 rounded border border-slate-200 text-center">
                                                                <p className="text-xs text-slate-500 mb-1">Kode Pembayaran {selectedMethod.toUpperCase()}</p>
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <p className="text-xl font-bold text-slate-800 tracking-wider font-mono">
                                                                        TRAIN-{bookingData?.booking_code}
                                                                    </p>
                                                                    <button 
                                                                        onClick={() => handleCopy(`TRAIN-${bookingData?.booking_code}`)}
                                                                        className="text-slate-400 hover:text-blue-600 transition-colors"
                                                                        title="Salin"
                                                                    >
                                                                        {copiedText === `TRAIN-${bookingData?.booking_code}` ? (
                                                                            <span className="text-xs text-emerald-600 font-bold">Tersalin!</span>
                                                                        ) : (
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside text-left">
                                                                <li>Datang ke gerai {selectedMethod.toUpperCase()} terdekat.</li>
                                                                <li>Sampaikan ke kasir bahwa Anda ingin membayar tiket kereta.</li>
                                                                <li>Berikan kode pembayaran di atas ke kasir.</li>
                                                                <li>Lakukan pembayaran sebesar <strong>Rp {finalTotal.toLocaleString('id-ID')}</strong>.</li>
                                                                <li>Simpan struk sebagai bukti pembayaran.</li>
                                                            </ol>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full text-left space-y-4">
                                                            <div className="bg-white p-4 rounded border border-slate-200 text-center">
                                                                <p className="text-xs text-slate-500 mb-1">Selesaikan Pembayaran dengan {selectedMethod.toUpperCase()}</p>
                                                                <p className="text-xl font-bold text-slate-800 tracking-wider font-mono">
                                                                    Rp {finalTotal.toLocaleString('id-ID')}
                                                                </p>
                                                            </div>
                                                            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside text-left">
                                                                <li>Ikuti petunjuk pembayaran dari {selectedMethod.toUpperCase()}.</li>
                                                                <li>Pastikan nominal transfer sesuai tagihan hingga 3 digit terakhir.</li>
                                                                <li>Simpan bukti pembayaran Anda.</li>
                                                            </ol>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="text-slate-400 p-6">
                                                        <span className="text-4xl block mb-4">💳</span>
                                                        <p className="text-sm font-medium text-slate-600">Pilih metode pembayaran terlebih dahulu untuk melihat instruksi.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-6 border-t border-slate-100 mt-8">
                                        <button
                                            onClick={() => setCurrentStep(3)}
                                            className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-sm rounded transition-colors"
                                        >
                                            Kembali
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isProcessing || isExpired}
                                            onClick={handleProcessPayment}
                                            className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isProcessing ? 'Memproses Transaksi...' : 'Konfirmasi Telah Bayar'}
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Payment;