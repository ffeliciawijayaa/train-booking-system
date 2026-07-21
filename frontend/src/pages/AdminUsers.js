import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(
                'http://127.0.0.1:8000/api/admin/users',
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setUsers(res.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Gagal mengambil data user:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="p-6 md:p-8 font-sans text-slate-800">
            
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">Kelola Pelanggan</h2>
                    <p className="text-slate-500 text-sm">Daftar seluruh pengguna yang terdaftar pada sistem.</p>
                </div>
                
            </div>
    

            <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden mb-12">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-lg font-bold text-slate-800">Daftar Pelanggan</h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari nama..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1800ad] focus:bg-white transition-colors"
                        />
                        <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider pl-6">ID</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nomor HP</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider pr-6">Gender</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500 text-sm">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500 text-sm">
                                        Belum ada user terdaftar.
                                    </td>
                                </tr>
                            ) : (
                                users.filter(s => (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="p-4 pl-6 text-sm font-semibold text-slate-800">
                                            {user.id}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-slate-800">
                                            {user.name}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {user.email}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {user.phone_number || "-"}
                                        </td>
                                        <td className="p-4 pr-6">
                                            {user.gender === "pria" ? (
                                                <span className="inline-block px-2.5 py-1 text-xs font-bold tracking-wide uppercase rounded-lg border bg-[#1800ad]/10 text-[#1800ad] border-[#1800ad]/20">
                                                    Pria
                                                </span>
                                            ) : user.gender === "wanita" ? (
                                                <span className="inline-block px-2.5 py-1 text-xs font-bold tracking-wide uppercase rounded-lg border bg-pink-50 text-pink-600 border-pink-100">
                                                    Wanita
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
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

export default AdminUsers;
