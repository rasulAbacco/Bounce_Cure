// Dashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Mail,
  Plus,
  Upload,
  Calendar,
  Activity,
  Database,
  Award,
  AlertTriangle,
  RefreshCw,
  Settings,
  Search,
  Filter,
  MoreVertical,
  BarChart3,
  Send,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_VRI_URL;

const Dashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [scheduledCampaigns, setScheduledCampaigns] = useState([]);
  const [sgSummary, setSgSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [greeting, setGreeting] = useState("");

  // Card metrics state
  const [cardMetrics, setCardMetrics] = useState({
    totalSentMails: 0,
    totalCampaigns: 0,
    totalScheduledCampaigns: 0,
    totalScheduledMails: 0,
  });

  // ======== Helper Functions ========
  const fetchWithAuth = async (url) => {
    const token = localStorage.getItem("token");
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login";
        throw new Error("Authentication required");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

  // ======== Fetch Data ========
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in again.");
          setLoading(false);
          return;
        }

        // Fetch all data in parallel
        const [campaignsResponse, scheduledResponse, summaryData] = await Promise.all([
          fetchWithAuth(`${API_URL}/api/analytics/sendgrid/campaigns`).catch(() => ({ campaigns: [] })),
          fetchWithAuth(`${API_URL}/api/automation-logs/scheduled`).catch(() => []),
          fetchWithAuth(`${API_URL}/api/analytics/sendgrid/summary`).catch(() => null),
        ]);

        const campaignsData = Array.isArray(campaignsResponse) 
          ? campaignsResponse 
          : (campaignsResponse.campaigns || []);

        const scheduledData = Array.isArray(scheduledResponse) ? scheduledResponse : [];

        setCampaigns(campaignsData);
        setScheduledCampaigns(scheduledData);
        setSgSummary(summaryData);

        // Calculate card metrics
        // 1. Total Sent Mails - from analytics (SendGrid summary)
        const totalSentMails = summaryData?.processed || 
          campaignsData.reduce((sum, c) => sum + (c.sentCount || 0), 0);

        // 2. Total Campaigns - from analytics (all sent campaigns)
        const totalCampaigns = campaignsData.length;

        // 3. Total Scheduled Campaigns - from automation (status = scheduled)
        const totalScheduledCampaigns = scheduledData.filter(
          c => c.status === "scheduled"
        ).length;

        // 4. Total Scheduled Mails - sum of recipients in scheduled campaigns
        const totalScheduledMails = scheduledData
          .filter(c => c.status === "scheduled")
          .reduce((sum, c) => sum + (c.recipients || c.sentCount || 0), 0);

        setCardMetrics({
          totalSentMails,
          totalCampaigns,
          totalScheduledCampaigns,
          totalScheduledMails,
        });

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

useEffect(() => {
  const updateGreeting = () => {
    const currentHour = new Date().getHours();
    
    if (currentHour >= 5 && currentHour < 12) {
      setGreeting("Good Morning");
    } else if (currentHour >= 12 && currentHour < 17) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  };
  
  updateGreeting();
  const interval = setInterval(updateGreeting, 60 * 1000);
  
  return () => clearInterval(interval);
}, []);


  // ======== Top Performers (by sent count) ========
  const topPerformers = useMemo(() => {
    return [...campaigns]
      .filter(c => c.sentCount > 0)
      .sort((a, b) => b.sentCount - a.sentCount)
      .slice(0, 5)
      .map(c => ({
        name: c.name || "Unnamed Campaign",
        sentCount: c.sentCount || 0,
        openRate: c.openRate || (c.sentCount > 0 ? ((c.openCount / c.sentCount) * 100).toFixed(1) : 0),
        clickRate: c.clickRate || (c.sentCount > 0 ? ((c.clickCount / c.sentCount) * 100).toFixed(1) : 0),
        date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Unknown",
      }));
  }, [campaigns]);

  // ======== Recent Activity (5 most recent campaigns) ========
  const recentActivity = useMemo(() => {
    return [...campaigns]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5)
      .map(c => ({
        name: c.name || "Unnamed Campaign",
        date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Unknown",
        status: c.status || "sent",
        sentCount: c.sentCount || 0,
        openRate: c.openRate || (c.sentCount > 0 ? ((c.openCount / c.sentCount) * 100).toFixed(1) : 0),
      }));
  }, [campaigns]);

  // ======== Upcoming Events (scheduled campaigns) ========
  const upcomingEvents = useMemo(() => {
    return scheduledCampaigns
      .filter(c => c.status === "scheduled" && c.scheduledDateTime)
      .sort((a, b) => new Date(a.scheduledDateTime) - new Date(b.scheduledDateTime))
      .slice(0, 5)
      .map(c => ({
        title: c.campaignName || "Unnamed Campaign",
        date: new Date(c.scheduledDateTime).toLocaleDateString(),
        time: new Date(c.scheduledDateTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        recipients: c.recipients || c.sentCount || 0,
      }));
  }, [scheduledCampaigns]);

  // ======== Campaign Performance Chart Data (Top 10 by sent count) ========
  const campaignChartData = useMemo(() => {
    return [...campaigns]
      .filter(c => c.sentCount > 0)
      .sort((a, b) => b.sentCount - a.sentCount)
      .slice(0, 10)
      .map(c => ({
        name: (c.name || "Unnamed").substring(0, 15) + "...",
        sent: c.sentCount || 0,
        opens: c.openCount || 0,
        clicks: c.clickCount || 0,
      }));
  }, [campaigns]);

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "text-blue-400 bg-blue-400/10",
      sent: "text-green-400 bg-green-400/10",
      paused: "text-yellow-400 bg-yellow-400/10",
      failed: "text-red-400 bg-red-400/10",
      processing: "text-purple-400 bg-purple-400/10",
    };
    return colors[status] || "text-gray-400 bg-gray-400/10";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-black text-white pt-16 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-[#c2831f]" />
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-black text-white pt-16 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-400" />
            <p className="text-red-400 mb-2">Error loading dashboard</p>
            <p className="text-gray-400 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#c2831f] text-white rounded-lg hover:bg-[#a66f1a]"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white pt-16">
        <div className="backdrop-blur-xl border-b border-gray-800 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-white">{greeting}</h1>
            <p className="text-gray-400">
              Monitor your email marketing performance and insights
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Key Metrics - Updated Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Total Sent Mails (from Analytics) */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Sent Mails</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {cardMetrics.totalSentMails.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">From Analytics</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-2xl group-hover:bg-blue-500/30 transition-all">
                  <Send className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </div>

            {/* 2. Total Campaigns (from Analytics) */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Campaigns</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {cardMetrics.totalCampaigns.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">From Analytics</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-2xl group-hover:bg-green-500/30 transition-all">
                  <Mail className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </div>

            {/* 3. Total Scheduled Campaigns (from Automation) */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Scheduled Campaigns</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {cardMetrics.totalScheduledCampaigns.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">From Automation</p>
                </div>
                <div className="p-3 bg-amber-500/20 rounded-2xl group-hover:bg-amber-500/30 transition-all">
                  <Clock className="w-8 h-8 text-amber-400" />
                </div>
              </div>
            </div>

            {/* 4. Total Scheduled Mails (from Automation) */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Scheduled Mails</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {cardMetrics.totalScheduledMails.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">From Automation</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-2xl group-hover:bg-purple-500/30 transition-all">
                  <Calendar className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Performance Chart */}
      
        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-700/50 rounded-3xl p-8 hover:border-gray-600/50 transition-all shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Campaign Performance</h3>
              <p className="text-gray-400 text-sm mt-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#c2831f] rounded-full"></span>
                Top 10 campaigns by sent emails
              </p>
            </div>
            <div className="bg-[#c2831f]/10 p-3 rounded-xl border border-[#c2831f]/20">
              <BarChart3 className="w-6 h-6 text-[#c2831f]" />
            </div>
          </div>

          {campaignChartData.length > 0 ? (
            <div className="h-80 bg-black/10 rounded-2xl p-3 border border-gray-800/50 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignChartData} barSize={32}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f39d12ff" stopOpacity={1} />
                      <stop offset="100%" stopColor="#e9a435ff" stopOpacity={1.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={1.7} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6B7280" 
                    tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <YAxis 
                    stroke="#6B7280" 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "1px solid #374151",
                      borderRadius: "12px",
                      color: "#fff",
                      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
                    }}
                    cursor={{ fill: 'rgba(194, 132, 31, 0.07)' }}
                  />
                  <Bar 
                    dataKey="sent" 
                    fill="url(#barGradient)" 
                    name="Sent" 
                    radius={[12, 12, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-20 bg-black/20 rounded-2xl border border-gray-800/50">
              <div className="bg-gray-800/50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium">No campaign data available</p>
              <p className="text-gray-500 text-sm mt-2">Data will appear here once campaigns are created</p>
            </div>
          )}
        </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Top Performers - By Sent Count */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Top Performers</h3>
                <Award className="w-5 h-5 text-[#c2831f]" />
              </div>
              <p className="text-gray-400 text-sm mb-4">Highest sent email campaigns</p>
              <div className="space-y-4">
                {topPerformers.length > 0 ? (
                  topPerformers.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#c2831f] to-[#a66f1a] rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {i + 1}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium truncate max-w-[150px]">
                            {c.name}
                          </p>
                          <p className="text-gray-400 text-xs">{c.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#c2831f] font-bold text-lg">
                          {c.sentCount.toLocaleString()}
                        </p>
                        <p className="text-gray-400 text-xs">sent</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No campaign data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity - 5 Most Recent */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                <Activity className="w-5 h-5 text-[#c2831f]" />
              </div>
              <p className="text-gray-400 text-sm mb-4">Latest 5 campaigns</p>
              <div className="space-y-4 overflow-y-auto">
                {recentActivity.length > 0 ? (
                  recentActivity.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all"
                    >
                      <div className="p-2 bg-green-500/20 rounded-lg mt-1">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{a.name}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-gray-400 text-xs">{a.date}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(a.status)}`}>
                            {a.status} : {a.sentCount}
                          </span>
                        </div>
                         
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Events - From Automation */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Upcoming Events</h3>
                <Calendar className="w-5 h-5 text-[#c2831f]" />
              </div>
              <p className="text-gray-400 text-sm mb-4">Scheduled campaigns</p>
              <div className="space-y-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all group"
                    >
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30">
                        <Clock className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium truncate">{e.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-gray-400 text-xs">{e.date}</p>
                          <p className="text-gray-400 text-xs">{e.time}</p>
                        </div>
                        <p className="text-[#c2831f] text-xs mt-1">
                          {e.recipients} recipients
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming campaigns scheduled</p>
                  </div>
                )}
              </div>
              <Link
                to="/automation"
                className="block w-full mt-4 p-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium text-center transition-all border border-gray-700 hover:border-[#c2831f]"
              >
                View All Events
              </Link>
            </div>
          </div>

          {/* Quick Actions - Enhanced Styling */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 hover:border-[#c2831f] transition-all">
            <h3 className="text-2xl font-bold text-white mb-2">Quick Actions</h3>
            <p className="text-gray-400 mb-6">Streamline your workflow with these shortcuts</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/email-campaign"
                className="w-full bg-gradient-to-br from-[#c2831f] to-[#a66f1a] text-white font-semibold py-5 px-6 rounded-xl hover:shadow-lg hover:shadow-[#c2831f]/20 flex items-center justify-center gap-3 group transform hover:scale-105 transition-all"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                Create Campaign
              </Link>
              <Link
                to="/automation"
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-5 px-6 rounded-xl border border-gray-700 hover:border-amber-500 flex items-center justify-center gap-3 group transform hover:scale-105 transition-all"
              >
                <Upload className="w-5 h-5 group-hover:scale-110 transition-transform text-amber-400" />
                Automations
              </Link>
              <Link
                to="/analytics"
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-5 px-6 rounded-xl border border-gray-700 hover:border-blue-500 flex items-center justify-center gap-3 group transform hover:scale-105 transition-all"
              >
                <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform text-blue-400" />
                Analytics
              </Link>
              <Link
                to="/verification"
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-5 px-6 rounded-xl border border-gray-700 hover:border-green-500 flex items-center justify-center gap-3 group transform hover:scale-105 transition-all"
              >
                <Database className="w-5 h-5 group-hover:scale-110 transition-transform text-green-400" />
                Email Validation
              </Link>
            </div>
          
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;