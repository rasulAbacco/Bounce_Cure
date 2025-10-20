import React, { useState, useEffect, useRef } from "react";
import { HiChatBubbleLeftRight } from "react-icons/hi2";
import { FaPaperPlane, FaRobot, FaUser } from "react-icons/fa";
import "../styles/Chatbot.css";
const API_URL = import.meta.env.VITE_VRI_URL;
const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I'm BounceCure Bot 🤖. Ask me anything about BounceCure!" }
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll chat to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Send user message to backend
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Adjust API URL for your Render setup
      const res = await fetch(`${API_URL}/api/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();
      const botReply = { sender: "bot", text: data.reply || "Sorry, I didn’t catch that." };
      setMessages(prev => [...prev, botReply]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "⚠️ Something went wrong. Please try again later." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      {/* Floating Button */}
      <div className="chat-float-button" onClick={() => setIsOpen(!isOpen)}>
        <HiChatBubbleLeftRight />
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window animate-slide-in">
          <div className="chat-header">
            BounceCure ChatBot
          </div>

          <div className="chat-body">
            {messages.map((msg, i) => (
              <div key={i} className={`message-row ${msg.sender}`}>
                <div className="icon">
                  {msg.sender === "bot" ? <FaRobot /> : <FaUser />}
                </div>
                <div className={`message-bubble ${msg.sender}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-row bot">
                <div className="icon"><FaRobot /></div>
                <div className="message-bubble bot typing">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <input
              type="text"
              style={{ color: "#000" }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
            />
            <button onClick={sendMessage}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
