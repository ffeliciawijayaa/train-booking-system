import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert("Konfirmasi password tidak cocok.");
            return;
        }

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/reset-password",
                {
                    email: email,
                    password: newPassword,
                    password_confirmation: confirmPassword,
                }
            );

            alert(response.data.message);

            navigate("/login");
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Gagal mereset password."
            );
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border w-full max-w-md">

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">
                        Reset Password
                    </h2>

                    <p className="text-sm text-slate-500">
                        Masukkan email dan password baru.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border rounded-xl"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            Password Baru
                        </label>

                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border rounded-xl"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            Konfirmasi Password
                        </label>

                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border rounded-xl"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                    >
                        Reset Password
                    </button>

                    <div className="text-center mt-4">
                        <Link
                            to="/login"
                            className="text-blue-600 hover:underline text-sm"
                        >
                            ← Kembali ke Login
                        </Link>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;