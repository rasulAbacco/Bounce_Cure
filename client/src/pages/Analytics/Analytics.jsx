import React, { useState } from "react";
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

  // Example Data
  const trendData = [
    { date: "Aug 1", open: 60, click: 20 },
    { date: "Aug 2", open: 70, click: 30 },
    { date: "Aug 3", open: 50, click: 25 },
    { date: "Aug 4", open: 80, click: 40 },
  ];

  const funnelData = [
    { stage: "Delivered", value: 100 },
    { stage: "Opened", value: 80 },
    { stage: "Clicked", value: 40 },
    { stage: "Purchased", value: 20 },
  ];

  const overTimeData = [
    { date: "Aug 1", value: 5 },
    { date: "Aug 2", value: 8 },
    { date: "Aug 3", value: 6 },
    { date: "Aug 4", value: 9 },
  ];

  const campaignTable = [
    { name: "Campaign A", sent: 1000, open: "60%", click: "20%" },
    { name: "Campaign B", sent: 1500, open: "70%", click: "30%" },
    { name: "Campaign C", sent: 800, open: "50%", click: "25%" },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen   text-white p-6 space-y-6 mt-20">
        
        {/* Header */}
        <div className="flex justify-between items-center relative">
          <h1 className="text-2xl font-bold text-[#c2831f]">Analytics Dashboard</h1>
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
            { title: "Total Sent", value: "5,000" },
            { title: "Open Rate", value: "65%" },
            { title: "Click Rate", value: "25%" },
            { title: "Conversions", value: "500" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-black border border-gray-800 p-4 rounded-xl shadow-lg">
              <h3 className="text-sm text-gray-400">{stat.title}</h3>
              <p className="text-2xl font-bold text-[#c2831f]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Trend Chart */}
        <div className=" border border-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-[#c2831f] mb-4">Open Rates Over Time</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip contentStyle={{ backgroundColor: "#111", border: "none" }} />
                <Line type="monotone" dataKey="open" stroke="#c2831f" strokeWidth={2} />
                <Line type="monotone" dataKey="click" stroke="#4ade80" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Section */}
        <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-2xl shadow-lg">
          {/* Tabs */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-[#c2831f]">Conversions</h2>
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
                  <XAxis type="number" stroke="#ccc" />
                  <YAxis type="category" dataKey="stage" stroke="#ccc" width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111", border: "none", color: "#fff" }}
                  />
                  <Bar dataKey="value" fill="#c2831f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip contentStyle={{ backgroundColor: "#111", border: "none" }} />
                  <Line type="monotone" dataKey="value" stroke="#c2831f" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Campaign Table */}
        <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-lg font-semibold text-[#c2831f] mb-4">Campaign Details</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Sent</th>
                <th className="py-2 px-4">Open Rate</th>
                <th className="py-2 px-4">Click Rate</th>
              </tr>
            </thead>
            <tbody>
              {campaignTable.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-800 hover:bg-gray-900">
                  <td className="py-2 px-4">{row.name}</td>
                  <td className="py-2 px-4">{row.sent}</td>
                  <td className="py-2 px-4">{row.open}</td>
                  <td className="py-2 px-4">{row.click}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
}
