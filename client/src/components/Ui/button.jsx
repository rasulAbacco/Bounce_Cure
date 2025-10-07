import React from "react";

export function Button({ children, onClick, type = "button", disabled, variant = "default", size = "md", className = "" }) {
    const base = "inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
    const sizes = {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-3 text-base",
        icon: "p-2",
    };
    const variants = {
        default: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
        outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400",
        ghost: "text-gray-700 hover:bg-gray-100",
    };

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`${base} ${sizes[size]} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
        >
            {children}
        </button>
    );
}
