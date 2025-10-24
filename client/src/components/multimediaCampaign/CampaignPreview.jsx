// src/components/multimediaCampaign/CampaignPreview.jsx
import React from "react";

export default function CampaignPreview({
    recipients,
    message,
    mediaUrl,
    onSend,
    isSending,
    error,
    success,
}) {
    return (
        <div className="border-t border-amber-500/20 pt-6 space-y-4">
            <h3 className="font-bold text-xl text-amber-400 flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></span>
                Campaign Preview
            </h3>
            <div className="bg-gradient-to-br from-gray-900 to-black p-5 rounded-xl border border-amber-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
                <p className="text-sm text-white whitespace-pre-wrap relative z-10">{message || "Your message will appear here..."}</p>
                {mediaUrl && (
                    <div className="mt-4 relative z-10">
                        <img src={mediaUrl} alt="media" className="rounded-xl max-h-52 border border-amber-500/30" />
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 rounded-xl animate-fadeIn">
                    <span className="font-semibold">⚠️ Error:</span> {error}
                </div>
            )}

            {success && (
                <div className="bg-green-900/20 border border-green-500/50 text-green-400 p-4 rounded-xl animate-fadeIn">
                    <span className="font-semibold">✓ Success:</span> Message queued successfully!
                </div>
            )}

            <button
                onClick={onSend}
                disabled={isSending || recipients.length === 0 || !message}
                className={`w-full px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 relative overflow-hidden group ${isSending || recipients.length === 0 || !message
                        ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-amber-600 to-amber-500 text-black hover:shadow-2xl hover:shadow-amber-500/50 hover:scale-[1.02]"
                    }`}
            >
                {isSending ? (
                    <span className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                        Sending Campaign...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        🚀 Send Campaign
                    </span>
                )}
            </button>
        </div>
    );
}