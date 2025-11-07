//src/components/multimediaCampaign/CampaignEditor.jsx
import React, { useState,useEffect } from "react";
import RecipientInput from "./RecipientInput";
import MessageComposer from "./MessageComposer";
import MediaUploader from "./MediaUploader";
import SchedulePicker from "./SchedulePicker";
import CampaignPreview from "./CampaignPreview";
import { useNavigate } from "react-router-dom";


export default function CampaignEditor({ channel = "sms" }) {
    const [recipients, setRecipients] = useState([]);
    const [message, setMessage] = useState("");
    const [mediaUrl, setMediaUrl] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

   const [credits, setCredits] = useState({ sms: 0, whatsapp: 0 });

useEffect(() => {
  const fetchCredits = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_VRI_URL}/api/users/credits`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // If backend responds HTML (login page/404) instead of JSON → avoid crash
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("❌ Invalid JSON in credit API response");
        return;
      }

      setCredits({
        sms: data.smsCredits || 0,
        whatsapp: data.whatsappCredits || 0,
      });

    } catch (err) {
      console.error("Credit fetch error", err);
    }
  };

  fetchCredits();
}, []);



    const handleSend = async () => {
        setIsSending(true);
        setError(null);
        setSuccess(false);

        const neededCredits = recipients.length;
const userCredits = channel === "sms" ? credits.sms : credits.whatsapp;

if (neededCredits > userCredits) {
  setIsSending(false);
  setError(`You don't have enough ${channel.toUpperCase()} credits`);
  return;
}


        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/multimedia-campaign/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
                channel,
                recipients,
                message,
                mediaUrl,
                schedule,
            }),
            });

            const data = await res.json();
            console.log("Response:", data);

            if (res.ok) {
            setSuccess(true);
            } else {
            setError(data.error || "Failed to send campaign");
            }
        } catch (err) {
            console.error("Error:", err);
            setError(err.message || "Request failed");
        } finally {
            setIsSending(false);
        }
    };


    return (
        <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-8">
            {/* Back Button */}
      <button
        onClick={() => navigate("/MultimediaCampaigns")}
        className="flex items-center gap-2 text-amber-400 text-sm font-medium hover:text-amber-300 transition-colors duration-200 mb-4 group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-950 via-black to-gray-950 rounded-3xl shadow-2xl shadow-amber-500/10 border border-amber-500/20 p-6 sm:p-8 lg:p-10 space-y-8">
                <div className="text-center space-y-2 pb-6 border-b border-amber-500/20">
                    <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent animate-fadeIn">
                        {channel.toUpperCase()} Campaign
                    </h2>
                    <p className="text-gray-500 text-sm">Create and launch your multimedia campaign</p>
                </div>

                <RecipientInput recipients={recipients} onChange={setRecipients} />

                <MessageComposer
                    channel={channel}
                    message={message}
                    onChange={setMessage}
                />

                {channel !== "sms" && (
                    <MediaUploader mediaUrl={mediaUrl} onChange={setMediaUrl} />
                )}

                <SchedulePicker value={schedule} onChange={setSchedule} />

                <CampaignPreview
                    recipients={recipients}
                    message={message}
                    mediaUrl={mediaUrl}
                    onSend={handleSend}
                    isSending={isSending}
                    error={error}
                    success={success}
                />
            </div>
        </div>
    );
}