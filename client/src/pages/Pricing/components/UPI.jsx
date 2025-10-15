import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function UPI({ amount = 0, currency = "INR", email = "", name = "", plan = {} }) {
    const [upiId, setUpiId] = useState("");
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("idle"); // idle | processing | success | failed
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const location = useLocation();
    const planData = location.state?.plan;


    const createPaymentRequest = async () => {
        if (!upiId) return setError("Please enter your UPI ID (e.g. name@bank).");
        setLoading(true);
        setError("");
        setMessage("");
        try {
            const resp = await fetch("/api/upi/create-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount,
                    currency,
                    email,
                    name,
                    planName: plan?.planName,
                    planType: plan?.planType || "month",
                    upiId,
                }),
            });

            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || "Failed to create UPI request");
            setOrder(data);
            setStatus("processing");
            setMessage("Payment request sent to your UPI app. Please approve the payment.");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Poll backend every 3 s for verification
    useEffect(() => {
        if (status !== "processing" || !order?.orderId) return;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/upi/verify-payment/${order.orderId}`);
                const data = await res.json();
                if (data.status === "succeeded") {
                    clearInterval(interval);
                    setStatus("success");
                    setMessage("✅ Payment successful! Thank you.");
                }
            } catch (e) {
                console.error(e);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [status, order]);

    return (
        <div className="mt-6 bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
            <h4 className="text-lg font-semibold mb-2 text-yellow-400">Pay via UPI</h4>
            <p className="text-sm text-slate-400 mb-4">
                Enter your UPI ID to receive a payment request.
            </p>

            {status === "idle" && (
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="e.g. username@okhdfc"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full p-3 rounded-md bg-slate-900/50 border border-slate-700 text-white"
                    />
                    <button
                        onClick={createPaymentRequest}
                        disabled={loading}
                        className="py-2 px-6 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 font-semibold text-black w-full"
                    >
                        {loading ? "Sending Request..." : "Send Payment Request"}
                    </button>
                </div>
            )}

            {status === "processing" && (
                <div className="mt-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-400 mx-auto mb-3"></div>
                    <p className="text-green-300">{message || "Waiting for payment confirmation..."}</p>
                    <p className="text-xs text-slate-400 mt-2">
                        Please approve the payment in your UPI app ({upiId}).
                    </p>
                </div>
            )}

            {status === "success" && (
                <div className="mt-4 text-green-400 font-semibold">
                    <p>{message}</p>
                    <p className="text-sm text-slate-400 mt-2">
                        Invoice has been sent to {email}.
                    </p>
                </div>
            )}

            {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
        </div>
    );
}
