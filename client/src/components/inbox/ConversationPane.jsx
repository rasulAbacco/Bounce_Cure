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

// Fixed sendMessage to handle response properly
const sendMessage = async (body, inReplyTo = null, toEmail = null) => {
  if (!body.trim()) return;
  
  const senderEmail = getSenderEmail();
  
  if (!senderEmail) {
    console.error("No sender email available");
    alert("Cannot send message: No sender email available. Please select an account.");
    return;
  }
  
  if (!conv?.account?.id) {
    console.error("No account ID available");
    alert("Cannot send message: No account selected for this conversation.");
    return;
  }
  
  setIsSending(true);
  try {
    const userName = currentUser?.userName || currentUser?.name || senderEmail.split('@')[0];
    
    const payload = {
      accountId: conv.account.id,
      to: toEmail,
      subject: inReplyTo ? `Re: ${conv?.subject || 'No Subject'}` : conv?.subject || 'No Subject',
      text: body,
      html: body.replace(/\n/g, '<br>'),
      inReplyTo: inReplyTo || undefined,
      references: inReplyTo ? `<${inReplyTo}>` : undefined
    };
    
    const response = await api.post(`/accounts/send-via-smtp`, payload);
    
    if (response.data.status === 'failed') {
      throw new Error('Message failed to send. Check your email configuration.');
    }

    // Create proper message object for display
    const newMessage = {
      id: Date.now(),
      messageId: response.data.messageId || `msg-${Date.now()}`,
      conversationId: conversation.id,
      from: senderEmail,
      fromName: userName,
      to: toEmail,
      body: body, // Use the original body text
      html: body.replace(/\n/g, '<br>'),
      createdAt: new Date().toISOString(),
      isReply: !!inReplyTo
    };
    
    // Add the new message to the state
    setMessages(prev => [...prev, newMessage]);
    
    // Emit via socket for real-time updates
    socket.emit("send_message", {
      conversationId: conversation.id,
      body: body,
      fromName: userName,
      fromEmail: senderEmail,
      toEmail: toEmail,
      inReplyTo: inReplyTo
    });
    
    // Reset states
    setIsReplyOpen(false);
    setIsForwardOpen(false);
    setReplyingTo(null);
    setReplyContent("");
    setForwardContent("");
    setForwardTo("");
    setForwardingMessage(null);
    
    // Success alert
    alert("Message sent successfully!");
  } catch (err) {
    console.error("Failed to send message:", err);
    
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
    
    // Scroll to bottom after a brief delay to ensure the reply box is rendered
    setTimeout(() => {
      const replyBox = document.getElementById('reply-box');
      if (replyBox) {
        replyBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

// Fixed handleSendReply function
const handleSendReply = () => {
  if (replyContent.trim()) {
    // Get the email address from the message we're replying to
    const toEmail = replyingTo?.from || replyingTo?.email;
    
    if (!toEmail) {
      console.error("Cannot determine recipient email", replyingTo);
      alert("Cannot send reply: Recipient email not found");
      return;
    }
    
    console.log("Replying to:", toEmail);
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
  const senderEmail = getSenderEmail();
  
  if (!senderEmail) {
    console.error("No sender email available");
    alert("Cannot forward: No sender email available. Please select an account.");
    return;
  }
  
  // Get the actual sender email from the message
  const fromEmail = message.from || message.email || "Unknown";
  const fromName = message.fromName || fromEmail;
  
  setForwardingMessage(message);
  setIsForwardOpen(true);
  setIsReplyOpen(false);
  setForwardContent(`\n\n---------- Forwarded message ---------\nFrom: ${fromName} <${fromEmail}>\nDate: ${new Date(message.createdAt).toLocaleString()}\nSubject: ${conv?.subject}\n\n${message.body}\n---------- End of forwarded message ---------\n`);
  setForwardTo("");
  setShowEmojiPicker(false);
  
  setTimeout(() => {
    const forwardBox = document.getElementById('forward-box');
    if (forwardBox) {
      forwardBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 100);
};



const handleSendForward = async () => {
    if (!forwardContent.trim() || !forwardTo.trim()) return;
    
    setIsSending(true);
    try {
      const senderEmail = getSenderEmail();
      const userName = currentUser?.userName || currentUser?.name || senderEmail.split('@')[0];
      
      // Make API call to send via SMTP
      const response = await api.post(`/accounts/send-via-smtp`, {
        accountId: conv?.account?.id,
        to: forwardTo,
        subject: `Fwd: ${conv?.subject || 'No Subject'}`,
        text: forwardContent,
        html: forwardContent.replace(/\n/g, '<br>'),
        inReplyTo: null,
        references: null
      });

      // Send via socket for real-time update
      socket.emit("send_message", {
        conversationId: conversation.id,
        body: forwardContent,
        fromName: userName,
        fromEmail: senderEmail,
        toEmail: forwardTo,
        inReplyTo: null
      });

      // Add to messages
      const newMessage = {
        id: Date.now(),
        messageId: response.data.messageId,
        conversationId: conversation.id,
        from: senderEmail,
        fromName: userName,
        to: forwardTo,
        body: forwardContent,
        createdAt: new Date().toISOString(),
        isReply: false
      };
      setMessages(prev => [...prev, newMessage]);
      
      // Reset state
      setIsForwardOpen(false);
      setForwardContent("");
      setForwardTo("");
      setForwardingMessage(null);
      
      alert("Message forwarded successfully!");
    } catch (err) {
      console.error("Failed to forward message:", err);
      
      let errorMessage = "Failed to forward message.";
      if (err.response?.data?.details) {
        errorMessage += ` ${err.response.data.details}`;
      } else if (err.response?.data?.error) {
        errorMessage += ` ${err.response.data.error}`;
      }
      
      alert(errorMessage);
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
  // Handle undefined, null, or empty body
  if (!html) {
    return { __html: '' };
  }
  
  // Process HTML to ensure images display properly
  const processedHtml = html
    .replace(/<img[^>]+src="([^"]+)"/g, (match, src) => {
      // Handle inline images or external URLs
      if (src.startsWith('cid:')) {
        return match; // Keep as is for now
      }
      return match; // Keep external images as is
    });
    
  return { __html: processedHtml };
};

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950 text-gray-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-lg">Select a conversation to view messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-950 text-white relative h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 flex-shrink-0 px-6 py-4 border-b border-gray-800 bg-gray-900 shadow-lg">
        <div className="max-w-5xl mx-auto mr-50">
          <h1 className="text-xl font-semibold text-white mb-2">{conv?.subject || "No Subject"}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>From: {messages[0]?.fromName || messages[0]?.from}</span>
            <span>•</span>
            <span>To: {messages[0]?.to}</span>
          </div>
          {conv?.account && (
            <div className="text-xs text-blue-400 mt-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span>Using account: {conv.account.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-gray-950 mt-14">
        <div className="max-w-5x3 mx-auto px-4 py-6 space-y-2">
          {messages.map((m, index) => (
            <div
              key={m.id}
              className={`bg-gray-900 border border-gray-800 rounded-lg overflow-hidden ${
                m.isReply ? 'ml-12 border-l-4 border-l-blue-500' : ''
              }`}
            >
              {/* Message Header */}
              <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {m.fromName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-medium text-white">{m.fromName || m.from}</div>
                        <div className="text-sm text-gray-400">
                          to {m.to}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs text-gray-500">
                      {new Date(m.createdAt).toLocaleDateString()} at {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReplyClick(m)}
                        className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Reply
                      </button>
                      <button
                        onClick={() => handleForwardClick(m)}
                        className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        Forward
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div className="px-6 py-5">
                <div 
                  className="text-gray-200 leading-relaxed prose prose-invert max-w-none"
                  style={{ wordBreak: 'break-word' }}
                  dangerouslySetInnerHTML={renderHTMLContent(m.body)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reply Box - Fixed at Bottom */}
      {isReplyOpen && (
        <div 
          id="reply-box"
          className="flex-shrink-0 bg-gray-900 border-t border-gray-800 shadow-2xl"
        >
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-300 mb-1">
                  Replying to: {replyingTo?.fromName}
                </div>
                <div className="text-xs text-gray-500">
                  From: {getSenderEmail() || "No account selected"}
                </div>
              </div>
              <button
                onClick={handleCancelReply}
                className="text-gray-400 hover:text-gray-300"
                disabled={isSending}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Type your reply..."
                className="w-full p-4 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    handleSendReply();
                  }
                }}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setActiveTextArea('reply');
                      setShowEmojiPicker(!showEmojiPicker);
                    }}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-colors"
                    title="Add emoji"
                  >
                    😊
                  </button>
                  <span className="text-xs text-gray-500 self-center">
                    Press Ctrl+Enter to send
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelReply}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-colors"
                    disabled={isSending}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendReply}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSending || !replyContent.trim()}
                  >
                    {isSending ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forward Box - Fixed at Bottom */}
      {isForwardOpen && (
        <div 
          id="forward-box"
          className="flex-shrink-0 bg-gray-900 border-t border-gray-800 shadow-2xl"
        >
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-300 mb-1">
                  Forwarding message from: {forwardingMessage?.fromName}
                </div>
                <div className="text-xs text-gray-500">
                  From: {getSenderEmail() || "No account selected"}
                </div>
              </div>
              <button
                onClick={handleCancelForward}
                className="text-gray-400 hover:text-gray-300"
                disabled={isSending}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <input
                type="email"
                value={forwardTo}
                onChange={(e) => setForwardTo(e.target.value)}
                placeholder="Recipient email address"
                className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <textarea
                value={forwardContent}
                onChange={(e) => setForwardContent(e.target.value)}
                placeholder="Add a message..."
                className="w-full p-4 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
              />
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setActiveTextArea('forward');
                    setShowEmojiPicker(!showEmojiPicker);
                  }}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-colors"
                  title="Add emoji"
                >
                  😊
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelForward}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-colors"
                    disabled={isSending}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendForward}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSending || !forwardContent.trim() || !forwardTo.trim()}
                  >
                    {isSending ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send Forward
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emoji Picker - Positioned above reply/forward box */}
      {showEmojiPicker && (
        <div className="absolute bottom-0 right-4 z-50 mb-2" style={{ bottom: isReplyOpen || isForwardOpen ? '280px' : '20px' }}>
          <EmojiPicker onEmojiClick={handleEmojiSelect} theme="dark" />
        </div>
      )}
    </div>
  );
}

 

// frontend/src/components/ConversationPane.jsx
// import React, { useEffect, useState, useCallback } from "react";
// import { api } from "../../api";
// import EmojiPicker from 'emoji-picker-react';

// export default function ConversationPane({
//   conversation,
//   socket,
//   currentUser,
//   refresh,
// }) {
//   const [conv, setConv] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [note, setNote] = useState("");
//   const [viewers, setViewers] = useState([]);
//   const [typingUsers, setTypingUsers] = useState([]);
//   const [replyingTo, setReplyingTo] = useState(null);
//   const [replyContent, setReplyContent] = useState("");
//   const [isReplyOpen, setIsReplyOpen] = useState(false);
//   const [isSending, setIsSending] = useState(false);
  
//   // Forward state
//   const [isForwardOpen, setIsForwardOpen] = useState(false);
//   const [forwardContent, setForwardContent] = useState("");
//   const [forwardTo, setForwardTo] = useState("");
//   const [forwardingMessage, setForwardingMessage] = useState(null);
  
//   // Emoji picker state
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [activeTextArea, setActiveTextArea] = useState(null);

//   // Get the sender email from the conversation's account
//   const getSenderEmail = useCallback(() => {
//     // First try to get email from the conversation's account
//     if (conv?.account?.email) {
//       return conv.account.email;
//     }
    
//     // Fallback to localStorage
//     const emailFromStorage = localStorage.getItem('userEmail');
//     if (emailFromStorage) {
//       return emailFromStorage;
//     }
    
//     // Last resort: try currentUser
//     return currentUser?.email || currentUser?.userEmail;
//   }, [conv, currentUser]);

//   // Fetch conversation data
//   const fetchConversation = useCallback(async () => {
//     if (!conversation) return;
//     try {
//       console.log("Fetching conversation with ID:", conversation.id);
//       const res = await api.get(`/conversations/${conversation.id}`);
//       setConv(res.data);
//       setMessages(res.data.messages || []);
//     } catch (err) {
//       console.error("Failed to fetch conversation:", err);
//       setConv(null);
//       setMessages([]);
//     }
//   }, [conversation]);

//   useEffect(() => {
//     if (!conversation) {
//       setConv(null);
//       setMessages([]);
//       return;
//     }
//     fetchConversation();

//     socket.emit("join_conversation", { conversationId: conversation.id });

//     return () => {
//       socket.emit("leave_conversation", { conversationId: conversation.id });
//     };
//   }, [conversation, fetchConversation, socket]);

//   // Setup socket listeners
//   useEffect(() => {
//     if (!conversation) return;

//     const handleMessage = (msg) => {
//       console.log("Received message:", msg);
//       if (msg.conversationId === conversation.id) {
//         setMessages((prev) => {
//           if (prev.find((m) => m.messageId === msg.messageId)) {
//             return prev; // skip duplicate
//           }
//           return [...prev, msg];
//         });
//       }
//     };

//     const handleNote = (n) => {
//       setConv((prev) => ({
//         ...prev,
//         notes: [...(prev?.notes || []), n],
//       }));
//     };

//     const handleViewers = (v) => setViewers(v);

//     const handleTyping = ({ userId, userName, typing }) => {
//       setTypingUsers((prev) => {
//         const filtered = prev.filter((u) => u.userId !== userId);
//         if (typing) {
//           filtered.push({ userId, userName });
//         }
//         return filtered;
//       });
//     };

//     socket.on("message", handleMessage);
//     socket.on("note", handleNote);
//     socket.on("viewers", handleViewers);
//     socket.on("typing", handleTyping);

//     return () => {
//       socket.off("message", handleMessage);
//       socket.off("note", handleNote);
//       socket.off("viewers", handleViewers);
//       socket.off("typing", handleTyping);
//     };
//   }, [conversation, socket]);

//   const sendNote = () => {
//     if (!note.trim()) return;
//     socket.emit("add_note", { conversationId: conversation.id, body: note });
//     setNote("");
//   };

// // Fixed sendMessage to handle response properly
// const sendMessage = async (body, inReplyTo = null, toEmail = null) => {
//   if (!body.trim()) return;
  
//   const senderEmail = getSenderEmail();
  
//   if (!senderEmail) {
//     console.error("No sender email available");
//     alert("Cannot send message: No sender email available. Please select an account.");
//     return;
//   }
  
//   if (!conv?.account?.id) {
//     console.error("No account ID available");
//     alert("Cannot send message: No account selected for this conversation.");
//     return;
//   }
  
//   setIsSending(true);
//   try {
//     const userName = currentUser?.userName || currentUser?.name || senderEmail.split('@')[0];
    
//     const payload = {
//       accountId: conv.account.id,
//       to: toEmail,
//       subject: inReplyTo ? `Re: ${conv?.subject || 'No Subject'}` : conv?.subject || 'No Subject',
//       text: body,
//       html: body.replace(/\n/g, '<br>'),
//       inReplyTo: inReplyTo || undefined,
//       references: inReplyTo ? `<${inReplyTo}>` : undefined
//     };
    
//     const response = await api.post(`/accounts/send-via-smtp`, payload);
    
//     if (response.data.status === 'failed') {
//       throw new Error('Message failed to send. Check your email configuration.');
//     }

//     // Create proper message object for display
//     const newMessage = {
//       id: Date.now(),
//       messageId: response.data.messageId || `msg-${Date.now()}`,
//       conversationId: conversation.id,
//       from: senderEmail,
//       fromName: userName,
//       to: toEmail,
//       body: body, // Use the original body text
//       html: body.replace(/\n/g, '<br>'),
//       createdAt: new Date().toISOString(),
//       isReply: !!inReplyTo
//     };
    
//     // Add the new message to the state
//     setMessages(prev => [...prev, newMessage]);
    
//     // Emit via socket for real-time updates
//     socket.emit("send_message", {
//       conversationId: conversation.id,
//       body: body,
//       fromName: userName,
//       fromEmail: senderEmail,
//       toEmail: toEmail,
//       inReplyTo: inReplyTo
//     });
    
//     // Reset states
//     setIsReplyOpen(false);
//     setIsForwardOpen(false);
//     setReplyingTo(null);
//     setReplyContent("");
//     setForwardContent("");
//     setForwardTo("");
//     setForwardingMessage(null);
    
//     // Success alert
//     alert("Message sent successfully!");
//   } catch (err) {
//     console.error("Failed to send message:", err);
    
//     let errorMessage = "Failed to send message.";
    
//     if (err.response) {
//       console.error("Error response data:", err.response.data);
//       errorMessage += ` Server error: ${err.response.data.error || err.response.status}`;
      
//       if (err.response.data.details) {
//         errorMessage += ` - ${err.response.data.details}`;
//       }
//     } else if (err.request) {
//       errorMessage += " No response from server.";
//     } else {
//       errorMessage += ` ${err.message}`;
//     }
    
//     alert(errorMessage);
//   } finally {
//     setIsSending(false);
//   }
// };


//   const handleReplyClick = (message) => {
//     // Get the sender email from the conversation's account
//     const senderEmail = getSenderEmail();
    
//     if (!senderEmail) {
//       console.error("No sender email available");
//       alert("Cannot reply: No sender email available. Please select an account.");
//       return;
//     }
    
//     setReplyingTo(message);
//     setIsReplyOpen(true);
//     setIsForwardOpen(false);
//     setReplyContent("");
//     setShowEmojiPicker(false);
//   };

// // Fixed handleSendReply function
// const handleSendReply = () => {
//   if (replyContent.trim()) {
//     // Get the email address from the message we're replying to
//     const toEmail = replyingTo?.from || replyingTo?.email;
    
//     if (!toEmail) {
//       console.error("Cannot determine recipient email", replyingTo);
//       alert("Cannot send reply: Recipient email not found");
//       return;
//     }
    
//     console.log("Replying to:", toEmail);
//     sendMessage(replyContent, replyingTo?.messageId, toEmail);
//   }
// };


//   const handleCancelReply = () => {
//     setIsReplyOpen(false);
//     setReplyingTo(null);
//     setReplyContent("");
//     setShowEmojiPicker(false);
//   };

//   // Forward functionality
// const handleForwardClick = (message) => {
//   const senderEmail = getSenderEmail();
  
//   if (!senderEmail) {
//     console.error("No sender email available");
//     alert("Cannot forward: No sender email available. Please select an account.");
//     return;
//   }
  
//   // Get the actual sender email from the message
//   const fromEmail = message.from || message.email || "Unknown";
//   const fromName = message.fromName || fromEmail;
  
//   setForwardingMessage(message);
//   setIsForwardOpen(true);
//   setIsReplyOpen(false);
//   setForwardContent(`\n\n---------- Forwarded message ---------\nFrom: ${fromName} <${fromEmail}>\nDate: ${new Date(message.createdAt).toLocaleString()}\nSubject: ${conv?.subject}\n\n${message.body}\n---------- End of forwarded message ---------\n`);
//   setForwardTo("");
//   setShowEmojiPicker(false);
// };



// const handleSendForward = async () => {
//     if (!forwardContent.trim() || !forwardTo.trim()) return;
    
//     setIsSending(true);
//     try {
//       const senderEmail = getSenderEmail();
//       const userName = currentUser?.userName || currentUser?.name || senderEmail.split('@')[0];
      
//       // Make API call to send via SMTP
//       const response = await api.post(`/accounts/send-via-smtp`, {
//         accountId: conv?.account?.id,
//         to: forwardTo,
//         subject: `Fwd: ${conv?.subject || 'No Subject'}`,
//         text: forwardContent,
//         html: forwardContent.replace(/\n/g, '<br>'),
//         inReplyTo: null,
//         references: null
//       });

//       // Send via socket for real-time update
//       socket.emit("send_message", {
//         conversationId: conversation.id,
//         body: forwardContent,
//         fromName: userName,
//         fromEmail: senderEmail,
//         toEmail: forwardTo,
//         inReplyTo: null
//       });

//       // Add to messages
//       const newMessage = {
//         id: Date.now(),
//         messageId: response.data.messageId,
//         conversationId: conversation.id,
//         from: senderEmail,
//         fromName: userName,
//         to: forwardTo,
//         body: forwardContent,
//         createdAt: new Date().toISOString(),
//         isReply: false
//       };
//       setMessages(prev => [...prev, newMessage]);
      
//       // Reset state
//       setIsForwardOpen(false);
//       setForwardContent("");
//       setForwardTo("");
//       setForwardingMessage(null);
      
//       alert("Message forwarded successfully!");
//     } catch (err) {
//       console.error("Failed to forward message:", err);
      
//       let errorMessage = "Failed to forward message.";
//       if (err.response?.data?.details) {
//         errorMessage += ` ${err.response.data.details}`;
//       } else if (err.response?.data?.error) {
//         errorMessage += ` ${err.response.data.error}`;
//       }
      
//       alert(errorMessage);
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const handleCancelForward = () => {
//     setIsForwardOpen(false);
//     setForwardContent("");
//     setForwardTo("");
//     setForwardingMessage(null);
//     setShowEmojiPicker(false);
//   };

//   // Emoji picker functionality
//   const handleEmojiSelect = (emoji) => {
//     if (activeTextArea === 'reply') {
//       setReplyContent(prev => prev + emoji.emoji);
//     } else if (activeTextArea === 'forward') {
//       setForwardContent(prev => prev + emoji.emoji);
//     }
//     setShowEmojiPicker(false);
//   };

//   // Function to render HTML content safely
// const renderHTMLContent = (html) => {
//   // Handle undefined, null, or empty body
//   if (!html) {
//     return { __html: '' };
//   }
  
//   // Process HTML to ensure images display properly
//   const processedHtml = html
//     .replace(/<img[^>]+src="([^"]+)"/g, (match, src) => {
//       // Handle inline images or external URLs
//       if (src.startsWith('cid:')) {
//         return match; // Keep as is for now
//       }
//       return match; // Keep external images as is
//     });
    
//   return { __html: processedHtml };
// };

//   if (!conversation) {
//     return (
//       <div className="flex-1 flex items-center justify-center bg-gray-950 text-gray-400">
//         <div className="text-center">
//           <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//           </svg>
//           <p className="text-lg">Select a conversation to view messages</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col bg-gray-950 text-white h-screen overflow-hidden">
//       {/* Header - Fixed */}
//       <div className="flex-shrink-0 px-6 py-4 border-b border-gray-800 bg-gray-900 shadow-lg z-20">
//         <div className="max-w-5xl mx-auto">
//           <h1 className="text-xl font-semibold text-white mb-2">{conv?.subject || "No Subject"}</h1>
//           <div className="flex items-center gap-4 text-sm text-gray-400">
//             <span>From: {messages[0]?.fromName || messages[0]?.from}</span>
//             <span>•</span>
//             <span>To: {messages[0]?.to}</span>
//           </div>
//           {conv?.account && (
//             <div className="text-xs text-blue-400 mt-2 flex items-center gap-1">
//               <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
//                 <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                 <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//               </svg>
//               <span>Using account: {conv.account.email}</span>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Messages Container - Scrollable with proper height calculation */}
//       <div 
//         className="flex-1 overflow-y-auto bg-gray-950"
//         style={{ 
//           height: isReplyOpen || isForwardOpen 
//             ? 'calc(100vh - 180px - 300px)' // Header height - Reply/Forward box height
//             : 'calc(100vh - 180px)' 
//         }}
//       >
//         <div className="max-w-5xl mx-auto px-4 py-6 space-y-2">
//           {messages.map((m, index) => (
//             <div
//               key={m.id}
//               className={`bg-gray-900 border border-gray-800 rounded-lg overflow-hidden ${
//                 m.isReply ? 'ml-12 border-l-4 border-l-blue-500' : ''
//               }`}
//             >
//               {/* Message Header */}
//               <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
//                 <div className="flex justify-between items-start">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
//                         {m.fromName?.charAt(0)?.toUpperCase() || 'U'}
//                       </div>
//                       <div>
//                         <div className="font-medium text-white">{m.fromName || m.from}</div>
//                         <div className="text-sm text-gray-400">
//                           to {m.to}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex flex-col items-end gap-2">
//                     <div className="text-xs text-gray-500">
//                       {new Date(m.createdAt).toLocaleDateString()} at {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                     </div>
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => handleReplyClick(m)}
//                         className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-1"
//                       >
//                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
//                         </svg>
//                         Reply
//                       </button>
//                       <button
//                         onClick={() => handleForwardClick(m)}
//                         className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors flex items-center gap-1"
//                       >
//                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                         </svg>
//                         Forward
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Message Body */}
//               <div className="px-6 py-5">
//                 <div 
//                   className="text-gray-200 leading-relaxed prose prose-invert max-w-none"
//                   style={{ wordBreak: 'break-word' }}
//                   dangerouslySetInnerHTML={renderHTMLContent(m.body)}
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Reply Box - Fixed at Bottom */}
//       {isReplyOpen && (
//         <div 
//           id="reply-box"
//           className="flex-shrink-0 bg-gray-900 border-t-2 border-gray-700 shadow-2xl z-30"
//         >
//           <div className="max-w-5xl mx-auto px-6 py-4">
//             <div className="mb-3 flex items-center justify-between">
//               <div>
//                 <div className="text-sm font-medium text-gray-300 mb-1">
//                   Replying to: {replyingTo?.fromName}
//                 </div>
//                 <div className="text-xs text-gray-500">
//                   From: {getSenderEmail() || "No account selected"}
//                 </div>
//               </div>
//               <button
//                 onClick={handleCancelReply}
//                 className="text-gray-400 hover:text-gray-300"
//                 disabled={isSending}
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
            
//             <div className="space-y-3">
//               <textarea
//                 value={replyContent}
//                 onChange={(e) => setReplyContent(e.target.value)}
//                 placeholder="Type your reply..."
//                 className="w-full p-4 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//                 rows="4"
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" && e.ctrlKey) {
//                     handleSendReply();
//                   }
//                 }}
//               />
              
//               <div className="flex items-center justify-between">
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => {
//                       setActiveTextArea('reply');
//                       setShowEmojiPicker(!showEmojiPicker);
//                     }}
//                     className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-colors"
//                     title="Add emoji"
//                   >
//                     😊
//                   </button>
//                   <span className="text-xs text-gray-500 self-center">
//                     Press Ctrl+Enter to send
//                   </span>
//                 </div>
                
//                 <div className="flex gap-2">
//                   <button
//                     onClick={handleCancelReply}
//                     className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-colors"
//                     disabled={isSending}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleSendReply}
//                     className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                     disabled={isSending || !replyContent.trim()}
//                   >
//                     {isSending ? (
//                       <>
//                         <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         Sending...
//                       </>
//                     ) : (
//                       <>
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
//                         </svg>
//                         Send Reply
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Forward Box - Fixed at Bottom */}
//       {isForwardOpen && (
//         <div 
//           id="forward-box"
//           className="flex-shrink-0 bg-gray-900 border-t-2 border-gray-700 shadow-2xl z-30"
//         >
//           <div className="max-w-5xl mx-auto px-6 py-4">
//             <div className="mb-3 flex items-center justify-between">
//               <div>
//                 <div className="text-sm font-medium text-gray-300 mb-1">
//                   Forwarding message from: {forwardingMessage?.fromName}
//                 </div>
//                 <div className="text-xs text-gray-500">
//                   From: {getSenderEmail() || "No account selected"}
//                 </div>
//               </div>
//               <button
//                 onClick={handleCancelForward}
//                 className="text-gray-400 hover:text-gray-300"
//                 disabled={isSending}
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
            
//             <div className="space-y-3">
//               <input
//                 type="email"
//                 value={forwardTo}
//                 onChange={(e) => setForwardTo(e.target.value)}
//                 placeholder="Recipient email address"
//                 className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
              
//               <textarea
//                 value={forwardContent}
//                 onChange={(e) => setForwardContent(e.target.value)}
//                 placeholder="Add a message..."
//                 className="w-full p-4 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//                 rows="4"
//               />
              
//               <div className="flex items-center justify-between">
//                 <button
//                   onClick={() => {
//                     setActiveTextArea('forward');
//                     setShowEmojiPicker(!showEmojiPicker);
//                   }}
//                   className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-colors"
//                   title="Add emoji"
//                 >
//                   😊
//                 </button>
                
//                 <div className="flex gap-2">
//                   <button
//                     onClick={handleCancelForward}
//                     className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-colors"
//                     disabled={isSending}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleSendForward}
//                     className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                     disabled={isSending || !forwardContent.trim() || !forwardTo.trim()}
//                   >
//                     {isSending ? (
//                       <>
//                         <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         Sending...
//                       </>
//                     ) : (
//                       <>
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
//                         </svg>
//                         Send Forward
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Emoji Picker - Positioned above reply/forward box */}
//       {showEmojiPicker && (
//         <div className="absolute bottom-20 right-8 z-50">
//           <EmojiPicker onEmojiClick={handleEmojiSelect} theme="dark" />
//         </div>
//       )}
//     </div>
//   );
// }