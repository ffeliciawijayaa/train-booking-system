import React, { useState, useEffect, useRef } from "react";
import { TrainFront, Search } from "lucide-react";

const StationSearchDropdown = ({
    label,
    value,
    onChange,
    stations,
    placeholder,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredStations = stations.filter(
        (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.city.toLowerCase().includes(search.toLowerCase()) ||
            s.station_code.toLowerCase().includes(search.toLowerCase()),
    );

    const selectedStation = stations.find((s) => s.id == value);

    return (
        <div
            className="w-full relative bg-slate-50 rounded hover:bg-slate-100 transition-colors"
            ref={dropdownRef}
        >
            <label className="absolute top-3 left-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10 pointer-events-none">
                {label}
            </label>
            <div
                className="w-full pl-4 pr-10 pt-7 pb-3 bg-transparent text-sm font-bold text-slate-800 cursor-pointer text-left h-full flex items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedStation
                    ? `${selectedStation.name} (${selectedStation.station_code})`
                    : placeholder}
            </div>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <span className="text-slate-400 text-xs">▼</span>
            </div>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden min-w-[300px]">
                    <div className="p-4 border-b border-slate-100">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Masukkan kota atau nama stasiun"
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1800ad]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="max-h-32 overflow-y-auto p-2 custom-scrollbar">
                        {filteredStations.length > 0 ? (
                            filteredStations.map((s) => (
                                <div
                                    key={s.id}
                                    className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                                    onClick={() => {
                                        onChange(s.id);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <TrainFront className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm">
                                                {s.name}
                                            </div>
                                            <div className="text-slate-500 text-xs">{s.city}</div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-100 px-2 py-1 rounded text-xs font-semibold text-slate-600">
                                        {s.station_code}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-slate-500 text-sm">
                                Stasiun tidak ditemukan
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StationSearchDropdown;
