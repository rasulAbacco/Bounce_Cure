import React from "react";
import PageLayout from "../components/PageLayout";
import { CheckCircle, Mail, Shield, Zap, Globe, Clock } from "lucide-react";

const FreeValidation = () => {
    return (
        <PageLayout>
            <div className="min-h-screen bg-black text-white relative w-[100vw]">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-difference filter blur-xl opacity-5 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full mix-blend-difference filter blur-xl opacity-5 animate-pulse"></div>
                    <div className="absolute top-1/3 left-1/4 w-60 h-60 bg-white rounded-full mix-blend-difference filter blur-xl opacity-5 animate-pulse"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 space-y-12">
                    {/* Section 1 - Header */}
                    <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl text-center">
                        <h1 className="text-4xl font-bold mb-4">Email Validation Tool</h1>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                            Ensure your email campaigns reach the inbox. Validate addresses before sending and reduce bounces.
                        </p>
                    </section>

                    {/* Section 2 - Dashboard Overview */}
                    <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4">Validation Dashboard</h2>
                        <p className="text-gray-300 mb-6">
                            Overview of total emails validated, invalid count, and average deliverability score.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { value: "12,340", label: "Validated Emails" },
                                { value: "324", label: "Invalid Emails" },
                                { value: "97%", label: "Deliverability" },
                            ].map((stat, index) => (
                                <div
                                    key={index}
                                    className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-lg hover:scale-105 transition-transform duration-300 text-center"
                                >
                                    <h3 className="text-3xl font-bold">{stat.value}</h3>
                                    <p className="text-gray-400">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 3 - Single Email Validation */}
                    <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl text-center">
                        <h2 className="text-2xl font-bold mb-6">Single Email Validation</h2>
                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <input
                                type="email"
                                placeholder="Enter email address"
                                className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300 flex-1"
                            />
                            <button className="bg-white text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-white/25 hover:bg-gray-100">
                                Validate
                            </button>
                        </div>
                        <p className="text-gray-400 mt-4">
                            Get instant results for a single email — perfect for quick checks.
                        </p>
                    </section>

                    {/* Section 4 - How It Works */}
                    <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6">How Email Validation Works</h2>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-white" />
                                Syntax check – Ensures the format is correct.
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-white" />
                                Domain verification – Confirms MX records exist.
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-white" />
                                Mailbox ping – Checks if the inbox is active.
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-white" />
                                Role-based filtering – Detects generic emails like support@.
                            </li>
                        </ul>
                    </section>

                    {/* Section 5 - Why Validate Emails */}
                    <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl text-center">
                        <h2 className="text-2xl font-bold mb-4">Why Validate Emails?</h2>
                        <p className="text-gray-300 max-w-3xl mx-auto">
                            Improve deliverability, protect your sender reputation, and reduce bounce rates.
                            Email validation is essential for successful marketing campaigns.
                        </p>
                    </section>
                </div>
            </div>
        </PageLayout>
    );
};

export default FreeValidation;
