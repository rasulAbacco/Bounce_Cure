import React from 'react';

const EmailView = ({ email }) => {
    if (!email) {
        return (
            <div className="w-1/2 p-4">
                <p>Select an email to view its content.</p>
            </div>
        );
    }

    return (
        <div className="w-1/2 p-6 overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-2">{email.subject}</h2>
            <div className="text-sm text-zinc-400 mb-4">
                From: {email.from} | To: {email.to}
            </div>
            <div className="mb-4">{email.body}</div>
        </div>
    );
};

export default EmailView;
