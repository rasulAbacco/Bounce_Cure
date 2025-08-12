import React, { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";
import "chart.js/auto";
import {
  Mail,
  CheckCircle,
  XCircle,
  BarChart,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import DashboardLayout from '../../components/DashboardLayout'

export default function Analytics() {
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    conversionRate: 0,
    bounceRate: 0,
    dailyData: [],
    domainData: [],
    recentLogs: [],
  });

  useEffect(() => {
    setTimeout(() => {
      setStats({
        total: 1200,
        success: 950,
        failed: 250,
        conversionRate: ((950 / 1200) * 100).toFixed(1),
        bounceRate: ((250 / 1200) * 100).toFixed(1),
        dailyData: [
          { day: "Mon", success: 120, failed: 30 },
          { day: "Tue", success: 150, failed: 40 },
          { day: "Wed", success: 180, failed: 35 },
          { day: "Thu", success: 200, failed: 50 },
          { day: "Fri", success: 170, failed: 45 },
          { day: "Sat", success: 130, failed: 30 },
          { day: "Sun", success: 100, failed: 20 },
        ],
        domainData: [
          { domain: "gmail.com", count: 500 },
          { domain: "yahoo.com", count: 200 },
          { domain: "outlook.com", count: 150 },
          { domain: "icloud.com", count: 100 },
          { domain: "others", count: 250 },
        ],
        recentLogs: [
          { email: "john.doe@gmail.com", status: "Success", date: "2025-08-11" },
          { email: "jane.smith@yahoo.com", status: "Failed", date: "2025-08-11" },
          { email: "mike.adams@outlook.com", status: "Success", date: "2025-08-10" },
          { email: "emma.white@icloud.com", status: "Success", date: "2025-08-10" },
          { email: "lucas.brown@gmail.com", status: "Failed", date: "2025-08-09" },
        ],
      });
    }, 500);
  }, []);

  const chartData = {
    labels: stats.dailyData.map((d) => d.day),
    datasets: [
      {
        label: "Success",
        data: stats.dailyData.map((d) => d.success),
        borderColor: "#42be08ff",
        backgroundColor: "rgba(19, 158, 19, 0.28)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Failed",
        data: stats.dailyData.map((d) => d.failed),
        borderColor: "#ff2c2fff",
        backgroundColor: "rgba(255, 77, 80, 0.71)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const pieData = {
    labels: stats.domainData.map((d) => d.domain),
    datasets: [
      {
        data: stats.domainData.map((d) => d.count),
        backgroundColor: [
          "#c2831f",
          "#ff4d4f",
          "#3b82f6",
          "#10b981",
          "#8b5cf6",
        ],
        borderColor: "#111",
        borderWidth: 1,
      },
    ],
  };

  return (
    <DashboardLayout>
    <div className="min-h-screen text-white p-6 space-y-10">
      {/* Heading */}
      {/* <h1 className="text-3xl font-bold text-[#c2831f] flex items-center gap-2">
        <BarChart className="w-7 h-7" /> Email Verification Analytics
      </h1> */}

      {/* Overview Stats */}
      <div className="grid md:grid-cols-5 gap-6">
        <StatCard icon={<Mail className="text-[#c2831f] w-6 h-6 hover:shadow-[0_4px_10px_rgba(255,255,255,0.6)] transition-shadow duration-200"/>} title="Total Verifications" value={stats.total} borderColor="#dd931bff" />
        <StatCard icon={<CheckCircle className="text-green-500 w-6 h-6" />} title="Successful" value={stats.success} borderColor="#1bee69ff" />
        <StatCard icon={<XCircle className="text-red-500 w-6 h-6" />} title="Failed" value={stats.failed} borderColor="#eb1d1dff" />
        <StatCard icon={<TrendingUp className="text-blue-500 w-6 h-6" />} title="Conversion Rate" value={`${stats.conversionRate}%`} borderColor="#156af3ff" />
        <StatCard icon={<AlertTriangle className="text-yellow-500 w-6 h-6" />} title="Bounce Rate" value={`${stats.bounceRate}%`} borderColor="#fccc0bff" />
      </div>

      {/* Compact Charts */}
      <div className="grid md:grid-cols-2 gap-6 hover:shadow-[#c2831f]/120">
        <ChartCard
          title="Weekly Performance"
          chart={<Line data={chartData} options={{ maintainAspectRatio: false, responsive: true }} height={200} />}
        />
        <ChartCard
          title="Top Email Domains"
          chart={<Pie data={pieData} options={{ maintainAspectRatio: false, responsive: true }} height={200} />}
        />
      </div>

      {/* Logs Table */}
      <div className=" p-6 rounded-2xl shadow-lg border border-gray-800">
        <h2 className="text-xl font-semibold text-[#c2831f] mb-4">
          Recent Verification Logs
        </h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2">Email</th>
              <th className="py-2">Status</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentLogs.map((log, i) => (
              <tr key={i} className="border-b border-gray-800">
                <td className="py-2">{log.email}</td>
                <td
                  className={`py-2 font-semibold ${
                    log.status === "Success" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {log.status}
                </td>
                <td className="py-2">{log.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </DashboardLayout>
  );
}

/* Components */
function StatCard({ icon, title, value, borderColor }) {
  return (
    <div
      className=" p-6 rounded-2xl shadow-lg border hover:scale-105 transition-all duration-300"
      style={{ borderColor }}
    >
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <p className="text-3xl font-bold mt-3">{value}</p>
    </div>
  );
}

function ChartCard({ title, chart }) {
  return (
    <div className=" p-4 rounded-2xl shadow-lg border border-gray-800">
      <h2 className="text-lg font-semibold text-[#c2831f] mb-3">{title}</h2>
      <div className="w-full max-h-[250px]">
        {chart}
      </div>
    </div>
  );
}
