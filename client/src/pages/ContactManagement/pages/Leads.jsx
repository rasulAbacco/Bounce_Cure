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
    Opened: "bg-green-900/40 text-green-400 border border-green-700",
    Clicked: "bg-blue-900/40 text-blue-400 border border-blue-700",
    Bounced: "bg-red-900/40 text-red-400 border border-red-700",
    Unsubscribed: "bg-yellow-900/40 text-yellow-400 border border-yellow-700",
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
          <Mail className="w-7 h-7 text-yellow-400" /> Email Campaign Leads
        </h1>
        <p className="text-zinc-400 mt-2">
          Track and manage your email campaign leads, engagement, and campaign
          performance in one place.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/60 p-5 rounded-xl border border-zinc-800">
          <p className="text-sm text-zinc-400">Total Leads</p>
          <p className="text-2xl font-bold mt-1">4,320</p>
        </div>
        <div className="bg-zinc-900/60 p-5 rounded-xl border border-zinc-800">
          <p className="text-sm text-zinc-400">Active Campaigns</p>
          <p className="text-2xl font-bold mt-1">12</p>
        </div>
        <div className="bg-zinc-900/60 p-5 rounded-xl border border-zinc-800">
          <p className="text-sm text-zinc-400">Open Rate</p>
          <p className="text-2xl font-bold mt-1">68%</p>
        </div>
        <div className="bg-zinc-900/60 p-5 rounded-xl border border-zinc-800">
          <p className="text-sm text-zinc-400">Click Rate</p>
          <p className="text-2xl font-bold mt-1">42%</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 w-full sm:w-1/3">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search leads..."
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm hover:bg-zinc-800">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-xl font-medium hover:bg-yellow-400">
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="overflow-x-auto border border-zinc-800 rounded-xl">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-zinc-900/60 text-zinc-400 border-b border-zinc-800">
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
              <tr
                key={lead.id}
                className="border-b border-zinc-800 hover:bg-zinc-900/40"
              >
                <td className="px-4 py-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-yellow-400" />
                  {lead.name}
                </td>
                <td className="px-4 py-3 text-zinc-300">{lead.email}</td>
                <td className="px-4 py-3">{lead.campaign}</td>
                <td className="px-4 py-3 text-zinc-400">{lead.source}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${badgeStyle[lead.status]}`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  {lead.score}%
                </td>
                <td className="px-4 py-3 text-zinc-400">{lead.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Campaign Insights */}
      <div className="bg-zinc-900/60 p-6 rounded-xl border border-zinc-800">
        <h2 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-yellow-400" />
          Campaign Insights
        </h2>
        <p className="text-zinc-400 text-sm mb-4">
          Opens vs Clicks over the past 30 days (chart placeholder — you can
          connect Recharts or Chart.js here).
        </p>
        <div className="h-40 flex items-center justify-center text-zinc-500 text-sm border border-dashed border-zinc-700 rounded-lg">
          📊 Chart Placeholder
        </div>
      </div>
    </div>
  );
};

export default Leads;
