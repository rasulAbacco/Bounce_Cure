// src/components/multimediaCampaign/SchedulePicker.jsx
import React from "react";

export default function SchedulePicker({ value, onChange }) {
    return (
        <div>
            <label className="font-semibold text-amber-400 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                Schedule (optional)
            </label>
            <input
                type="datetime-local"
                className="mt-3 p-4 border rounded-xl w-full bg-gradient-to-br from-gray-900 to-black border-amber-500/20 text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 hover:border-amber-500/30"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
