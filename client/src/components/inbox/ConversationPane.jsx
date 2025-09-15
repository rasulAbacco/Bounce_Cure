// frontend/src/components/ConversationPane.jsx
import React, { useEffect, useState } from "react";
import { api } from "../../api";

export default function ConversationPane({ conversation, socket, currentUser, refresh }) {
    const [conv, setConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [note, setNote] = useState("");
    const [viewers, setViewers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);

    useEffect(() => {
        if (!conversation) { setConv(null); setMessages([]); return; }
        (async () => {
            const res = await api.get(`/conversations/${conversation.id}`);
            setConv(res.data);
            setMessages(res.data.messages || []);
            // join socket room
            socket.emit("join_conversation", { conversationId: conversation.id });
        })();

        socket.on("message", (msg) => {
            if (msg.conversationId === conversation.id) setMessages(prev => [...prev, msg]);
        });
        socket.on("note", (n) => setConv(prev => ({ ...prev, notes: [...(prev?.notes || []), n] })));
        socket.on("viewers", (v) => setViewers(v));
        socket.on("typing", ({ userId, userName, typing }) => {
            setTypingUsers(prev => {
                const copy = prev.filter(u => u.userId !== userId);
                if (typing) copy.push({ userId, userName });
                return copy;
            });
        });

        return () => {
            socket.emit("leave_conversation", { conversationId: conversation.id });
            socket.off("message");
            socket.off("note");
            socket.off("viewers");
            socket.off("typing");
        };
    }, [conversation?.id, socket]);

    const sendNote = () => {
        if (!note.trim()) return;
        socket.emit("add_note", { conversationId: conversation.id, body: note });
        setNote("");
    };

    const sendMessage = (body) => {
        socket.emit("send_message", { conversationId: conversation.id, body, fromName: currentUser.userName, fromEmail: currentUser.userName });
    };

    if (!conversation) {
        return <div className="flex-1 p-8 bg-black">Select a conversation</div>;
    }

    return (
        <div className="flex-1 flex flex-col bg-black">
            <div className="p-4 border-b flex items-center justify-between bg-black">
                <div className="bg-black">
                    <div className="font-semibold">{conv?.subject}</div>
                    <div className="text-xs text-gray-500">{(conv?.assignee ? `Assigned to ${conv.assignee}` : "Unassigned")}</div>
                </div>
                <div className="text-sm text-gray-600">
                    Viewers: {viewers.map(v => v.userName).join(", ")}
                </div>
            </div>

            <div className="flex-1 p-4 overflow-auto bg-black">
                {messages.map(m => (
                    <div key={m.id} className="mb-4">
                        <div className="text-xs text-gray-500">{m.fromName} • {new Date(m.createdAt).toLocaleString()}</div>
                        <div className="bg-white p-3 rounded shadow-sm mt-1">{m.body}</div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t">
                <div className="mb-2 text-xs text-gray-500">{typingUsers.length ? `${typingUsers.map(u => u.userName).join(", ")} typing...` : ""}</div>
                <div className="flex gap-2">
                    <input type="text" placeholder="Type a message" className="flex-1 p-2 border rounded" onKeyDown={(e) => {
                        socket.emit("typing", { conversationId: conversation.id, typing: true });
                        if (e.key === "Enter") { sendMessage(e.target.value); e.target.value = ""; socket.emit("typing", { conversationId: conversation.id, typing: false }); }
                    }} />
                    <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => {
                        const input = document.querySelector('input[placeholder="Type a message"]');
                        if (input.value) { sendMessage(input.value); input.value = ""; socket.emit("typing", { conversationId: conversation.id, typing: false }); }
                    }}>Send</button>
                </div>

                <div className="mt-3">
                    <textarea placeholder="Internal note" value={note} onChange={(e) => setNote(e.target.value)} className="w-full p-2 border rounded" />
                    <div className="flex justify-end mt-2">
                        <button onClick={sendNote} className="px-3 py-1 bg-gray-800 text-white rounded">Add Note</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
