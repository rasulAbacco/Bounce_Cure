// client/src/components/inbox/Inbox.jsx
import React, { useEffect, useState } from "react";
import { api } from "../../api";
import Sidebar from "./Sidebar";
import ConversationPane from "./ConversationPane";
import { createSocket } from "../../sockets";
import AccountManager from "./AccountManager";
import InboxSidebar from "../../pages/ContactManagement/pages/InboxSidebar"; // ✅ New sidebar panel

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
        return () => s.disconnect();
    }, []);

    // ✅ Load accounts
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await api.get("/accounts");
                const accounts = res.data;
                const savedAccountId = localStorage.getItem("selectedAccountId");
                if (savedAccountId && accounts.length > 0) {
                    const savedAccount = accounts.find(
                        (acc) => acc.id === parseInt(savedAccountId)
                    );
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
            } finally {
                setInitialLoad(false);
            }
        };
        if (initialLoad) fetchAccounts();
    }, [initialLoad, selectedAccount]);

    // ✅ Persist selected account
    useEffect(() => {
        if (selectedAccount) {
            localStorage.setItem("selectedAccountId", selectedAccount.id.toString());
        } else {
            localStorage.removeItem("selectedAccountId");
        }
    }, [selectedAccount]);

    // ✅ Fetch emails
    async function fetchConvs() {
        if (!selectedAccount) return;
        setLoading(true);
        try {
            const res = await api.get(`/emails?accountId=${selectedAccount.id}`);
            const emailsAsConversations = res.data.map((email) => ({
                id: email.id,
                subject: email.subject || "(No Subject)",
                snippet:
                    email.body?.substring(0, 100) +
                    (email.body?.length > 100 ? "..." : ""),
                email,
                accountId: selectedAccount.id,
                accountEmail: selectedAccount.email,
            }));

            emailsAsConversations.sort(
                (a, b) => new Date(b.email.date) - new Date(a.email.date)
            );
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
        if (shouldNavigate) setView("inbox");
    };

    const handleAccountAdded = () => {
        fetchConvs();
    };

    const handleSelectConversation = (conversation) => {
        setSelected(conversation);
    };

    const handleRefresh = () => {
        fetchConvs();
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Navbar */}
            <nav className="flex items-center justify-between bg-gray-800 text-white px-6 py-3 shadow-md">
                <div className="font-bold text-lg">
                    Inbox {selectedAccount ? `- ${selectedAccount.email}` : ""}
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        className={`px-4 py-2 rounded-md transition-colors ${view === "inbox"
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
                        className={`px-4 py-2 rounded-md transition-colors ${view === "accounts"
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-gray-700 hover:bg-gray-600"
                            }`}
                        onClick={() => setView("accounts")}
                    >
                        Accounts
                    </button>

                    <button
                        className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 flex items-center transition-colors"
                        onClick={handleRefresh}
                        title="Refresh emails"
                    >
                        🔄 Refresh
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

                        {/* Center: Conversation view */}
                        <div className="flex flex-1">
                            <ConversationPane
                                conversation={
                                    selected ? selected.email : null
                                }
                                socket={socket}
                                currentUser={currentUser}
                                refresh={fetchConvs}
                            />

                            {/* Right Sidebar – lead/contact info */}
                            <InboxSidebar
                                email={selected?.email}
                                userId={currentUser.userId}
                            />
                        </div>
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
