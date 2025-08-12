import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaEnvelope, FaTicketAlt, FaPhoneAlt, FaComments } from "react-icons/fa";
import DashboardLayout from "../../components/DashboardLayout";

export default function HelpAndSupport() {
    return (
        <DashboardLayout>
            <div className="min-h-screen  px-6 py-12">
                <div className="max-w-5xl mx-auto space-y-10">

                    {/* Help & Support FAQ (Full Width) */}
                    <div className="bg-gradient-to-br from-[#12263f] to-[#0a1a2f] rounded-lg shadow-lg p-2 border border-white">
                        <h2 className="text-4xl font-bold text-white mb-6">Help & Support</h2>
                        <p className="text-gray-300 mb-6">Need assistance? Check our FAQ for quick answers.</p>
                        <div className="space-y-3">
                            {[
                                { q: "How can I reset my password?", a: "Go to settings → security → reset password." },
                                { q: "Where can I view my invoices?", a: "Invoices are available in the Billing section of your dashboard." },
                                { q: "How do I contact support?", a: "Use the Contact Support form on this page." },
                                { q: "Can I change my subscription plan?", a: "Yes, go to Billing → Subscription → Change Plan to upgrade or downgrade." },
                                { q: "What payment methods do you accept?", a: "We accept credit/debit cards, PayPal, and bank transfers." },
                                { q: "Is my data secure?", a: "Yes, all data is encrypted and stored securely following industry standards." },
                                { q: "Do you offer refunds?", a: "Refunds are available for annual plans within the first 14 days of purchase." },
                            ].map(({ q, a }, i) => (
                                <details key={i} className=" rounded p-3 text-gray-300">
                                    <summary className="cursor-pointer font-medium text-white">{q}</summary>
                                    <p className="mt-2 text-sm">{a}</p>
                                </details>
                            ))}
                        </div>
                    </div>

                    {/* Support Channels Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">

                        {/* Email Support Card */}
                        <div className="bg-gradient-to-br  rounded-lg shadow-lg p-6 border border-white flex flex-col">
                            <div className="flex items-center space-x-8 mb-6">
                                <FaEnvelope className="text-[#c2831f] text-3xl" />
                                <h3 className="text-xl font-semibold text-white">Email Support</h3>
                            </div>
                            <p className="text-gray-300 flex-grow">
                                Reach out to us anytime by email and we’ll get back to you within 24 hours.
                            </p>
                            <a
                                href="mailto:support@example.com"
                                className="mt-4 inline-block bg-[#c2831f] hover:bg-[#c2831f]  font-semibold py-2 rounded text-center transition"
                            >
                                Email Us
                            </a>
                        </div>

                        {/* Contact Support Form Card */}
                        <div className="bg-gradient-to-br  rounded-lg shadow-lg p-6 border border-white flex flex-col justify-between">
                            <div>
                                <div className="flex items-center space-x-3 mb-4">
                                    <FaComments className="text-[#c2831f] text-2xl" />
                                    <h3 className="text-xl font-semibold text-white">Contact Support</h3>
                                </div>
                                <p className="text-gray-300 mb-4">
                                    Still stuck? Our team is here to help you 24/7.
                                </p>

                                <form className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        className="w-full px-4 py-2 rounded  text-white border border-gray-600 focus:border-white outline-none"
                                    />

                                    <textarea
                                        placeholder="Your Message"
                                        className="w-full px-4 py-2 rounded  text-white border border-gray-600 focus:border-white outline-none"
                                        rows="3"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full bg-[#c2831f] hover:bg-[#c2831f]  font-semibold py-2 rounded transition"
                                    >
                                        Send Message
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Raise Ticket Card */}
                        <div className="bg-gradient-to-br  rounded-lg shadow-lg p-6 border border-white flex flex-col justify-between">
                            <div>
                                <div className="flex items-center space-x-3 mb-4">
                                    <FaTicketAlt className="text-[#c2831f] text-2xl" />
                                    <h3 className="text-xl font-semibold text-white">Raise Ticket</h3>
                                </div>
                                <p className="text-gray-300 mb-4">
                                    Submit a ticket for technical issues or account problems.
                                </p>

                                <form className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Subject"
                                        className="w-full px-4 py-2 rounded  text-white border border-gray-600 focus:border-white outline-none"
                                    />
                                    <textarea
                                        placeholder="Describe your issue"
                                        className="w-full px-4 py-2 rounded  text-white border border-gray-600 focus:border-white outline-none"
                                        rows="3"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full bg-[#c2831f] hover:bg-[#c2831f]  font-semibold py-2 rounded transition"
                                    >
                                        Submit Ticket
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Live Chat / Phone Support Card */}
                        <div className="bg-gradient-to-br rounded-lg shadow-lg p-6 border border-white flex flex-col justify-between">
                            <div>
                                <div className="flex items-center space-x-3 mb-4">
                                    <FaPhoneAlt className="text-[#c2831f] text-2xl" />
                                    <h3 className="text-xl font-semibold text-white">Phone & Chat Support</h3>
                                </div>
                                <p className="text-gray-300 mb-4">
                                    Call us or use live chat for immediate assistance.
                                </p>
                                <div className="space-y-2">
                                    <p className="text-gray-300">
                                        <strong>Phone:</strong>{" "}
                                        <a href="tel:+1234567890" className="text-[#c2831f] hover:underline">
                                            +1 234 567 890
                                        </a>
                                    </p>
                                    <p className="text-gray-300">
                                        <strong>Live Chat:</strong> Available 9am - 9pm (Mon-Fri)
                                    </p>
                                </div>
                                <a
                                    href="#"
                                    className="mt-5 inline-block bg-[#c2831f] hover:bg-[#b27210] text-white font-semibold py-3 px-6 rounded text-center cursor-pointer shadow-md hover:shadow-lg transition duration-300"
                                >
                                    Start Chat
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
