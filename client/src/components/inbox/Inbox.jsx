import React, { useEffect, useState } from "react";
import { api } from "../../api";
import Sidebar from "./Sidebar";
import ConversationPane from "./ConversationPane";
import { createSocket } from "../../sockets";
import AccountManager from "./AccountManager";

export default function Inbox() {
    const [conversations, setConversations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [socket, setSocket] = useState(null);
    const [view, setView] = useState("inbox");
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const currentUser = { userId: "user-1", userName: "Admin" };

    useEffect(() => {
        const s = createSocket(currentUser);
        setSocket(s);

        const savedAccountId = localStorage.getItem('selectedAccountId');
        if (savedAccountId) {
            // We'll fetch the account details in fetchAccounts
        }

        return () => {
            s.disconnect();
        };
    }, []);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await api.get("/accounts");
                const accounts = res.data;
                
                const savedAccountId = localStorage.getItem('selectedAccountId');
                if (savedAccountId && accounts.length > 0) {
                    const savedAccount = accounts.find(acc => acc.id === parseInt(savedAccountId));
                    if (savedAccount) {
                        setSelectedAccount(savedAccount);
                        return;
                    }
                }
                
                if (accounts.length > 0 && !selectedAccount) {
                    setSelectedAccount(accounts[0]);
                }
            } catch (err) {
                console.error("Error fetching accounts:", err);
            }
        };
        
        if (initialLoad) {
            fetchAccounts();
            setInitialLoad(false);
        }
    }, [initialLoad, selectedAccount]);

    useEffect(() => {
        if (selectedAccount) {
            localStorage.setItem('selectedAccountId', selectedAccount.id.toString());
        } else {
            localStorage.removeItem('selectedAccountId');
        }
    }, [selectedAccount]);

    async function fetchConvs() {
        if (!selectedAccount) return;
        
        setLoading(true);
        try {
            const res = await api.get(`/emails?accountId=${selectedAccount.id}`);
            const emailsAsConversations = res.data.map(email => ({
                id: email.id,
                subject: email.subject,
                snippet: email.body.substring(0, 100) + (email.body.length > 100 ? "..." : ""),
                email: email,
                accountId: selectedAccount.id,
                accountEmail: selectedAccount.email
            }));
            
            emailsAsConversations.sort((a, b) => new Date(b.email.date) - new Date(a.email.date));
            setConversations(emailsAsConversations);
        } catch (err) {
            console.error("Error fetching conversations", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (view === "inbox" && selectedAccount) {
            fetchConvs();
            setSelected(null);
        }
    }, [selectedAccount, view]);

    const handleAccountSelected = (account, shouldNavigate = false) => {
        setSelectedAccount(account);
        if (shouldNavigate) {
            setView("inbox");
        }
    };

    const handleAccountAdded = () => {
        // Account added logic
    };

    const emailToConversation = (email) => {
        if (!email) return null;
        
        return {
            id: email.id,
            subject: email.subject,
            email: email.from,
            messages: [{
                id: email.id,
                messageId: email.messageId,
                fromName: email.from,
                body: email.body,
                createdAt: email.date,
            }],
            notes: [],
            assignee: null,
        };
    };

    const handleSelectConversation = (conversation) => {
        setSelected(conversation);
    };

    // Handle page refresh
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Top nav bar */}
            <nav className="flex items-center justify-between bg-gray-800 text-white px-6 py-3 shadow-md">
                <div className="font-bold text-lg">
                    Inbox {selectedAccount ? `- ${selectedAccount.email}` : ''}
                </div>
                
                <div className="flex items-center space-x-4">
                    <button
                        className={`px-4 py-2 rounded-md transition-colors ${
                            view === "inbox" 
                                ? "bg-blue-600 hover:bg-blue-700" 
                                : "bg-gray-700 hover:bg-gray-600"
                        }`}
                        onClick={() => {
                            setView("inbox");
                            setSelected(null);
                        }}
                    >
                        Conversations
                    </button>
                    
                    <button
                        className={`px-4 py-2 rounded-md transition-colors ${
                            view === "accounts" 
                                ? "bg-blue-600 hover:bg-blue-700" 
                                : "bg-gray-700 hover:bg-gray-600"
                        }`}
                        onClick={() => setView("accounts")}
                    >
                        Accounts
                    </button>
                    
                    {/* Refresh button - always visible */}
                    <button
                        className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 flex items-center transition-colors"
                        onClick={handleRefresh}
                        title="Refresh page"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5 mr-2" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                        >
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        Refresh
                    </button>
                </div>
            </nav>

            {/* Main content area */}
            <div className="flex flex-1 overflow-hidden">
                {view === "inbox" ? (
                    <>
                        <Sidebar
                            conversations={conversations}
                            selected={selected}
                            onSelect={handleSelectConversation}
                            refreshConversations={fetchConvs}
                            loading={loading}
                        />

                        <ConversationPane
                            conversation={selected ? emailToConversation(selected.email) : null}
                            socket={socket}
                            currentUser={currentUser}
                            refresh={fetchConvs}
                        />
                    </>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                       <AccountManager 
                            onAccountSelected={handleAccountSelected}
                            onAccountAdded={handleAccountAdded}
                            currentSelectedAccount={selectedAccount}
                        />

                    </div>
                )}
            </div>
        </div>
    );
}