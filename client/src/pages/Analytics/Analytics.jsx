import DashboardLayout from "../../components/DashboardLayout";
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { Mail, CheckCircle, XCircle, BarChart } from "lucide-react";

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    successRate: 0,
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/analytics")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  }, []);

  // Animate numbers when stats arrive
  useEffect(() => {
    if (stats) {
      const duration = 1000; // 1 second
      const frameRate = 20;
      const totalFrames = duration / frameRate;
      let frame = 0;

      const interval = setInterval(() => {
        frame++;
        setAnimatedStats({
          total: Math.round((stats.total / totalFrames) * frame),
          success: Math.round((stats.success / totalFrames) * frame),
          failed: Math.round((stats.failed / totalFrames) * frame),
          successRate: ((stats.successRate / totalFrames) * frame).toFixed(2),
        });

        if (frame === totalFrames) clearInterval(interval);
      }, frameRate);
    }
  }, [stats]);

  if (!stats)
    return <div className="text-center mt-20 text-gray-500">Loading analytics...</div>;

  const chartData = {
    labels: stats.daily.map((d) => d.date),
    datasets: [
      {
        label: "Emails Verified",
        data: stats.daily.map((d) => d.count),
        borderColor: "#c2831f",
        backgroundColor: "rgba(194, 131, 31, 0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <DashboardLayout>
      <div className="p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          📊 Email Verification Analytics
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Verified", value: animatedStats.total, color: "text-blue-600", icon: <Mail className="w-6 h-6" /> },
            { label: "Success", value: animatedStats.success, color: "text-green-600", icon: <CheckCircle className="w-6 h-6" /> },
            { label: "Failed", value: animatedStats.failed, color: "text-red-600", icon: <XCircle className="w-6 h-6" /> },
            { label: "Success Rate", value: `${animatedStats.successRate}%`, color: "text-purple-600", icon: <BarChart className="w-6 h-6" /> },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className={`flex items-center gap-3 ${item.color} mb-2`}>
                {item.icon}
                <h2 className="text-lg font-semibold">{item.label}</h2>
              </div>
              <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
          <h2 className="text-xl font-semibold mb-4">Daily Verification Trends</h2>
          <Line data={chartData} />
        </div>

        {/* Top Domains */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Top Verified Domains</h2>
          <ul className="divide-y">
            {stats.topDomains.map((d, idx) => (
              <li key={idx} className="py-3 flex justify-between text-gray-700">
                <span>{d.domain}</span>
                <span className="font-semibold">{d.count}</span>
              </li>
            ))}
          </ul>
          {stats.peakHour !== null && (
            <p className="mt-4 text-sm text-gray-500">
              ⏰ Peak verification hour:{" "}
              <span className="font-semibold">{stats.peakHour}:00</span>
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
