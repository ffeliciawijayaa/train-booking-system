import React from 'react';
import { Check } from 'lucide-react';

function ProgressSteps({ currentStep }) {
    const steps = [
        { id: 1, label: 'Data Penumpang' },
        { id: 2, label: 'Proteksi Tambahan' },
        { id: 3, label: 'Review' },
        { id: 4, label: 'Pembayaran' }
    ];

    return (
        <div className="w-full mb-8">
            <div className="flex items-center justify-between relative">
                {/* Garis latar belakang (abu-abu) */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded z-0"></div>
                
                {/* Garis progres (biru) */}
                <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 transition-all duration-500 rounded z-0"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step) => {
                    const isCompleted = currentStep > step.id;
                    const isActive = currentStep === step.id;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                                    isCompleted 
                                        ? 'bg-blue-600 text-white shadow ring-4 ring-slate-50' 
                                        : isActive 
                                            ? 'bg-blue-600 text-white shadow ring-4 ring-blue-100' 
                                            : 'bg-slate-200 text-slate-500 ring-4 ring-slate-50'
                                }`}
                            >
                                {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                            </div>
                            <div 
                                className={`absolute top-10 whitespace-nowrap text-xs font-bold transition-colors ${
                                    isActive || isCompleted ? 'text-blue-900' : 'text-slate-400'
                                }`}
                            >
                                {step.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ProgressSteps;
