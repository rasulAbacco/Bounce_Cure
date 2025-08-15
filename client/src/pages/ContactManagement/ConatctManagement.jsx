import React from 'react'

import DashboardLayout from '../../components/DashboardLayout'

const ConatctManagement = () => {
    return (
        <DashboardLayout>
            <div>ConatctManagement</div>

        </DashboardLayout>
    )
}

export default ConatctManagement




// import React from "react";
// import {
//   UserPlus,
//   Download,
//   Search,
//   Mail,
//   CheckCircle,
//   XCircle,
//   PlusCircle,
//   Upload,
//   BarChart2,
//   Clock,
// } from "lucide-react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import DashboardLayout from "../../components/DashboardLayout";

// export default function ConatctManagement() {
//   const clients = [
//     { name: "John Doe", email: "john@example.com", status: "Active", lastActivity: "2025-08-10" },
//     { name: "Jane Smith", email: "jane@example.com", status: "Inactive", lastActivity: "2025-08-08" },
//     { name: "Robert Lee", email: "robert@example.com", status: "Active", lastActivity: "2025-08-09" },
//     { name: "Emily Davis", email: "emily@example.com", status: "Pending", lastActivity: "2025-08-07" },
//     { name: "Michael Brown", email: "michael@example.com", status: "Active", lastActivity: "2025-08-06" },
//   ];

//   const stats = [
//     { label: "Total Clients", value: 120, icon: <UserPlus className="text-[#c2831f]" /> },
//     { label: "Active Campaigns", value: 8, icon: <Mail className="text-[#c2831f]" /> },
//     { label: "Verified Emails", value: "95%", icon: <CheckCircle className="text-[#c2831f]" /> },
//     { label: "Bounce Rate", value: "2.5%", icon: <XCircle className="text-[#c2831f]" /> },
//   ];

//   const activities = [
//     { action: "Verified 200 emails", time: "2 hours ago" },
//     { action: "Added new client - Sarah Lee", time: "4 hours ago" },
//     { action: "Launched campaign - Summer Sale", time: "Yesterday" },
//     { action: "Imported 500 contacts", time: "2 days ago" },
//   ];

//   const data = [
//     { month: "Jan", seriesA: 30, seriesB: 20, seriesC: 10 },
//     { month: "Apr", seriesA: 40, seriesB: 25, seriesC: 20 },
//     { month: "Jul", seriesA: 50, seriesB: 30, seriesC: 25 },
//     { month: "Oct", seriesA: 60, seriesB: 35, seriesC: 30 },
//     { month: "Jan", seriesA: 70, seriesB: 40, seriesC: 40 },
//     { month: "Apr", seriesA: 75, seriesB: 50, seriesC: 50 },
//     { month: "Jul", seriesA: 90, seriesB: 60, seriesC: 55 },
//     { month: "Oct", seriesA: 85, seriesB: 65, seriesC: 60 },
//   ];

//   return (
//     <DashboardLayout>
//     <div className="p-6 bg-black min-h-screen text-white mt-20">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
//         <h1 className="text-2xl font-bold text-[#c2831f]">CRM Dashboard</h1>
//         <div className="flex gap-2 mt-4 sm:mt-0">
//           <button className="flex items-center gap-2 px-4 py-2 bg-[#c2831f] text-black rounded-lg hover:bg-[#d3962c] transition">
//             <UserPlus size={18} /> Add Client
//           </button>
//           <button className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg hover:border-[#c2831f] transition">
//             <Download size={18} /> Export
//           </button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//         {/* Main content */}
//         <div className="lg:col-span-3 space-y-6">
//           {/* Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             {stats.map((stat, index) => (
//               <div
//                 key={index}
//                 className="flex items-center gap-4 p-4 border border-gray-800 rounded-xl hover:border-[#c2831f] transition"
//               >
//                 <div className="text-3xl">{stat.icon}</div>
//                 <div>
//                   <p className="text-gray-400 text-sm">{stat.label}</p>
//                   <p className="text-xl font-bold">{stat.value}</p>
//                 </div>
//               </div>
//             ))}
//           </div>

//          {/* Financial-Style Multi-Line Chart */}
//         <div className="bg-[#0a0a0a] p-4 rounded-xl border border-gray-800">
//             <h2 className="text-lg font-semibold text-[#c2831f] mb-4">Performance Trends</h2>
//             <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
//                 {/* Subtle grid lines */}
//                 <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />

//                 {/* Minimal axes */}
//                 <XAxis 
//                     dataKey="month" 
//                     stroke="#666" 
//                     tick={{ fontSize: 12, fill: "#999" }} 
//                     axisLine={false} 
//                     tickLine={false} 
//                 />
//                 <YAxis 
//                     stroke="#666" 
//                     tick={{ fontSize: 12, fill: "#999" }} 
//                     axisLine={false} 
//                     tickLine={false} 
//                 />

//                 {/* Tooltip */}
//                 <Tooltip 
//                     contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", color: "#000" }} 
//                 />

//                 {/* Legend */}
//                 <Legend verticalAlign="bottom" height={36} iconType="circle" />

//                 {/* Lines with point dots */}
//                 <Line type="monotone" dataKey="seriesA" stroke="#ffcc00" strokeWidth={2} dot={{ r: 4, fill: "#ffcc00" }} />
//                 <Line type="monotone" dataKey="seriesB" stroke="#333" strokeWidth={2} dot={{ r: 4, fill: "#333" }} />
//                 <Line type="monotone" dataKey="seriesC" stroke="#00b3b3" strokeWidth={2} dot={{ r: 4, fill: "#00b3b3" }} />
//                 <Line type="monotone" dataKey="seriesD" stroke="#ff6666" strokeWidth={2} dot={{ r: 4, fill: "#ff6666" }} />
//                 </LineChart>
//             </ResponsiveContainer>
//         </div>


//             {/* Clients Table */}
//             <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden shadow-lg">
//                 {/* Header */}
//                 <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-800">
//                     <h2 className="text-lg font-semibold text-[#c2831f]">Clients</h2>
//                     <div className="flex items-center w-full sm:w-auto bg-black border border-gray-700 rounded-lg px-3 py-1">
//                     <Search size={18} className="text-gray-400 shrink-0" />
//                     <input
//                         type="text"
//                         placeholder="Search clients..."
//                         className="bg-transparent outline-none px-2 text-sm w-full"
//                     />
//                     </div>
//                 </div>

//                 {/* Responsive Table */}
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left text-sm min-w-[500px]">
//                     <thead>
//                         <tr className="border-b border-gray-800">
//                         <th className="p-4">Name</th>
//                         <th className="p-4 hidden sm:table-cell">Email</th>
//                         <th className="p-4">Status</th>
//                         <th className="p-4 hidden md:table-cell">Last Activity</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {clients.map((client, index) => (
//                         <tr
//                             key={index}
//                             className="border-b border-gray-800 hover:bg-[#111] transition"
//                         >
//                             <td className="p-4">{client.name}</td>
//                             <td className="p-4 hidden sm:table-cell">{client.email}</td>
//                             <td className="p-4">
//                             <span
//                                 className={`px-2 py-1 rounded-full text-xs ${
//                                 client.status === "Active"
//                                     ? "bg-green-500/20 text-green-400"
//                                     : client.status === "Inactive"
//                                     ? "bg-red-500/20 text-red-400"
//                                     : "bg-yellow-500/20 text-yellow-400"
//                                 }`}
//                             >
//                                 {client.status}
//                             </span>
//                             </td>
//                             <td className="p-4 hidden md:table-cell">{client.lastActivity}</td>
//                         </tr>
//                         ))}
//                     </tbody>
//                     </table>
//                 </div>
//             </div>

//         </div>

//         {/* Sidebar */}
//         <div className="space-y-6">
//           {/* Quick Actions */}
//           <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-4">
//             <h2 className="text-lg font-semibold text-[#c2831f] mb-4">Quick Actions</h2>
//             <button className="w-full flex items-center gap-2 p-3 border border-gray-700 rounded-lg hover:border-[#c2831f] transition mb-2">
//               <PlusCircle size={18} /> Create Campaign
//             </button>
//             <button className="w-full flex items-center gap-2 p-3 border border-gray-700 rounded-lg hover:border-[#c2831f] transition mb-2">
//               <Upload size={18} /> Import Contacts
//             </button>
//             <button className="w-full flex items-center gap-2 p-3 border border-gray-700 rounded-lg hover:border-[#c2831f] transition">
//               <BarChart2 size={18} /> View Reports
//             </button>
//           </div>

//           {/* Recent Activities */}
//           <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-4">
//             <h2 className="text-lg font-semibold text-[#c2831f] mb-4">Recent Activity</h2>
//             <ul className="space-y-4">
//               {activities.map((act, index) => (
//                 <li key={index} className="flex items-start gap-3">
//                   <Clock className="text-gray-400" size={18} />
//                   <div>
//                     <p>{act.action}</p>
//                     <span className="text-gray-500 text-xs">{act.time}</span>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//     </DashboardLayout>
//   );
// }

