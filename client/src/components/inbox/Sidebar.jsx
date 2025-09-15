// frontend/src/components/Sidebar.jsx
import React from "react";

export default function Sidebar({ conversations, onSelect, selected }) {
    return (
        <div className="w-80 border-r bg-black">
            <div className="p-4 font-bold">Shared Inbox</div>
            <div className="overflow-auto h-[calc(100vh-64px)]">
                {conversations.map((c) => (
                    <div key={c.id}
                        onClick={() => onSelect(c)}
                        className={`p-3 border-b cursor-pointer ${selected?.id === c.id ? "bg-gray-100" : "hover:bg-gray-50"}`}>
                        <div className="text-sm font-medium">{c.subject}</div>
                        <div className="text-xs text-gray-500 truncate">{c.snippet}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
