import React from 'react';

const PaymentMethodStep = ({
    paymentMethods,
    selectedMethod,
    setSelectedMethod,
    bookingData,
    finalTotal,
    qrCodeUrl,
    copiedText,
    handleCopy,
    isProcessing,
    isExpired,
    onProcessPayment,
    onBack,
}) => {
    const selectedMethodObj = paymentMethods.find(m => m.code === selectedMethod || m.name === selectedMethod);

    return (
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
                            key={method.code || method.id}
                            className={`flex items-center justify-between p-4 rounded border cursor-pointer text-sm font-medium transition-all ${selectedMethod === method.code
                                ? 'border-[#1800ad] bg-[#1800ad]/5/50 text-blue-800 ring-1 ring-[#1800ad]'
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
                                className="w-4 h-4 text-[#1800ad] focus:ring-[#1800ad]"
                            />
                        </label>
                    ))}
                </div>

                <div className="flex flex-col h-full">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Instruksi Pembayaran</h3>
                    <div className="flex-1 bg-slate-50 border border-slate-200 p-6 rounded flex flex-col items-center justify-center text-center shadow-sm">
                        {selectedMethod ? (
                            selectedMethodObj?.instructions ? (
                                <div className="w-full text-left space-y-4">
                                    <div className="bg-white p-4 rounded border border-slate-200 text-center">
                                        <p className="text-xs text-slate-500 mb-1">Metode Pembayaran</p>
                                        <p className="text-lg font-bold text-slate-800">{selectedMethodObj.name}</p>
                                        <p className="text-xs text-amber-600 font-bold mt-1">Total Tagihan: Rp {finalTotal.toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded border border-slate-200 text-xs text-slate-700 whitespace-pre-line text-left leading-relaxed shadow-sm">
                                        <div className="font-bold text-slate-800 mb-2 border-b pb-1">Petunjuk Pembayaran:</div>
                                        {selectedMethodObj.instructions}
                                    </div>
                                </div>
                            ) : selectedMethod.toLowerCase() === 'qris' ? (
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
                                                className="text-slate-400 hover:text-[#1800ad] transition-colors"
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
                                                className="text-slate-400 hover:text-[#1800ad] transition-colors"
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
                    onClick={onBack}
                    className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-sm rounded transition-colors"
                >
                    Kembali
                </button>
                <button
                    type="button"
                    disabled={isProcessing || isExpired}
                    onClick={onProcessPayment}
                    className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? 'Memproses Transaksi...' : 'Konfirmasi Telah Bayar'}
                </button>
            </div>
        </div>
    );
};

export default PaymentMethodStep;
