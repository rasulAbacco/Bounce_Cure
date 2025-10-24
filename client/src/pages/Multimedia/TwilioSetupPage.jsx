import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function TwilioSetupPage() {
  const [form, setForm] = useState({
    accountSid: "",
    authToken: "",
    whatsappNumber: "",
    smsNumber: "",
  });
  const navigate = useNavigate();
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const fieldLabels = {
    accountSid: "Account SID",
    authToken: "Auth Token",
    whatsappNumber: "WhatsApp Number",
    smsNumber: "SMS Number",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (showErrors && value) {
      const stillEmpty = Object.keys(form).some((k) => k !== name && !prev[k]);
      if (!stillEmpty) setShowErrors(false);
    }
  };
    
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // ✅ FIXED: Added /api prefix to match backend route mounting
    const res = await fetch(`${import.meta.env.VITE_API_URL}/twilioConfig/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        alert("✅ Configuration saved successfully!");
        // ✅ Navigate to Multimedia Campaigns after saving
        navigate("/MultimediaCampaigns");
      } else {
        alert(`❌ Failed to save configuration: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error saving Twilio config:", err);
      alert("⚠️ Server error while saving Twilio configuration. Please check the console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        className="flex gap-2 text-amber-400 text-sm font-semibold hover:text-amber-300 transition-colors duration-200 mb-8 group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="uppercase tracking-wide font-medium">Back</span>
      </button>

      {/* Content Container */}
      <div className="flex items-center justify-center">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-3" style={{ color: "#bd7a0f" }}>
              Twilio Configuration
            </h1>
            <p className="text-zinc-400 text-lg">
              Configure your Twilio account settings for SMS and WhatsApp integration
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-8">
            <div ref={containerRef} className="space-y-6">
              {["accountSid", "authToken", "whatsappNumber", "smsNumber"].map((field) => (
                <div key={field} className="group">
                  <label className="block font-semibold text-white mb-2 text-sm uppercase tracking-wide">
                    {fieldLabels[field]}
                  </label>
                  <input
                    type={field === "authToken" ? "password" : "text"}
                    name={field}
                    value={form[field] || ""}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-black border rounded-xl text-white placeholder-zinc-600 
                      focus:outline-none transition-all duration-300
                      ${!form[field] && showErrors 
                        ? "border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/30" 
                        : "border-zinc-700 focus:border-[#bd7a0f] focus:ring-2 focus:ring-[#bd7a0f]/30"
                      }`}
                    placeholder={`Enter your ${fieldLabels[field].toLowerCase()}`}
                    required
                  />
                  {showErrors && !form[field] && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {fieldLabels[field]} is required
                    </p>
                  )}
                </div>
              ))}

              <button
                onClick={() => {
                  const emptyFields = ["accountSid", "authToken", "whatsappNumber", "smsNumber"].filter(
                    (f) => !form[f]
                  );

                  if (emptyFields.length > 0) {
                    setShowErrors(true);
                    const firstInvalid = containerRef.current?.querySelector("input:invalid");
                    if (firstInvalid && typeof firstInvalid.reportValidity === "function") {
                      firstInvalid.reportValidity();
                    }
                    return;
                  }

                  handleSubmit();
                }}
                disabled={loading}
                className="w-full py-4 mt-8 rounded-xl text-white font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                style={{
                  backgroundColor: loading ? "#3f3f46" : "#bd7a0f",
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#d89012")}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = "#bd7a0f")}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Configuration...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Configuration
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-sm">
              Your credentials are encrypted and stored securely
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}