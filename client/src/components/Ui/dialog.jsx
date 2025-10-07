import React from "react";

export function Dialog({ open, onOpenChange, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => onOpenChange(false)}>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}

export function DialogContent({ children, className = "" }) {
    return <div className={className}>{children}</div>;
}

export function DialogHeader({ children, className = "" }) {
    return <div className={`mb-3 ${className}`}>{children}</div>;
}

export function DialogTitle({ children, className = "" }) {
    return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
}
