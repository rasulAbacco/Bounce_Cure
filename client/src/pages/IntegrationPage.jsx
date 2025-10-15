import React, { useState } from 'react';
import {
    Search,
    Users,
    Database,
    TrendingUp,
    Target,
    Smartphone,
    BarChart3,
    Workflow,
    UserCheck,
    Calendar,
    MessageSquare,
    Mail,
    Phone,
    Activity,
    FileText,
    DollarSign,
    Clock,
    Zap,
    Shield,
    Settings,
    CheckCircle
} from 'lucide-react';
import PageLayout from "../components/PageLayout";
import {Link} from "react-router-dom";
const crmFeatures = [
    { name: 'Contact Management', icon: <Users size={40} />, category: 'Core Features', description: 'Centralize customer data and track all interactions in one unified platform.' },
    { name: 'Lead Tracking', icon: <Target size={40} />, category: 'Sales', description: 'Monitor leads through the sales pipeline and convert prospects efficiently.' },
    { name: 'Sales Pipeline', icon: <TrendingUp size={40} />, category: 'Sales', description: 'Visualize deals at every stage and forecast revenue accurately.' },
    { name: 'Task Automation', icon: <Workflow size={40} />, category: 'Automation', description: 'Automate repetitive tasks and workflows to save time and increase productivity.' },
    { name: 'Email Integration', icon: <Mail size={40} />, category: 'Communication', description: 'Send, track, and manage email campaigns directly from your CRM.' },
    { name: 'Analytics Dashboard', icon: <BarChart3 size={40} />, category: 'Analytics', description: 'Get real-time insights with customizable reports and data visualization.' },
    { name: 'Mobile Access', icon: <Smartphone size={40} />, category: 'Productivity', description: 'Access your CRM anywhere with native mobile apps for iOS and Android.' },
    { name: 'Customer Segmentation', icon: <Database size={40} />, category: 'Marketing', description: 'Create targeted segments based on behavior, demographics, and engagement.' },
    { name: 'Activity Tracking', icon: <Activity size={40} />, category: 'Core Features', description: 'Log calls, meetings, notes, and all customer interactions automatically.' },
    { name: 'Calendar Sync', icon: <Calendar size={40} />, category: 'Productivity', description: 'Integrate with Google Calendar and Outlook to schedule meetings seamlessly.' },
    { name: 'Live Chat', icon: <MessageSquare size={40} />, category: 'Communication', description: 'Engage customers in real-time with integrated chat support.' },
    { name: 'Call Management', icon: <Phone size={40} />, category: 'Communication', description: 'Make calls, log conversations, and track call outcomes within the CRM.' },
    { name: 'Document Storage', icon: <FileText size={40} />, category: 'Core Features', description: 'Store and organize contracts, proposals, and customer documents securely.' },
    { name: 'Revenue Forecasting', icon: <DollarSign size={40} />, category: 'Analytics', description: 'Predict future revenue with AI-powered forecasting and trend analysis.' },
    { name: 'Customer Support', icon: <UserCheck size={40} />, category: 'Support', description: 'Manage support tickets and provide exceptional customer service.' },
    { name: 'Team Collaboration', icon: <Users size={40} />, category: 'Productivity', description: 'Share notes, assign tasks, and collaborate with your team effortlessly.' },
    { name: 'Custom Fields', icon: <Settings size={40} />, category: 'Customization', description: 'Customize data fields to match your unique business requirements.' },
    { name: 'API Access', icon: <Workflow size={40} />, category: 'Integration', description: 'Build custom integrations with our robust REST API and webhooks.' },
    { name: 'Data Security', icon: <Shield size={40} />, category: 'Security', description: 'Enterprise-grade security with encryption, backups, and compliance.' },
    { name: 'Performance Metrics', icon: <TrendingUp size={40} />, category: 'Analytics', description: 'Track team performance and individual productivity with detailed metrics.' }
];

const categories = ['All', 'Core Features', 'Sales', 'Marketing', 'Communication', 'Analytics', 'Automation', 'Productivity', 'Support', 'Integration', 'Security', 'Customization'];

const CRMPage = () => {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredFeatures = crmFeatures.filter((feature) => {
        const matchesSearch = feature.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || feature.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <PageLayout>
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-amber-400/20 to-yellow-600/20 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-l from-white/10 to-gray-300/10 rounded-full filter blur-3xl opacity-25 animate-pulse"></div>
                <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-[600px] h-96 bg-gradient-to-t from-amber-500/15 to-transparent rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30"></div>
            </div>

            {/* Hero Section */}
            <section className="relative pt-24 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Main Header Card */}
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 mb-16 shadow-2xl">
                        <div className="text-center mb-12">
                            <div className="flex justify-center mb-6">
                                <div className="p-5 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl border border-amber-400/30">
                                    <Users className="w-16 h-16 text-amber-400" />
                                </div>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-amber-200 to-yellow-400 bg-clip-text text-transparent leading-tight">
                                Customer Relationship Management
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                                Transform your customer relationships with our powerful CRM platform. Manage contacts, track deals, automate workflows, and grow your business with data-driven insights.
                            </p>
                        </div>

                        {/* Enhanced Search and Filter */}
                        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 max-w-4xl mx-auto">
                            <div className="relative w-full lg:w-96 group">
                                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-amber-400 transition-colors duration-300" size={22} />
                                <input
                                    type="text"
                                    placeholder="Search CRM features..."
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
                                <div className="text-3xl font-bold text-amber-400 mb-1">50,000+</div>
                                <div className="text-gray-400 text-sm">Active Users</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-amber-400 mb-1">99.9%</div>
                                <div className="text-gray-400 text-sm">Uptime</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-amber-400 mb-1">5M+</div>
                                <div className="text-gray-400 text-sm">Contacts Managed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-amber-400 mb-1">24/7</div>
                                <div className="text-gray-400 text-sm">Support</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="relative py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredFeatures.map((feature, index) => (
                            <div
                                key={index}
                                className="group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-amber-400/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl opacity-0 group-hover:opacity-50 blur transition-opacity duration-500 -z-10"></div>

                                <div className="relative z-10">
                                    <div className="flex justify-center mb-6">
                                        <div className="p-4 bg-gradient-to-br from-white/10 to-amber-500/10 rounded-2xl border border-white/20 backdrop-blur-sm group-hover:from-amber-500/20 group-hover:to-yellow-500/20 group-hover:border-amber-400/40 transition-all duration-300 group-hover:scale-110">
                                            <div className="text-white group-hover:text-amber-200 transition-colors duration-300">
                                                {feature.icon}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-100 transition-colors duration-300">
                                            {feature.name}
                                        </h3>

                                        <p className="text-gray-400 mb-6 leading-relaxed text-sm group-hover:text-gray-300 transition-colors duration-300">
                                            {feature.description}
                                        </p>

                                        <div className="flex items-center justify-center">
                                            <span className="inline-flex items-center px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-full text-xs font-medium text-gray-300 group-hover:bg-amber-500/20 group-hover:border-amber-400/50 group-hover:text-amber-200 transition-all duration-300">
                                                {feature.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredFeatures.length === 0 && (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-2xl font-bold text-white mb-2">No features found</h3>
                            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Information Cards */}
            <section className="relative py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {/* Why CRM Matters */}
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-amber-400/30 transition-all duration-500 group">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl border border-amber-400/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp className="text-amber-400" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                                Boost Sales Performance
                            </h2>
                            <p className="text-gray-400 leading-relaxed">
                                Increase revenue by up to 45% with better lead management, sales automation, and data-driven insights that help your team close more deals faster.
                            </p>
                        </div>

                        {/* Streamline Operations */}
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-amber-400/30 transition-all duration-500 group">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl border border-amber-400/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Workflow className="text-amber-400" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                                Automate Workflows
                            </h2>
                            <p className="text-gray-400 leading-relaxed">
                                Save 10+ hours per week by automating repetitive tasks like follow-ups, data entry, and lead assignment, allowing your team to focus on relationships.
                            </p>
                        </div>

                        {/* Customer Insights */}
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-amber-400/30 transition-all duration-500 group md:col-span-2 lg:col-span-1">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl border border-amber-400/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <BarChart3 className="text-amber-400" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                                Actionable Insights
                            </h2>
                            <p className="text-gray-400 leading-relaxed">
                                Make smarter decisions with real-time analytics, custom reports, and AI-powered forecasting that predict trends and opportunities.
                            </p>
                        </div>
                    </div>

                    {/* Popular Categories Section */}
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 mb-12">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center bg-gradient-to-r from-white via-amber-200 to-yellow-400 bg-clip-text text-transparent">
                            Explore by Category
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

                    {/* Benefits Section */}
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-10 mb-12">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center bg-gradient-to-r from-white via-amber-200 to-yellow-400 bg-clip-text text-transparent">
                            Why Choose Our CRM?
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { icon: Zap, title: 'Quick Setup', desc: 'Get started in minutes with easy onboarding' },
                                { icon: Shield, title: 'Secure & Compliant', desc: 'Enterprise-grade security and data protection' },
                                { icon: Clock, title: 'Save Time', desc: 'Automate tasks and boost productivity' },
                                { icon: CheckCircle, title: 'Easy to Use', desc: 'Intuitive interface that teams love' }
                            ].map((item, i) => (
                                <div key={i} className="text-center group">
                                    <div className="flex justify-center mb-4">
                                        <div className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl border border-amber-400/30 group-hover:scale-110 transition-transform duration-300">
                                            <item.icon className="w-8 h-8 text-amber-400" />
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-gray-400 text-sm">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="backdrop-blur-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-400/20 rounded-3xl p-12 text-center">
                        <h2 className="text-4xl font-bold text-white mb-6 bg-gradient-to-r from-white via-amber-200 to-yellow-400 bg-clip-text text-transparent">
                            Transform Your Customer Relationships Today
                        </h2>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Join thousands of businesses already using our CRM to grow faster, sell smarter, and build lasting customer relationships.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/login" className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold rounded-2xl hover:from-amber-400 hover:to-yellow-400 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30">
                                Start Free Trial
                            </Link>
                      
                        </div>
                    </div>
                </div>
            </section>
        </div>
        </PageLayout>
    );
};

export default CRMPage;