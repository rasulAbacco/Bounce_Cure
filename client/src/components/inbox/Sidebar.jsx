import React from 'react';

const Sidebar = () => {
    return (
        <div className="w-60 bg-zinc-800 p-4 space-y-4">
            <h2 className="text-xl font-bold mb-4">Folders</h2>
            <ul className="space-y-2">
                <li className="hover:text-blue-400 cursor-pointer">📥 Inbox</li>
                <li className="hover:text-blue-400 cursor-pointer">📤 Sent</li>
                <li className="hover:text-blue-400 cursor-pointer">⚠️ Bounced</li>
                <li className="hover:text-blue-400 cursor-pointer">🏷️ Tags</li>
            </ul>
        </div>
    );
};

export default Sidebar;
