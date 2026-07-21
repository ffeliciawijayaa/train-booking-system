import React from 'react';
import { formatTime } from '../../utils/dateUtils';

const OrderReviewStep = ({
    bookingData,
    selectedProtection,
    adultPaxCount,
    baseTotal,
    protectionCost,
    finalTotal,
    onNext,
    onBack,
}) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="border-b border-slate-200 pb-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900">Review</h2>
            </div>

            <div className="flex flex-col gap-6">
                {/*rute kereta */}
                <div className="bg-slate-50 p-5 rounded border border-slate-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1800ad] bg-[#1800ad]/10 px-2 py-1 rounded">
                        {bookingData.schedule?.train?.class?.toUpperCase() || 'KERETA'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-3 mb-4">{bookingData.schedule?.train?.name}</h3>

                    <div className="border-t border-slate-200 pt-4">
                        <div className="flex justify-between items-start text-sm">
                            <div>
                                <p className="text-lg font-bold text-slate-900">{formatTime(bookingData.schedule?.departure_time, '.') || '--.--'}</p>
                                <p className="font-bold text-slate-700 mt-1">{bookingData.board_station?.name || 'Stasiun Asal'}</p>
                                <p className="text-xs text-slate-500">Keberangkatan</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-slate-900">{formatTime(bookingData.schedule?.arrival_time, '.') || '--.--'}</p>
                                <p className="font-bold text-slate-700 mt-1">{bookingData.alight_station?.name || 'Stasiun Tujuan'}</p>
                                <p className="text-xs text-slate-500">Kedatangan</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/*daftar penumpang*/}
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
                                        <span className="bg-[#1800ad] text-white font-bold px-2.5 py-1 rounded text-xs">
                                            Gerbong {detail.coach_number} - {detail.seat_number}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/*biaya*/}
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
                    onClick={onBack}
                    className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-sm rounded transition-colors"
                >
                    Kembali
                </button>
                <button
                    onClick={onNext}
                    className="px-8 py-3 bg-[#1800ad] hover:bg-[#11007a] text-white font-bold text-sm rounded shadow transition-colors"
                >
                    Lanjut ke Pembayaran
                </button>
            </div>
        </div>
    );
};

export default OrderReviewStep;
