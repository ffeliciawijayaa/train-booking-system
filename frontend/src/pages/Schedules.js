import Modal from '../components/Modal';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { usePopup } from '../components/PopupContext';

function Schedules() {
    const { showPopup, showConfirm } = usePopup();

    const [trains, setTrains] = useState([]);
    const [stations, setStations] = useState([]);
    const [schedulesList, setSchedulesList] = useState([]);

    const [selectedTrain, setSelectedTrain] = useState('');
    const [journeyDate, setJourneyDate] = useState('');
    const [message, setMessage] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [editScheduleId, setEditScheduleId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [routeStops, setRouteStops] = useState([
        { station_id: '', arrival_time: '', departure_time: '', price_from_start: 0 },
        { station_id: '', arrival_time: '', departure_time: '', price_from_start: 0 }
    ]);

    const todayDate = new Date().toISOString().split('T')[0];

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchSchedules = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/schedules', getAuthHeader());
            setSchedulesList(response.data.data);
        } catch (err) {
            console.error("Gagal memuat daftar jadwal", err);
        }
    };

    useEffect(() => {
        const fetchMaster = async () => {
            try {
                const resTrains = await axios.get('http://127.0.0.1:8000/api/admin/trains', getAuthHeader());
                const resStations = await axios.get('http://127.0.0.1:8000/api/admin/stations', getAuthHeader());
                setTrains(resTrains.data.data);
                setStations(resStations.data.data);
            } catch (err) {
                console.error("Gagal memuat data master", err);
            }
        };
        fetchMaster();
        fetchSchedules();
    }, []);

    const handleStopChange = (index, field, value) => {
        const updatedStops = [...routeStops];
        if (field === 'price_from_start') {
            value = value.replace(/[^0-9]/g, '');
        }
        updatedStops[index][field] = value;
        setRouteStops(updatedStops);
    };

    const addStopRow = () => {
        setRouteStops([...routeStops, { station_id: '', arrival_time: '', departure_time: '', price_from_start: 0 }]);
    };

    const removeStopRow = (index) => {
        if (routeStops.length > 2) {
            const updatedStops = routeStops.filter((_, i) => i !== index);
            setRouteStops(updatedStops);
        } else {
            showPopup("Minimal harus ada stasiun awal dan akhir!");
        }
    };

    const timeToMinutes = (timeString) => {
        if (!timeString) return 0;
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const resetForm = () => {
        setSelectedTrain('');
        setJourneyDate('');
        setRouteStops([
            { station_id: '', arrival_time: '', departure_time: '', price_from_start: 0 },
            { station_id: '', arrival_time: '', departure_time: '', price_from_start: 0 }
        ]);
        setIsEditing(false);
        setEditScheduleId(null);
        setIsModalOpen(false);
    };

    const handleAddNew = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const stationIds = routeStops.map(stop => stop.station_id);
        const hasDuplicateStation = stationIds.some((id, index) => stationIds.indexOf(id) !== index);
        if (hasDuplicateStation) {
            const err = 'Gagal: Terdapat stasiun rute yang ganda atau duplikat.';
            setMessage(err);
            showPopup(err);
            return;
        }

        for (let i = 0; i < routeStops.length; i++) {
            const current = routeStops[i];

            if (i > 0) {
                const prevPrice = parseFloat(routeStops[i - 1].price_from_start) || 0;
                const currentPrice = parseFloat(current.price_from_start) || 0;
                if (currentPrice <= prevPrice) {
                    const err = `Gagal di Urutan Ke-${i + 1}: Harga dari awal (Rp ${currentPrice.toLocaleString('id-ID')}) harus lebih besar dari stasiun sebelumnya (Rp ${prevPrice.toLocaleString('id-ID')}).`;
                    setMessage(err);
                    showPopup(err);
                    return;
                }
            }

            if (i !== 0 && i !== routeStops.length - 1) {
                const arrMin = timeToMinutes(current.arrival_time);
                const depMin = timeToMinutes(current.departure_time);
                if (depMin - arrMin < 5) {
                    const err = `Gagal: Waktu transit di stasiun urutan ke-${i + 1} terlalu singkat. Jam berangkat harus lebih lambat minimal 5 menit dari jam tiba.`;
                    setMessage(err);
                    showPopup(err);
                    return;
                }
            }

            if (i > 0) {
                const prev = routeStops[i - 1];
                const prevDepMin = timeToMinutes(prev.departure_time || prev.arrival_time);
                const currentArrMin = timeToMinutes(current.arrival_time || current.departure_time);

                if (currentArrMin - prevDepMin < 30) {
                    const err = `Gagal: Durasi perjalanan ke stasiun urutan ke-${i + 1} tidak logis. Waktu kedatangan harus minimal 30 menit setelah keberangkatan dari stasiun sebelumnya.`;
                    setMessage(err);
                    showPopup(err);
                    return;
                }
            }
        }

        try {
            if (isEditing) {
                const response = await axios.put(`http://127.0.0.1:8000/api/admin/schedules/${editScheduleId}`, {
                    train_id: selectedTrain,
                    journey_date: journeyDate,
                    route_stops: routeStops
                }, getAuthHeader());
                setMessage(response.data.message || 'Jadwal berhasil diperbarui.');
            } else {
                const response = await axios.post('http://127.0.0.1:8000/api/admin/schedules', {
                    train_id: selectedTrain,
                    journey_date: journeyDate,
                    route_stops: routeStops
                }, getAuthHeader());
                setMessage(response.data.message || 'Jadwal baru berhasil disimpan.');
            }
            resetForm();
            fetchSchedules();
        } catch (error) {
            const err = error.response?.data?.message || 'Gagal memproses data jadwal.';
            setMessage(err);
            showPopup(err);
        }
    };

    const handleEditClick = (sch) => {
        setIsEditing(true);
        setEditScheduleId(sch.id);
        setSelectedTrain(sch.train_id);
        setJourneyDate(sch.journey_date);

        const mappedStops = sch.route_stops.map(stop => ({
            station_id: stop.station_id,

            arrival_time: stop.arrival_time
                ? stop.arrival_time.split(' ')[1]?.substring(0, 5)
                : '',

            departure_time: stop.departure_time
                ? stop.departure_time.split(' ')[1]?.substring(0, 5)
                : '',

            price_from_start: stop.price_from_start
        }));
        setRouteStops(mappedStops);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (await showConfirm(`Apakah Anda yakin ingin menghapus jadwal perjalanan dengan ID #${id}? Semua rute transit terkait akan ikut terhapus.`)) {
            try {
                const response = await axios.delete(`http://127.0.0.1:8000/api/admin/schedules/${id}`, getAuthHeader());
                setMessage(response.data.message);
                fetchSchedules();
            } catch (error) {
                setMessage('Gagal menghapus jadwal perjalanan.');
            }
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return '-';
        const parts = timeString.split(' ');
        const timePart = parts.length > 1 ? parts[1] : parts[0];
        return timePart.substring(0, 5);
    };

    const isMessageError = message.includes('Gagal') || message.includes('tidak valid');

    return (
        <div className="p-6 md:p-8 font-sans text-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Kelola Jadwal</h2>
                    <p className="text-sm text-slate-500 mt-1">Kelola perjalanan kereta dan rute transit secara real-time.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="px-4 py-2 bg-[#1800ad] hover:bg-[#11007a] text-white font-bold rounded-lg transition-colors text-sm"
                >
                    + Tambah Data
                </button>
            </div>

            <hr className="border-slate-200 mb-8" />

            {/* Alert Message Toast di Bawah */}
            {message && (
                <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl text-sm font-semibold text-white shadow-xl transition-all border ${isMessageError
                    ? 'bg-red-600 border-red-700'
                    : 'bg-emerald-700 border-emerald-800'
                    }`}>
                    {message}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={resetForm} maxWidth="max-w-4xl" title={isEditing ? "Edit Jadwal Perjalanan" : "Tambah Jadwal Perjalanan"}>

                {message && isMessageError && (
                    <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm">
                        <span>{message}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih Kereta:</label>
                                    <select
                                        value={selectedTrain}
                                        onChange={(e) => setSelectedTrain(e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1800ad]/100/20 focus:border-[#1800ad]/100 transition-all"
                                    >
                                        <option value="">-- Pilih Kereta --</option>
                                        {trains.filter(t => t.is_active === 1 || t.is_active === true).map(t => <option key={t.id} value={t.id}>{t.name} ({t.train_code})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Perjalanan:</label>
                                    <input
                                        type="date"
                                        min={todayDate}
                                        value={journeyDate}
                                        onChange={(e) => setJourneyDate(e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1800ad]/100/20 focus:border-[#1800ad]/100 transition-all"
                                    />
                                </div>
                            </div>

                            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                                Daftar Stasiun Pemberhentian
                            </h3>

                            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                                {routeStops.map((stop, index) => (
                                    <div key={index} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 items-end bg-slate-50 p-4 border border-slate-200 rounded-lg shadow-sm">
                                        <div className="md:col-span-4">
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                                                Urutan Ke-{index + 1} ({index === 0 ? "Awal" : index === routeStops.length - 1 ? "Akhir" : "Transit"})
                                            </label>
                                            <select
                                                value={stop.station_id}
                                                onChange={(e) => handleStopChange(index, 'station_id', e.target.value)}
                                                required
                                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#1800ad]/100"
                                            >
                                                <option value="">-- Pilih Stasiun --</option>
                                                {stations.filter(s => s.is_active === 1 || s.is_active === true).map(s => <option key={s.id} value={s.id}>{s.name} ({s.station_code})</option>)}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Jam Tiba:</label>
                                            <input
                                                type="time"
                                                value={stop.arrival_time}
                                                onChange={(e) => handleStopChange(index, 'arrival_time', e.target.value)}
                                                disabled={index === 0}
                                                required={index !== 0}
                                                className="w-full px-3 py-2 bg-white disabled:bg-slate-200 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#1800ad]/100"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Jam Berangkat:</label>
                                            <input
                                                type="time"
                                                value={stop.departure_time}
                                                onChange={(e) => handleStopChange(index, 'departure_time', e.target.value)}
                                                disabled={index === routeStops.length - 1}
                                                required={index !== routeStops.length - 1}
                                                className="w-full px-3 py-2 bg-white disabled:bg-slate-200 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#1800ad]/100"
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Harga Dari Awal (Rp):</label>
                                            <input
                                                type="text"
                                                value={stop.price_from_start}
                                                onChange={(e) => handleStopChange(index, 'price_from_start', e.target.value)}
                                                required
                                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#1800ad]/100"
                                            />
                                        </div>
                                        <div className="md:col-span-1 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => removeStopRow(index)}
                                                className="w-full sm:w-auto px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 font-bold text-sm rounded-lg transition-colors duration-150"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={addStopRow}
                                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-semibold text-sm rounded-lg transition-colors"
                                >
                                    + Tambah Stasiun Transit
                                </button>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100 flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 font-bold text-sm text-white rounded-lg shadow-sm transition-colors bg-[#1800ad] hover:bg-[#11007a]"
                                >
                                    Simpan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-lg transition-colors"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
            </Modal>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden mb-12">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Daftar Jadwal Perjalanan</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider pl-6">ID</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kereta</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Detail Rute Perjalanan</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center pr-6">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {schedulesList.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">
                                        Belum ada jadwal perjalanan yang dibuat.
                                    </td>
                                </tr>
                            ) : (
                                schedulesList.map((sch) => (
                                    <tr key={sch.id} className="hover:bg-slate-50/50 transition-colors group align-top">
                                        <td className="p-4 pl-6 text-sm font-semibold text-slate-800">{sch.id}</td>
                                        <td className="p-4 text-sm text-slate-800 whitespace-nowrap">{sch.journey_date}</td>
                                        <td className="p-4 text-sm font-medium text-slate-800">{sch.train?.name || `ID: ${sch.train_id}`}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-2">
                                                {sch.route_stops?.map((stop, i) => (
                                                    <div key={i} className="flex items-center text-xs bg-white border border-slate-200 px-3 py-2 border-l-4 border-l-[#1800ad]/100 rounded shadow-sm">
                                                        <span className="font-semibold text-slate-800 w-44 truncate">
                                                            {i + 1}. {stop.station?.name || `ID: ${stop.station_id}`}
                                                        </span>
                                                        <span className="text-slate-500 w-44 pl-2">
                                                            {i === 0 ? 'Mulai' : formatTime(stop.arrival_time)} → {i === sch.route_stops.length - 1 ? 'Selesai' : formatTime(stop.departure_time)}
                                                        </span>
                                                        <span className="text-emerald-600 font-bold ml-auto bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                                            Rp {Number(stop.price_from_start).toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-block px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-100 rounded-md text-xs font-bold tracking-wide uppercase">
                                                {sch.status}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEditClick(sch)}
                                                    className="px-3 py-1.5 bg-[#1800ad]/10 text-[#1800ad] hover:bg-[#1800ad]/20 rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(sch.id)}
                                                    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Schedules;