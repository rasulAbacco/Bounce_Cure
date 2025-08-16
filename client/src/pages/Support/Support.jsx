import React, { useState, useMemo } from "react";
import { FaEnvelope, FaTicketAlt, FaPhoneAlt, FaComments } from "react-icons/fa";
import DashboardLayout from "../../components/DashboardLayout";
import "../../styles/support.css";
import { Pointer } from "lucide-react";

export default function HelpAndSupport() {
    const [messageForm, setMessageForm] = useState({ name: "", message: "" });
    const [ticketForm, setTicketForm] = useState({ subject: "", description: "" });

    // Tracks which FAQ is open
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            q: "How do I reset my account password?",
            a: "Navigate to your profile settings, select 'Security Settings', and click 'Reset Password'. You’ll receive an email with a link to create a new password."
        },
        {
            q: "How can I download my billing history?",
            a: "Go to your Dashboard, select 'Billing', and click 'Download Invoice' to save a PDF copy of your transaction history."
        },
        {
            q: "Can I contact support outside business hours?",
            a: "Yes. Email and ticket support are available 24/7. Live chat and phone support operate from 9:00 AM to 9:00 PM, Monday through Friday."
        },
        {
            q: "How do I upgrade or downgrade my subscription?",
            a: "Open the 'Billing' section, select 'Subscription Plan', choose your preferred plan, and confirm the changes."
        },
        {
            q: "What payment options do you support?",
            a: "We accept major credit and debit cards, PayPal, Apple Pay, and direct bank transfers."
        },
        {
            q: "How secure is my personal and payment data?",
            a: "All data is protected with 256-bit SSL encryption and we fully comply with GDPR and PCI-DSS security standards."
        },
        {
            q: "What is your refund policy?",
            a: "For annual plans, we offer full refunds within 14 days of payment. Monthly plans are non-refundable."
        },
    ];

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleMessageSubmit = async (e) => {
        e.preventDefault();
        console.log("Sending message:", messageForm);
        try {
            const res = await fetch("http://localhost:5000/api/support/message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(messageForm),
            });
            const data = await res.json();
            console.log("Response:", data);
            if (res.ok) {
                alert(data.message);
                setMessageForm({ name: "", message: "" });
            } else {
                alert(data.error || "Failed to send message.");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong. Please try again later.");
        }
    };

    const handleTicketSubmit = async (e) => {
        e.preventDefault();
        console.log("Sending ticket:", ticketForm);
        try {
            const res = await fetch("http://localhost:5000/api/support/ticket", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ticketForm),
            });
            const data = await res.json();
            console.log("Response:", data);
            if (res.ok) {
                alert(data.message);
                setTicketForm({ subject: "", description: "" });
            } else {
                alert(data.error || "Failed to submit ticket.");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong. Please try again later.");
        }
    };

    // ----- Animated background squares (Tailwind only, no external CSS changes) -----
    const squares = useMemo(() => {
        return Array.from({ length: 12 }).map(() => ({
            size: 16 + Math.floor(Math.random() * 40), // 16–56px
            left: Math.random() * 100,                  // 0–100 vw
            delay: Math.random() * 12,                  // 0–12s
            dur: 14 + Math.random() * 16,               // 14–30s
            start: -10 - Math.random() * 25             // -10 to -35 vh (below)
        }));
    }, []);

    return (
        <DashboardLayout>
            {/* Animated Background (no layout/logic changes) */}
            <div
                className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
                aria-hidden="true"
            >
                {squares.map((sq, i) => (
                    <div
                        key={i}
                        className="absolute bg-sky-400/20 transform-gpu will-change-transform"
                        style={{
                            width: `${sq.size}px`,
                            height: `${sq.size}px`,
                            left: `${sq.left}%`,
                            bottom: `${sq.start}vh`,
                            animation: `floatUp ${sq.dur}s linear infinite`,
                            animationDelay: `${sq.delay}s`,
                        }}
                    />
                ))}

                {/* Keyframes live right here so no external CSS edits are needed */}
                <style>{`
                  @keyframes floatUp {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(160vh) rotate(360deg); opacity: 0; }
                  }
                `}</style>
            </div>

            <div className="help-support-container">
                <div className="help-support-inner">

                    {/* FAQ Section */}
                    <div className="faq-section">
                        <h2>Help & Support</h2>
                        <p>Find quick answers to common questions below.</p>
                        <div className="faq-list">
                            {faqs.map(({ q, a }, i) => (
                                <div key={i} className="faq-item">
                                    <button
                                        className={`faq-question ${openIndex === i ? "active" : ""}`}
                                        onClick={() => toggleFAQ(i)}
                                        style={{
                                            cursor: "pointer",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            width: "100%",
                                            padding: "10px 15px",
                                            border: "none",
                                            background: "transparent",
                                            textAlign: "left",
                                            fontSize: "16px",
                                        }}
                                    >
                                        <span>{q}</span>
                                        <span>{openIndex === i ? "−" : "+"}</span>
                                    </button>
                                    <div
                                        className={`faq-answer ${openIndex === i ? "open" : ""}`}
                                        style={{
                                            maxHeight: openIndex === i ? "500px" : "0",
                                            opacity: openIndex === i ? 1 : 0,
                                            overflow: "hidden",
                                            transition: "all 0.3s ease",
                                            padding: openIndex === i ? "10px 15px" : "0 15px",
                                        }}
                                    >
                                        <p>{a}</p>
                                    </div>
                                </div>

                            ))}
                        </div>
                    </div>

                    {/* Support Cards Grid */}
                    <div className="support-cards-grid">
                        {/* Email Support */}
                        <div className="support-card">
                            <div className="card-header">
                                <FaEnvelope className="card-icon" />
                                <h3>Email Support</h3>
                            </div>
                            <p>Reach out anytime — we'll respond within 24 hours.</p>
                            <a
                                className="card-button"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();

                                    const width = 600;
                                    const height = 400;
                                    const left = (window.screen.width / 2) - (width / 2);
                                    const top = (window.screen.height / 2) - (height / 2);

                                    window.open(
                                        "https://mail.google.com/mail/?view=cm&to=abacco83@gmail.com&su=Support%20Request",
                                        "gmailComposeWindow",
                                        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
                                    );
                                }}
                            >
                                Email Us
                            </a>
                        </div>



                        {/* Contact Support Form */}
                        <div className="support-card">
                            <div className="card-header">
                                <FaComments className="card-icon" />
                                <h3>Contact Support</h3>
                            </div>
                            <p>Stuck somewhere? Our support team is here 24/7.</p>
                            <form className="card-form" onSubmit={handleMessageSubmit}>
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={messageForm.name}
                                    onChange={(e) => setMessageForm({ ...messageForm, name: e.target.value })}
                                    required
                                />
                                <textarea
                                    placeholder="Your Message"
                                    rows="3"
                                    value={messageForm.message}
                                    onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                                    required
                                />
                                <button type="submit">Send Message</button>
                            </form>
                        </div>

                        {/* Raise Ticket Form */}
                        <div className="support-card">
                            <div className="card-header">
                                <FaTicketAlt className="card-icon" />
                                <h3>Raise Ticket</h3>
                            </div>
                            <p>Technical issue or account trouble? Submit a ticket.</p>
                            <form className="card-form" onSubmit={handleTicketSubmit}>
                                <input
                                    type="text"
                                    placeholder="Subject"
                                    value={ticketForm.subject}
                                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                                    required
                                />
                                <textarea
                                    placeholder="Describe your issue"
                                    rows="3"
                                    value={ticketForm.description}
                                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                                    required
                                />
                                <button type="submit">Submit Ticket</button>
                            </form>
                        </div>

                        {/* Phone & Chat Support */}
                        <div className="support-card">
                            <div className="card-header">
                                <FaPhoneAlt className="card-icon" />
                                <h3>Phone & Chat Support</h3>
                            </div>
                            <p>
                                <strong>Phone:</strong> <a href="tel:+1234567890">+1 234 567 890</a>
                            </p>
                            <p>
                                <strong>Live Chat:</strong> Available 9am - 9pm (Mon – Fri)
                            </p>
                            <button
                                className="card-button"
                                onClick={() => {
                                    const url = "https://wa.me/1234567890?text=Hello,%20I%20need%20support";
                                    window.open(
                                        url,
                                        "WhatsAppBusinessChat",
                                        "width=400,height=600,top=100,left=100,resizable=yes,scrollbars=yes"
                                    );
                                }}
                            >
                                Start Chat
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
