import React from 'react';

const ProtectionStep = ({
    protections,
    selectedProtection,
    setSelectedProtection,
    onNext,
    onBack,
}) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="border-b border-slate-200 pb-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900">Proteksi Tambahan</h2>
            </div>

            <div className="space-y-4 mb-8">
                <label className={`flex items-start p-4 rounded border cursor-pointer transition-all ${!selectedProtection ? 'border-[#1800ad] bg-[#1800ad]/5 text-blue-800 ring-1 ring-[#1800ad]' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name="protection" className="mt-1 w-4 h-4 text-[#1800ad] focus:ring-[#1800ad]"
                        checked={!selectedProtection} onChange={() => setSelectedProtection(null)}
                    />
                    <div className="ml-4 text-sm">
                        <span className="font-bold block text-base mb-0.5">Tanpa Perlindungan</span>
                        <span className="text-xs text-slate-500">Risiko perjalanan sepenuhnya ditanggung penumpang.</span>
                    </div>
                </label>

                {protections.map((prot) => (
                    <label key={prot.id} className={`flex items-start p-4 rounded border cursor-pointer transition-all ${selectedProtection?.id === prot.id ? 'border-[#1800ad] bg-[#1800ad]/5 text-blue-800 ring-1 ring-[#1800ad]' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>
                        <input type="radio" name="protection" className="mt-1 w-4 h-4 text-[#1800ad] focus:ring-[#1800ad]"
                            checked={selectedProtection?.id === prot.id} onChange={() => setSelectedProtection(prot)}
                        />
                        <div className="ml-4 flex-1 text-sm">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-slate-800 text-base">{prot.name}</span>
                                <span className="text-[#1800ad] font-bold">+Rp {parseInt(prot.price).toLocaleString('id-ID')}/pax</span>
                            </div>
                            <span className="text-xs text-slate-500 leading-relaxed block max-w-2xl">{prot.description}</span>
                        </div>
                    </label>
                ))}
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
                    Lanjut
                </button>
            </div>
        </div>
    );
};

export default ProtectionStep;
