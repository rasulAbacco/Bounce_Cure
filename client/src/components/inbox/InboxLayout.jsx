import React, { useState } from 'react';
import Sidebar from './Sidebar';
import EmailList from './EmailList';
import EmailView from './EmailView';
import FilterBar from './FilterBar';

const InboxLayout = () => {
    const [selectedEmail, setSelectedEmail] = useState(null);

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1">
                <FilterBar />
                <div className="flex flex-1 overflow-hidden">
                    <EmailList setSelectedEmail={setSelectedEmail} />
                    <EmailView email={selectedEmail} />
                </div>
            </div>
        </div>
    );
};

export default InboxLayout;
