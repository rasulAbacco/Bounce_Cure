// src/components/multimediaCampaign/MessageComposer.jsx
import React from "react";
export default function MessageComposer({ channel, message, onChange }) {
    const charCount = message.length;
    const segmentSize = 160;
    const segments = Math.ceil(charCount / segmentSize);

    return (
        <div className="group">
            <label className="font-semibold text-amber-400 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                Message
            </label>
            <textarea
                className="w-full mt-3 p-4 bg-gradient-to-br from-gray-900 to-black border border-amber-500/20 rounded-xl h-44 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 resize-none hover:border-amber-500/30"
                placeholder={`Craft your ${channel.toUpperCase()} message here...`}
                value={message}
                onChange={(e) => onChange(e.target.value)}
            />
            <div className="flex justify-between items-center mt-2 text-xs">
                <span className="text-gray-400">
                    <span className="text-amber-400 font-bold">{charCount}</span> characters
                </span>
                {channel === "sms" && (
                    <span className="text-gray-400">
                        ≈ <span className="text-amber-400 font-bold">{segments}</span> SMS segments
                    </span>
                )}
            </div>
        </div>
    );
}