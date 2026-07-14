import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function AdminUsers() {
    const [users, setUsers] = useState([]);
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
        <div className="p-6 max-w-6xl mx-auto font-sans text-slate-800">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Kelola User
                    </h1>

                    <p className="text-slate-500 text-sm mt-1">
                        Daftar seluruh pengguna yang terdaftar pada sistem.
                    </p>
                </div>

                <Link
                    to="/admin/schedules"
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors text-sm"
                >
                    Kembali ke Dashboard
                </Link>
            </div>

            <p className="text-sm text-slate-500 mb-4">
                Total User: <span className="font-bold">{users.length}</span>
            </p>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-100 text-slate-600 text-sm">
                            <th className="p-4 border-b font-bold">ID</th>
                            <th className="p-4 border-b font-bold">Nama</th>
                            <th className="p-4 border-b font-bold">Email</th>
                            <th className="p-4 border-b font-bold">Nomor HP</th>
                            <th className="p-4 border-b font-bold">Gender</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="p-4 text-center text-slate-500">
                                    Memuat data...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-4 text-center text-slate-500">
                                    Belum ada user terdaftar.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-slate-50 border-b last:border-0 transition-colors"
                                >
                                    <td className="p-4 text-sm font-semibold">
                                        {user.id}
                                    </td>

                                    <td className="p-4 text-sm font-semibold text-slate-800">
                                        {user.name}
                                    </td>

                                    <td className="p-4 text-sm">
                                        {user.email}
                                    </td>

                                    <td className="p-4 text-sm">
                                        {user.phone_number || "-"}
                                    </td>

                                    <td className="p-4">
                                        {user.gender === "pria" ? (
                                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                                Pria
                                            </span>
                                        ) : user.gender === "wanita" ? (
                                            <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold">
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
    );
}

export default AdminUsers;
