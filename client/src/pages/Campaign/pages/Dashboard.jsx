// client/src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar
} from 'recharts';
import {
    Users, Mail, Eye, MousePointer, TrendingUp, TrendingDown,
    Plus, Upload, Bell, Calendar, CheckCircle, AlertCircle,
    Activity, Globe, Target, DollarSign, Clock, Shield,
    Download, Filter, RefreshCw, Settings, Search, MoreVertical, Ban,
    Zap, Database, Star, Award, AlertTriangle, Info,
    Import, BarChart3, Send
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Greeting from '../../components/Greeting';
import '../../styles/dashboard.css';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    
    // Campaigns state
    const [campaigns, setCampaigns] = useState([]);
    const [scheduledCampaigns, setScheduledCampaigns] = useState([]);
    const [automationLogs, setAutomationLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Combined campaigns state
    const [allCampaigns, setAllCampaigns] = useState([]);

            const fetchWithAuth = async (url) => {
            const token = localStorage.getItem('token'); // ✅ this should come from signup/login
            const response = await fetch(url, {
                headers: {
                'Authorization': `Bearer ${token}`,  // ✅ header is set correctly
                'Content-Type': 'application/json'
                }
            });


        if (!response.ok) {
            if (response.status === 401) {
                // Redirect to login or handle authentication error
                window.location.href = '/login'; // Adjust this to your login route
                throw new Error('Authentication required');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    };

    // Fetch campaigns from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch all campaigns with error handling
                try {
                    const campaignsData = await fetchWithAuth("http://localhost:5000/api/campaigns");
                    // Ensure it's an array
                    setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
                } catch (err) {
                    console.error("Error fetching campaigns:", err);
                    setCampaigns([]);
                }
                
                // Fetch scheduled campaigns with error handling
                try {
                    const scheduledData = await fetchWithAuth("http://localhost:5000/api/automation/scheduled");
                    setScheduledCampaigns(Array.isArray(scheduledData) ? scheduledData : []);
                } catch (err) {
                    console.error("Error fetching scheduled campaigns:", err);
                    setScheduledCampaigns([]);
                }
                
                // Fetch automation logs with error handling
                try {
                    const logsData = await fetchWithAuth("http://localhost:5000/api/automation/logs");
                    setAutomationLogs(Array.isArray(logsData) ? logsData : []);
                } catch (err) {
                    console.error("Error fetching automation logs:", err);
                    setAutomationLogs([]);
                }

            } catch (err) {
                setError(err.message);
                console.error("Error in dashboard data fetch:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Combine campaigns and scheduled campaigns
    useEffect(() => {
        // Create a map to avoid duplicates
        const campaignMap = new Map();
        
        // Add regular campaigns (ensure campaigns is an array)
        if (Array.isArray(campaigns)) {
            campaigns.forEach(campaign => {
                campaignMap.set(campaign.id, {
                    ...campaign,
                    source: 'campaigns'
                });
            });
        }
        
        // Add or update with scheduled campaigns (ensure scheduledCampaigns is an array)
        if (Array.isArray(scheduledCampaigns)) {
            scheduledCampaigns.forEach(scheduled => {
                if (campaignMap.has(scheduled.id)) {
                    // Update existing campaign with scheduled data
                    campaignMap.set(scheduled.id, {
                        ...campaignMap.get(scheduled.id),
                        ...scheduled,
                        source: 'both'
                    });
                } else {
                    // Add new scheduled campaign
                    campaignMap.set(scheduled.id, {
                        ...scheduled,
                        name: scheduled.campaignName,
                        source: 'scheduled'
                    });
                }
            });
        }
        
        // Convert map back to array
        setAllCampaigns(Array.from(campaignMap.values()));
    }, [campaigns, scheduledCampaigns]);

    // Build derived stats
    const totalSent = allCampaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
    const totalOpens = allCampaigns.reduce((sum, c) => sum + (c.openCount || 0), 0);
    const totalClicks = allCampaigns.reduce((sum, c) => sum + (c.clickCount || 0), 0);
    const totalConversions = allCampaigns.reduce((sum, c) => sum + (c.conversionCount || 0), 0);

    const openRate = totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : 0;
    const clickRate = totalSent > 0 ? ((totalClicks / totalSent) * 100).toFixed(1) : 0;
    
    // Calculate today's campaigns
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayCampaigns = allCampaigns.filter(campaign => {
        // Check if campaign was created today
        if (campaign.createdAt) {
            const createdDate = new Date(campaign.createdAt);
            if (createdDate >= today && createdDate < tomorrow) {
                return true;
            }
        }
        
        // Check if campaign is scheduled for today
        if (campaign.scheduledDateTime) {
            const scheduledDate = new Date(campaign.scheduledDateTime);
            if (scheduledDate >= today && scheduledDate < tomorrow) {
                return true;
            }
        }
        
        return false;
    });

    // Sample data for charts
    const campaignData = [
        { name: 'Jan', opens: 4000, clicks: 2400, bounces: 400 },
        { name: 'Feb', opens: 3000, clicks: 1398, bounces: 300 },
        { name: 'Mar', opens: 2000, clicks: 9800, bounces: 200 },
        { name: 'Apr', opens: 2780, clicks: 3908, bounces: 278 },
        { name: 'May', opens: 1890, clicks: 4800, bounces: 189 },
        { name: 'Jun', opens: 2390, clicks: 3800, bounces: 239 },
        { name: 'Jul', opens: 3490, clicks: 4300, bounces: 349 },
    ];

    const hourlyEngagementData = [
        { hour: '00:00', engagement: 15 }, { hour: '02:00', engagement: 8 }, { hour: '04:00', engagement: 12 },
        { hour: '06:00', engagement: 35 }, { hour: '08:00', engagement: 78 }, { hour: '10:00', engagement: 95 },
        { hour: '12:00', engagement: 85 }, { hour: '14:00', engagement: 92 }, { hour: '16:00', engagement: 88 },
        { hour: '18:00', engagement: 76 }, { hour: '20:00', engagement: 45 }, { hour: '22:00', engagement: 28 }
    ];

    // Top Performers (Campaigns with highest open rates)
    const topPerformers = [...allCampaigns]
        .filter(campaign => campaign.sentCount > 0) // Only include campaigns that have been sent
        .sort((a, b) => (b.openCount / b.sentCount) - (a.openCount / a.sentCount))
        .slice(0, 5)
        .map(campaign => ({
            name: campaign.name || campaign.campaignName || 'Unnamed Campaign',
            openRate: campaign.sentCount > 0 ? ((campaign.openCount / campaign.sentCount) * 100).toFixed(1) : 0,
            clickRate: campaign.sentCount > 0 ? ((campaign.clickCount / campaign.sentCount) * 100).toFixed(1) : 0,
            date: campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : 
                  campaign.scheduledDateTime ? new Date(campaign.scheduledDateTime).toLocaleDateString() : 'Unknown date'
        }));

    // Recent Activity (Most recent campaigns)
    const recentActivity = [...allCampaigns]
        .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : (a.scheduledDateTime ? new Date(a.scheduledDateTime) : new Date(0));
            const dateB = b.createdAt ? new Date(b.createdAt) : (b.scheduledDateTime ? new Date(b.scheduledDateTime) : new Date(0));
            return dateB - dateA;
        })
        .slice(0, 5)
        .map(campaign => ({
            name: campaign.name || campaign.campaignName || 'Unnamed Campaign',
            date: campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : 
                  campaign.scheduledDateTime ? new Date(campaign.scheduledDateTime).toLocaleDateString() : 'Unknown date',
            status: campaign.status || 'Unknown',
            openRate: campaign.sentCount > 0 ? ((campaign.openCount / campaign.sentCount) * 100).toFixed(1) : 0,
            clickRate: campaign.sentCount > 0 ? ((campaign.clickCount / campaign.sentCount) * 100).toFixed(1) : 0
        }));

    // Upcoming Events (Scheduled campaigns)
    const upcomingEvents = Array.isArray(scheduledCampaigns) ? scheduledCampaigns
        .filter(campaign => campaign.status === 'scheduled' && campaign.scheduledDateTime)
        .map(campaign => ({
            title: campaign.campaignName || 'Unnamed Campaign',
            date: new Date(campaign.scheduledDateTime).toLocaleDateString(),
            time: new Date(campaign.scheduledDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            type: 'campaign'
        }))
        .slice(0, 4) : [];

    // Function to format date and time
    const formatDateTime = (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Function to get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'text-blue-400 bg-blue-400/20';
            case 'sent': return 'text-green-400 bg-green-400/20';
            case 'paused': return 'text-yellow-400 bg-yellow-400/20';
            case 'failed': return 'text-red-400 bg-red-400/20';
            case 'processing': return 'text-purple-400 bg-purple-400/20';
            case 'draft': return 'text-gray-400 bg-gray-400/20';
            default: return 'text-gray-400 bg-gray-400/20';
        }
    };

    // Show loading state
    if (loading) {
        return (
            <DashboardLayout>
                <div className="min-h-screen text-white relative overflow-hidden pt-16">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-[#c2831f]" />
                            <p className="text-gray-400">Loading dashboard...</p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Show error state
    if (error) {
        return (
            <DashboardLayout>
                <div className="min-h-screen text-white relative overflow-hidden pt-16">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-400" />
                            <p className="text-red-400 mb-2">Error loading dashboard</p>
                            <p className="text-gray-400 text-sm">{error}</p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-[#c2831f] text-white rounded-lg hover:bg-[#a66f1a] transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen text-white relative overflow-hidden pt-16">
                <div className="relative z-10">
                    {/* Header Section */}
                    <div className="backdrop-blur-xl border-b border-white/10 p-6">
                        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            <div>
                                <Greeting />
                                <p className="text-gray-400">Monitor your email marketing performance and insights</p>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto p-6 space-y-8">
                        {/* Key Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 group">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium">Total Campaigns</p>
                                        <p className="text-3xl font-bold text-white mt-1">{allCampaigns.length}</p>
                                    </div>
                                    <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-all duration-300">
                                        <Mail className="w-8 h-8 text-[#c2831f]" />
                                    </div>
                                </div>
                            </div>

                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 group">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium">Today Campaigns</p>
                                        <p className="text-3xl font-bold text-white mt-1">{todayCampaigns.length}</p>
                                    </div>
                                    <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-all duration-300">
                                        <Send className="w-8 h-8 text-[#c2831f]" />
                                    </div>
                                </div>
                            </div>

                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 group">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium">Average Open Rate</p>
                                        <p className="text-3xl font-bold text-white mt-1">{openRate}%</p>
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
                                        <p className="text-3xl font-bold text-white mt-1">{clickRate}%</p>
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
                            {/* Performance Chart */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-500">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white">Performance</h3>
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

                        {/* Campaign Performance Table */}
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

                            {/* Scrollable table container with fixed height */}
                            <div className="overflow-y-auto max-h-96 border-t border-white/20">
                                <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-black/100 z-10">
                                    <tr className="border-b border-white/20">
                                    <th className="text-left text-gray-300 py-4 font-medium">Campaign</th>
                                    <th className="text-left text-gray-300 py-4 font-medium min-w-[100px]">Date</th>
                                    <th className="text-left text-gray-300 py-4 font-medium min-w-[100px]">Status</th>
                                    <th className="text-left text-gray-300 py-4 font-medium">Opens</th>
                                    <th className="text-left text-gray-300 py-4 font-medium">Clicks</th>
                                    <th className="py-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allCampaigns.map((campaign, index) => (
                                    <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors group">
                                        <td className="py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                            <span className="text-white font-medium">
                                            {campaign.name || campaign.campaignName || 'Unnamed Campaign'}
                                            {campaign.source === 'scheduled' && (
                                                <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">Scheduled</span>
                                            )}
                                            {campaign.source === 'both' && (
                                                <span className="ml-2 text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">Both</span>
                                            )}
                                            </span>
                                        </div>
                                        </td>
                                        <td className="py-4 text-gray-300 whitespace-nowrap">
                                        {campaign.createdAt
                                            ? new Date(campaign.createdAt).toLocaleDateString()
                                            : campaign.scheduledDateTime
                                            ? new Date(campaign.scheduledDateTime).toLocaleDateString()
                                            : 'Unknown date'}
                                        </td>
                                        <td className="py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                                            {campaign.status || 'draft'}
                                        </span>
                                        </td>
                                        <td className="py-4 text-white font-medium whitespace-nowrap">
                                        {campaign.sentCount > 0 ? ((campaign.openCount / campaign.sentCount) * 100).toFixed(1) : 0}%
                                        </td>
                                        <td className="py-4 text-white font-medium whitespace-nowrap">
                                        {campaign.sentCount > 0 ? ((campaign.clickCount / campaign.sentCount) * 100).toFixed(1) : 0}%
                                        </td>
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
                            {/* Top Performers */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-500">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white">Top Performers</h3>
                                    <Award className="w-5 h-5 text-white" />
                                </div>
                                <div className="space-y-4">
                                    {topPerformers.length > 0 ? topPerformers.map((campaign, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">{index + 1}</span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{campaign.name}</p>
                                                    <p className="text-gray-400 text-sm">{campaign.date}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-bold">{campaign.openRate}%</p>
                                                <p className="text-gray-400 text-sm">Click: {campaign.clickRate}%</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 text-gray-400">
                                            <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>No campaign data available</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-500">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                                    <Activity className="w-5 h-5 text-white" />
                                </div>
                                <div className="space-y-4 h-120 overflow-y-auto dash-notification">
                                    {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
                                            <div className="mt-1 flex-shrink-0">
                                                <Mail className="w-5 h-5 text-[#c2831f]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm leading-relaxed">Campaign "{activity.name}" {activity.status.toLowerCase()}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-gray-400 text-xs">{activity.date}</p>
                                                    <div className="flex gap-2">
                                                        <span className="px-2 py-1 rounded-full text-xs bg-[#16FF00]/80 text-black">
                                                            Open: {activity.openRate}%
                                                        </span>
                                                        <span className="px-2 py-1 rounded-full text-xs bg-[#033FFF]/80 text-white">
                                                            Click: {activity.clickRate}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 text-gray-400">
                                            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>No recent activity</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Upcoming Events */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-500">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white">Upcoming Events</h3>
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div className="space-y-4">
                                    {upcomingEvents.length > 0 ? upcomingEvents.map((event, index) => (
                                        <div key={index} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                                                <Mail className="w-6 h-6 text-[#c2831f]" />
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
                                    )) : (
                                        <div className="text-center py-8 text-gray-400">
                                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>No upcoming campaigns scheduled</p>
                                        </div>
                                    )}
                                </div>
                                <button className="cursor-pointer w-full mt-4 p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-all duration-300 border border-white/10 hover:border-white/20">
                                    <Link to="/automation">View All Events</Link>
                                </button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-500">
                            <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <button className="cursor-pointer w-full bg-white text-black font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:bg-gray-200 flex items-center justify-center gap-3 group">
                                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                                    <Link to="/email-campaign">Create New Campaign</Link>
                                </button>

                                <button className="cursor-pointer w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30 flex items-center justify-center gap-3 group">
                                    <Upload className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 text-[#c2831f]" />
                                    <Link to="/automation">Automations</Link>
                                </button>

                                <button className="cursor-pointer w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30 flex items-center justify-center gap-3 group">
                                    <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 text-[#c2831f]" />
                                    <Link to="/analytics">Analytics</Link>
                                </button>

                                <button className="cursor-pointer w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30 flex items-center justify-center gap-3 group">
                                    <Database className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 text-[#c2831f]" />
                                    <Link to="/verification">Email Validation</Link>
                                </button>
                            </div>

                            {/* Settings Quick Access */}
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <h4 className="text-white font-medium mb-4">Settings</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="cursor-pointer p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all duration-300 flex items-center gap-2">
                                        <Settings className="w-4 h-4 text-[#c2831f]" />
                                        <Link className="text-sm" to="/settings">Settings</Link>
                                    </button>
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