import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Filter,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
} from "recharts";
import DashboardLayout from "../../components/DashboardLayout";

export default function Analytics() {
  const [activeTab, setActiveTab] = useState("funnel");

  // Date picker state
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Filter dropdown state
  const filters = ["All Campaigns", "Email", "SMS", "Push"];
  const [selectedFilter, setSelectedFilter] = useState("All Campaigns");
  const [showFilter, setShowFilter] = useState(false);

  // 🔹 Campaigns state from backend
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch campaigns on mount
  useEffect(() => {
    fetch("http://localhost:5000/api/campaigns")
      .then((res) => res.json())
      .then((data) => {
        setCampaigns(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching campaigns:", err);
        setLoading(false);
      });
  }, []);

  // Build derived stats
  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const totalOpens = campaigns.reduce((sum, c) => sum + c.openCount, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clickCount, 0);
  const totalConversions = campaigns.reduce(
    (sum, c) => sum + c.conversionCount,
    0
  );

  const openRate = totalSent ? ((totalOpens / totalSent) * 100).toFixed(1) + "%" : "0%";
  const clickRate = totalSent ? ((totalClicks / totalSent) * 100).toFixed(1) + "%" : "0%";
  const conversionRate = totalSent ? ((totalConversions / totalSent) * 100).toFixed(1) + "%" : "0%";

  // 🔹 Prepare chart data (last 7 campaigns)
  const trendData = campaigns.slice(0, 7).map((c) => ({
    date: new Date(c.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    open: c.openCount,
    click: c.clickCount,
    conversion: c.conversionCount,
  }));

  const funnelData = [
    { stage: "Delivered", value: totalSent },
    { stage: "Opened", value: totalOpens },
    { stage: "Clicked", value: totalClicks },
    { stage: "Converted", value: totalConversions },
  ];

  const campaignTable = campaigns.map((c) => ({
    name: c.name,
    sent: c.sentCount,
    open: c.sentCount ? ((c.openCount / c.sentCount) * 100).toFixed(1) + "%" : "0%",
    click: c.sentCount ? ((c.clickCount / c.sentCount) * 100).toFixed(1) + "%" : "0%",
    conversion: c.sentCount ? ((c.conversionCount / c.sentCount) * 100).toFixed(1) + "%" : "0%",
  }));

  return (
    <DashboardLayout>
      <div className="min-h-screen text-white p-6 space-y-6 mt-20">
        {/* Header */}
        <div className="flex justify-between items-center relative">
          <h1 className="text-2xl font-bold text-[#c2831f]">
            Analytics Dashboard
          </h1>
          <div className="flex items-center gap-2 relative">
            {/* Date Picker */}
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-1 px-3 py-2 border border-gray-700 rounded-lg bg-black hover:bg-gray-900"
              >
                <CalendarIcon size={18} /> Date Range
              </button>
              {showDatePicker && (
                <div className="absolute right-0 mt-2 bg-white p-3 rounded-lg shadow-lg z-10">
                  <DatePicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(dates) => {
                      const [start, end] = dates;
                      setStartDate(start);
                      setEndDate(end);
                    }}
                    inline
                  />
                  <button
                    className="mt-2 w-full bg-[#c2831f] text-black py-1 rounded-lg"
                    onClick={() => setShowDatePicker(false)}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Total Sent", value: totalSent },
            { title: "Open Rate", value: openRate },
            { title: "Click Rate", value: clickRate },
            { title: "Conversion Rate", value: conversionRate },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-black border border-gray-700 p-4 rounded-xl shadow-lg transition-all duration-200 hover:border-gray-100"
            >
              <h3 className="text-sm text-gray-400">{stat.title}</h3>
              <p className="text-2xl font-bold text-[#c2831f]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Trend Chart */}
        <div className="border border-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-[#c2831f] mb-4">
            Open/Click/Conversion Over Time
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111", border: "none" }}
                />
                <Line type="monotone" dataKey="open" stroke="#c2831f" strokeWidth={2} />
                <Line type="monotone" dataKey="click" stroke="#4ade80" strokeWidth={2} />
                <Line type="monotone" dataKey="conversion" stroke="#60a5fa" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Section */}
        <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-2xl shadow-lg">
          {/* Tabs */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-[#c2831f]">
              Conversions
            </h2>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded-lg text-sm ${
                  activeTab === "funnel"
                    ? "bg-[#c2831f] text-black"
                    : "bg-black text-gray-300 border border-gray-700"
                }`}
                onClick={() => setActiveTab("funnel")}
              >
                Conversion Funnel
              </button>
              <button
                className={`px-3 py-1 rounded-lg text-sm ${
                  activeTab === "overtime"
                    ? "bg-[#c2831f] text-black"
                    : "bg-black text-gray-300 border border-gray-700"
                }`}
                onClick={() => setActiveTab("overtime")}
              >
                Conversions Over Time
              </button>
            </div>
          </div>

          {/* Charts */}
          <div className="h-64 bg-transparent">
            {activeTab === "funnel" ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" stroke="#080808ff" />
                  <YAxis
                    type="category"
                    dataKey="stage"
                    stroke="#ccc"
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111",
                      border: "none",
                      color: "#fff",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#c2831f"
                    barSize={20}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111", border: "none" }}
                  />
                  <Line type="monotone" dataKey="conversion" stroke="#60a5fa" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Campaign Table */}
        <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-lg font-semibold text-[#c2831f] mb-4">
            Campaign Details
          </h2>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-4">Sent</th>
                  <th className="py-2 px-4">Open Rate</th>
                  <th className="py-2 px-4">Click Rate</th>
                  <th className="py-2 px-4">Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {campaignTable.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-800 hover:bg-gray-900"
                  >
                    <td className="py-2 px-4">{row.name}</td>
                    <td className="py-2 px-4">{row.sent}</td>
                    <td className="py-2 px-4">{row.open}</td>
                    <td className="py-2 px-4">{row.click}</td>
                    <td className="py-2 px-4">{row.conversion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
