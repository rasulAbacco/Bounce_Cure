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
                        <h1 className="text-4xl font-bold mb-4 text-[#c2831f]">Email Campaign</h1>
                        <p className="text-gray-300 max-w-2xl mx-auto mt-2">
                            Create, schedule, and automate professional email campaigns that connect with your audience.
                            Optimize your messaging, track engagement, and improve overall deliverability.
                        </p>
                    </section>

                    {/* Section 2 - Campaign Overview */}
                    <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4 text-[#c2831f]">Campaign Performance Dashboard</h2>
                        <p className="text-gray-300 mb-6">
                            Get a snapshot of your campaign reach, engagement rate, and delivery success in real time.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { value: "25,800", label: "Emails Sent" },
                                { value: "4,560", label: "Opens" },
                                { value: "18%", label: "Click Rate" },
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

                    {/* Section 3 - How It Works */}
                    <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-center text-[#c2831f]">How Email Campaigns Work</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { icon: Mail, title: "Compose", desc: "Create personalized and visually appealing email templates." },
                                { icon: Globe, title: "Target", desc: "Segment your audience and reach the right people." },
                                { icon: Zap, title: "Send & Automate", desc: "Schedule or trigger campaigns automatically." },
                                { icon: BarChart2, title: "Track Results", desc: "Monitor open rates, clicks, and conversions." },
                            ].map((item, i) => (
                                <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:scale-105 transition-all duration-300 text-center">
                                    <item.icon className="w-8 h-8 mx-auto mb-4 text-[#c2831f]" />
                                    <h3 className="font-bold text-lg">{item.title}</h3>
                                    <p className="text-gray-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 4 - Why Run Email Campaigns */}
                    <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-center text-[#c2831f]">Why Run Email Campaigns?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            {[
                                { icon: Users, title: "Reach More Customers", desc: "Engage your audience directly in their inbox." },
                                { icon: Shield, title: "Build Trust", desc: "Stay consistent with branded and secure messaging." },
                                { icon: Clock, title: "Automate Delivery", desc: "Save time with automated workflows." },
                                { icon: FileText, title: "Detailed Analytics", desc: "Measure performance and optimize future sends." },
                                { icon: Lock, title: "Data Protection", desc: "All campaign data remains secure and private." },
                                { icon: Zap, title: "Higher ROI", desc: "Email marketing offers the best return per dollar spent." },
                            ].map((item, i) => (
                                <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:scale-105 transition-all duration-300">
                                    <item.icon className="w-8 h-8 mx-auto mb-4 text-[#c2831f]" />
                                    <h3 className="font-bold text-lg">{item.title}</h3>
                                    <p className="text-gray-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 5 - Call to Action */}
                    <section className="bg-white/10 backdrop-blur-xl border border-white/40 rounded-3xl p-8 text-center shadow-2xl">
                        <h2 className="text-3xl font-bold mb-4 text-[#c2831f]">Launch Your First Campaign Today</h2>
                        <p className="text-white/90 mb-6">Sign up and start engaging your audience with powerful email campaigns.</p>
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
