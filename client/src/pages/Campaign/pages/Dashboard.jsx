import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCampaigns } from "../../../services/campaignService";
import Button from "../components/UI/Button";
import Layout from "../Components/Layout/Layout";

const Dashboard = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        getCampaigns()
            .then((data) => {
                setCampaigns(data);
            })
            .finally(() => setLoading(false));
    }, []);

    // Filter campaigns
    const filteredCampaigns =
        filter === "All"
            ? campaigns
            : campaigns.filter((c) => c.status.toLowerCase() === filter.toLowerCase());

    return (
        <Layout>
            <div className="p-6 bg-black text-white min-h-screen">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Campaigns</h1>
                    <Link to="/create">
                        <Button>+ New Campaign</Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#111] p-4 rounded-xl shadow text-center">
                        <p className="text-gray-400">Total Campaigns</p>
                        <h2 className="text-2xl font-bold">{campaigns.length}</h2>
                    </div>
                    <div className="bg-[#111] p-4 rounded-xl shadow text-center">
                        <p className="text-gray-400">Total Recipients</p>
                        <h2 className="text-2xl font-bold">12.5K</h2>
                    </div>
                    <div className="bg-[#111] p-4 rounded-xl shadow text-center">
                        <p className="text-gray-400">Open Rate</p>
                        <h2 className="text-2xl font-bold">42.3%</h2>
                    </div>
                    <div className="bg-[#111] p-4 rounded-xl shadow text-center">
                        <p className="text-gray-400">Active Campaigns</p>
                        <h2 className="text-2xl font-bold">
                            {campaigns.filter((c) => c.status === "active").length}
                        </h2>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-6">
                    {["All", "Active", "Paused", "Completed", "Draft"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2 rounded-lg ${filter === tab
                                ? "bg-yellow-500 text-black font-semibold"
                                : "bg-[#222] text-gray-400 hover:text-white"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Campaigns Table */}
                {loading ? (
                    <p>Loading campaigns...</p>
                ) : filteredCampaigns.length === 0 ? (
                    <p>No campaigns found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#111] text-left text-gray-400">
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
                                            <span className="text-gray-400">
                                                ({c.openRate || "0"}%)
                                            </span>
                                        </td>
                                        <td className="p-3">{c.clicks || 0}</td>
                                        <td className="p-3">{c.replies || 0}</td>
                                        <td className="p-3 flex space-x-2">
                                            <button className="text-blue-400 hover:underline">
                                                View
                                            </button>
                                            <button className="text-yellow-400 hover:underline">
                                                Edit
                                            </button>
                                            <button className="text-red-400 hover:underline">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
