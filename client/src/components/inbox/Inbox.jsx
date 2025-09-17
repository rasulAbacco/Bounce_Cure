import React, { useEffect, useState } from "react";
import { api } from "../../api";
import Sidebar from "./Sidebar";
import ConversationPane from "./ConversationPane";
import { createSocket } from "../../sockets";
import AccountManager from "./AccountManager"; // 👈 import the component

export default function Inbox() {
    const [conversations, setConversations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [socket, setSocket] = useState(null);
    const [view, setView] = useState("inbox"); // 👈 toggle between inbox & accounts
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const currentUser = { userId: "user-1", userName: "Admin" }; // replace with real auth

    useEffect(() => {
        const s = createSocket(currentUser);
        setSocket(s);

        // Load the initial selected account from localStorage if available
        const savedAccountId = localStorage.getItem('selectedAccountId');
        if (savedAccountId) {
            // We'll fetch the account details in fetchAccounts
        }

        return () => {
            s.disconnect();
        };
    }, []);

    // Fetch accounts to restore the selected account
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await api.get("/accounts");
                const accounts = res.data;
                
                // Try to restore the selected account from localStorage
                const savedAccountId = localStorage.getItem('selectedAccountId');
                if (savedAccountId && accounts.length > 0) {
                    const savedAccount = accounts.find(acc => acc.id === parseInt(savedAccountId));
                    if (savedAccount) {
                        setSelectedAccount(savedAccount);
                        return;
                    }
                }
                
                // If no saved account or it wasn't found, select the first one
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

    // Save selected account to localStorage when it changes
    useEffect(() => {
        if (selectedAccount) {
            localStorage.setItem('selectedAccountId', selectedAccount.id.toString());
        } else {
            localStorage.removeItem('selectedAccountId');
        }
    }, [selectedAccount]);

    // Fetch conversations/emails for the selected account
    async function fetchConvs() {
        if (!selectedAccount) return;
        
        setLoading(true);
        try {
            // Get emails from the selected account
            const res = await api.get(`/emails?accountId=${selectedAccount.id}`);
            // Convert emails to conversation format
            const emailsAsConversations = res.data.map(email => ({
                id: email.id,
                subject: email.subject,
                snippet: email.body.substring(0, 100) + (email.body.length > 100 ? "..." : ""),
                email: email,
                accountId: selectedAccount.id,
                accountEmail: selectedAccount.email
            }));
            
            // Sort by date (newest first)
            emailsAsConversations.sort((a, b) => new Date(b.email.date) - new Date(a.email.date));
            setConversations(emailsAsConversations);
        } catch (err) {
            console.error("Error fetching conversations", err);
        } finally {
            setLoading(false);
        }
    }

    // Fetch conversations when selected account changes and when switching to inbox view
    useEffect(() => {
        if (view === "inbox" && selectedAccount) {
            fetchConvs();
            // Clear the selected conversation when account changes
            setSelected(null);
        }
    }, [selectedAccount, view]);

    // Handle account selection
    const handleAccountSelected = (account, shouldNavigate = false) => {
        setSelectedAccount(account);
        // If shouldNavigate is true, switch to inbox view
        if (shouldNavigate) {
            setView("inbox");
        }
    };

    // Handle account added
    const handleAccountAdded = () => {
        // This will be called after an account is added
        // The account selection is already handled in handleAccountSelected
    };

    // Convert email to conversation format for ConversationPane
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

    // Handle selecting a conversation
    const handleSelectConversation = (conversation) => {
        setSelected(conversation);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Top nav bar */}
            <nav className="flex items-center justify-between bg-gray-800 text-white px-4 py-2">
                <div className="font-bold">
                    Inbox {selectedAccount ? `- ${selectedAccount.email}` : ''}
                </div>
                <div className="space-x-4">
                    <button
                        className={`px-3 py-1 rounded ${view === "inbox" ? "bg-blue-600" : "bg-gray-700"
                            }`}
                        onClick={() => {
                            setView("inbox");
                            // Clear selected conversation when switching to inbox view
                            setSelected(null);
                        }}
                    >
                        Conversations
                    </button>
                    <button
                        className={`px-3 py-1 rounded ${view === "accounts" ? "bg-blue-600" : "bg-gray-700"
                            }`}
                        onClick={() => setView("accounts")}
                    >
                        Accounts
                    </button>
                </div>
            </nav>

            {/* Main content area */}
            <div className="flex flex-1">
                {view === "inbox" ? (
                    <>
                        <Sidebar
                            conversations={conversations}
                            selected={selected}
                            onSelect={handleSelectConversation}
                            refreshConversations={fetchConvs} // 👈 Add this prop
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
                        /> {/* 👈 embed account manager here */}
                    </div>
                )}
            </div>
        </div>
    );
}