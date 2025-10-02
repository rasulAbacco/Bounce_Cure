import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
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
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";

const API_URL = import.meta.env.VITE_VRI_URL;

const rateTrendData = [
  { date: "2024-09-25", openRate: 22, clickRate: 10, sentMails: 1200, campaigns: 5 },
  { date: "2024-09-26", openRate: 28, clickRate: 12, sentMails: 1450, campaigns: 7 },
  { date: "2024-09-27", openRate: 30, clickRate: 15, sentMails: 1800, campaigns: 6 },
  { date: "2024-09-28", openRate: 25, clickRate: 11, sentMails: 1600, campaigns: 8 },
  { date: "2024-09-29", openRate: 32, clickRate: 14, sentMails: 2100, campaigns: 9 },
  { date: "2024-09-30", openRate: 35, clickRate: 16, sentMails: 2400, campaigns: 10 },
];

const Dashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [scheduledCampaigns, setScheduledCampaigns] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [sgSummary, setSgSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Fetch SendGrid summary for stats
  useEffect(() => {
    const fetchSendGridSummary = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const data = await fetchWithAuth(
          `${API_URL}/api/analytics/sendgrid/summary`
        );
        console.log("SendGrid summary:", data);
        setSgSummary(data);
      } catch (err) {
        console.error("Error fetching SendGrid summary:", err);
      }
    };
    fetchSendGridSummary();
  }, []);

  // Fetch campaigns with SendGrid integration
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

        // Use the enriched campaigns endpoint like Analytics page
        const [campaignsData, scheduledData] = await Promise.all([
          fetchWithAuth(`${API_URL}/api/analytics/sendgrid/campaigns`).catch(
            () => []
          ),
          fetchWithAuth(`${API_URL}/api/automation/scheduled`).catch(() => []),
        ]);

        console.log("Fetched enriched campaigns:", campaignsData);
        setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
        setScheduledCampaigns(
          Array.isArray(scheduledData) ? scheduledData : []
        );
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const campaignMap = new Map();
    if (Array.isArray(campaigns)) {
      campaigns.forEach((c) =>
        campaignMap.set(c.id, { ...c, source: "campaigns" })
      );
    }
    if (Array.isArray(scheduledCampaigns)) {
      scheduledCampaigns.forEach((s) => {
        if (campaignMap.has(s.id)) {
          campaignMap.set(s.id, {
            ...campaignMap.get(s.id),
            ...s,
            source: "both",
          });
        } else {
          campaignMap.set(s.id, {
            ...s,
            name: s.campaignName,
            source: "scheduled",
          });
        }
      });
    }
    setAllCampaigns(Array.from(campaignMap.values()));
  }, [campaigns, scheduledCampaigns]);

  // Calculate metrics using SendGrid summary data
  const totalSent =
    sgSummary?.processed ||
    campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
  const totalOpens =
    sgSummary?.opens ||
    campaigns.reduce((sum, c) => sum + (c.openCount || 0), 0);
  const totalClicks =
    sgSummary?.clicks ||
    campaigns.reduce((sum, c) => sum + (c.clickCount || 0), 0);

  const openRate =
    totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : "0.0";
  const clickRate =
    totalSent > 0 ? ((totalClicks / totalSent) * 100).toFixed(1) : "0.0";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayCampaigns = allCampaigns.filter((c) => {
    const createdDate = c.createdAt ? new Date(c.createdAt) : null;
    const scheduledDate = c.scheduledDateTime
      ? new Date(c.scheduledDateTime)
      : null;
    return (
      (createdDate >= today && createdDate < tomorrow) ||
      (scheduledDate >= today && scheduledDate < tomorrow)
    );
  });
  const automationSent = Array.isArray(scheduledCampaigns)
    ? scheduledCampaigns.reduce((sum, s) => sum + (s.sentCount || 0), 0)
    : 0;

  const campaignSent = Array.isArray(campaigns)
    ? campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0)
    : 0;

  const totalSents = campaignSent + automationSent;

  const topPerformers = [...allCampaigns]
    .filter((c) => c.sentCount > 0)
    .sort((a, b) => b.openCount / b.sentCount - a.openCount / a.sentCount)
    .slice(0, 5)
    .map((c) => ({
      name: c.name || c.campaignName || "Unnamed Campaign",
      openRate:
        c.openRate ||
        (c.sentCount > 0 ? ((c.openCount / c.sentCount) * 100).toFixed(1) : 0),
      clickRate:
        c.clickRate ||
        (c.sentCount > 0 ? ((c.clickCount / c.sentCount) * 100).toFixed(1) : 0),
      date: c.createdAt
        ? new Date(c.createdAt).toLocaleDateString()
        : c.scheduledDateTime
        ? new Date(c.scheduledDateTime).toLocaleDateString()
        : "Unknown",
    }));

  const recentActivity = [...allCampaigns]
    .sort((a, b) => {
      const dateA = a.createdAt
        ? new Date(a.createdAt)
        : a.scheduledDateTime
        ? new Date(a.scheduledDateTime)
        : new Date(0);
      const dateB = b.createdAt
        ? new Date(b.createdAt)
        : b.scheduledDateTime
        ? new Date(b.scheduledDateTime)
        : new Date(0);
      return dateB - dateA;
    })
    .slice(0, 5)
    .map((c) => ({
      name: c.name || c.campaignName || "Unnamed Campaign",
      date: c.createdAt
        ? new Date(c.createdAt).toLocaleDateString()
        : c.scheduledDateTime
        ? new Date(c.scheduledDateTime).toLocaleDateString()
        : "Unknown",
      status: c.status || "Unknown",
      openRate:
        c.openRate ||
        (c.sentCount > 0 ? ((c.openCount / c.sentCount) * 100).toFixed(1) : 0),
      clickRate:
        c.clickRate ||
        (c.sentCount > 0 ? ((c.clickCount / c.sentCount) * 100).toFixed(1) : 0),
    }));

  const upcomingEvents = Array.isArray(scheduledCampaigns)
    ? scheduledCampaigns
        .filter((c) => c.status === "scheduled" && c.scheduledDateTime)
        .slice(0, 4)
        .map((c) => ({
          title: c.campaignName || "Unnamed Campaign",
          date: new Date(c.scheduledDateTime).toLocaleDateString(),
          time: new Date(c.scheduledDateTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }))
    : [];

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "text-amber-500 bg-amber-500/10",
      sent: "text-green-400 bg-green-400/10",
      paused: "text-yellow-400 bg-yellow-400/10",
      failed: "text-red-400 bg-red-400/10",
      processing: "text-amber-500 bg-amber-500/10",
    };
    return colors[status] || "text-gray-400 bg-gray-400/10";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-16 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-[#c2831f]" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white pt-16">
        <div className="backdrop-blur-xl border-b border-gray-800 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-white">Good Evening</h1>
            <p className="text-gray-400">
              Monitor your email marketing performance and insights
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Sent Mails Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm font-medium">
                    Total Sent Mails
                  </p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {totalSents}
                  </p>
                </div>
                <div className="p-3 bg-gray-800 rounded-2xl group-hover:bg-gray-700 transition-all">
                  <Mail className="w-8 h-8 text-[#c2831f]" />
                </div>
              </div>
              <div className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rateTrendData}>
                    <Line
                      type="monotone"
                      dataKey="sentMails"
                      stroke="#c2831f"
                      strokeWidth={2}
                      dot={{ stroke: '#c2831f', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: '#a66f1a' }}
                    />
                     
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
            </div>

            {/* Total Campaigns Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm font-medium">
                    Total Campaigns
                  </p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {(campaigns?.length || 0) +
                      (scheduledCampaigns?.length || 0)}
                  </p>
                </div>
                <div className="p-3 bg-gray-800 rounded-2xl group-hover:bg-gray-700 transition-all">
                  <Send className="w-8 h-8 text-[#c2831f]" />
                </div>
              </div>
              <div className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rateTrendData}>
                    <Line
                      type="monotone"
                      dataKey="campaigns"
                      stroke="#c2831f"
                      strokeWidth={2}
                      dot={{ stroke: '#c2831f', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: '#a66f1a' }}
                    />
                   
                  </LineChart>
                </ResponsiveContainer>
              </div>
               
            </div>

            {/* Average Open Rate Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition-all">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-400">Average Open Rate</h3>
                <span className="px-2 py-1 text-xs rounded-lg bg-[#c2831f]/10 text-[#c2831f]">
                  %
                </span>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{openRate}%</p>
              <div className="h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rateTrendData}>
                    <Line
                      type="monotone"
                      dataKey="sentMails"
                      stroke="#c2831f"
                      strokeWidth={2}
                      dot={{ stroke: '#c2831f', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: '#a66f1a' }}
                    />
                    
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Click-through Rate Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition-all">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-400">Click-through Rate</h3>
                <span className="px-2 py-1 text-xs rounded-lg bg-[#c2831f]/10 text-[#c2831f]">
                  CTR
                </span>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{clickRate}%</p>
              <div className="h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rateTrendData}>
                    <Line
                      type="monotone"
                      dataKey="sentMails"
                      stroke="#c2831f"
                      strokeWidth={2}
                      dot={{ stroke: '#c2831f', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: '#a66f1a' }}
                    />
                    
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl hover:bg-gray-800 transition-all">
            <h2 className="text-lg font-semibold text-white mb-4">
              Performance Over Time
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={rateTrendData}>
                <defs>
                  <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c2831f" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#c2831f" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorClick" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a66f1a" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a66f1a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <Tooltip
                  contentStyle={{
                    background: "rgba(31, 41, 55, 0.9)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="openRate"
                  stroke="#c2831f"
                  fillOpacity={1}
                  fill="url(#colorOpen)"
                />
                <Area
                  type="monotone"
                  dataKey="clickRate"
                  stroke="#a66f1a"
                  fillOpacity={1}
                  fill="url(#colorClick)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Campaign Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h3 className="text-xl font-bold text-white">
                Campaign Performance
              </h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 outline-none focus:border-[#c2831f]"
                  />
                </div>
                <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                  <Filter className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-96 border-t border-gray-800">
              {allCampaigns.length === 0 ? (
                <p className="text-gray-400 text-center py-10">
                  No campaigns available. Create your first campaign to see
                  performance data.
                </p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-gray-900 z-10">
                    <tr className="border-b border-gray-800">
                      <th className="text-gray-300 py-4 font-medium">
                        Campaign
                      </th>
                      <th className="text-gray-300 py-4 font-medium">Date</th>
                      <th className="text-gray-300 py-4 font-medium">Status</th>
                      <th className="text-gray-300 py-4 font-medium">
                        Open Rate
                      </th>
                      <th className="text-gray-300 py-4 font-medium">
                        Click Rate
                      </th>
                      <th className="py-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCampaigns.map((c, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-800 hover:bg-gray-800/50 group"
                      >
                        <td className="py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-[#c2831f] rounded-full"></div>
                            <span className="text-white font-medium">
                              {c.name || c.campaignName || "Unnamed Campaign"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-gray-300 whitespace-nowrap">
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleDateString()
                            : c.scheduledDateTime
                            ? new Date(c.scheduledDateTime).toLocaleDateString()
                            : "Unknown"}
                        </td>
                        <td className="py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              c.status
                            )}`}
                          >
                            {c.status || "draft"}
                          </span>
                        </td>
                        <td className="py-4 text-white font-medium whitespace-nowrap">
                          {c.openRate ||
                            (c.sentCount > 0
                              ? ((c.openCount / c.sentCount) * 100).toFixed(1)
                              : 0)}
                          %
                        </td>
                        <td className="py-4 text-white font-medium whitespace-nowrap">
                          {c.clickRate ||
                            (c.sentCount > 0
                              ? ((c.clickCount / c.sentCount) * 100).toFixed(1)
                              : 0)}
                          %
                        </td>
                        <td className="py-4">
                          <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 opacity-0 group-hover:opacity-100">
                            <MoreVertical className="w-4 h-4 text-white" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Top Performers */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Top Performers</h3>
                <Award className="w-5 h-5 text-[#c2831f]" />
              </div>
              <div className="space-y-4">
                {topPerformers.length > 0 ? (
                  topPerformers.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {i + 1}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{c.name}</p>
                          <p className="text-gray-400 text-sm">{c.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#c2831f] font-semibold">
                          {c.openRate}%
                        </p>
                        <p className="text-gray-400 text-sm">{c.clickRate}%</p>
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

            {/* Recent Activity */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  Recent Activity
                </h3>
                <Activity className="w-5 h-5 text-[#c2831f]" />
              </div>
              <div className="space-y-4 max-h-120 overflow-y-auto">
                {recentActivity.length > 0 ? (
                  recentActivity.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all"
                    >
                      <Mail className="w-5 h-5 text-[#c2831f] mt-1" />
                      <div className="flex-1">
                        <p className="text-white text-sm">
                          Campaign "{a.name}" {a.status.toLowerCase()}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-gray-400 text-xs">{a.date}</p>
                          <div className="flex gap-2">
                            <span className="text-[#c2831f] text-xs">
                              {a.openRate}%
                            </span>
                            <span className="text-gray-400 text-xs">
                              {a.clickRate}%
                            </span>
                          </div>
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

            {/* Upcoming Events */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  Upcoming Events
                </h3>
                <Calendar className="w-5 h-5 text-[#c2831f]" />
              </div>
              <div className="space-y-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all group"
                    >
                      <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center group-hover:bg-gray-600">
                        <Mail className="w-6 h-6 text-[#c2831f]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{e.title}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-gray-400 text-sm">{e.date}</p>
                          <p className="text-gray-400 text-sm">{e.time}</p>
                        </div>
                      </div>
                      <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming campaigns scheduled</p>
                  </div>
                )}
              </div>
              <button className="block w-full mt-4 p-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium text-center transition-all border border-gray-700 hover:border-gray-600">
                View All Events
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition-all">
            <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="w-full bg-[#c2831f] text-white font-semibold py-4 px-6 rounded-xl hover:bg-[#a66f1a] flex items-center justify-center gap-3 group">
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Create New Campaign
              </button>
              <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl border border-gray-700 hover:border-gray-600 flex items-center justify-center gap-3 group">
                <Upload className="w-5 h-5 group-hover:scale-110 transition-transform text-[#c2831f]" />
                Automations
              </button>
              <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl border border-gray-700 hover:border-gray-600 flex items-center justify-center gap-3 group">
                <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform text-[#c2831f]" />
                Analytics
              </button>
              <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl border border-gray-700 hover:border-gray-600 flex items-center justify-center gap-3 group">
                <Database className="w-5 h-5 group-hover:scale-110 transition-transform text-[#c2831f]" />
                Email Validation
              </button>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-800">
              <h4 className="text-white font-medium mb-4">Settings</h4>
              <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white flex items-center gap-2 w-fit">
                <Settings className="w-4 h-4 text-[#c2831f]" />
                <span className="text-sm">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;