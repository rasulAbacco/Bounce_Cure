import React from "react";

const Header = () => {
    return (
        <header className="h-14 bg-white border-b flex items-center justify-between px-6 shadow-sm">
            <h1 className="text-lg font-bold text-gray-800">Campaign Template Editor</h1>
            <div className="flex items-center gap-4">
                {/* Placeholder for user profile / notifications */}
                <span className="text-sm text-gray-500">Hello, User</span>
                <img
                    src="https://via.placeholder.com/32"
                    alt="User"
                    className="w-8 h-8 rounded-full"
                />
            </div>
        </header>
    );
};

export default Header;
