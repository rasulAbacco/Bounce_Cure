import React, { useEffect, useState } from 'react';
import EmailItem from './EmailItem';
import Loading from './Loading';
import EmptyState from './EmptyState';
import { getEmails } from '../../services/emailApi';

const EmailList = ({ setSelectedEmail }) => {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getEmails().then((data) => {
            setEmails(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <Loading />;
    if (emails.length === 0) return <EmptyState message="No emails found." />;

    return (
        <div className="w-1/2 border-r border-zinc-700 overflow-y-auto">
            {emails.map((email) => (
                <EmailItem
                    key={email.id}
                    email={email}
                    onClick={() => setSelectedEmail(email)}
                />
            ))}
        </div>
    );
};

export default EmailList;
