import React from "react";

export function Textarea({ value, onChange, placeholder = "", className = "", ...rest }) {
    return (
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
            {...rest}
        />
    );
}
