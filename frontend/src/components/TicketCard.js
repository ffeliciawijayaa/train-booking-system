import React from 'react';
import { getQrCodeUrl } from '../utils/qrUtils';

const TicketCard = ({ booking }) => {
    const isPaid = booking.status === 'completed';

    let isExpired = false;
    if (booking.payment?.expired_at) {
        const expired = new Date(booking.payment.expired_at.replace(/-/g, "/")).getTime();
        if (expired < new Date().getTime()) {
            isExpired = true;
        }
    }
    const isCanceled = booking.status === 'canceled' || (booking.status === 'pending' && isExpired);

    const qrCodeUrl = getQrCodeUrl(`KAI_${booking.booking_code}`, '150x150');

    return (
        <div key={booking.id} className="relative bg-white rounded-lg shadow-sm flex flex-col md:flex-row mb-6 transition hover:shadow-md border border-slate-100">
            <div className="flex-1 p-6 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="font-bold text-lg text-slate-800">{booking.schedule?.train?.name || 'Kereta'}</span>
                        <div className="text-sm text-slate-500 mt-1">
                            Kode Booking: <span className="font-bold text-slate-800">{booking.booking_code}</span>
                            <span className="mx-2 hidden sm:inline">•</span>
                            <br className="sm:hidden" />
                            Berangkat: <span className="font-bold text-slate-800">{booking.schedule?.journey_date || '-'}</span>
                        </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wide 
                        ${isPaid ? 'bg-green-100 text-green-700'
                            : isCanceled ? 'bg-slate-100 text-slate-600'
                                : 'bg-amber-100 text-amber-700'}`}>
                        {isPaid ? 'Aktif' : isCanceled ? 'Dibatalkan' : 'Menunggu Pembayaran'}
                    </span>
                </div>

                <div className="flex items-center gap-3 text-slate-700">
                    <div className="font-semibold text-[#11007a] bg-[#1800ad]/5 px-3 py-1.5 rounded border border-blue-100">{booking.board_station?.name}</div>
                    <span className="text-slate-400">&rarr;</span>
                    <div className="font-semibold text-[#11007a] bg-[#1800ad]/5 px-3 py-1.5 rounded border border-blue-100">{booking.alight_station?.name}</div>
                </div>

                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-100">
                    <div className="font-semibold mb-2 text-slate-800">Daftar Penumpang:</div>
                    <ul className="space-y-1">
                        {booking.booking_details?.map((detail, idx) => (
                            <li key={idx} className="flex justify-between border-b border-slate-200 border-dashed pb-1 last:border-0 last:pb-0">
                                <span>{detail.passenger_name} {detail.passenger_type === 'infant' && <span className="text-emerald-600 font-bold ml-1 text-xs">(Bayi)</span>}</span>
                                <span className="font-medium">
                                    {detail.passenger_type === 'infant' ? 'Tanpa Kursi' : `Gerbong ${detail.coach_number} - Kursi ${detail.seat_number}`}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* THE SEPARATOR WITH HOLES */}
            <div className="relative flex flex-col justify-center items-center w-full md:w-0 h-0 md:h-auto border-t md:border-t-0 md:border-l-2 border-dashed border-slate-200">
                {/* Top Notch (Desktop) / Left Notch (Mobile) */}
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 md:left-0 md:-translate-x-[calc(50%+1px)] w-8 h-8 bg-slate-50 rounded-full z-10" style={{ boxShadow: 'inset 0 -2px 4px 0 rgb(0 0 0 / 0.02)' }}></div>

                {/* Bottom Notch (Desktop) / Right Notch (Mobile) */}
                <div className="absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 md:left-0 md:-translate-x-[calc(50%+1px)] w-8 h-8 bg-slate-50 rounded-full z-10" style={{ boxShadow: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.02)' }}></div>
            </div>

            <div className="w-full md:w-64 p-6 pt-4 md:pt-6 flex flex-col items-center justify-center text-center">
                {isPaid ? (
                    <>
                        <div className="text-xs text-slate-500 mb-2 font-semibold">Tunjukkan QR ini saat boarding</div>
                        <img src={qrCodeUrl} alt="QR Code Boarding" className="w-32 h-32 border border-slate-200 p-2 rounded mb-3 shadow-sm" />
                        <div className="text-xs text-slate-400">Scan QR Code</div>
                    </>
                ) : (
                    <div className="text-slate-400 font-black text-xl uppercase tracking-widest">DIBATALKAN</div>
                )}
            </div>
        </div>
    );
};

export default TicketCard;
