import React from 'react';

const EmailItem = ({ email, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="p-4 border-b border-zinc-700 hover:bg-zinc-700 cursor-pointer"
        >
            <div className="flex justify-between">
                <strong>{email.from}</strong>
                <span className="text-sm">{new Date(email.date).toLocaleString()}</span>
            </div>
            <p className="text-md">{email.subject}</p>
            <p className="text-sm text-zinc-400 truncate">{email.body}</p>
        </div>
    );
};

export default EmailItem;
