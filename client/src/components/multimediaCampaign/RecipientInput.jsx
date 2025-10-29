import React, { useState } from "react";

// RecipientInput Component
function RecipientInput({ recipients, onChange }) {
    const [rawInput, setRawInput] = useState("");
 
    const parseNumbers = (text) => {
        const nums = text
            .split(/[\n,; ]+/)
            .map((n) => n.trim())
            .filter(Boolean)
            .map((n) => (n.startsWith("+") ? n : `+91${n}`));
        onChange(Array.from(new Set(nums)));
    };

    return (
        <div className="group">
            <label className="font-semibold text-amber-400 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                Recipients
            </label>
            <textarea
                className="w-full mt-3 p-4 bg-gradient-to-br from-gray-900 to-black border border-amber-500/20 rounded-xl h-28 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 resize-none hover:border-amber-500/30"
                placeholder="Enter numbers separated by commas or new lines..."
                value={rawInput}
                onChange={(e) => {
                    setRawInput(e.target.value);
                    parseNumbers(e.target.value);
                }}
            />
            <div className="flex items-center gap-2 mt-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
                <p className="text-xs text-gray-400 px-2">
                    <span className="text-amber-400 font-bold">{recipients.length}</span> recipients parsed
                </p>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
            </div>
        </div>
    );
}

export default RecipientInput;