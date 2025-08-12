import React, { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar
} from 'recharts';
import {
    Users, Mail, Eye, MousePointer, TrendingUp, TrendingDown,
    Plus, Upload, Bell, Calendar, CheckCircle, AlertCircle,
    Activity, Globe, Target, DollarSign, Clock, Shield,
    Download, Filter, RefreshCw, Settings, Search, MoreVertical, Ban,
    Zap, Database, Star, Award, AlertTriangle, Info
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Greeting from '../../components/Greeting';
import '../../styles/dashboard.css';

const Dashboard = () => {
    const [timeRange, setTimeRange] = useState('7d');

    // Sample data for charts
    const campaignData = [
        { name: 'Jan', opens: 4000, clicks: 2400, bounces: 400, revenue: 12000 },
        { name: 'Feb', opens: 3000, clicks: 1398, bounces: 300, revenue: 9800 },
        { name: 'Mar', opens: 2000, clicks: 9800, bounces: 200, revenue: 15600 },
        { name: 'Apr', opens: 2780, clicks: 3908, bounces: 278, revenue: 18900 },
        { name: 'May', opens: 1890, clicks: 4800, bounces: 189, revenue: 22100 },
        { name: 'Jun', opens: 2390, clicks: 3800, bounces: 239, revenue: 19400 },
        { name: 'Jul', opens: 3490, clicks: 4300, bounces: 349, revenue: 25800 },
    ];

    const hourlyEngagementData = [
        { hour: '00:00', engagement: 15 }, { hour: '02:00', engagement: 8 }, { hour: '04:00', engagement: 12 },
        { hour: '06:00', engagement: 35 }, { hour: '08:00', engagement: 78 }, { hour: '10:00', engagement: 95 },
        { hour: '12:00', engagement: 85 }, { hour: '14:00', engagement: 92 }, { hour: '16:00', engagement: 88 },
        { hour: '18:00', engagement: 76 }, { hour: '20:00', engagement: 45 }, { hour: '22:00', engagement: 28 }
    ];

    const deviceData = [
        { name: 'Mobile', value: 65, color: '#7C00FE' },
        { name: 'Desktop', value: 28, color: '#4300FF' },
        { name: 'Tablet', value: 7, color: '#16FF00' }
    ];

    const geographicData = [
        { country: 'United States', opens: 2400, clicks: 1200, flag: 'US' },
        { country: 'United Kingdom', opens: 1800, clicks: 900, flag: 'GB' },
        { country: 'Canada', opens: 1200, clicks: 600, flag: '🇨🇦' },
        { country: 'Germany', opens: 1000, clicks: 450, flag: '🇩🇪' },
        { country: 'Australia', opens: 800, clicks: 380, flag: '🇦🇺' }
    ];

    const contactListData = [
        { name: 'Active Subscribers', value: 4500, color: '#4EF037' },
        { name: 'Inactive Users', value: 1200, color: '#ff0000ff' },
        { name: 'New Signups', value: 800, color: '#9400FF' },
        { name: 'Unsubscribed', value: 300, color: '#0002A1' },
    ];

    const recentCampaigns = [
        { name: 'Summer Sale Campaign', date: '2024-08-10', status: 'Sent', open: '24.5%', click: '8.2%', bounce: '2.1%', revenue: '$12,400' },
        { name: 'Product Launch Alert', date: '2024-08-08', status: 'Sent', open: '32.1%', click: '12.4%', bounce: '1.8%', revenue: '$18,900' },
        { name: 'Weekly Newsletter #32', date: '2024-08-05', status: 'Sent', open: '18.7%', click: '5.3%', bounce: '3.2%', revenue: '$5,600' },
        { name: 'Flash Sale Announcement', date: '2024-08-03', status: 'Draft', open: '41.2%', click: '15.6%', bounce: '1.9%', revenue: '$22,100' },
        { name: 'Customer Feedback Survey', date: '2024-08-01', status: 'Scheduled', open: '29.8%', click: '7.4%', bounce: '2.5%', revenue: '$8,300' }
    ];

    const topContacts = [
        { name: 'Sarah Johnson', email: 'sarah@example.com', engagement: '98%', score: 985, location: 'New York' },
        { name: 'Mike Chen', email: 'mike@example.com', engagement: '95%', score: 942, location: 'San Francisco' },
        { name: 'Emma Davis', email: 'emma@example.com', engagement: '92%', score: 918, location: 'London' },
        { name: 'Alex Wilson', email: 'alex@example.com', engagement: '89%', score: 895, location: 'Toronto' },
        { name: 'Lisa Brown', email: 'lisa@example.com', engagement: '87%', score: 872, location: 'Sydney' },
    ];

    const automationFlows = [
        { name: 'Welcome Series', status: 'Active', emails: 5, subscribers: 1240, conversion: '18.5%' },
        { name: 'Abandoned Cart', status: 'Active', emails: 3, subscribers: 856, conversion: '24.2%' },
        { name: 'Re-engagement', status: 'Paused', emails: 4, subscribers: 2100, conversion: '12.8%' },
        { name: 'VIP Customer', status: 'Active', emails: 7, subscribers: 340, conversion: '31.7%' }
    ];

    const notifications = [
        { type: 'success', message: 'Campaign "Summer Sale" delivered successfully to 5,400 subscribers', time: '2 hours ago', priority: 'high' },
        { type: 'warning', message: 'Low engagement detected in segment A - consider re-targeting', time: '4 hours ago', priority: 'medium' },
        { type: 'info', message: 'New contacts imported: 145 added, 12 duplicates removed', time: '6 hours ago', priority: 'low' },
        { type: 'error', message: 'Authentication failed for Mailchimp integration', time: '8 hours ago', priority: 'high' },
        { type: 'success', message: 'A/B test results: Version B outperformed by 15%', time: '1 day ago', priority: 'medium' }
    ];

    const upcomingEvents = [
        { title: 'Product Launch Campaign', date: '2024-08-15', time: '10:00 AM', type: 'campaign' },
        { title: 'Weekly Newsletter Send', date: '2024-08-13', time: '2:00 PM', type: 'newsletter' },
        { title: 'A/B Test Analysis', date: '2024-08-14', time: '9:30 AM', type: 'analysis' },
        { title: 'Quarterly Review Meeting', date: '2024-08-16', time: '3:00 PM', type: 'meeting' }
    ];

    return (
        <DashboardLayout>
            <div className="min-h-screen text-white relative overflow-hidden pt-16">
                {/* Animated Background Elements */}

                <div className="relative z-10">
                    {/* Header Section */}
                    <div className="backdrop-blur-xl  border-b border-white/10 p-6">
                        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            <div>
                                <Greeting />
                                <p className="text-gray-400">Monitor your email marketing performance and insights</p>
                            </div>

                            <div className="cursor-pointer flex flex-wrap items-center gap-4">
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                    className=" cursor-pointer px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white outline-none focus:border-white/40 transition-all duration-300"
                                >
                                    <option value="1d" className="bg-black cursor-pointer">Last 24 hours</option>
                                    <option value="7d" className="bg-black cursor-pointer">Last 7 days</option>
                                    <option value="30d" className="bg-black cursor-pointer">Last 30 days</option>
                                    <option value="90d" className="bg-black cursor-pointer">Last 3 months</option>
                                </select>

                                <button className="cursor-pointer p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300">
                                    <RefreshCw className="w-5 h-5" />
                                </button>

                                <button className="cursor-pointer px-4 py-2 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center gap-2">
                                    <Download className="w-4 h-4" />
                                    Export Report
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto p-6 space-y-8">
                        {/* Key Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 group">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium">Total Contacts</p>
                                        <p className="text-3xl font-bold text-white mt-1">6,800</p>
                                        <div className="flex items-center mt-3">
                                            <TrendingUp className="w-4 h-4 text-white mr-1" />
                                            <span className="text-white text-sm font-medium">+12.5%</span>
                                            <span className="text-gray-500 text-sm ml-2">vs last month</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-all duration-300">
                                        <Users className="w-8 h-8 text-[#c2831f]" />
                                    </div>
                                </div>
                            </div>

                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 group">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium">Revenue Generated</p>
                                        <p className="text-3xl font-bold text-white mt-1">$28.4k</p>
                                        <div className="flex items-center mt-3">
                                            <TrendingUp className="w-4 h-4 text-white mr-1" />
                                            <span className="text-white text-sm font-medium">+18.2%</span>
                                            <span className="text-gray-500 text-sm ml-2">vs last month</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-all duration-300">
                                        <DollarSign className="w-8 h-8 text-[#c2831f]" />
                                    </div>
                                </div>
                            </div>

                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 group">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium">Average Open Rate</p>
                                        <p className="text-3xl font-bold text-white mt-1">28.4%</p>
                                        <div className="flex items-center mt-3">
                                            <TrendingDown className="w-4 h-4 text-gray-400 mr-1" />
                                            <span className="text-gray-400 text-sm font-medium">-2.1%</span>
                                            <span className="text-gray-500 text-sm ml-2">vs last month</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-all duration-300">
                                        <Eye className="w-8 h-8 text-[#c2831f]" />
                                    </div>
                                </div>
                            </div>

                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 group">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium">Click-through Rate</p>
                                        <p className="text-3xl font-bold text-white mt-1">9.7%</p>
                                        <div className="flex items-center mt-3">
                                            <TrendingUp className="w-4 h-4 text-white mr-1" />
                                            <span className="text-white text-sm font-medium">+4.3%</span>
                                            <span className="text-gray-500 text-sm ml-2">vs last month</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-all duration-300">
                                        <MousePointer className="w-8 h-8 text-[#c2831f]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Revenue & Performance Chart */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-500">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white">Revenue & Performance</h3>
                                    <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300">
                                        <MoreVertical className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={campaignData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="name" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: '12px',
                                                color: '#fff',
                                                backdropFilter: 'blur(20px)'
                                            }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="opens" stroke="#ff4800ff" strokeWidth={2} dot={{ fill: '#ff0000ff', r: 3 }} />
                                        <Line type="monotone" dataKey="clicks" stroke="#ffe600ff" strokeWidth={2} dot={{ fill: '#ffe600ff', r: 3 }} />
                                        <Line type="monotone" dataKey="revenue" stroke="#00ff2aff" strokeWidth={2} dot={{ fill: '#00ff0dff', r: 3 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Hourly Engagement */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-500">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white">Hourly Engagement</h3>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-400">Last 24 hours</span>
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={hourlyEngagementData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="hour" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: '12px',
                                                color: '#00ff95ff',
                                                backdropFilter: 'blur(20px)'
                                            }}
                                        />
                                        <Area type="monotone" dataKey="engagement" stroke="#00ff88ff" fill="rgba(255,255,255,0.1)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Analytics Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Contact Distribution */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-500">
                                <h3 className="text-xl font-bold text-white mb-6">Contact Distribution</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={contactListData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#ffffffff"
                                            dataKey="value"
                                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                        >
                                            {contactListData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: '12px',
                                                color: '#fff',
                                                backdropFilter: 'blur(20px)'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    {contactListData.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-sm text-gray-300">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Device Analytics */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-500">
                                <h3 className="text-xl font-bold text-white mb-6">Device Usage</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart
                                        data={deviceData}
                                        layout="vertical" // vertical layout is more common for name on Y-axis
                                        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                                    >
                                        <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
                                        <YAxis dataKey="name" type="category" stroke="#9ca3af" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: '12px',
                                                color: '#000000ff',
                                                backdropFilter: 'blur(20px)',
                                            }}
                                        />
                                        <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                            {deviceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>


                                <div className="space-y-3 mt-6">
                                    {deviceData.map((device, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                            <span className="text-white font-medium">{device.name}</span>
                                            <span className="text-white font-bold">{device.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Geographic Performance */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-500">
                                <h3 className="text-xl font-bold text-white mb-6">Top Regions</h3>
                                <div className="space-y-4">
                                    {geographicData.map((country, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{countryCodeToFlagEmoji(country.flag)}</span>
                                                <div>
                                                    <p className="text-white font-medium">{country.country}</p>
                                                    <p className="text-gray-400 text-sm">{country.opens} opens</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-bold">{country.clicks}</p>
                                                <p className="text-gray-400 text-sm">clicks</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Campaigns Table */}
                        <div className="backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-500">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                <h3 className="text-xl font-bold text-white">Campaign Performance</h3>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                                    <div className="relative w-full sm:w-auto">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search campaigns..."
                                            className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 outline-none focus:border-white/40 transition-all duration-300 w-full"
                                        />
                                    </div>
                                    <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300">
                                        <Filter className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/20">
                                            <th className="text-left text-gray-300 py-4 font-medium">Campaign</th>
                                            <th className="text-left text-gray-300 py-4 font-medium min-w-[100px]">Date</th>
                                            <th className="text-left text-gray-300 py-4 font-medium min-w-[100px]">Status</th>
                                            <th className="text-left text-gray-300 py-4 font-medium">Opens</th>
                                            <th className="text-left text-gray-300 py-4 font-medium">Clicks</th>
                                            <th className="text-left text-gray-300 py-4 font-medium">Revenue</th>
                                            <th className="text-left text-gray-300 py-4 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentCampaigns.map((campaign, index) => (
                                            <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors group">
                                                <td className="py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                        <span className="text-white font-medium">{campaign.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-gray-300 whitespace-nowrap">{campaign.date}</td>
                                                <td className="py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${campaign.status === 'Sent' ? 'bg-[#16FF00]/70 text-black' :
                                                        campaign.status === 'Draft' ? 'bg-[#6528F7]/80 text-gray-300' :
                                                            'bg-[#FFED00]/80 text-black'
                                                        }`}>
                                                        {campaign.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-white font-medium whitespace-nowrap">{campaign.open}</td>
                                                <td className="py-4 text-white font-medium whitespace-nowrap">{campaign.click}</td>
                                                <td className="py-4 text-white font-bold whitespace-nowrap">{campaign.revenue}</td>
                                                <td className="py-4">
                                                    <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100">
                                                        <MoreVertical className="w-4 h-4 text-white" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Bottom Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                            {/* Top Contacts */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-500">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white">Top Performers</h3>
                                    <Award className="w-5 h-5 text-white" />
                                </div>
                                <div className="space-y-4">
                                    {topContacts.map((contact, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">{index + 1}</span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{contact.name}</p>
                                                    <p className="text-gray-400 text-sm">{contact.location}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-bold">{contact.engagement}</p>
                                                <p className="text-gray-400 text-sm">Score: {contact.score}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Automation Flows */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-500">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white">Automation Flows</h3>
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <div className="space-y-4">
                                    {automationFlows.map((flow, index) => (
                                        <div key={index} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-white font-medium">{flow.name}</h4>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${flow.status === 'Active' ? 'bg-[#16FF00]/70 text-black' : 'bg-[#FFED00]/80 text-black'
                                                    }`}>
                                                    {flow.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-400">Emails</p>
                                                    <p className="text-white font-medium">{flow.emails}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Subscribers</p>
                                                    <p className="text-white font-medium">{flow.subscribers}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Conversion</p>
                                                    <p className="text-white font-medium">{flow.conversion}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notifications Panel */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-500">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                                    <Bell className="w-5 h-5 text-white" />
                                </div>
                                <div className="space-y-4 h-120 overflow-y-auto dash-notification">
                                    {notifications.map((notification, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
                                            <div className="mt-1 flex-shrink-0">
                                                {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-[#16FF00]" />}
                                                {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#9C19E0]" />}
                                                {notification.type === 'info' && <Info className="w-5 h-5 text-[#033FFF]" />}
                                                {notification.type === 'error' && <Ban className="w-5 h-5 text-[#FF1E1E]" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm leading-relaxed">{notification.message}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-gray-400 text-xs">{notification.time}</p>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${notification.priority === 'high' ? 'bg-[#06FF00]/80 text-white' :
                                                        notification.priority === 'medium' ? 'bg-[#7900FF]/80 text-gray-300' :
                                                            'bg-[#32E0C4] text-black'
                                                        }`}>
                                                        {notification.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Additional Sections */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Upcoming Events */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-500">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white">Upcoming Events</h3>
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div className="space-y-4">
                                    {upcomingEvents.map((event, index) => (
                                        <div key={index} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                                                {event.type === 'campaign' && <Mail className="w-6 h-6 text-[#c2831f]" />}
                                                {event.type === 'newsletter' && <Globe className="w-6 h-6 text-[#c2831f]" />}
                                                {event.type === 'analysis' && <Activity className="w-6 h-6 text-[#c2831f]" />}
                                                {event.type === 'meeting' && <Users className="w-6 h-6 text-[#c2831f]" />}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-white font-medium">{event.title}</h4>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                                                    <p className="text-gray-400 text-sm">{event.date}</p>
                                                    <p className="text-gray-400 text-sm">{event.time}</p>
                                                </div>
                                            </div>
                                            <button className="cursor-pointer p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100">
                                                <MoreVertical className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button className="cursor-pointer w-full mt-4 p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-all duration-300 border border-white/10 hover:border-white/20">
                                    View All Events
                                </button>
                            </div>

                            {/* Quick Actions */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-500">
                                <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <button className="cursor-pointer w-full bg-white text-black font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:bg-gray-200 flex items-center justify-center gap-3 group">
                                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                                        Create New Campaign
                                    </button>

                                    <button className="cursor-pointer w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30 flex items-center justify-center gap-3 group">
                                        <Upload className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 text-[#c2831f]" />
                                        Import Contacts
                                    </button>

                                    <button className="cursor-pointer w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30 flex items-center justify-center gap-3 group">
                                        <Target className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 text-[#c2831f]" />
                                        Create Segment
                                    </button>

                                    <button className="cursor-pointer w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30 flex items-center justify-center gap-3 group">
                                        <Database className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 text-[#c2831f]" />
                                        Validate Email List
                                    </button>
                                </div>

                                {/* Settings Quick Access */}
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <h4 className="text-white font-medium mb-4">Settings & Tools</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="cursor-pointer p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all duration-300 flex items-center gap-2">
                                            <Settings className="w-4 h-4 text-[#c2831f]" />
                                            <span className="text-sm">Settings</span>
                                        </button>
                                        <button className="cursor-pointer p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all duration-300 flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-[#c2831f]" />
                                            <span className="text-sm">Security</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary Footer */}
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div>
                                    <h4 className="text-2xl font-bold text-white mb-2">99.5%</h4>
                                    <p className="text-gray-400">Deliverability Rate</p>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-white mb-2">2.4M</h4>
                                    <p className="text-gray-400">Emails Processed</p>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-white mb-2">98.7%</h4>
                                    <p className="text-gray-400">System Uptime</p>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-white mb-2">24/7</h4>
                                    <p className="text-gray-400">Support Available</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default Dashboard;
function countryCodeToFlagEmoji(flag) {
    // If it's already an emoji (length > 2), just return it directly
    if (!flag) return '';
    if (flag.length > 2) return flag;

    // Otherwise convert 2-letter country code to emoji
    const codePoints = flag
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}