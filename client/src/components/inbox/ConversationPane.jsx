// client/src/components/ConversationPane.jsx
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../api";
import EmojiPicker from "emoji-picker-react";
import { User, Link, Unlink, Loader2 } from "lucide-react";

export default function ConversationPane({
  conversation,
  socket,
  currentUser,
  refresh,
}) {
  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [crmInfo, setCrmInfo] = useState(null); // ✅ CRM Match Info
  const [crmLoading, setCrmLoading] = useState(false);
  const [note, setNote] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isForwardOpen, setIsForwardOpen] = useState(false);
  const [forwardContent, setForwardContent] = useState("");
  const [forwardTo, setForwardTo] = useState("");
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeTextArea, setActiveTextArea] = useState(null);

  // ✅ Determine Sender Email
  const getSenderEmail = useCallback(() => {
    if (conv?.account?.email) return conv.account.email;
    return (
      localStorage.getItem("userEmail") ||
      currentUser?.email ||
      currentUser?.userEmail ||
      null
    );
  }, [conv, currentUser]);

  // ✅ Fetch Conversation Data
  const fetchConversation = useCallback(async () => {
    if (!conversation) return;
    try {
      const res = await api.get(`/conversations/${conversation.id}`);
      setConv(res.data);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Failed to fetch conversation:", err);
    }
  }, [conversation]);

  // ✅ Load CRM Info (auto-link detection)
  const fetchCRMInfo = async (email) => {
    if (!email) return;
    try {
      setCrmLoading(true);
      const res = await api.get(`/crm/match?email=${email}`);
      setCrmInfo(res.data || null);
    } catch (err) {
      console.error("CRM match lookup failed:", err);
      setCrmInfo(null);
    } finally {
      setCrmLoading(false);
    }
  };

  // Load conversation and CRM info
  useEffect(() => {
    if (!conversation) {
      setConv(null);
      setMessages([]);
      return;
    }
    fetchConversation();
    if (conversation?.from) fetchCRMInfo(conversation.from);

    socket.emit("join_conversation", { conversationId: conversation.id });
    return () => {
      socket.emit("leave_conversation", { conversationId: conversation.id });
    };
  }, [conversation, fetchConversation, socket]);

  // ✅ Link conversation to CRM manually
  const handleLinkToCRM = async (type) => {
    try {
      setCrmLoading(true);
      await api.post("/crm/link", {
        email: conversation?.from,
        type,
        conversationId: conversation.id,
      });
      fetchCRMInfo(conversation.from);
    } catch (err) {
      console.error("Error linking conversation:", err);
    } finally {
      setCrmLoading(false);
    }
  };

  const handleUnlinkFromCRM = async () => {
    try {
      setCrmLoading(true);
      await api.post("/crm/unlink", {
        conversationId: conversation.id,
      });
      setCrmInfo(null);
    } catch (err) {
      console.error("Error unlinking conversation:", err);
    } finally {
      setCrmLoading(false);
    }
  };

  // ✅ Safe HTML render
  const renderHTMLContent = (html) => {
    if (!html) return { __html: "" };
    return { __html: html };
  };

  // ✅ Reply Handling (unchanged)
  const handleReplyClick = (message) => {
    const senderEmail = getSenderEmail();
    if (!senderEmail) {
      alert("No sender email available. Select an account first.");
      return;
    }
    setReplyingTo(message);
    setIsReplyOpen(true);
    setIsForwardOpen(false);
    setReplyContent("");
  };

  const handleSendReply = async () => {
    if (!replyContent.trim()) return;
    const toEmail = replyingTo?.from || replyingTo?.email;
    if (!toEmail) {
      alert("Cannot send reply: missing recipient.");
      return;
    }
    await sendMessage(replyContent, replyingTo?.messageId, toEmail);
  };

  const sendMessage = async (body, inReplyTo = null, toEmail = null) => {
    if (!body.trim()) return;
    const senderEmail = getSenderEmail();
    if (!senderEmail) {
      alert("No sender email available");
      return;
    }
    setIsSending(true);
    try {
      const payload = {
        accountId: conv.account.id,
        to: toEmail,
        subject: inReplyTo ? `Re: ${conv.subject}` : conv.subject,
        text: body,
        html: body.replace(/\n/g, "<br>"),
        inReplyTo,
      };
      const res = await api.post(`/accounts/send-via-smtp`, payload);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          messageId: res.data.messageId,
          conversationId: conversation.id,
          from: senderEmail,
          body,
          createdAt: new Date().toISOString(),
        },
      ]);
      alert("Message sent!");
    } catch (err) {
      console.error("Send message failed:", err);
      alert("Failed to send message");
    } finally {
      setIsSending(false);
      setIsReplyOpen(false);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950 text-gray-400">
        <div className="text-center">
          <p className="text-lg">Select a conversation to view messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-950 text-white relative">
      {/* Header */}
      <div className="sticky top-0 z-10 px-6 py-4 border-b border-gray-800 bg-gray-900 shadow-lg">
        <h1 className="text-xl font-semibold text-white">
          {conv?.subject || "No Subject"}
        </h1>
        <p className="text-sm text-gray-400">
          From: {messages[0]?.fromName || messages[0]?.from}
        </p>

        {/* ✅ CRM Link Section */}
        <div className="mt-3 p-3 bg-gray-800 rounded-md flex items-center justify-between">
          {crmLoading ? (
            <div className="flex items-center text-gray-400">
              <Loader2 className="animate-spin w-4 h-4 mr-2" /> Checking CRM...
            </div>
          ) : crmInfo ? (
            <>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-green-400" />
                <span>
                  Linked with {crmInfo.type}:{" "}
                  <strong>{crmInfo.name || crmInfo.email}</strong>
                </span>
              </div>
              <button
                onClick={handleUnlinkFromCRM}
                className="flex items-center gap-1 text-red-400 hover:text-red-300"
              >
                <Unlink className="w-4 h-4" /> Unlink
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <span className="text-gray-400 text-sm">Not linked</span>
              <button
                onClick={() => handleLinkToCRM("Lead")}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
              >
                <Link className="w-4 h-4" /> Link as Lead
              </button>
              <button
                onClick={() => handleLinkToCRM("Contact")}
                className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1"
              >
                <Link className="w-4 h-4" /> Link as Contact
              </button>
              <button
                onClick={() => handleLinkToCRM("Deal")}
                className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center gap-1"
              >
                <Link className="w-4 h-4" /> Link as Deal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className="bg-gray-900 border border-gray-800 rounded-lg px-5 py-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-white">{m.from}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(m.createdAt).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => handleReplyClick(m)}
                  className="text-blue-400 hover:text-blue-300 text-xs"
                >
                  ↩️ Reply
                </button>
              </div>
              <div
                className="mt-3 text-gray-200"
                dangerouslySetInnerHTML={renderHTMLContent(m.body)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Reply Box */}
      {isReplyOpen && (
        <div className="bg-gray-900 border-t border-gray-800 p-4 sticky bottom-0">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Type your reply..."
            className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-white resize-none mb-3"
            rows="4"
          />
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                setActiveTextArea("reply");
                setShowEmojiPicker(!showEmojiPicker);
              }}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            >
              😊 Emoji
            </button>
            <button
              onClick={handleSendReply}
              disabled={isSending || !replyContent.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
            >
              {isSending ? "Sending..." : "Send Reply"}
            </button>
          </div>
          {showEmojiPicker && (
            <div className="absolute bottom-20 right-10">
              <EmojiPicker
                onEmojiClick={(emoji) =>
                  setReplyContent((prev) => prev + emoji.emoji)
                }
                theme="dark"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
