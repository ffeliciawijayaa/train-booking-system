import React, { useState } from "react";
import { PlusCircle, MinusCircle } from "lucide-react";

const faqs = [
    {
        question: "Bagaimana cara memesan tiket di Sobat Rel?",
        answer:
            "Pilih jadwal perjalanan, isi data penumpang, lakukan pembayaran, dan tiket siap digunakan.",
    },
    {
        question: "Apakah ada biaya tambahan untuk pemesanan?",
        answer:
            "Tidak ada. Harga yang tertera sudah termasuk pajak dan biaya layanan, sehingga Anda tidak perlu membayar biaya tambahan.",
    },
    {
        question: "Apakah saya perlu membuat akun untuk memesan tiket?",
        answer:
            "Ya, akun diperlukan supaya Anda dapat mengelola pemesanan dan melihat riwayat perjalanan.",
    },

    {
        question: "Bagaimana jika saya terlambat?",
        answer:
            "Tiket akan hangus jika Anda tertinggal kereta. Pastikan Anda tiba di stasiun setidaknya 30 menit sebelum jadwal keberangkatan.",
    },
    {
        question: "Metode pembayaran apa saja yang tersedia?",
        answer:
            "Kami menerima pembayaran melalui transfer bank, QRIS, kartu kredit, dan berbagai e-wallet terkemuka.",
    },
    {
        question: "Bagaimana cara melihat tiket yang sudah dipesan?",
        answer:
            "Tiket yang berhasil dibeli dapat dilihat melalui halaman tiket saya.",
    },
];

const FaqSection = () => {
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="w-full bg-slate-50 pb-20 px-6 md:px-28 lg:px-32">
            <div className="max-w-[1400px] mx-auto pt-16 md:pt-20 border-t border-slate-200 flex flex-col lg:flex-row gap-12 lg:gap-20">
                <div className="lg:w-1/3 text-left">
                    <h3 className="text-4xl md:text-5xl font-medium text-slate-900 mb-6 tracking-tight">
                        FAQs
                    </h3>
                    <p className="text-slate-600 text-base leading-relaxed">
                        Semua yang perlu Anda ketahui tentang pemesanan dan layanan
                        kami. Tidak dapat menemukan jawaban yang Anda cari? Silakan
                        hubungi tim kami.
                    </p>
                </div>

                {/*grid */}
                <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 items-start">
                
                    <div className="space-y-2">
                        {faqs.slice(0, 3).map((faq, index) => (
                            <div
                                key={index}
                                className="border-b border-slate-200/80 pb-4 mb-4"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex justify-between items-center text-left py-2 gap-4 outline-none group"
                                >
                                    <span className="font-bold text-slate-800 text-[15px] group-hover:text-[#1800ad] transition-colors">
                                        {faq.question}
                                    </span>
                                    {openFaq === index ? (
                                        <MinusCircle className="w-5 h-5 text-slate-400 shrink-0" />
                                    ) : (
                                        <PlusCircle className="w-5 h-5 text-slate-400 shrink-0" />
                                    )}
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"}`}
                                >
                                    <div className="text-slate-600 text-sm leading-relaxed pr-8 pb-2">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

               
                    <div className="space-y-2">
                        {faqs.slice(3, 6).map((faq, index) => (
                            <div
                                key={index + 3}
                                className="border-b border-slate-200/80 pb-4 mb-4"
                            >
                                <button
                                    onClick={() => toggleFaq(index + 3)}
                                    className="w-full flex justify-between items-center text-left py-2 gap-4 outline-none group"
                                >
                                    <span className="font-bold text-slate-800 text-[15px] group-hover:text-[#1800ad] transition-colors">
                                        {faq.question}
                                    </span>
                                    {openFaq === index + 3 ? (
                                        <MinusCircle className="w-5 h-5 text-slate-400 shrink-0" />
                                    ) : (
                                        <PlusCircle className="w-5 h-5 text-slate-400 shrink-0" />
                                    )}
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index + 3 ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"}`}
                                >
                                    <div className="text-slate-600 text-sm leading-relaxed pr-8 pb-2">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaqSection;
