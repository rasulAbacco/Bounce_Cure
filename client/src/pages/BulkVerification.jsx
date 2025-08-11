import React, { useState } from "react";
import { Upload, CheckCircle, XCircle, AlertTriangle, Shield, BarChart2, FileText, Users, Zap } from "lucide-react";
import PageLayout from "../components/PageLayout";
import { Link } from 'react-router-dom'
const BulkVerification = () => {
    const [emails, setEmails] = useState([]);
    const [results, setResults] = useState(null);

    // Demo data for free bulk validation
    const handleDemoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Mock example results
        const demoResults = {
            valid: ["john@example.com", "sarah@test.com", "contact@company.com"],
            invalid: ["fakeemail@", "missingdomain@", "wrong@domain"],
            risky: ["temp@mailinator.com", "info@domain.com"],
        };
        setEmails(Object.values(demoResults).flat());
        setResults(demoResults);
    };

    return (
        <PageLayout>
            <div className="min-h-screen bg-black text-white px-6 py-12 space-y-16">
                {/* Header */}
                <section className="text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold mb-4">Bulk Email Verification</h1>
                    <p className="text-gray-400">
                        Validate your entire email list in one go. Upload your file and instantly identify valid, invalid, and risky addresses.
                    </p>
                </section>

                {/* Demo Upload */}
                <section className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center shadow-xl">
                    <h2 className="text-2xl font-bold mb-4">Free Demo – No Login Required</h2>
                    <p className="text-gray-400 mb-6">Upload a CSV file with up to 10 emails for a free check.</p>
                    <label className="cursor-pointer bg-white text-black px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 hover:scale-105 transition-all duration-300">
                        <Upload className="w-5 h-5" /> Upload CSV
                        <input type="file" accept=".csv" className="hidden" onChange={handleDemoUpload} />
                    </label>
                </section>

                {/* Results */}
                {results && (
                    <section className="space-y-8">
                        <h2 className="text-2xl font-bold text-center">Validation Results</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Valid */}
                            <div className="bg-green-500/10 p-6 rounded-2xl border border-green-500/20">
                                <h3 className="flex items-center gap-2 text-green-400 font-bold mb-3">
                                    <CheckCircle className="w-5 h-5" /> Valid Emails
                                </h3>
                                <ul className="text-gray-300 text-sm space-y-1">
                                    {results.valid.map((email, i) => (
                                        <li key={i}>{email}</li>
                                    ))}
                                </ul>
                            </div>
                            {/* Invalid */}
                            <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20">
                                <h3 className="flex items-center gap-2 text-red-400 font-bold mb-3">
                                    <XCircle className="w-5 h-5" /> Invalid Emails
                                </h3>
                                <ul className="text-gray-300 text-sm space-y-1">
                                    {results.invalid.map((email, i) => (
                                        <li key={i}>{email}</li>
                                    ))}
                                </ul>
                            </div>
                            {/* Risky */}
                            <div className="bg-yellow-500/10 p-6 rounded-2xl border border-yellow-500/20">
                                <h3 className="flex items-center gap-2 text-yellow-400 font-bold mb-3">
                                    <AlertTriangle className="w-5 h-5" /> Risky Emails
                                </h3>
                                <ul className="text-gray-300 text-sm space-y-1">
                                    {results.risky.map((email, i) => (
                                        <li key={i}>{email}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>
                )}

                {/* Why It’s Needed */}
                <section className="bg-white/5 p-8 rounded-3xl border border-white/10 shadow-xl">
                    <h2 className="text-2xl font-bold mb-6 text-center">Why Bulk Verification?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        {[
                            { icon: Shield, title: "Protect Reputation", desc: "Avoid blacklists by removing harmful addresses." },
                            { icon: Zap, title: "Increase Deliverability", desc: "Ensure more emails land in the inbox." },
                            { icon: BarChart2, title: "Improve ROI", desc: "Reach engaged users and boost campaign performance." },
                        ].map((item, i) => (
                            <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                <item.icon className="w-8 h-8 mx-auto mb-4 text-white" />
                                <h3 className="font-bold">{item.title}</h3>
                                <p className="text-gray-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* How It Works */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 text-center">How Bulk Verification Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { icon: Upload, title: "Upload", desc: "Import your email list in CSV format." },
                            { icon: FileText, title: "Analyze", desc: "We check syntax, domain, and inbox activity." },
                            { icon: CheckCircle, title: "Categorize", desc: "Separate emails into Valid, Invalid, and Risky." },
                            { icon: Users, title: "Download", desc: "Export the cleaned list for campaigns." },
                        ].map((item, i) => (
                            <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
                                <item.icon className="w-8 h-8 mx-auto mb-4 text-white" />
                                <h3 className="font-bold">{item.title}</h3>
                                <p className="text-gray-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Extra Sections */}
                <section className="relative p-8 rounded-3xl text-center shadow-2xl 
    bg-black/30 backdrop-blur-lg border border-white/20 overflow-hidden group">

                    {/* Animated shiny border */}
                    <div className="absolute inset-0 rounded-3xl border-[2px] border-transparent 
        bg-gradient-to-r from-transparent via-white/20 to-transparent 
        animate-shine pointer-events-none"></div>

                    <h2 className="text-3xl font-bold mb-4 text-white">
                        Integrate With Your Workflow
                    </h2>
                    <p className="mb-6 text-white/80">
                        Connect with Mailchimp, SendGrid, HubSpot, and more.
                    </p>

                    <Link
                        to="/services/integrations"
                        className="bg-white text-black font-bold py-3 px-6 rounded-xl 
        hover:scale-105 transition-all">
                        View Integrations
                    </Link>
                </section>


                {/* Call to Action */}
                <section className="bg-white/5 p-8 rounded-3xl border border-white/10 shadow-xl text-center">
                    <h2 className="text-3xl font-bold mb-4">Start Cleaning Your Email List</h2>
                    <p className="text-gray-400 mb-6">Sign up now to validate thousands of emails instantly.</p>
                    <Link to="/signup" className="bg-white text-black font-bold py-3 px-6 rounded-xl hover:scale-105 transition-all">
                        Get Started
                    </Link>
                </section>
            </div>
        </PageLayout>
    );
};

export default BulkVerification;
