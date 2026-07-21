import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserNavbar from "../components/UserNavbar";
import Footer from "../components/Footer";
import ProgressSteps from '../components/ProgressSteps';
import { usePopup } from '../components/PopupContext';
import { formatTime } from '../utils/dateUtils';
import { getQrCodeUrl } from '../utils/qrUtils';
import useClipboard from '../hooks/useClipboard';
import useCountdownTimer from '../hooks/useCountdownTimer';
import ProtectionStep from '../components/payment/ProtectionStep';
import OrderReviewStep from '../components/payment/OrderReviewStep';
import PaymentMethodStep from '../components/payment/PaymentMethodStep';

function Payment() {
    const { showPopup, showConfirm } = usePopup();
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { copiedText, handleCopy } = useClipboard();

    const [currentStep, setCurrentStep] = useState(2);

    const [bookingData, setBookingData] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [protections, setProtections] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [selectedProtection, setSelectedProtection] = useState(null);

    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const { timeLeft, isExpired } = useCountdownTimer(bookingData?.payment?.expired_at);

    const token = localStorage.getItem('token');

    //ambil Data Booking, Metode Bayar, dan Asuransi dari Backend
    useEffect(() => {
        const fetchAllData = async () => {
            if (!token) {
                showPopup("Anda belum login.");
                navigate('/login');
                return;
            }

            try {

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
                showPopup("Data pesanan tidak ditemukan atau sesi Anda habis.");
                setLoading(false);
                if (error.response?.status === 401) navigate('/login');
            }
        };
        fetchAllData();
    }, [bookingId, token, navigate]);

    //otomatis kick user jika waktu habis
    useEffect(() => {
        if (isExpired) {
            showPopup("Waktu pembayaran telah habis. Pesanan Anda dibatalkan.");
            navigate('/');
        }
    }, [isExpired, navigate]);

    //proses Pembayaran
    const handleProcessPayment = async () => {
        if (!selectedMethod) {
            showPopup("Silakan pilih metode pembayaran terlebih dahulu!");
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

            showPopup(response.data.message);
            navigate('/my-tickets');
        } catch (error) {
            console.error("Pembayaran gagal", error);
            showPopup(error.response?.data?.message || "Terjadi kendala saat memproses pembayaran.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center font-semibold text-slate-600">Memuat rincian tagihan...</div>;
    if (!bookingData) return <div className="p-8 text-center text-red-500 font-semibold">Data transaksi tidak valid.</div>;

    const qrCodeUrl = getQrCodeUrl(`QRIS_KAI_${bookingData.booking_code}_${bookingData.total_price}`, '250x250');

    //kalkulasi Harga Tiket + Asuransi jika dipilih
    const baseTotal = parseInt(bookingData.total_price || 0);
    const adultPaxCount = bookingData.booking_details?.filter(d => d.passenger_type === 'dewasa').length || bookingData.booking_details?.length || 1;
    const protectionCost = selectedProtection ? (parseInt(selectedProtection.price) * adultPaxCount) : 0;
    const finalTotal = baseTotal + protectionCost;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
            <UserNavbar variant="white" />
            <div className="flex-1 pt-32 pb-24 w-full">
                <div className="max-w-[1400px] mx-auto px-6 md:px-28 lg:px-32 space-y-8">

                    {/*progress step*/}
                    <div className="max-w-3xl mx-auto mb-12 px-4">
                        <ProgressSteps currentStep={currentStep} />
                    </div>

                    <div className="max-w-4xl mx-auto">
                        {/*live countdown*/}
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

                            {currentStep === 2 && (
                                <ProtectionStep
                                    protections={protections}
                                    selectedProtection={selectedProtection}
                                    setSelectedProtection={setSelectedProtection}
                                    onNext={() => setCurrentStep(3)}
                                    onBack={async () => {
                                        if (await showConfirm('Yakin ingin membatalkan pesanan tiket ini?')) {
                                            navigate('/');
                                        }
                                    }}
                                />
                            )}

                            {currentStep === 3 && (
                                <OrderReviewStep
                                    bookingData={bookingData}
                                    selectedProtection={selectedProtection}
                                    adultPaxCount={adultPaxCount}
                                    baseTotal={baseTotal}
                                    protectionCost={protectionCost}
                                    finalTotal={finalTotal}
                                    onNext={() => setCurrentStep(4)}
                                    onBack={() => setCurrentStep(2)}
                                />
                            )}

                            {currentStep === 4 && (
                                <PaymentMethodStep
                                    paymentMethods={paymentMethods}
                                    selectedMethod={selectedMethod}
                                    setSelectedMethod={setSelectedMethod}
                                    bookingData={bookingData}
                                    finalTotal={finalTotal}
                                    qrCodeUrl={qrCodeUrl}
                                    copiedText={copiedText}
                                    handleCopy={handleCopy}
                                    isProcessing={isProcessing}
                                    isExpired={isExpired}
                                    onProcessPayment={handleProcessPayment}
                                    onBack={() => setCurrentStep(3)}
                                />
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