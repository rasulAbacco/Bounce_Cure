// import React from 'react'

// import DashboardLayout from '../../components/DashboardLayout'

// const ConatctManagement = () => {
//     return (
//         <DashboardLayout>
//             <div>ConatctManagement</div>

//         </DashboardLayout>
//     )
// }

// export default ConatctManagement




import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  UserPlus,
  Download,
  Search,
  Mail,
  CheckCircle,
  XCircle,
  PlusCircle,
  Upload,
  BarChart2,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DashboardLayout from "../../components/DashboardLayout";

export default function ConatctManagement() {
  const [stats, setStats] = useState([]);
  const [clients, setClients] = useState([]);
  const [activities, setActivities] = useState([]);
  const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/overview");
      console.log("API response:", res.data); // 👈 debug log
      setStats(res.data.stats || []);
      setClients(res.data.clients || []);
      setActivities(res.data.activities || []);
      setHistory(res.data.history || []);
    } catch (err) {
      console.error("Fake API load failed", err);
    }
  };
  fetchData();
}, []);


  return (
    <DashboardLayout>
      <div className="p-6 bg-black min-h-screen text-white mt-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#c2831f]">CRM Dashboard</h1>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#c2831f] text-black rounded-lg hover:bg-[#d3962c] transition">
              <UserPlus size={18} /> Add Client
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg hover:border-[#c2831f] transition">
              <Download size={18} /> Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border border-gray-800 rounded-xl hover:border-[#c2831f] transition"
                >
                  <div className="text-3xl">
                    {index === 0 && <UserPlus className="text-[#c2831f]" />}
                    {index === 1 && <CheckCircle className="text-[#c2831f]" />}
                    {index === 2 && <XCircle className="text-[#c2831f]" />}
                    {index === 3 && <Mail className="text-[#c2831f]" />}
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-[#0a0a0a] p-4 rounded-xl border border-gray-800">
              <h2 className="text-lg font-semibold text-[#c2831f] mb-4">
                Performance Trends
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                  <Line type="monotone" dataKey="seriesA" stroke="#ffcc00" strokeWidth={2} />
                  <Line type="monotone" dataKey="seriesB" stroke="#00b3b3" strokeWidth={2} />
                  <Line type="monotone" dataKey="seriesC" stroke="#ff6666" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Clients Table */}
            <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden shadow-lg">
              <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-[#c2831f]">Clients</h2>
                <div className="flex items-center w-full sm:w-auto bg-black border border-gray-700 rounded-lg px-3 py-1">
                  <Search size={18} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    className="bg-transparent outline-none px-2 text-sm w-full"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[900px]">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Score</th>
                      <th className="p-4">Syntax</th>
                      <th className="p-4">Domain</th>
                      <th className="p-4">Mailbox</th>
                      <th className="p-4">Catch-All</th>
                      <th className="p-4">Disposable</th>
                      <th className="p-4">Role-Based</th>
                      <th className="p-4">Greylisted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client, index) => (
                      <tr key={index} className="border-b border-gray-800 hover:bg-[#111] transition">
                        <td className="p-4">{client.name}</td>
                        <td className="p-4">{client.email}</td>
                        <td className="p-4">{client.status}</td>
                        <td className="p-4 font-bold">{client.score}%</td>
                        <td className="p-4">{client.syntax_valid ? "✅" : "❌"}</td>
                        <td className="p-4">{client.domain_valid ? "✅" : "❌"}</td>
                        <td className="p-4">{client.mailbox_exists ? "✅" : "❌"}</td>
                        <td className="p-4">{client.catch_all ? "⚠️" : "✅"}</td>
                        <td className="p-4">{client.disposable ? "❌" : "✅"}</td>
                        <td className="p-4">{client.role_based ? "⚠️" : "✅"}</td>
                        <td className="p-4">{client.greylisted ? "⚠️" : "✅"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Verification History */}
            <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden shadow-lg mt-6">
              <div className="p-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-[#c2831f]">Verification History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[800px]">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="p-4">Email</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Score</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, idx) => (
                      <tr key={idx} className="border-b border-gray-800 hover:bg-[#111] transition">
                        <td className="p-4">{h.email}</td>
                        <td className="p-4">{h.status}</td>
                        <td className="p-4 font-bold">{h.score}%</td>
                        <td className="p-4">{h.verifiedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-[#c2831f] mb-4">Quick Actions</h2>
              <button className="w-full flex items-center gap-2 p-3 border border-gray-700 rounded-lg hover:border-[#c2831f] transition mb-2">
                <PlusCircle size={18} /> Create Campaign
              </button>
              <button className="w-full flex items-center gap-2 p-3 border border-gray-700 rounded-lg hover:border-[#c2831f] transition mb-2">
                <Upload size={18} /> Import Contacts
              </button>
              <button className="w-full flex items-center gap-2 p-3 border border-gray-700 rounded-lg hover:border-[#c2831f] transition">
                <BarChart2 size={18} /> View Reports
              </button>
            </div>

            <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-[#c2831f] mb-4">Recent Activity</h2>
              <ul className="space-y-4">
                {activities.map((act, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Clock className="text-gray-400" size={18} />
                    <div>
                      <p>{act.action}</p>
                      <span className="text-gray-500 text-xs">{act.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


