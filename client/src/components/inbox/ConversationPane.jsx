// frontend/src/components/ConversationPane.jsx
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../api";

export default function ConversationPane({
  conversation,
  socket,
  currentUser,
  refresh,
}) {
  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [note, setNote] = useState("");
  const [viewers, setViewers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Fetch conversation data
  const fetchConversation = useCallback(async () => {
    if (!conversation) return;
    try {
      console.log("Fetching conversation with ID:", conversation.id);
      const res = await api.get(`/conversations/${conversation.id}`);
      setConv(res.data);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Failed to fetch conversation:", err);
      setConv(null);
      setMessages([]);
    }
  }, [conversation]);

  useEffect(() => {
    if (!conversation) {
      setConv(null);
      setMessages([]);
      return;
    }
    fetchConversation();

    socket.emit("join_conversation", { conversationId: conversation.id });

    return () => {
      socket.emit("leave_conversation", { conversationId: conversation.id });
    };
  }, [conversation, fetchConversation, socket]);

  // Setup socket listeners
  useEffect(() => {
    if (!conversation) return;

    const handleMessage = (msg) => {
      console.log("Received message:", msg);
      if (msg.conversationId === conversation.id) {
        setMessages((prev) => {
          if (prev.find((m) => m.messageId === msg.messageId)) {
            return prev; // skip duplicate
          }
          return [...prev, msg];
        });
      }
    };

    const handleNote = (n) => {
      setConv((prev) => ({
        ...prev,
        notes: [...(prev?.notes || []), n],
      }));
    };

    const handleViewers = (v) => setViewers(v);

    const handleTyping = ({ userId, userName, typing }) => {
      setTypingUsers((prev) => {
        const filtered = prev.filter((u) => u.userId !== userId);
        if (typing) {
          filtered.push({ userId, userName });
        }
        return filtered;
      });
    };

    socket.on("message", handleMessage);
    socket.on("note", handleNote);
    socket.on("viewers", handleViewers);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("message", handleMessage);
      socket.off("note", handleNote);
      socket.off("viewers", handleViewers);
      socket.off("typing", handleTyping);
    };
  }, [conversation, socket]);

  const sendNote = () => {
    if (!note.trim()) return;
    socket.emit("add_note", { conversationId: conversation.id, body: note });
    setNote("");
  };

  // This is where you add the sendMessage function
// frontend/src/components/ConversationPane.jsx

const sendMessage = async (body, inReplyTo = null, toEmail = null) => {
    if (!body.trim()) return;
    
    setIsSending(true);
    try {
      // Determine the recipient - use toEmail if provided, otherwise use the original sender
      const recipient = toEmail || replyingTo?.fromName || conv?.messages?.[0]?.fromName;
      
      // Get the user's email - try different possible locations
      const userEmail = currentUser?.email || currentUser?.userName || currentUser?.userEmail;
      
      console.log("Sending reply to:", recipient);
      console.log("Sending reply from:", userEmail); // Log the sender
      console.log("Current user object:", currentUser); // Log the entire user object
      
      // First, send via socket for real-time updates
      socket.emit("send_message", {
        conversationId: conversation.id,
        body,
        fromName: currentUser?.userName || currentUser?.name || "User",
        fromEmail: userEmail, // Use the user's email
        toEmail: recipient, // Send to the original sender
        inReplyTo
      });

      // Then, make API call to persist the reply
      const response = await api.post(`/conversations/${conversation.id}/reply`, {
        body,
        fromName: currentUser?.userName || currentUser?.name || "User",
        fromEmail: userEmail, // Use the user's email
        toEmail: recipient, // Send to the original sender
        inReplyTo
      });

      // Add the new message to the state
      setMessages(prev => [...prev, response.data]);
      
      // Reset reply state
      setIsReplyOpen(false);
      setReplyingTo(null);
      setReplyContent("");
    } catch (err) {
      console.error("Failed to send reply:", err);
    } finally {
      setIsSending(false);
    }
};

  const handleReplyClick = (message) => {
    setReplyingTo(message);
    setIsReplyOpen(true);
    setReplyContent("");
  };

  const handleSendReply = () => {
    if (replyContent.trim()) {
      // Get the email address of the person we're replying to
      const toEmail = replyingTo?.fromName;
      sendMessage(replyContent, replyingTo?.messageId, toEmail);
    }
  };

  const handleCancelReply = () => {
    setIsReplyOpen(false);
    setReplyingTo(null);
    setReplyContent("");
  };

  // Function to render HTML content safely
  const renderHTMLContent = (html) => {
    return { __html: html };
  };

  if (!conversation) {
    return (
      <div className="flex-1 p-8 bg-black text-white">
        Select a conversation
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black text-white min-h-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-black">
        <div>
          <div className="font-bold text-lg">{conv?.subject}</div>
        </div>
        <div className="mt-2 sm:mt-0 text-xs text-gray-500">
          Viewers:{" "}
          {viewers.length ? viewers.map((v) => v.userName).join(", ") : "None"}
        </div>
      </div>

      {/* Messages in Email Style */}
      <div className="flex-1 overflow-auto p-6 space-y-6 bg-black">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-6xl mx-auto ${m.isReply ? 'ml-8 border-l-4 border-l-blue-500' : ''}`}
          >
            <div className="mb-4">
              <div className="text-sm text-gray-400">From: {m.fromName}</div>
              <div className="text-sm text-gray-400">
                Date: {new Date(m.createdAt).toLocaleString()}
              </div>
            </div>
            
            {/* Render HTML content safely */}
            <div 
              className="text-gray-100 whitespace-pre-wrap"
              dangerouslySetInnerHTML={renderHTMLContent(m.body)}
            />
            
            {/* Reply button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => handleReplyClick(m)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
              >
                Reply
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Box */}
      {isReplyOpen && (
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="mb-2 text-sm text-gray-300">
            Replying to: {replyingTo?.fromName}
          </div>
          <div className="flex flex-col gap-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Type your reply..."
              className="flex-1 p-3 border border-gray-600 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  handleSendReply();
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelReply}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                disabled={isSending}
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center"
                disabled={isSending || !replyContent.trim()}
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Typing Indicator */}
      <div className="p-2 text-xs text-gray-400">
        {typingUsers.length
          ? `${typingUsers.map((u) => u.userName).join(", ")} typing...`
          : ""}
      </div>

      {/* Message Input */}
      {!isReplyOpen && (
        <div className="p-4 border-t border-gray-700 bg-black">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a message"
              className="flex-1 p-2 border border-gray-600 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // For new messages, reply to the original sender
                  const originalSender = conv?.messages?.[0]?.fromName;
                  sendMessage(e.target.value, null, originalSender);
                  e.target.value = "";
                }
              }}
            />
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              onClick={() => {
                const input = document.querySelector(
                  'input[placeholder="Type a message"]'
                );
                if (input.value.trim()) {
                  // For new messages, reply to the original sender
                  const originalSender = conv?.messages?.[0]?.fromName;
                  sendMessage(input.value, null, originalSender);
                  input.value = "";
                }
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}