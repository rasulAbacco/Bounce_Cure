import React from "react";
import PageLayout from "../components/PageLayout";
import {
    CheckCircle,
    Mail,
    Shield,
    Zap,
    Globe,
    Clock,
    BarChart2,
    Upload,
    FileText,
    Users,
    Lock,
} from "lucide-react";
import { Link } from 'react-router-dom';

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
                        <h1 className="text-4xl font-bold mb-4 text-[#c2831f]">Email Validation Tool</h1>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                            Ensure your email campaigns reach the inbox. Validate addresses before sending and reduce bounces.
                        </p>
                    </section>

                    {/* Section 2 - Dashboard Overview */}
                    <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4 text-[#c2831f]">Validation Dashboard</h2>
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
                                    <h3 className="text-3xl font-bold text-[#c2831f]">{stat.value}</h3>
                                    <p className="text-gray-400">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 3 - Bulk Email Validation */}
                    {/* <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl text-center">
                        <h2 className="text-2xl font-bold mb-6">Bulk Email Validation</h2>
                        <p className="text-gray-300 mb-4">Upload your email list and get results instantly with our bulk checker.</p>
                        <button className="bg-white text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-white/25">
                            <Upload className="inline w-5 h-5 mr-2" /> Upload CSV
                        </button>
                    </section> */}

                    {/* Section 4 - Single Email Validation */}
                    <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl text-center">
                        <h2 className="text-2xl font-bold mb-6 text-[#c2831f]">Single Email Validation</h2>
                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <input
                                type="email"
                                placeholder="Enter email address"
                                className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300 flex-1"
                            />
                            <button className="bg-white text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-white/25">
                                Validate
                            </button>
                        </div>
                        <p className="text-gray-400 mt-4">
                            Get instant results for a single email — perfect for quick checks.
                        </p>
                    </section>

                    {/* Section 5 - How It Works */}
                    <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-center text-[#c2831f]">How Email Validation Works</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { icon: Mail, title: "Syntax Check", desc: "Ensures the email format is correct." },
                                { icon: Globe, title: "Domain Verification", desc: "Confirms MX records exist." },
                                { icon: Shield, title: "Mailbox Ping", desc: "Checks if the inbox is active." },
                                { icon: Users, title: "Role-based Filtering", desc: "Detects generic emails like support@." },
                            ].map((item, i) => (
                                <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:scale-105 transition-all duration-300 text-center">
                                    <item.icon className="w-8 h-8 mx-auto mb-4 text-[#c2831f]" />
                                    <h3 className="font-bold text-lg">{item.title}</h3>
                                    <p className="text-gray-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 6 - Why Validate Emails */}
                    <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-center text-[#c2831f]">Why Validate Emails?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            {[
                                { icon: Shield, title: "Protect Reputation", desc: "Avoid spam complaints and blacklists." },
                                { icon: Zap, title: "Improve Deliverability", desc: "Increase the chances of hitting the inbox." },
                                { icon: BarChart2, title: "Reduce Bounce Rate", desc: "Lower email bounces for better metrics." },
                                { icon: Lock, title: "Data Security", desc: "Your data is encrypted and safe." },
                                { icon: FileText, title: "Compliance", desc: "Stay GDPR and CAN-SPAM compliant." },
                                { icon: Users, title: "Better Targeting", desc: "Reach the right audience effectively." },
                            ].map((item, i) => (
                                <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:scale-105 transition-all duration-300">
                                    <item.icon className="w-8 h-8 mx-auto mb-4 text-[#c2831f]" />
                                    <h3 className="font-bold text-lg">{item.title}</h3>
                                    <p className="text-gray-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 7 - Call to Action */}
                    <section className="bg-white/10 backdrop-blur-xl border border-white/40 rounded-3xl p-8 text-center shadow-2xl">
                        <h2 className="text-3xl font-bold mb-4 text-[#c2831f]">Start Validating Emails Today</h2>
                        <p className="text-white/90 mb-6">Sign up now and get 100 free validations.</p>
                        <Link to="/signup" className="bg-white text-black font-bold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300">
                            Get Started
                        </Link>
                    </section>
                </div>
            </div>
        </PageLayout>
    );
};

export default FreeValidation;
