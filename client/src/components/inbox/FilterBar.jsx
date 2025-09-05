import React from 'react';

const FilterBar = () => {
    return (
        <div className="bg-zinc-800 p-3 flex items-center justify-between border-b border-zinc-700">
            <input
                type="text"
                placeholder="Search emails..."
                className="p-2 bg-zinc-700 rounded-md w-1/3 text-sm text-white"
            />

            <div className="flex items-center gap-3">
                <select className="bg-zinc-700 p-2 text-white rounded-md text-sm">
                    <option>All Tags</option>
                    <option>Lead</option>
                    <option>Marketing</option>
                </select>
                <select className="bg-zinc-700 p-2 text-white rounded-md text-sm">
                    <option>Status</option>
                    <option>Sent</option>
                    <option>Opened</option>
                    <option>Bounced</option>
                </select>
            </div>
        </div>
    );
};

export default FilterBar;
