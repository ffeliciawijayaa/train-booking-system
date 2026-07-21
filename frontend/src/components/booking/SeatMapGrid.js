import React from 'react';
import { formatTime } from '../../utils/dateUtils';

const SeatMapGrid = ({
    scheduleDetail,
    formattedJourneyDate,
    trainClass,
    totalCoaches,
    currentCoach,
    onCoachChange,
    userGender,
    rows,
    seatLetters,
    aisleIndex,
    occupiedSeats,
    passengers,
    onSeatClick,
}) => {
    return (
        <div className="lg:col-span-7 bg-white p-6 rounded shadow-sm border border-slate-200">
            <div className="flex flex-wrap justify-between items-center border-b border-slate-200 pb-4 mb-6 gap-3">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Denah Sisi Dalam Gerbong</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Kereta <span className="font-semibold text-slate-800">{scheduleDetail?.train?.name}</span> ({trainClass ? trainClass.charAt(0).toUpperCase() + trainClass.slice(1) : ''})
                    </p>
                    <div className="mt-3">
                        <div className="text-xs font-medium text-slate-500 mb-1">
                            {formattedJourneyDate || '-'}
                        </div>
                        <div className="flex items-start gap-5 mt-1">
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-slate-900 leading-tight">{formatTime(scheduleDetail?.departure_time, '.')}</span>
                                <span className="text-[13px] text-slate-500 mt-0.5">{scheduleDetail?.departure_station_name} ({scheduleDetail?.departure_station_code})</span>
                            </div>
                            <div className="text-slate-400 text-sm font-bold mt-1">
                                →
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-slate-900 leading-tight">{formatTime(scheduleDetail?.arrival_time, '.')}</span>
                                <span className="text-[13px] text-slate-500 mt-0.5">{scheduleDetail?.arrival_station_name} ({scheduleDetail?.arrival_station_code})</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-600">Pilih Gerbong:</label>
                    <select
                        value={currentCoach}
                        onChange={(e) => onCoachChange(parseInt(e.target.value))}
                        className="appearance-none px-3 py-2 pr-8 border border-slate-200 rounded text-xs font-semibold bg-white focus:outline-blue-500 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.5rem_center]"
                    >
                        {Array.from({ length: totalCoaches }, (_, i) => (
                            <option key={i + 1} value={i + 1}>Gerbong {i + 1}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex gap-4 justify-center text-xs mb-6 font-medium text-slate-600 bg-slate-50 p-3 rounded border">
                <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 bg-emerald-500 rounded border"></span> Tersedia
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 bg-[#1800ad] rounded border"></span> Pilihanmu
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 bg-slate-300 rounded border"></span> Sudah Terisi
                </div>
                {userGender === 'wanita' && (
                    <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 bg-pink-100 rounded border border-pink-200 text-pink-500 flex items-center justify-center font-bold text-[8px]">W</span> Sudah Terisi (Wanita)
                    </div>
                )}
            </div>

            <div className="border border-slate-200 rounded p-6 bg-slate-50/50">
                <div className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 border-b border-dashed pb-2">
                    Arah Depan
                </div>

                <div className="space-y-3">
                    {Array.from({ length: rows }, (_, rowIndex) => {
                        const rowNum = rowIndex + 1;
                        return (
                            <div key={rowNum} className="flex justify-center items-center gap-3">
                                <span className="w-6 text-center text-xs font-bold text-slate-400">{rowNum}</span>

                                {seatLetters.map((letter, letterIdx) => {
                                    const seatCode = `${rowNum}${letter}`;

                                    const occupiedSeat = occupiedSeats.find(
                                        (s) => parseInt(s.coach_number) === currentCoach && s.seat_number === seatCode
                                    );

                                    const isOccupied = !!occupiedSeat;
                                    const isOccupiedFemale = isOccupied && occupiedSeat.passenger_gender === 'wanita';
                                    const showPinkOccupied = userGender === 'wanita' && isOccupiedFemale;

                                    const selectedIndex = passengers.findIndex(p => p.seat_number === seatCode);
                                    const isSelectedByUs = selectedIndex !== -1;

                                    let seatClass = 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300';
                                    if (isOccupied) {
                                        if (showPinkOccupied) {
                                            seatClass = 'bg-pink-50 border-pink-200 text-pink-500 cursor-not-allowed';
                                        } else {
                                            seatClass = 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed';
                                        }
                                    } else if (isSelectedByUs) {
                                        seatClass = 'bg-[#1800ad] border-blue-700 text-white shadow-md ring-2 ring-blue-300 ring-offset-1';
                                    }

                                    return (
                                        <React.Fragment key={letter}>
                                            {letterIdx === aisleIndex && (
                                                <div className="w-6"></div>
                                            )}

                                            <button
                                                type="button"
                                                disabled={isOccupied}
                                                onClick={() => onSeatClick(seatCode)}
                                                className={`w-11 h-11 rounded text-xs font-bold transition-all border flex flex-col items-center justify-center ${seatClass}`}
                                            >
                                                <span>{seatCode}</span>
                                                {isSelectedByUs && <span className="text-[9px] font-medium opacity-90 mt-0.5">P{selectedIndex + 1}</span>}
                                            </button>
                                        </React.Fragment>
                                    );
                                })}
                                <span className="w-6 text-center text-xs font-bold text-slate-400">{rowNum}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SeatMapGrid;
