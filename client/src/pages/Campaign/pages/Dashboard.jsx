import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCampaigns } from "../../../services/campaignService";
import Button from "../Components/UI/Button";
import Layout from "../Components/Layout/Layout";
import {
    MdCampaign,
    MdPeople,
    MdOpenInNew,
    MdTrendingUp,
    MdAdd,
    MdAnalytics,
    MdDescription,
} from "react-icons/md";

const Dashboard = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [activeTab, setActiveTab] = useState("dashboard");

    useEffect(() => {
        getCampaigns()
            .then((data) => {
                setCampaigns(data);
            })
            .finally(() => setLoading(false));
    }, []);

    const filteredCampaigns =
        filter === "All"
            ? campaigns
            : campaigns.filter((c) => c.status.toLowerCase() === filter.toLowerCase());

    const totalRecipients = campaigns.reduce(
        (sum, c) => sum + (c.recipients || 0),
        0
    );
    const totalSent = campaigns.reduce((sum, c) => sum + (c.sent || 0), 0);
    const totalOpens = campaigns.reduce((sum, c) => sum + (c.opens || 0), 0);
    const averageOpenRate =
        totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : "0";
    const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

    const activities = [
        { id: 1, message: "Newsletter #45 sent to 2,500 subscribers", time: "2 minutes ago" },
        { id: 2, message: "Black Friday campaign achieved 67% open rate", time: "15 minutes ago" },
        { id: 3, message: "125 new subscribers joined this hour", time: "1 hour ago" },
        { id: 4, message: "Product Launch campaign completed successfully", time: "2 hours ago" },
    ];

    return (

            <div className="p-6 bg-black text-white min-h-screen">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Email Campaign Dashboard</h1>
                        <p className="text-gray-400">
                            Complete email marketing management in one place
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Button variant="outline">Refresh</Button>
                        <Link to="/create">
                            <Button className="bg-yellow-500 text-black font-semibold">
                                + New Campaign
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-4 mb-8 bg-[#111] p-2 rounded-lg border border-gray-800">
                    {[
                        { key: "dashboard", label: "Dashboard", icon: <MdAnalytics className="mr-2" /> },
                        { key: "campaigns", label: "Campaigns", icon: <MdCampaign className="mr-2" /> },
                        { key: "contacts", label: "Contacts", icon: <MdPeople className="mr-2" /> },
                        { key: "templates", label: "Templates", icon: <MdDescription className="mr-2" /> },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.key
                                    ? "bg-yellow-500 text-black font-semibold"
                                    : "text-gray-400 hover:text-white"
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === "dashboard" && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-[#111] p-6 rounded-xl border border-gray-800 shadow hover:border-yellow-500/30 transition">
                                <div className="flex items-center space-x-3">
                                    <MdCampaign className="text-yellow-500 text-2xl" />
                                    <p className="text-gray-400">Total Campaigns</p>
                                </div>
                                <h2 className="text-3xl font-bold mt-2">{campaigns.length}</h2>
                                <p className="text-green-400 text-sm mt-1">↑ 12% vs last month</p>
                            </div>

                            <div className="bg-[#111] p-6 rounded-xl border border-gray-800 shadow hover:border-yellow-500/30 transition">
                                <div className="flex items-center space-x-3">
                                    <MdPeople className="text-yellow-500 text-2xl" />
                                    <p className="text-gray-400">Total Recipients</p>
                                </div>
                                <h2 className="text-3xl font-bold mt-2">
                                    {(totalRecipients / 1000).toFixed(1)}K
                                </h2>
                                <p className="text-green-400 text-sm mt-1">↑ 8% vs last month</p>
                            </div>

                            <div className="bg-[#111] p-6 rounded-xl border border-gray-800 shadow hover:border-yellow-500/30 transition">
                                <div className="flex items-center space-x-3">
                                    <MdOpenInNew className="text-yellow-500 text-2xl" />
                                    <p className="text-gray-400">Average Open Rate</p>
                                </div>
                                <h2 className="text-3xl font-bold mt-2">{averageOpenRate}%</h2>
                                <p className="text-green-400 text-sm mt-1">↑ 3% vs last month</p>
                            </div>

                            <div className="bg-[#111] p-6 rounded-xl border border-gray-800 shadow hover:border-yellow-500/30 transition">
                                <div className="flex items-center space-x-3">
                                    <MdTrendingUp className="text-yellow-500 text-2xl" />
                                    <p className="text-gray-400">Active Campaigns</p>
                                </div>
                                <h2 className="text-3xl font-bold mt-2">{activeCampaigns}</h2>
                                <p className="text-red-400 text-sm mt-1">↓ 2% vs last month</p>
                            </div>
                        </div>

                        {/* Quick Actions & Top Campaigns */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Quick Actions */}
                            <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
                                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 flex flex-col h-16">
                                        <MdAdd className="mb-1" /> New Campaign
                                    </Button>
                                    <Button className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 flex flex-col h-16">
                                        <MdAnalytics className="mb-1" /> Analytics
                                    </Button>
                                    <Button className="bg-green-500/20 text-green-400 hover:bg-green-500/30 flex flex-col h-16">
                                        <MdPeople className="mb-1" /> Contacts
                                    </Button>
                                    <Button className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 flex flex-col h-16">
                                        📑 Templates
                                    </Button>
                                </div>
                            </div>

                            {/* Top Campaigns */}
                            <div className="lg:col-span-2 bg-[#111] p-6 rounded-xl border border-gray-800">
                                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                                    <MdTrendingUp className="text-yellow-500" />
                                    <span>Top Performing Campaigns</span>
                                </h3>
                                <div className="space-y-3">
                                    {campaigns.slice(0, 4).map((c, i) => (
                                        <div
                                            key={c.id}
                                            className="flex justify-between items-center bg-black p-4 rounded-lg border border-gray-800 hover:border-yellow-500/30 transition"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{c.name}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {c.openRate}% open • {c.clickRate}% click
                                                    </p>
                                                </div>
                                            </div>
                                            {c.revenue && c.revenue !== "-" && (
                                                <p className="text-yellow-400 font-semibold">{c.revenue}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
                            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {activities.map((a) => (
                                    <div key={a.id} className="flex items-start space-x-3">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                                        <div>
                                            <p className="text-sm">{a.message}</p>
                                            <p className="text-xs text-gray-400">{a.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "campaigns" && (
                    <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
                        <h3 className="text-lg font-semibold mb-4">All Campaigns</h3>
                        {loading ? (
                            <p>Loading campaigns...</p>
                        ) : filteredCampaigns.length === 0 ? (
                            <p>No campaigns found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[#222] text-gray-400 text-left">
                                            <th className="p-3">Campaign</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Recipients</th>
                                            <th className="p-3">Sent</th>
                                            <th className="p-3">Opens</th>
                                            <th className="p-3">Clicks</th>
                                            <th className="p-3">Replies</th>
                                            <th className="p-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCampaigns.map((c) => (
                                            <tr
                                                key={c.id}
                                                className="border-b border-gray-800 hover:bg-[#1a1a1a]"
                                            >
                                                <td className="p-3">{c.name}</td>
                                                <td className="p-3">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${c.status === "active"
                                                                ? "bg-green-600"
                                                                : c.status === "paused"
                                                                    ? "bg-yellow-600"
                                                                    : c.status === "completed"
                                                                        ? "bg-blue-600"
                                                                        : "bg-gray-600"
                                                            }`}
                                                    >
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td className="p-3">{c.recipients || 0}</td>
                                                <td className="p-3">{c.sent || 0}</td>
                                                <td className="p-3">
                                                    {c.opens || 0}{" "}
                                                    <span className="text-gray-400">({c.openRate || "0"}%)</span>
                                                </td>
                                                <td className="p-3">{c.clicks || 0}</td>
                                                <td className="p-3">{c.replies || 0}</td>
                                                <td className="p-3 flex space-x-2">
                                                    <button className="text-blue-400 hover:underline">View</button>
                                                    <button className="text-yellow-400 hover:underline">Edit</button>
                                                    <button className="text-red-400 hover:underline">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "contacts" && (
                    <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
                        <h3 className="text-lg font-semibold mb-2">Contacts</h3>
                        <p className="text-gray-400">
                            Manage your subscribers and contact lists here.
                        </p>
                    </div>
                )}

                {activeTab === "templates" && (
                    <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
                        <h3 className="text-lg font-semibold mb-2">Templates</h3>
                        <p className="text-gray-400">
                            Pre-designed templates for email campaigns.
                        </p>
                    </div>
                )}
            </div>
    
    );
};

export default Dashboard;
