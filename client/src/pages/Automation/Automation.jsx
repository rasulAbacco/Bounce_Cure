import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Line, Pie } from "react-chartjs-2";
import "chart.js/auto";
import { Zap, Activity, CheckCircle, Play } from "lucide-react";

const Automation = () => {
  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Automation Runs",
        data: [12, 19, 8, 15, 22, 18, 25],
        borderColor: "#c2831f",
        backgroundColor: "rgba(194, 131, 31, 0.3)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#c2831f",
        pointBorderColor: "#fff",
      },
    ],
  };

  const pieData = {
    labels: ["Success", "Failed", "Pending"],
    datasets: [
      {
        data: [65, 20, 15],
        backgroundColor: ["#1fc21fff", "#ef4444", "#3b82f6"],
        borderColor: "#111",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#fff",
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: "#1f1f1f",
        titleColor: "#c2831f",
        bodyColor: "#fff",
      },
    },
    scales: {
      x: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#fff",
        },
      },
      tooltip: {
        backgroundColor: "#1f1f1f",
        titleColor: "#c2831f",
        bodyColor: "#fff",
      },
    },
  };

  const stats = [
    {
      title: "Active Automations",
      value: 12,
      icon: <Zap className="text-[#c2831f]" size={28} />,
    },
    {
      title: "Total Triggers",
      value: 256,
      icon: <Activity className="text-[#c2831f]" size={28} />,
    },
    {
      title: "Success Rate",
      value: "85%",
      icon: <CheckCircle className="text-[#c2831f]" size={28} />,
    },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen text-white w-full px-4 sm:px-6 md:px-10 py-6 space-y-8 mt-20">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#c2831f] mb-2">
            Automation Dashboard
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Monitor, control, and optimize all your automated workflows in one
            place. Get real-time insights into performance and trigger activities.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-gray-800 shadow-lg hover:shadow-[#c2831f]/20 hover:scale-105 transition"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-800 rounded-full">{item.icon}</div>
                <div>
                  <p className="text-gray-400 text-sm">{item.title}</p>
                  <h3 className="text-xl font-bold">{item.value}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Workflow Diagram */}
       <div className="p-4 sm:p-6 rounded-xl border border-gray-800">
            <h2 className="text-lg sm:text-xl font-semibold text-[#c2831f] mb-4">
                Workflow Overview
            </h2>
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4 text-center">
                <div className="flex flex-col items-center">
                <Play className="text-green-500" size={28} />
                <p className="mt-1 text-sm">Trigger</p>
                </div>

                {/* Connector line for sm and above */}
                <div className="hidden sm:block w-12 h-[2px] bg-[#c2831f] self-center" />

                <div className="flex flex-col items-center">
                <Activity className="text-yellow-500" size={28} />
                <p className="mt-1 text-sm">Process</p>
                </div>

                <div className="hidden sm:block w-12 h-[2px] bg-[#c2831f] self-center" />

                <div className="flex flex-col items-center">
                <CheckCircle className="text-green-400" size={28} />
                <p className="mt-1 text-sm">Completed</p>
                </div>
            </div>
        </div>


        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Line Chart */}
          <div className="p-4 rounded-xl border border-gray-800">
            <h2 className="text-lg font-semibold text-[#c2831f] mb-3">
              Automation Runs This Week
            </h2>
            <div className="w-full h-48 sm:h-56 md:h-64">
              <Line data={lineData} options={chartOptions} />
            </div>
          </div>

          {/* Pie Chart */}
          <div className="p-4 rounded-xl border border-gray-800">
            <h2 className="text-lg font-semibold text-[#c2831f] mb-3">
              Automation Status
            </h2>
            <div className="w-full h-48 sm:h-56 md:h-64">
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="p-4 sm:p-6 rounded-xl border border-gray-800 overflow-x-auto w-full">
          <h2 className="text-lg font-semibold text-[#c2831f] mb-4">
            Recent Automation Logs
          </h2>
          <table className="min-w-full sm:min-w-[100   ] text-sm text-gray-300">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Automation</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800">
                <td className="p-2">2025-08-12</td>
                <td className="p-2">Welcome Email Trigger</td>
                <td className="p-2 text-green-400">Success</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="p-2">2025-08-12</td>
                <td className="p-2">Bounce Cleanup</td>
                <td className="p-2 text-red-400">Failed</td>
              </tr>
              <tr>
                <td className="p-2">2025-08-11</td>
                <td className="p-2">Follow-up Reminder</td>
                <td className="p-2 text-yellow-400">Pending</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Automation;
