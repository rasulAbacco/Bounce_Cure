import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import {
    Search,
    Mail,
    Database,
    Users,
    MessageSquare,
    ShoppingCart,
    Zap,
    Server,
    Settings,
    Globe,
    Calendar,
    BarChart3,
    Cloud,
    Code,
    Smartphone,
    FileText,
    Monitor,
    Headphones,
    CreditCard,
    GitBranch,
    Layers
} from 'lucide-react';
import PageLayout from '../components/PageLayout';

const integrationsList = [
    { name: 'Mailchimp', icon: <Mail size={40} />, category: 'Email Marketing', description: 'Send targeted campaigns with verified emails and boost deliverability.' },
    { name: 'HubSpot', icon: <Users size={40} />, category: 'CRM', description: 'Sync validated contacts into your CRM for better lead management.' },
    { name: 'Google Sheets', icon: <Database size={40} />, category: 'Productivity', description: 'Import and validate email lists directly from spreadsheets.' },
    { name: 'Slack', icon: <MessageSquare size={40} />, category: 'Communication', description: 'Get validation alerts and reports in your team channels.' },
    { name: 'Shopify', icon: <ShoppingCart size={40} />, category: 'Ecommerce', description: 'Ensure clean customer lists for marketing campaigns.' },
    { name: 'Zapier', icon: <Zap size={40} />, category: 'Automation', description: 'Connect with 5000+ apps for seamless workflows.' },
    { name: 'MySQL Database', icon: <Server size={40} />, category: 'Database', description: 'Clean and sync emails from your database systems.' },
    { name: 'Salesforce', icon: <Settings size={40} />, category: 'CRM', description: 'Integrate with the world\'s leading CRM platform.' },
    { name: 'WordPress', icon: <Globe size={40} />, category: 'Content Management', description: 'Validate emails from your WordPress forms and subscribers.' },
    { name: 'Google Calendar', icon: <Calendar size={40} />, category: 'Productivity', description: 'Sync event attendee emails and validate registrations.' },
    { name: 'Google Analytics', icon: <BarChart3 size={40} />, category: 'Analytics', description: 'Track email validation metrics and campaign performance.' },
    { name: 'AWS S3', icon: <Cloud size={40} />, category: 'Cloud Storage', description: 'Store and process email lists from cloud storage.' },
    { name: 'GitHub', icon: <Code size={40} />, category: 'Development', description: 'Validate contributor emails and manage repositories.' },
    { name: 'Twilio', icon: <Smartphone size={40} />, category: 'Communication', description: 'Validate phone numbers and email addresses together.' },
    { name: 'Airtable', icon: <FileText size={40} />, category: 'Database', description: 'Sync and validate emails in your Airtable bases.' },
    { name: 'Monday.com', icon: <Monitor size={40} />, category: 'Project Management', description: 'Manage email validation tasks in your workflows.' },
    { name: 'Intercom', icon: <Headphones size={40} />, category: 'Customer Support', description: 'Validate customer emails for better support.' },
    { name: 'Stripe', icon: <CreditCard size={40} />, category: 'Payment', description: 'Ensure valid customer emails for billing and receipts.' },
    { name: 'ActiveCampaign', icon: <GitBranch size={40} />, category: 'Email Marketing', description: 'Advanced automation with validated email lists.' },
    { name: 'ConvertKit', icon: <Layers size={40} />, category: 'Email Marketing', description: 'Creator-focused email marketing with clean lists.' }
];

const categories = ['All', 'Email Marketing', 'CRM', 'Productivity', 'Communication', 'Ecommerce', 'Automation', 'Database', 'Analytics', 'Cloud Storage', 'Development', 'Content Management', 'Project Management', 'Customer Support', 'Payment'];

const IntegrationPage = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredIntegrations = integrationsList.filter((integration) => {
        const matchesSearch = integration.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || integration.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <PageLayout>
            <div className="min-h-screen bg-black relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-amber-400/20 to-yellow-600/20 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
                    <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-l from-white/10 to-gray-300/10 rounded-full filter blur-3xl opacity-25 animate-pulse delay-1000"></div>
                    <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-[600px] h-96 bg-gradient-to-t from-amber-500/15 to-transparent rounded-full filter blur-3xl opacity-20 animate-pulse delay-500"></div>

                    {/* Grid pattern overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30"></div>
                </div>

                {/* Hero Section */}
                <section className="relative pt-24 pb-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Main Header Card */}
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 mb-16 shadow-2xl">
                            <div className="text-center mb-12">
                                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-amber-200 to-yellow-400 bg-clip-text text-transparent leading-tight">
                                    Seamless Integrations
                                </h1>
                                <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                                    Connect with your favorite tools and automate your email validation workflow with our powerful integration ecosystem
                                </p>
                            </div>

                            {/* Enhanced Search and Filter */}
                            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 max-w-4xl mx-auto">
                                <div className="relative w-full lg:w-96 group">
                                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-amber-400 transition-colors duration-300" size={22} />
                                    <input
                                        type="text"
                                        placeholder="Search integrations..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-14 pr-6 py-4 bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-gray-400 outline-none focus:border-amber-400/60 focus:bg-black/30 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 text-lg"
                                    />
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10"></div>
                                </div>

                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-8 py-4 bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl text-white outline-none focus:border-amber-400/60 focus:bg-black/30 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 text-lg cursor-pointer min-w-48"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat} className="bg-black text-white py-2">{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap justify-center gap-8 mt-12 pt-8 border-t border-white/10">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-amber-400 mb-1">{integrationsList.length}+</div>
                                    <div className="text-gray-400 text-sm">Integrations</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-amber-400 mb-1">99.9%</div>
                                    <div className="text-gray-400 text-sm">Uptime</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-amber-400 mb-1">24/7</div>
                                    <div className="text-gray-400 text-sm">Support</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Integrations Grid */}
                <section className="relative py-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredIntegrations.map((integration, index) => (
                                <div
                                    key={index}
                                    className="group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-amber-400/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer"
                                >
                                    {/* Gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    {/* Glow effect */}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl opacity-0 group-hover:opacity-50 blur transition-opacity duration-500 -z-10"></div>

                                    <div className="relative z-10">
                                        {/* Icon Container */}
                                        <div className="flex justify-center mb-6">
                                            <div className="p-4 bg-gradient-to-br from-white/10 to-amber-500/10 rounded-2xl border border-white/20 backdrop-blur-sm group-hover:from-amber-500/20 group-hover:to-yellow-500/20 group-hover:border-amber-400/40 transition-all duration-300 group-hover:scale-110">
                                                <div className="text-white group-hover:text-amber-200 transition-colors duration-300">
                                                    {integration.icon}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="text-center">
                                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-100 transition-colors duration-300">
                                                {integration.name}
                                            </h3>

                                            <p className="text-gray-400 mb-6 leading-relaxed text-sm group-hover:text-gray-300 transition-colors duration-300">
                                                {integration.description}
                                            </p>

                                            <div className="flex items-center justify-center">
                                                <span className="inline-flex items-center px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-full text-xs font-medium text-gray-300 group-hover:bg-amber-500/20 group-hover:border-amber-400/50 group-hover:text-amber-200 transition-all duration-300">
                                                    {integration.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredIntegrations.length === 0 && (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-2xl font-bold text-white mb-2">No integrations found</h3>
                                <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Information Cards */}
                <section className="relative py-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {/* Why Integrations Matter */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-amber-400/30 transition-all duration-500 group">
                                <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl border border-amber-400/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Zap className="text-amber-400" size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                                    Why Integrations Matter
                                </h2>
                                <p className="text-gray-400 leading-relaxed">
                                    Seamlessly integrate with your existing workflow to automatically validate emails, saving time and dramatically improving campaign effectiveness across all your marketing channels.
                                </p>
                            </div>

                            {/* How to Get Started */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-amber-400/30 transition-all duration-500 group">
                                <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl border border-amber-400/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Settings className="text-amber-400" size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                                    Quick Setup
                                </h2>
                                <p className="text-gray-400 leading-relaxed">
                                    Connect any tool in minutes with our simple setup process. No technical knowledge required - just click, authenticate, and start validating emails instantly.
                                </p>
                            </div>

                            {/* API Integration */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-amber-400/30 transition-all duration-500 group md:col-span-2 lg:col-span-1">
                                <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl border border-amber-400/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Code className="text-amber-400" size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                                    Custom API
                                </h2>
                                <p className="text-gray-400 leading-relaxed">
                                    Build custom integrations with our powerful REST API. Connect any service, create unique workflows, and scale your validation needs.
                                </p>
                            </div>
                        </div>

                        {/* Popular Categories Section */}
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 mb-12">
                            <h2 className="text-3xl font-bold text-white mb-8 text-center bg-gradient-to-r from-white via-amber-200 to-yellow-400 bg-clip-text text-transparent">
                                Popular Categories
                            </h2>
                            <div className="flex flex-wrap justify-center gap-4">
                                {categories.slice(1).map((cat, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-6 py-3 backdrop-blur-sm border rounded-xl font-medium transition-all duration-300 hover:scale-105 ${selectedCategory === cat
                                            ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                                            : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30 hover:text-white'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="backdrop-blur-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-400/20 rounded-3xl p-12 text-center">
                            <h2 className="text-4xl font-bold text-white mb-6 bg-gradient-to-r from-white via-amber-200 to-yellow-400 bg-clip-text text-transparent">
                                Ready to Get Started?
                            </h2>
                            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                                Join thousands of businesses already using our integrations to streamline their email validation process.
                            </p>
                            <button
                                onClick={() => navigate("/signup")}
                                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold rounded-2xl hover:from-amber-400 hover:to-yellow-400 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30">
                                Start Integrating Now
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </PageLayout>
    );
};

export default IntegrationPage;