import React, { useState } from 'react';
import {
    Search,
    Mail,
    Database,
    Users,
    MessageSquare,
    ShoppingCart,
    Zap,
    Server
} from 'lucide-react';
import PageLayout from '../components/PageLayout';

const integrationsList = [
    { name: 'Mailchimp', icon: <Mail size={40} />, category: 'Email Marketing', description: 'Send targeted campaigns with verified emails.' },
    { name: 'HubSpot', icon: <Users size={40} />, category: 'CRM', description: 'Sync validated contacts into your CRM.' },
    { name: 'Google Sheets', icon: <Database size={40} />, category: 'Productivity', description: 'Import and validate email lists directly.' },
    { name: 'Slack', icon: <MessageSquare size={40} />, category: 'Communication', description: 'Get validation alerts in your team\'s channel.' },
    { name: 'Shopify', icon: <ShoppingCart size={40} />, category: 'Ecommerce', description: 'Ensure clean customer lists for marketing.' },
    { name: 'Zapier', icon: <Zap size={40} />, category: 'Automation', description: 'Connect with 5000+ apps for workflows.' },
    { name: 'MySQL Database', icon: <Server size={40} />, category: 'Database', description: 'Clean and sync emails from your database.' }
];

const categories = ['All', 'Email Marketing', 'CRM', 'Productivity', 'Communication', 'Ecommerce', 'Automation', 'Database'];

const IntegrationPage = () => {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredIntegrations = integrationsList.filter((integration) => {
        const matchesSearch = integration.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || integration.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <PageLayout>
            <div className="min-h-screen relative overflow-hidden">
                {/* Background blur elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                    <div className="absolute top-40 right-20 w-72 h-72 bg-white-500 rounded-full  filter blur-xl opacity-20  delay-1000"></div>
                    <div className="absolute -bottom-8 left-40 w-72 h-72 bg-white-500 rounded-full  filter blur-xl opacity-20  delay-500"></div>
                </div>

                {/* Hero Section with Search & Filter */}
                <section className="relative pt-20 pb-16 px-6">
                    <div className="max-w-6xl mx-auto">
                        {/* Glass morphism header */}
                        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 mb-12">
                            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                                Powerful Integrations
                            </h1>
                            <p className="text-xl text-gray-300 text-center mb-8">
                                Connect with your favorite tools and automate your email validation workflow
                            </p>

                            {/* Search and Filter Controls */}
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                                <div className="relative w-full md:w-96">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search integrations..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 outline-none focus:border-blue-400/50 focus:bg-white/20 transition-all duration-300"
                                    />
                                </div>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white outline-none focus:border-blue-400/50 focus:bg-white/20 transition-all duration-300"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat} className="bg-gray-900 text-white">{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Integrations Grid */}
                <section className="relative py-16 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredIntegrations.map((integration, index) => (
                                <div
                                    key={index}
                                    className="group relative backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/20 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
                                >
                                    {/* Gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    <div className="relative z-10 text-center">
                                        {/* Icon with better visibility */}
                                        <div className="flex justify-center mb-6">
                                            <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-white/20 backdrop-blur-sm group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                                                <div className="text-white group-hover:text-blue-200 transition-colors duration-300">
                                                    {integration.icon}
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-100 transition-colors duration-300">
                                            {integration.name}
                                        </h3>

                                        <p className="text-gray-300 mb-4 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                                            {integration.description}
                                        </p>

                                        <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-xs font-medium text-white group-hover:bg-blue-500/30 group-hover:border-blue-400/50 transition-all duration-300">
                                            {integration.category}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Information Sections */}
                <section className="relative py-16 px-6">
                    <div className="max-w-6xl mx-auto space-y-12">
                        {/* Why Integrations Matter & How to Get Started */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
                                <h2 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                                    Why Integrations Matter
                                </h2>
                                <p className="text-gray-300 leading-relaxed">
                                    Integrating with your favorite tools ensures your email lists stay clean automatically, saving time and increasing campaign effectiveness.
                                </p>
                            </div>
                            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
                                <h2 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                                    How to Get Started
                                </h2>
                                <p className="text-gray-300 leading-relaxed">
                                    Choose your preferred tool, connect it with our system, and start validating emails instantly without any manual uploads.
                                </p>
                            </div>
                        </div>

                        {/* Popular Categories */}
                        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-6 bg-gradient-to-r from-green-200 to-blue-200 bg-clip-text text-transparent">
                                Popular Categories
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {categories.slice(1).map((cat, i) => (
                                    <span key={i} className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white hover:bg-white/30 hover:border-white/50 transition-all duration-300 cursor-pointer">
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* API Integrations */}
                        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
                            <h2 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
                                API Integrations
                            </h2>
                            <p className="text-gray-300 leading-relaxed">
                                Use our API to connect with any service, even if it's not listed in our integrations directory. Build custom workflows that fit your unique needs.
                            </p>
                        </div>

                        {/* Upcoming Integrations */}
                        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
                            <h2 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-pink-200 to-purple-200 bg-clip-text text-transparent">
                                Upcoming Integrations
                            </h2>
                            <p className="text-gray-300 leading-relaxed">
                                We're constantly adding new tools based on user feedback. Stay tuned for our upcoming releases and help us prioritize what matters to you!
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </PageLayout>
    );
};

export default IntegrationPage;