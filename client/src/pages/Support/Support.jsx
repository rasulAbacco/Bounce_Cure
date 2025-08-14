import React, { useState } from "react";
import {
    FaEnvelope,
    FaTicketAlt,
    FaPhoneAlt,
    FaComments,
} from "react-icons/fa";
import DashboardLayout from "../../components/DashboardLayout";
import "../../styles/support.css";
import emailjs from "emailjs-com";

export default function HelpAndSupport() {
    const [messageForm, setMessageForm] = useState({ name: "", message: "" });
    const [ticketForm, setTicketForm] = useState({ subject: "", description: "" });

    const faqs = [
        { q: "How do I reset my account password?", a: "Click on your profile → Security Settings → Reset Password. Follow the email instructions." },
        { q: "How can I download my billing history?", a: "Go to Dashboard → Billing → Download Invoice to get PDFs of your transactions." },
        { q: "Can I contact support outside business hours?", a: "Yes! Email and ticket support is available 24/7. Live chat and phone support run 9am–9pm (Mon–Fri)." },
        { q: "How do I upgrade or downgrade my subscription?", a: "Visit Billing → Subscription Plan. Choose your desired plan and confirm changes." },
        { q: "What payment options do you support?", a: "We support credit/debit cards, PayPal, Apple Pay, and direct bank transfers." },
        { q: "How secure is my personal and payment data?", a: "Your data is secured with 256-bit encryption and complies with GDPR and PCI-DSS standards." },
        { q: "What is your refund policy?", a: "Refunds are offered within 14 days of payment for annual plans. Monthly plans are non-refundable." },
    ];

    // Send message email
    const handleMessageSubmit = (e) => {
        e.preventDefault();
        emailjs.send(
            "service_xxxxxx", // Replace with your EmailJS service ID
            "template_message", // Replace with your EmailJS template ID for messages
            {
                from_name: messageForm.name,
                message: messageForm.message,
                to_email: "jake.peralata.b2bleads@gmail.com", // Your inbox email
            },
            "public_xxxxxx" // Replace with your EmailJS public key
        )
        .then(() => {
            alert("Message sent successfully!");
            setMessageForm({ name: "", message: "" });
        })
        .catch((err) => {
            console.error(err);
            alert("Failed to send message. Please try again later.");
        });
    };

    // Send ticket email
    const handleTicketSubmit = (e) => {
        e.preventDefault();
        emailjs.send(
            "service_xxxxxx", // Replace with your EmailJS service ID
            "template_ticket", // Replace with your EmailJS template ID for tickets
            {
                subject: ticketForm.subject,
                description: ticketForm.description,
                to_email: "jake.peralata.b2bleads@gmail.com", // Your inbox email
            },
            "public_xxxxxx" // Replace with your EmailJS public key
        )
        .then(() => {
            alert("Ticket submitted successfully!");
            setTicketForm({ subject: "", description: "" });
        })
        .catch((err) => {
            console.error(err);
            alert("Failed to submit ticket. Please try again later.");
        });
    };

    const handleChatClick = () => alert("Starting chat...");

    return (
        <DashboardLayout>
            <div className="help-support-container">
                <div className="help-support-inner">

                    {/* FAQ Section */}
                    <div className="faq-section">
                        <h2>Help & Support</h2>
                        <p>Find quick answers to common questions below.</p>
                        <div className="faq-list">
                            {faqs.map(({ q, a }, i) => (
                                <details key={i} className="faq-item">
                                    <summary>{q}</summary>
                                    <p>{a}</p>
                                </details>
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
                                href="https://mail.google.com/mail/?view=cm&fs=1&to=your_email@example.com&su=Support%20Request&body=Hello,%0A%0AI%20need%20help%20with..."
                                target="_blank"
                                rel="noopener noreferrer"
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

                        {/* Raise Ticket */}
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
                            <p>Need immediate help? Call or chat with us.</p>
                            <p>
                                <strong>Phone:</strong>{" "}
                                <a href="tel:+1234567890">+1 234 567 890</a>
                            </p>
                            <p>
                                <strong>Live Chat:</strong> Available 9am - 9pm (Mon–Fri)
                            </p>
                            <button className="card-button" onClick={handleChatClick}>
                                Start Chat
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
