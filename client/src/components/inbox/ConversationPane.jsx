// frontend/src/components/ConversationPane.jsx
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../api";
import EmojiPicker from 'emoji-picker-react';

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
  
  // Forward state
  const [isForwardOpen, setIsForwardOpen] = useState(false);
  const [forwardContent, setForwardContent] = useState("");
  const [forwardTo, setForwardTo] = useState("");
  const [forwardingMessage, setForwardingMessage] = useState(null);
  
  // Emoji picker state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeTextArea, setActiveTextArea] = useState(null);

  // Get the sender email from the conversation's account
  const getSenderEmail = useCallback(() => {
    // First try to get email from the conversation's account
    if (conv?.account?.email) {
      return conv.account.email;
    }
    
    // Fallback to localStorage
    const emailFromStorage = localStorage.getItem('userEmail');
    if (emailFromStorage) {
      return emailFromStorage;
    }
    
    // Last resort: try currentUser
    return currentUser?.email || currentUser?.userEmail;
  }, [conv, currentUser]);

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

  const sendMessage = async (body, inReplyTo = null, toEmail = null) => {
    if (!body.trim()) return;
    
    // Get the sender email from the conversation's account
    const senderEmail = getSenderEmail();
    
    if (!senderEmail) {
      console.error("No sender email available");
      alert("Cannot send message: No sender email available. Please select an account.");
      return;
    }
    
    setIsSending(true);
    try {
      const userName = currentUser?.userName || currentUser?.name || senderEmail.split('@')[0];
      
      console.log("Sending message to:", toEmail);
      console.log("Sending message from:", senderEmail);
      console.log("Using account:", conv?.account);
      
      // First, send via socket for real-time updates
      socket.emit("send_message", {
        conversationId: conversation.id,
        body,
        fromName: userName,
        fromEmail: senderEmail,
        toEmail: toEmail,
        inReplyTo
      });

      // Then, make API call to persist the message
      const response = await api.post(`/conversations/${conversation.id}/reply`, {
        body,
        fromName: userName,
        fromEmail: senderEmail,
        toEmail: toEmail,
        inReplyTo
      });

      // Check if message was sent successfully
      if (response.data.status === 'failed') {
        throw new Error('Message failed to send. Check your email configuration.');
      }

      // Add the new message to the state
      setMessages(prev => [...prev, response.data]);
      
      // Reset states
      setIsReplyOpen(false);
      setIsForwardOpen(false);
      setReplyingTo(null);
      setReplyContent("");
      setForwardContent("");
      setForwardTo("");
      setForwardingMessage(null);
    } catch (err) {
      console.error("Failed to send message:", err);
      
      // Display a more detailed error message
      let errorMessage = "Failed to send message.";
      
      if (err.response) {
        console.error("Error response data:", err.response.data);
        errorMessage += ` Server error: ${err.response.data.error || err.response.status}`;
        
        if (err.response.data.details) {
          errorMessage += ` - ${err.response.data.details}`;
        }
      } else if (err.request) {
        errorMessage += " No response from server.";
      } else {
        errorMessage += ` ${err.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleReplyClick = (message) => {
    // Get the sender email from the conversation's account
    const senderEmail = getSenderEmail();
    
    if (!senderEmail) {
      console.error("No sender email available");
      alert("Cannot reply: No sender email available. Please select an account.");
      return;
    }
    
    setReplyingTo(message);
    setIsReplyOpen(true);
    setIsForwardOpen(false);
    setReplyContent("");
    setShowEmojiPicker(false);
  };

const handleSendReply = () => {
  if (replyContent.trim()) {
    const originalMessage = messages.find(m => m.isOriginal) || messages[0];
    const toEmail = originalMessage.fromName || originalMessage.from || originalMessage.email; 
    sendMessage(replyContent, replyingTo?.messageId, toEmail);
  }
};


  const handleCancelReply = () => {
    setIsReplyOpen(false);
    setReplyingTo(null);
    setReplyContent("");
    setShowEmojiPicker(false);
  };

  // Forward functionality
  const handleForwardClick = (message) => {
    // Get the sender email from the conversation's account
    const senderEmail = getSenderEmail();
    
    if (!senderEmail) {
      console.error("No sender email available");
      alert("Cannot forward: No sender email available. Please select an account.");
      return;
    }
    
    setForwardingMessage(message);
    setIsForwardOpen(true);
    setIsReplyOpen(false);
    setForwardContent(`\n\n---------- Forwarded message ---------\nFrom: ${message.from}\nDate: ${new Date(message.createdAt).toLocaleString()}\nSubject: ${conv?.subject}\n\n${message.body}\n---------- End of forwarded message ---------\n`);
    setForwardTo("");
    setShowEmojiPicker(false);
  };

  const handleSendForward = async () => {
    if (!forwardContent.trim() || !forwardTo.trim()) return;
    
    setIsSending(true);
    try {
      const senderEmail = getSenderEmail();
      const userName = currentUser?.userName || currentUser?.name || senderEmail.split('@')[0];
      
      // Send via socket
      socket.emit("send_message", {
        conversationId: conversation.id,
        body: forwardContent,
        fromName: userName,
        fromEmail: senderEmail,
        toEmail: forwardTo,
        inReplyTo: null
      });

      // Make API call
      const response = await api.post(`/conversations/${conversation.id}/reply`, {
        body: forwardContent,
        fromName: userName,
        fromEmail: senderEmail,
        toEmail: forwardTo,
        inReplyTo: null
      });

      // Check if message was sent successfully
      if (response.data.status === 'failed') {
        throw new Error('Message failed to send. Check your email configuration.');
      }

      // Add to messages
      setMessages(prev => [...prev, response.data]);
      
      // Reset state
      setIsForwardOpen(false);
      setForwardContent("");
      setForwardTo("");
      setForwardingMessage(null);
    } catch (err) {
      console.error("Failed to forward message:", err);
      alert("Failed to forward message. Please check your email configuration.");
    } finally {
      setIsSending(false);
    }
  };

  const handleCancelForward = () => {
    setIsForwardOpen(false);
    setForwardContent("");
    setForwardTo("");
    setForwardingMessage(null);
    setShowEmojiPicker(false);
  };

  // Emoji picker functionality
  const handleEmojiSelect = (emoji) => {
    if (activeTextArea === 'reply') {
      setReplyContent(prev => prev + emoji.emoji);
    } else if (activeTextArea === 'forward') {
      setForwardContent(prev => prev + emoji.emoji);
    }
    setShowEmojiPicker(false);
  };

  // Function to render HTML content safely
  const renderHTMLContent = (html) => {
    // Process HTML to ensure images display properly
    const processedHtml = html
      .replace(/<img[^>]+src="([^"]+)"/g, (match, src) => {
        // Handle inline images or external URLs
        if (src.startsWith('cid:')) {
          // For content-id images, you might need to fetch them separately
          return match; // Keep as is for now
        }
        return match; // Keep external images as is
      });
      
    return { __html: processedHtml };
  };

  if (!conversation) {
    return (
      <div className="flex-1 p-8 bg-black text-white">
        Select a conversation
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black text-white relative" style={{height: '96vh'}}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-black">
        <div>
          <div className="font-bold text-lg">{conv?.subject}</div>
          <div className="text-sm text-gray-400">
            From: {messages[0]?.fromName} • To: {messages[0]?.to}
          </div>
          {conv?.account && (
            <div className="text-xs text-blue-400 mt-1">
              Using account: {conv.account.email}
            </div>
          )}
        </div>
      </div>

      {/* Messages in Email Style */}
      <div className="flex-1 overflow-auto p-6 space-y-6 bg-black">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-6x2 mx-auto ${m.isReply ? 'ml-8 border-l-4 border-l-blue-500' : ''}`}
          >
            <div className="mb-4 flex justify-between items-start">
              <div>
                <div className="font-semibold">{m.fromName}</div>
                <div className="text-sm text-gray-400">
                  to {m.to} • {new Date(m.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleReplyClick(m)}
                  className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
                >
                  Reply
                </button>
                <button
                  onClick={() => handleForwardClick(m)}
                  className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
                >
                  Forward
                </button>
              </div>
            </div>
            
            {/* Render HTML content safely */}
            <div 
              className="text-gray-100 whitespace-pre-wrap"
              dangerouslySetInnerHTML={renderHTMLContent(m.body)}
            />
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
            <div className="text-sm text-gray-400">
              From: {getSenderEmail() || "No account selected"}
            </div>
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
                onClick={() => {
                  setActiveTextArea('reply');
                  setShowEmojiPicker(!showEmojiPicker);
                }}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                😊
              </button>
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

      {/* Forward Box */}
      {isForwardOpen && (
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="mb-2 text-sm text-gray-300">
            Forwarding message from: {forwardingMessage?.fromName}
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-sm text-gray-400">
              From: {getSenderEmail() || "No account selected"}
            </div>
            <input
              type="email"
              value={forwardTo}
              onChange={(e) => setForwardTo(e.target.value)}
              placeholder="Recipient email"
              className="p-3 border border-gray-600 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={forwardContent}
              onChange={(e) => setForwardContent(e.target.value)}
              placeholder="Add a message..."
              className="flex-1 p-3 border border-gray-600 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setActiveTextArea('forward');
                  setShowEmojiPicker(!showEmojiPicker);
                }}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                😊
              </button>
              <button
                onClick={handleCancelForward}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                disabled={isSending}
              >
                Cancel
              </button>
              <button
                onClick={handleSendForward}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center"
                disabled={isSending || !forwardContent.trim() || !forwardTo.trim()}
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : "Send Forward"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4 z-10">
          <EmojiPicker onEmojiClick={handleEmojiSelect} />
        </div>
      )}
    </div>
  );
}