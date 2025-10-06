// client/src/pages/Analytics/Analytics.jsx
import React, { useState, useEffect } from "react";
import { Calendar, Filter, BarChart3, TrendingUp, Users, MousePointer } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import DashboardLayout from "../../components/DashboardLayout";

const API_URL = import.meta.env.VITE_VRI_URL;

export default function Analytics() {
  // Date picker state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Filter dropdown state
  const filters = ["All Campaigns", "Email", "SMS", "Push"];
  const [selectedFilter, setSelectedFilter] = useState("All Campaigns");
  const [showFilter, setShowFilter] = useState(false);

  // Campaigns state
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sgSummary, setSgSummary] = useState(null);

  // Fetch campaigns with SendGrid integration
  useEffect(() => {
    const fetchCampaigns = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in again.");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Use the new integrated endpoint
        const res = await fetch(`${API_URL}/api/analytics/sendgrid/campaigns`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (res.status === 401) {
          setError("Unauthorized. Please log in again.");
          setLoading(false);
          return;
        }
        
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        
        const data = await res.json();
        console.log("Fetched enriched campaigns:", data);
        
        if (Array.isArray(data)) {
          setCampaigns(data);
        } else {
          setCampaigns([]);
        }
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setError("Failed to fetch campaigns.");
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaigns();
  }, []);

  // Fetch SendGrid summary for header stats
  useEffect(() => {
    const fetchSendGridSummary = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/analytics/sendgrid/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        console.log("SendGrid summary:", data);
        setSgSummary(data);
      } catch (err) {
        console.error("Error fetching SendGrid summary:", err);
      }
    };
    fetchSendGridSummary();
  }, []);

  // Header stats - use SendGrid summary
  const totalSent = sgSummary?.processed || campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
  const delivered = sgSummary?.delivered || campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
  const totalOpens = sgSummary?.opens || campaigns.reduce((sum, c) => sum + (c.openCount || 0), 0);
  const totalClicks = sgSummary?.clicks || campaigns.reduce((sum, c) => sum + (c.clickCount || 0), 0);
  const totalConversions = sgSummary?.conversions || campaigns.reduce((sum, c) => sum + (c.conversionCount || 0), 0);

  // Chart data - now uses enriched campaign data with SendGrid stats
  const trendData = campaigns
    .filter(c => c.createdAt)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-7)
    .map((c) => ({
      date: new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      opens: c.openCount || 0,
      clicks: c.clickCount || 0,
      conversions: c.conversionCount || 0,
      openRate: c.openRate || 0,
      clickRate: c.clickRate || 0,
      conversionRate: c.conversionRate || 0,
    }));

  // Campaign table data - now uses enriched campaign data
  const campaignTable = campaigns.map((c) => ({
    id: c.id,
    name: c.name || "Untitled",
    sent: c.sentCount || 0,
    delivered: c.sentCount || 0,
    opens: c.openCount || 0,
    clicks: c.clickCount || 0,
    conversions: c.conversionCount || 0,
    openRate: c.openRate || 0,
    clickRate: c.clickRate || 0,
    conversionRate: c.conversionRate || 0,
  }));

  // Delete campaign
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/campaigns/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error deleting campaign:", err);
      alert("Failed to delete campaign.");
    }
  };

  console.log("Trend data for charts:", trendData);
  console.log("Campaign table data:", campaignTable);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center relative pt-16">
          <h1 className="text-2xl font-bold text-[#c2831f]">Analytics Dashboard</h1>
          <div className="flex items-center gap-2 relative">
            {/* Date Picker */}
            {/* <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-1 px-3 py-2 border border-gray-700 rounded-lg bg-black hover:bg-gray-900"
              >
                <Calendar size={18} /> Date Range
              </button>
              {showDatePicker && (
                <div className="absolute right-0 mt-2 bg-white text-black p-4 rounded-lg shadow-lg z-10 w-64">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <button
                      className="w-full bg-[#c2831f] text-white py-2 rounded-lg hover:bg-[#a36e19]"
                      onClick={() => setShowDatePicker(false)}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div> */}

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-1 px-3 py-2 border border-gray-700 rounded-lg bg-black hover:bg-gray-900"
              >
                <Filter size={18} /> {selectedFilter}
              </button>
              {showFilter && (
                <div className="absolute right-0 mt-2 bg-white text-black rounded-lg shadow-lg z-10">
                  {filters.map((f) => (
                    <div
                      key={f}
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        setSelectedFilter(f);
                        setShowFilter(false);
                      }}
                    >
                      {f}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <div className="bg-red-500 text-white p-3 rounded-lg">{error}</div>}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { title: "Total Sent", value: totalSent.toLocaleString(), icon: <Users size={20} />, color: "bg-blue-500" },
            { title: "Delivered", value: delivered.toLocaleString(), icon: <Users size={20} />, color: "bg-green-500" },
            { title: "Opens", value: totalOpens.toLocaleString(), icon: <BarChart3 size={20} />, color: "bg-[#c2831f]" },
            { title: "Clicks", value: totalClicks.toLocaleString(), icon: <MousePointer size={20} />, color: "bg-[#60a5fa]" },
            { title: "Conversions", value: totalConversions.toLocaleString(), icon: <TrendingUp size={20} />, color: "bg-[#8b5cf6]" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-black border border-gray-700 p-4 rounded-xl shadow-lg transition-all duration-200 hover:border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-gray-400">{stat.title}</h3>
                  <p className="text-2xl font-bold text-[#c2831f]">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-full ${stat.color} bg-opacity-20`}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Engagement Over Time (Count) */}
        <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-[#c2831f] mb-4">Engagement Over Time (Count)</h2>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c2831f]"></div>
            </div>
          ) : trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #444", color: "#fff" }}
                  labelStyle={{ color: "#c2831f" }}
                />
                <Legend />
                <Line type="monotone" dataKey="opens" stroke="#c2831f" strokeWidth={2} name="Opens" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="clicks" stroke="#60a5fa" strokeWidth={2} name="Clicks" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="conversions" stroke="#8b5cf6" strokeWidth={2} name="Conversions" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">No campaign data available for charts. Create your first campaign to see analytics.</p>
          )}
        </div>

        {/* Engagement Rates Over Time (%) */}
        <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-[#c2831f] mb-4">Engagement Rates Over Time (%)</h2>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c2831f]"></div>
            </div>
          ) : trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#888' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #444", color: "#fff" }}
                  labelStyle={{ color: "#c2831f" }}
                  formatter={(value) => `${value}%`}
                />
                <Legend />
                <Bar dataKey="openRate" fill="#c2831f" name="Open Rate %" />
                <Bar dataKey="clickRate" fill="#60a5fa" name="Click Rate %" />
                <Bar dataKey="conversionRate" fill="#8b5cf6" name="Conversion Rate %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">No campaign data available for charts. Create your first campaign to see analytics.</p>
          )}
        </div>

        {/* Campaign Table */}
        <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-lg font-semibold text-[#c2831f] mb-4">Campaign Details</h2>
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c2831f]"></div>
              </div>
            ) : campaigns.length === 0 ? (
              <p className="text-gray-400 text-center py-10">No campaigns available. Create your first campaign to see detailed analytics.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#0a0a0a] z-10">
                  <tr className="border-b border-gray-700 text-gray-400">
                    <th className="py-3 px-4">Campaign Name</th>
                    <th className="py-3 px-4">Sent</th>
                    <th className="py-3 px-4">Delivered</th>
                    <th className="py-3 px-4">Open Rate</th>
                    <th className="py-3 px-4">Click Rate</th>
                    <th className="py-3 px-4">Conversion Rate</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignTable.map((row) => (
                    <tr key={row.id} className="border-b border-gray-800 hover:bg-gray-900 transition-colors">
                      <td className="py-3 px-4 font-medium">{row.name}</td>
                      <td className="py-3 px-4">{row.sent.toLocaleString()}</td>
                      <td className="py-3 px-4">{row.delivered.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="min-w-[35px] font-semibold text-[#c2831f]">{row.openRate}%</span>
                          <div className="w-20 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-[#c2831f] h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(row.openRate, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="min-w-[35px] font-semibold text-[#60a5fa]">{row.clickRate}%</span>
                          <div className="w-20 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-[#60a5fa] h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(row.clickRate, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="min-w-[35px] font-semibold text-[#8b5cf6]">{row.conversionRate}%</span>
                          <div className="w-20 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-[#8b5cf6] h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(row.conversionRate, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="text-red-500 hover:text-red-700 font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}