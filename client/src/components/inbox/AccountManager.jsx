import React, { useState, useEffect } from "react";
import { api } from "../../api";

export default function AccountManager() {
    const [accounts, setAccounts] = useState([]);
    const [form, setForm] = useState({
        userId: 1, // replace with logged-in user ID
        email: "",
        imapHost: "",
        imapPort: 993,
        imapUser: "",
        encryptedPass: "",
    });

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const res = await api.get("/accounts");
            setAccounts(res.data);
        } catch (err) {
            console.error("Error fetching accounts", err);
        }
    };

    const addAccount = async (e) => {
        e.preventDefault();
        try {
            await api.post("/accounts", form);
            setForm({ userId: 1, email: "", imapHost: "", imapPort: 993, imapUser: "", encryptedPass: "" });
            fetchAccounts();
        } catch (err) {
            console.error("Error adding account", err);
        }
    };

    return (
        <div className="p-6 bg-gray-800">
            <h2 className="text-lg font-bold mb-4 text-black">Email Accounts</h2>

            {/* List accounts */}
            <div className="mb-6">
                {accounts.map((acc) => (
                    <div key={acc.id} className="border p-3 rounded mb-2 bg-white">
                        <div className="font-medium">{acc.email}</div>
                        <div className="text-sm text-gray-500">{acc.imapHost}:{acc.imapPort}</div>
                    </div>
                ))}
            </div>

            {/* Add account form */}
            <form onSubmit={addAccount} className="space-y-3 bg-white p-4 rounded shadow">
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 border rounded text-black"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="IMAP Host"
                    className="w-full p-2 border rounded  text-black"
                    value={form.imapHost}
                    onChange={(e) => setForm({ ...form, imapHost: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="IMAP Port"
                    className="w-full p-2 border rounded  text-black"
                    value={form.imapPort}
                    onChange={(e) => setForm({ ...form, imapPort: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="IMAP Username"
                    className="w-full p-2 border rounded  text-black"
                    value={form.imapUser}
                    onChange={(e) => setForm({ ...form, imapUser: e.target.value })}
                    required
                />
                <input
                    type="password"
                    placeholder="Encrypted Password"
                    className="w-full p-2 border rounded  text-black"
                    value={form.encryptedPass}
                    onChange={(e) => setForm({ ...form, encryptedPass: e.target.value })}
                    required
                />
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                    Add Account
                </button>
            </form>
        </div>
    );
}
