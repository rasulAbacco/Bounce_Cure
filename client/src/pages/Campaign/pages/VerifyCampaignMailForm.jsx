import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_VRI_URL;

const VerifyCampaignMailForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        replyTo: "",
        address: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        nickname: "",
        message: "", // New note/message field
    });

    const [emails, setEmails] = useState([""]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    // ✅ Auto-fill replyTo with logged-in user's email if stored
    useEffect(() => {
        const userEmail = localStorage.getItem("userEmail"); // or fetch from JWT payload if stored
        if (userEmail) {
            setFormData((prev) => ({ ...prev, replyTo: userEmail }));
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEmailChange = (index, value) => {
        const updated = [...emails];
        updated[index] = value;
        setEmails(updated);
    };

    const addEmailField = () => {
        setEmails([...emails, ""]);
    };

    const removeEmailField = (index) => {
        setEmails(emails.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const token = localStorage.getItem("token");
            const payload = { ...formData, emails };
            const res = await fetch(`${API_URL}/api/sender/request-verification`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Request failed");
            setStatus({ type: "success", text: data.message });
        } catch (err) {
            setStatus({ type: "error", text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex justify-center items-center bg-black text-white">
            <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8 w-full max-w-2xl shadow-xl">
                <h2 className="text-2xl font-bold mb-6 text-center text-[#e2971f]">
                    Create a Sender (Verification Request)
                </h2>
                <p className="text-gray-400 text-sm mb-6 text-center">
                    You’re required to include accurate contact information to comply with CAN-SPAM laws.
                </p>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* From Name */}
                    <div className="col-span-2">
                        <label className="block text-sm mb-1 text-gray-400">From Name *</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-[#e2971f]"
                        />
                    </div>

                    {/* Multiple From Emails */}
                    <div className="col-span-2">
                        <label className="block text-sm mb-2 text-gray-400">From Email Address(es) *</label>
                        {emails.map((email, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => handleEmailChange(index, e.target.value)}
                                    placeholder="Enter sender email"
                                    className="flex-1 px-3 py-2 rounded-md bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-[#e2971f]"
                                />
                                {emails.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeEmailField(index)}
                                        className="text-red-400 hover:text-red-500 text-sm"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addEmailField}
                            className="mt-2 text-[#e2971f] hover:underline text-sm"
                        >
                            + Add another email
                        </button>
                    </div>

                    {/* Reply To */}
                    <div className="col-span-2">
                        <label className="block text-sm mb-1 text-gray-400">
                            Reply-To Email (Admin will notify this address after verification)
                        </label>
                        <input
                            type="email"
                            name="replyTo"
                            required
                            value={formData.replyTo}
                            onChange={handleChange}
                            placeholder="Enter the email where admin should notify"
                            className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-[#e2971f]"
                        />
                    </div>

                    {/* Address Fields */}
                    <div className="col-span-2">
                        <label className="block text-sm mb-1 text-gray-400">Company Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm mb-1 text-gray-400">Company Address Line 2</label>
                        <input
                            type="text"
                            name="address2"
                            value={formData.address2}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-gray-400">City</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-gray-400">State</label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-gray-400">Zip Code</label>
                        <input
                            type="text"
                            name="zip"
                            value={formData.zip}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-gray-400">Country</label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700"
                        />
                    </div>

                    {/* Nickname */}
                    <div className="col-span-2">
                        <label className="block text-sm mb-1 text-gray-400">Nickname</label>
                        <input
                            type="text"
                            name="nickname"
                            value={formData.nickname}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700"
                        />
                    </div>

                    {/* New Note/Message Field */}
                    <div className="col-span-2">
                        <label className="block text-sm mb-1 text-gray-400">Note / Message for Admin</label>
                        <textarea
                            name="message"
                            rows="3"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Any additional details or special requests for verification..."
                            className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-[#e2971f]"
                        />
                    </div>

                    {/* Submit */}
                    <div className="col-span-2 flex justify-end mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 rounded-md font-medium text-white ${loading
                                ? "bg-gray-700"
                                : "bg-[#e2971f] hover:bg-[#d09025]"
                                }`}
                        >
                            {loading ? "Sending..." : "Send Request"}
                        </button>
                    </div>
                </form>

                {status && (
                    <p
                        className={`mt-6 text-center ${status.type === "success" ? "text-green-400" : "text-red-400"
                            }`}
                    >
                        {status.text}
                    </p>
                )}
            </div>
        </div>
    );
};

export default VerifyCampaignMailForm;
