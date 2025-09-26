// frontend/src/components/CreateSendGridSender.jsx
import React, { useState } from "react";

export default function CreateSendGridSender({ onCreated }) {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch("/api/senders/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name, address, city, country }),
            });
            const data = await res.json();
            if (!res.ok) throw data;
            setMessage("Verification email sent by SendGrid. Ask the user to check their inbox and click the link.");
            if (onCreated) onCreated(email);
        } catch (err) {
            console.error(err);
            setMessage(err?.details?.errors || err?.error || "Failed to create sender");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submit} style={{ maxWidth: 600 }}>
            <h3>Add sender for SendGrid verification</h3>
            <label>Email (the user will receive SendGrid verification):</label>
            <input value={email} onChange={e => setEmail(e.target.value)} required />
            <label>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} required />
            <label>Address (street)</label>
            <input value={address} onChange={e => setAddress(e.target.value)} />
            <label>City</label>
            <input value={city} onChange={e => setCity(e.target.value)} />
            <label>Country</label>
            <input value={country} onChange={e => setCountry(e.target.value)} />
            <button type="submit" disabled={loading}>{loading ? "Creating..." : "Create & Send Verification"}</button>
            {message && <p>{message}</p>}
        </form>
    );
}
