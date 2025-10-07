import React from "react";

export function Card({ children, className = "" }) {
    return <div className={`bg-white dark:bg-gray-900 shadow-md rounded-xl p-4 ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = "" }) {
    return <div className={`mb-3 border-b pb-2 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
    return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
}

export function CardContent({ children, className = "" }) {
    return <div className={className}>{children}</div>;
}
