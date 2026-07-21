import React from 'react';
import { Trash2 } from 'lucide-react';

const PassengerFormSection = ({
    passengers,
    activePassengerIndex,
    setActivePassengerIndex,
    onAddPassenger,
    onRemovePassenger,
    onPassengerChange,
    scheduleDetail,
    onSubmit,
}) => {
    return (
        <div className="lg:col-span-5 space-y-6">
            <form onSubmit={onSubmit} className="bg-white p-6 rounded shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
                    <h3 className="text-lg font-bold text-slate-900">Informasi Penumpang</h3>
                    <button
                        type="button"
                        onClick={onAddPassenger}
                        className="px-4 py-2 bg-[#1800ad]/5 hover:bg-[#1800ad]/10 text-[#1800ad] text-sm font-bold rounded border border-[#1800ad]/20 transition-colors"
                    >
                        + Tambah Orang
                    </button>
                </div>

                {passengers.map((passenger, index) => (
                    <div
                        key={index}
                        onClick={() => setActivePassengerIndex(index)}
                        className={`p-4 rounded border mb-4 cursor-pointer transition-all ${activePassengerIndex === index
                            ? 'border-[#1800ad] bg-[#1800ad]/5/20 ring-2 ring-[#1800ad]/10'
                            : 'border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#1800ad]">
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
                                        onClick={(e) => onRemovePassenger(index, e)}
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
                                    onChange={(e) => onPassengerChange(index, 'type', e.target.value)}
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
                                        onChange={(e) => onPassengerChange(index, 'birth_date', e.target.value)}
                                        className="w-full px-3 py-2 border rounded text-sm bg-white focus:outline-blue-500 text-slate-700"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap </label>
                                <input
                                    type="text"
                                    required
                                    value={passenger.name}
                                    onChange={(e) => onPassengerChange(index, 'name', e.target.value)}
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
                                        onChange={(e) => onPassengerChange(index, 'nik', e.target.value.replace(/[^0-9]/g, ''))}
                                        className="w-full px-3 py-2 border rounded text-sm bg-white focus:outline-blue-500"
                                    />
                                </div>
                                {passenger.type === 'dewasa' && (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Kelamin</label>
                                        <select
                                            value={passenger.gender}
                                            onChange={(e) => onPassengerChange(index, 'gender', e.target.value)}
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
                                <span className="text-[#1800ad]">Rp {(scheduleDetail.price * adultCount).toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    );
                })()}

                <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-[#1800ad] hover:bg-[#11007a] text-white font-bold text-sm rounded transition-colors"
                >
                    Lanjut Pembayaran
                </button>
            </form>
        </div>
    );
};

export default PassengerFormSection;
