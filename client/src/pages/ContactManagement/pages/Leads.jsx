import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Mail,
  User,
  BarChart3,
  Activity,
} from "lucide-react";

const Leads = () => {

  const [leads] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      campaign: "Welcome Series",
      source: "Signup Form",
      status: "Opened",
      score: 85,
      last: "Aug 20",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      campaign: "Product Launch",
      source: "Landing Page",
      status: "Clicked",
      score: 92,
      last: "Aug 19",
    },
    {
      id: 3,
      name: "Sam Brown",
      email: "sam@example.com",
      campaign: "Re-engagement",
      source: "Newsletter",
      status: "Bounced",
      score: 10,
      last: "Aug 18",
    },
    {
      id: 4,
      name: "Alice Johnson",
      email: "alice@example.com",
      campaign: "Discount Promo",
      source: "Referral",
      status: "Unsubscribed",
      score: 0,
      last: "Aug 15",
    },
  ]);

  const badgeStyle = {
    Opened: "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-700",
    Clicked: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700",
    Bounced: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700",
    Unsubscribed: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700",
  };

  return (
    <div className="space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-yellow-500 flex items-center gap-2">
          <Mail className="w-7 h-7" /> Email Campaign Leads
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-sm">
          Track and manage your email campaign leads, engagement, and campaign performance.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: "4,320" },
          { label: "Active Campaigns", value: "12" },
          { label: "Open Rate", value: "68%" },
          { label: "Click Rate", value: "42%" },
        ].map((stat) => (
          <div key={stat.label} className="bg-black dark:bg-white-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <p className="text-white  dark:text-white-900">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="flex items-center gap-2 bg-black dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 w-full sm:w-1/3">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search leads..."
            className="bg-transparent outline-none w-full text-sm text-zinc-200 dark:text-white"
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-xl font-medium hover:bg-yellow-400 transition">
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-black-100 dark:bg-zinc-900 text-white dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Campaign</th>
              <th className="px-4 py-3 text-left">Source</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Engagement</th>
              <th className="px-4 py-3 text-left">Last Contacted</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
                <td className="px-4 py-3 flex items-center gap-2 font-medium text-zinc-800 dark:text-white">
                  <User className="w-4 h-4 text-yellow-500" />
                  {lead.name}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{lead.email}</td>
                <td className="px-4 py-3 text-zinc-600">{lead.campaign}</td>
                <td className="px-4 py-3 text-zinc-500">{lead.source}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeStyle[lead.status]}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-3 flex items-center gap-2 text-zinc-600">
                  <Activity className="w-4 h-4 text-green-500" />
                  {lead.score}%
                </td>
                <td className="px-4 py-3 text-zinc-500">{lead.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Campaign Insights Chart Placeholder */}
      <div className="bg-black dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-semibold text-yellow-500 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Campaign Insights
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
          Opens vs Clicks over the past 30 days. (Integrate Recharts or Chart.js here.)
        </p>
        <div className="h-40 flex items-center justify-center text-zinc-500 text-sm border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
          📊 Chart Placeholder
        </div>
      </div>
    </div>
  );
};

export default Leads;
