import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Mail, Send, Calendar, Activity, TrendingUp,
  MousePointer, BarChart3, RefreshCw, AlertTriangle,
  LayoutDashboard, FileText, Clock, Users, CheckCircle,
  Zap, Filter, Search, Eye, Pause, PlayCircle, MoreVertical,
  XCircle, Shield, X
} from "lucide-react";
import Templets from "./Templets";

const API_URL = "http://localhost:5000";

const Dashboard = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]); // New state for all campaigns
  const [scheduledCampaigns, setScheduledCampaigns] = useState([]);
  const [automationLogs, setAutomationLogs] = useState([]);
  const [sgSummary, setSgSummary] = useState(null);
  const [automationStats, setAutomationStats] = useState({
    scheduled: 0,
    sent: 0,
    processing: 0,
    failed: 0,
    recurring: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [senderVerified, setSenderVerified] = useState(false);
  const [triggerMessage, setTriggerMessage] = useState("");
  const [showTriggerMessage, setShowTriggerMessage] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  // Fetch all campaigns (not just scheduled)
  const fetchAllCampaigns = async () => {
    try {
      const token = localStorage.getItem("token") || "demo-token";
      const response = await fetch(`${API_URL}/api/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Ensure data is an array
      if (Array.isArray(data)) {
        setAllCampaigns(data);
      } else {
        console.error("Unexpected data format for campaigns:", data);
        setAllCampaigns([]);
      }
    } catch (err) {
      console.error("Error fetching all campaigns:", err);
      setAllCampaigns([]); // Set empty array on error
    }
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem("token") || "demo-token";

      // Fetch SendGrid summary
      const summaryRes = await fetch(`${API_URL}/api/analytics/sendgrid/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSgSummary(summaryData);
      }

      // Fetch campaigns with analytics
      const campaignsRes = await fetch(`${API_URL}/api/analytics/sendgrid/campaigns`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (campaignsRes.ok) {
        const campaignsData = await campaignsRes.json();
        setCampaigns(campaignsData);
      }
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to fetch analytics data");
    }
  };

  // Fetch automation data
  const fetchAutomationData = async () => {
    try {
      const token = localStorage.getItem("token") || "demo-token";

      // Fetch automation stats
      const statsRes = await fetch(`${API_URL}/api/automation/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setAutomationStats(statsData);
      }

      // Fetch scheduled campaigns
      const scheduledRes = await fetch(`${API_URL}/api/automation/scheduled`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (scheduledRes.ok) {
        const scheduledData = await scheduledRes.json();
        setScheduledCampaigns(scheduledData);
      }

      // Fetch automation logs
      const logsRes = await fetch(`${API_URL}/api/automation/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setAutomationLogs(logsData);
      }

      // Check sender verification
      const verificationRes = await fetch(`${API_URL}/api/automation/sender/verification`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (verificationRes.ok) {
        const verificationData = await verificationRes.json();
        setSenderVerified(verificationData.verified);
      }
    } catch (err) {
      console.error("Error fetching automation data:", err);
      setError("Failed to fetch automation data");
    }
  };

  // Handle campaign actions
  const handleCampaignAction = async (campaignId, action) => {
    try {
      const token = localStorage.getItem("token") || "demo-token";
      const response = await fetch(`${API_URL}/api/campaigns/${campaignId}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        // Refresh both all campaigns and scheduled campaigns
        await Promise.all([fetchAllCampaigns(), fetchAutomationData()]);
        setShowActionMenu(null);
      } else {
        const error = await response.json();
        alert(`Failed to ${action} campaign: ${error.error || error.message}`);
      }
    } catch (error) {
      console.error(`Error ${action} campaign:`, error);
      alert(`Failed to ${action} campaign: ${error.message}`);
    }
  };


  // Initialize data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchAnalyticsData(),
          fetchAutomationData(),
          fetchAllCampaigns() // Add this to fetch all campaigns
        ]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up periodic refresh
    const interval = setInterval(() => {
      fetchAnalyticsData();
      fetchAutomationData();
      fetchAllCampaigns(); // Add this to refresh all campaigns
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];

  // Calculate metrics from real data
  const totalSent = sgSummary?.processed ?? safeCampaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
  const totalOpens = sgSummary?.opens ?? safeCampaigns.reduce((sum, c) => sum + (c.openCount || 0), 0);
  const totalClicks = sgSummary?.clicks ?? safeCampaigns.reduce((sum, c) => sum + (c.clickCount || 0), 0);
  const totalConversions = sgSummary?.conversions ?? safeCampaigns.reduce((sum, c) => sum + (c.conversionCount || 0), 0);

  // Top performers chart data
  const topPerformersData = [...safeCampaigns]
    .sort((a, b) => (b.openRate || 0) - (a.openRate || 0))
    .slice(0, 5)
    .map(c => ({
      name: c.name?.length > 15 ? c.name.substring(0, 15) + '...' : (c.name || 'Unnamed'),
      openRate: c.openRate || 0,
      clickRate: c.clickRate || 0,
      conversionRate: c.conversionRate || 0,
    }));

  // Recent campaigns
  const recentCampaigns = [...safeCampaigns]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);


  // Filter all campaigns (not just scheduled) - FIXED VERSION
  const filteredCampaigns = allCampaigns.filter(campaign => {
    // Ensure campaign and its properties exist before accessing them
    const campaignName = campaign?.campaignName || campaign?.name || '';
    const subject = campaign?.subject || '';
    const status = campaign?.status || '';

    const matchesSearch = campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Clock size={14} />;
      case 'sent': return <CheckCircle size={14} />;
      case 'paused': return <Pause size={14} />;
      case 'failed': return <XCircle size={14} />;
      case 'processing': return <RefreshCw size={14} className="animate-spin" />;
      case 'draft': return <FileText size={14} />;
      default: return <AlertTriangle size={14} />;
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return 'Invalid date';

    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <RefreshCw className="animate-spin text-[#e2971f]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Header */}
      <div className="flex justify-between items-center ml-5 mt-23">
        <div>
          <h1 className="text-2xl font-bold ">Email Campaign Dashboard</h1>
          <p className="text-gray-400 mb-8">
            Complete email marketing management in one place
          </p>
        </div>

        <div className="flex flex-row items-center justify-center gap-5 mr-8">
          {/* Top Row Actions */}
          <div className="flex space-x-3 cursor-pointer z-50">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-500 text-[#e2971f] hover:text-white hover:border-yellow-500 transition"
            >
              <RefreshCw className="w-6 h-6" />
            </button>
          </div>

          {/* New Campaign Button */}
          <div
            onClick={() => setShowOptions(true)}
            className="border border-yellow-400 hover:bg-yellow-300/20 transition rounded-lg py-3 px-4 flex flex-col items-center justify-center text-yellow-400 cursor-pointer"
          >
            <span className="text-sm font-semibold">New Campaign</span>
          </div>

          {/* Modal */}
          {showOptions && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* Background Blur Overlay */}
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowOptions(false)}
              ></div>

              {/* Modal Content */}
              <div className="relative bg-[#111] text-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-3xl border border-gray-800">
                {/* Close Button */}
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
                  onClick={() => setShowOptions(false)}
                >
                  ✕
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center">
                  Create New Campaign
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Option 1 - Scratch */}
                  <div
                    onClick={() => {
                      setShowOptions(false);
                      localStorage.removeItem("canvasData");
                      navigate("/editor", {
                        state: {
                          template: {
                            pages: [{ id: 1, elements: [] }],
                            activePage: 0,
                          },
                        },
                      });
                    }}
                    className="cursor-pointer bg-gray-900 p-8 rounded-xl hover:bg-gray-800 transition flex flex-col items-center text-center"
                  >
                    <h3 className="text-xl font-semibold mb-2">Start from Scratch</h3>
                    <p className="text-gray-400 text-sm">
                      Create a brand new design with an empty canvas
                    </p>
                  </div>

                  {/* Option 2 - Templates */}
                  <div
                    onClick={() => {
                      setShowOptions(false);
                      navigate("/all-templates");
                    }}
                    className="cursor-pointer bg-gray-900 p-8 rounded-xl hover:bg-gray-800 transition flex flex-col items-center text-center"
                  >
                    <h3 className="text-xl font-semibold mb-2">Choose Templates</h3>
                    <p className="text-gray-400 text-sm">
                      Select from predefined templates
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-800 px-6">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === "dashboard" 
                ? "bg-[#e2971f] text-black rounded-t-lg" 
                : "text-gray-400 hover:text-white"
              }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === "campaigns" 
                ? "bg-[#e2971f] text-black rounded-t-lg" 
                : "text-gray-400 hover:text-white"
              }`}
          >
            <Send size={18} />
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === "templates" 
                ? "bg-[#e2971f] text-black rounded-t-lg" 
                : "text-gray-400 hover:text-white"
              }`}
          >
            <FileText size={18} />
            Templates
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg">
            {error}
          </div>
        )}

        {activeTab === "dashboard" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "Total Sent",
                  value: totalSent.toLocaleString(),
                  icon: <Send size={20} />,
                  color: "bg-blue-500",
                  change: totalSent > 0 ? "↑ 8% vs last month" : "No data"
                },
                { 
                  title: "Opens", 
                  value: totalOpens.toLocaleString(), 
                  icon: <BarChart3 size={20} />, 
                  color: "bg-[#e2971f]",
                  change: totalOpens > 0 ? "↑ 3% vs last month" : "No data"
                },
                {
                  title: "Clicks",
                  value: totalClicks.toLocaleString(),
                  icon: <MousePointer size={20} />,
                  color: "bg-[#60a5fa]",
                  change: totalClicks > 0 ? "↓ 2% vs last month" : "No data"
                },
                {
                  title: "Conversions",
                  value: totalConversions.toLocaleString(),
                  icon: <TrendingUp size={20} />,
                  color: "bg-[#8b5cf6]",
                  change: totalConversions > 0 ? "↑ 5% vs last month" : "No data"
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-[#0a0a0a] border border-gray-700 p-6 rounded-xl shadow-lg transition-all duration-200 hover:border-gray-500"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm text-gray-400 mb-1">{stat.title}</h3>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color} bg-opacity-20`}>{stat.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performing Campaigns Chart */}
              <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-2xl shadow-lg">
                <h2 className="text-lg font-semibold text-white mb-4">Top Performing Campaigns</h2>
                {topPerformersData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topPerformersData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="name" stroke="#888" angle={-15} textAnchor="end" height={80} />
                      <YAxis stroke="#888" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #444", color: "#fff" }}
                        labelStyle={{ color: "#e2971f" }}
                        formatter={(value) => [`${value}%`, '']}
                      />
                      <Legend />
                      <Bar dataKey="openRate" fill="#e2971f" name="Open Rate %" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="clickRate" fill="#60a5fa" name="Click Rate %" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="conversionRate" fill="#8b5cf6" name="Conversion Rate %" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400 text-center py-10">No campaign data available</p>
                )}
              </div>

              {/* Recent Campaigns */}
              <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent Campaigns</h3>
                  <Activity className="text-[#e2971f]" size={20} />
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {recentCampaigns.length > 0 ? (
                    recentCampaigns.map((campaign) => (
                      <div key={campaign.id} className="p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors border border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{campaign.name || 'Unnamed Campaign'}</p>
                            <p className="text-sm text-gray-400">
                              {campaign.createdAt ? formatDateTime(campaign.createdAt) : 'N/A'}
                            </p>
                          </div>
                          <Mail className="text-[#e2971f]" size={18} />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex gap-4">
                            <span className="text-gray-400">
                              Opens: <span className="text-[#e2971f] font-semibold">{campaign.openRate || 0}%</span>
                            </span>
                            <span className="text-gray-400">
                              Clicks: <span className="text-blue-400 font-semibold">{campaign.clickRate || 0}%</span>
                            </span>
                            <span className="text-gray-400">
                              Conversions: <span className="text-purple-400 font-semibold">{campaign.conversionRate || 0}%</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">No campaigns yet</p>
                  )}
                </div>
              </div>
            </div>



            {/* Recent Activity */}
            <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {automationLogs.length > 0 ? (
                  automationLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-900 rounded-lg">
                      <div className={`p-2 rounded-lg ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium">{log.campaignName || 'Unnamed Campaign'}</p>
                        <p className="text-sm text-gray-400">{log.message || 'No details'}</p>
                        {log.details && (
                          <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(log.createdAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">No recent activity</p>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "campaigns" && (
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">All Campaigns</h2>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e2971f]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#e2971f]"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="sent">Sent</option>
                  <option value="paused">Paused</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredCampaigns.length > 0 ? (
                filteredCampaigns.map((campaign) => (
                  <div key={campaign.id} className="p-4 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${getStatusColor(campaign.status)}`}>
                          {getStatusIcon(campaign.status)}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{campaign.campaignName || campaign.name || 'Unnamed Campaign'}</h3>
                          <p className="text-sm text-gray-400">{campaign.subject || 'No subject'}</p>
                          {campaign.scheduledDateTime && (
                            <p className="text-xs text-gray-500 mt-1">
                              Scheduled: {formatDateTime(campaign.scheduledDateTime)}
                            </p>
                          )}
                          {campaign.recurringFrequency && (
                            <p className="text-xs text-gray-500 mt-1">
                              Recurring: {campaign.recurringFrequency}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">

                        <div className="relative">

                          {showActionMenu === campaign.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => console.log('View campaign')}
                                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Eye size={14} />
                                  View Details
                                </button>
                                {campaign.status === 'scheduled' && (
                                  <button
                                    onClick={() => handleCampaignAction(campaign.id, 'pause')}
                                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                  >
                                    <Pause size={14} />
                                    Pause
                                  </button>
                                )}
                                {campaign.status === 'paused' && (
                                  <button
                                    onClick={() => handleCampaignAction(campaign.id, 'resume')}
                                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                  >
                                    <PlayCircle size={14} />
                                    Resume
                                  </button>
                                )}
                                <button
                                  onClick={() => handleCampaignAction(campaign.id, 'delete')}
                                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <XCircle size={14} />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Calendar className="mx-auto text-gray-600 mb-4" size={48} />
                  <h3 className="text-gray-400 font-medium mb-2">No campaigns found</h3>
                  <p className="text-gray-500 mb-4">Create your first campaign to see it here</p>
                  <button
                    onClick={() => window.location.href = '/send-campaign'}
                    className="px-4 py-2 bg-[#e2971f] text-white rounded-lg hover:bg-[#d09025]"
                  >
                    Create Campaign
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "templates" && (
          <Templets />
        )}
      </div>
    </div>
  );
};

export default Dashboard;