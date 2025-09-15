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
    const currentUser = { userId: "user-1", userName: "Admin" }; // replace with real auth

    useEffect(() => {
        const s = createSocket(currentUser);
        setSocket(s);

        s.on("conversation_updated", () => fetchConvs());
        s.on("conversation_assigned", () => fetchConvs());
        s.on("message", (msg) => {
            if (!selected || msg.conversationId !== selected.id) {
                // optionally show badge/unread
            }
            fetchConvs();
        });

        return () => s.disconnect();
    }, []);

    async function fetchConvs() {
        try {
            const res = await api.get("/conversations");
            setConversations(res.data);
        } catch (err) {
            console.error("Error fetching conversations", err);
        }
    }

    useEffect(() => {
        if (view === "inbox") {
            fetchConvs();
        }
    }, [view]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Top nav bar */}
            <nav className="flex items-center justify-between bg-gray-800 text-white px-4 py-2">
                <div className="font-bold">Inbox</div>
                <div className="space-x-4">
                    <button
                        className={`px-3 py-1 rounded ${view === "inbox" ? "bg-blue-600" : "bg-gray-700"
                            }`}
                        onClick={() => setView("inbox")}
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
                            onSelect={setSelected}
                            selected={selected}
                        />
                        <ConversationPane
                            conversation={selected}
                            socket={socket}
                            currentUser={currentUser}
                            refresh={fetchConvs}
                        />
                    </>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <AccountManager /> {/* 👈 embed account manager here */}
                    </div>
                )}
            </div>
        </div>
    );
}
