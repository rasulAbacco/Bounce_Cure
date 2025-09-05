import React, { useEffect, useState } from "react";
import { MdRefresh } from "react-icons/md";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";

<div className="flex space-x-4">
    <button className="text-yellow-400 hover:text-yellow-300">
        <FiEye className="w-5 h-5" />
    </button>

    <button className="text-yellow-400 hover:text-yellow-300">
        <FiEdit className="w-5 h-5" />
    </button>

    <button className="text-yellow-400 hover:text-yellow-300">
        <FiTrash2 className="w-5 h-5" />
    </button>
</div>


import { Link, useNavigate } from "react-router-dom";
import { getCampaigns } from "../../../services/campaignService";
import Button from "../Components/UI/Button";
import Templets from "./Templets";
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

    const navigate = useNavigate();
    const [showOptions, setShowOptions] = useState(false);

    // 📌 Contacts state
    const [contacts, setContacts] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [newContact, setNewContact] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        status: "active",
    });

    // 📌 Fetch Contacts
    const fetchContacts = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/contacts");
            const data = await res.json();
            setContacts(data);
        } catch (err) {
            console.error("Fetch contacts error:", err);
        }
    };

    useEffect(() => {
        if (activeTab === "contacts") {
            fetchContacts();
        }
    }, [activeTab]);

    // 📌 Handle Add Contact
    const handleAddContact = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newContact),
            });
            if (!res.ok) throw new Error("Failed to add contact");
            await fetchContacts();
            setShowAddModal(false);
            setNewContact({ name: "", email: "", phone: "", company: "", status: "active" });
        } catch (err) {
            console.error("Add contact error:", err);
        }
    };

    // 📌 Handle Edit Contact
    const handleUpdateContact = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/contacts/${selectedContact.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selectedContact),
            });
            if (!res.ok) throw new Error("Failed to update contact");
            await fetchContacts();
            setShowEditModal(false);
            setSelectedContact(null);
        } catch (err) {
            console.error("Update contact error:", err);
        }
    };

    // 📌 Handle Delete Contact
    const handleDeleteContact = async (id) => {
        if (!window.confirm("Are you sure you want to delete this contact?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/contacts/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete contact");
            await fetchContacts();
        } catch (err) {
            console.error("Delete contact error:", err);
        }
    };

    // Campaign stats
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
        { id: 1, message: "Newsletter #45 sent to 2,500 subscribers", time: "2m ago" },
        { id: 2, message: "Black Friday campaign got 67% open rate", time: "15m ago" },
        { id: 3, message: "125 new subscribers joined this hour", time: "1h ago" },
        { id: 4, message: "Product Launch campaign completed", time: "2h ago" },
    ];

    // Campaign Actions
    const handleView = (id) => (window.location.href = `/campaigns/${id}`);
    const handleEdit = (id) => (window.location.href = `/campaigns/${id}/edit`);
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this campaign?")) {
            import("../../../services/campaignService").then(({ deleteCampaign }) => {
                deleteCampaign(id).then(() =>
                    setCampaigns((prev) => prev.filter((c) => c.id !== id))
                );
            });
        }
    };

    return (

        <div className="p-6 bg-black text-white min-h-screen mt-[5%]">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Email Campaign Dashboard</h1>
                    <p className="text-gray-400">
                        Complete email marketing management in one place
                    </p>
                </div>

                <div className="flex flex-row items-center justify-center gap-5">
                    {/* Top Row Actions */}
                    <div className="flex space-x-3 cursor-pointer z-index">
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-500 text-[#c2831f] hover:text-white hover:border-yellow-500 transition"
                        >
                            <MdRefresh className="w-6 h-6" /> {/* adjust size here */}
                        </button>
                    </div>


                    {/* New Campaign Button */}
                   <div
                    onClick={() => setShowOptions(true)}
                    className="border border-yellow-400 hover:bg-yellow-300/20 transition rounded-lg py-3 px-4 flex flex-col items-center justify-center text-yellow-400 cursor-pointer"
                    >
                     <span className="text-sm font-semibold">New Campaign</span>
                    </div>


                    {/* Modal */}
                    {showOptions && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            {/* Background Blur Overlay */}
                            <div
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                onClick={() => setShowOptions(false)} // close on outside click
                            ></div>

                            {/* Modal Content */}
                            <div className="relative bg-[#111] text-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-3xl border border-gray-800 animate-fadeIn">
                                {/* Close Button */}
                                <button
                                    className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
                                    onClick={() => setShowOptions(false)}
                                >
                                    ✕
                                </button>

                                <h2 className="text-2xl font-bold mb-6 text-center">
                                    Create New Campaign
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Option 1 - Scratch */}
                                    <div
                                        onClick={() => {
                                            setShowOptions(false);
                                            localStorage.removeItem("canvasData"); // clear any old saved design
                                            navigate("/editor", {
                                            state: {
                                                template: {
                                                pages: [{ id: 1, elements: [] }], // empty page
                                                activePage: 0,
                                                 },
                                            },
                                            });
                                        }}
                                        className="cursor-pointer bg-gray-900 p-8 rounded-xl hover:bg-gray-800 transition flex flex-col items-center text-center"
                                        >
                                        <h3 className="text-xl font-semibold mb-2">Start from Scratch</h3>
                                        <p className="text-gray-400 text-sm">
                                            Create a brand new design with an empty canvas
                                        </p>
                                    </div>

                                    {/* Option 2 - Templates */}
                                    <div
                                        onClick={() => {
                                            setShowOptions(false);
                                            navigate("/all-templates");
                                        }}
                                        className="cursor-pointer bg-gray-900 p-8 rounded-xl hover:bg-gray-800 transition flex flex-col items-center text-center"
                                    >
                                        <h3 className="text-xl font-semibold mb-2">Choose Templates</h3>
                                        <p className="text-gray-400 text-sm">
                                            Select from predefined templates
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
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
                        {/* Quick Actions - Left Column */}
                        <div className="bg-[#111] p-6 rounded-xl border border-gray-700 col-span-1">
                            <h3 className="text-lg font-semibold mb-4 text-white">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-4">

                                <div
                                    onClick={() => setShowOptions(true)}
                                    className="border border-yellow-400 hover:bg-yellow-300/20 transition rounded-lg py-3 px-4 flex flex-col items-center justify-center text-yellow-400 cursor-pointer"
                                    >
                                        <MdCampaign className="text-xl mb-1" />
                                    <span className="text-sm font-semibold">New Campaign</span>
                                </div>

                       
                                <Link to="/analytics">
                                    <div className="border border-blue-400 hover:bg-blue-600/30 transition rounded-lg py-3 px-4 flex flex-col items-center justify-center text-blue-400 cursor-pointer">
                                        <MdAnalytics className="text-xl mb-1" />
                                        <span className="text-sm font-semibold">Analytics</span>
                                    </div>
                                </Link>

                                <Link to="/contacts">
                                    <div onClick={() => setActiveTab("contacts")} className="border border-green-400 hover:bg-green-600/20 transition rounded-lg py-3 px-4 flex flex-col items-center justify-center text-green-400 cursor-pointer">
                                        <MdPeople className="text-xl mb-1" />
                                        <span className="text-sm font-semibold">Contacts</span>
                                    </div></Link>
                                <div
                                    onClick={() => setActiveTab("templates")}
                                    className="border border-orange-400 hover:bg-orange-500/20 transition rounded-lg py-3 px-4 flex flex-col items-center justify-center text-orange-400 cursor-pointer"
                                >
                                    <MdDescription className="text-xl mb-1" />
                                    <span className="text-sm font-semibold">Templates</span>
                                </div>

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

            {/* Campaigns Tab */}
            {activeTab === "campaigns" && (
                <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg mb-5 font-semibold">All Campaigns</h3>
                        <div className="flex space-x-2">
                            {["All", "Active", "Paused", "Completed", "Draft"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-3 py-1 rounded-md text-sm font-medium ${filter === status
                                        ? "bg-yellow-500 text-black"
                                        : "bg-[#222] text-gray-400 hover:bg-[#333]"
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

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
                                        <tr key={c.id} className="border-b border-gray-800 hover:bg-[#1a1a1a]">
                                            <td className="p-3">{c.name}</td>
                                            <td className="p-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${c.status === "active"
                                                    ? "bg-green-600"
                                                    : c.status === "paused"
                                                        ? "bg-yellow-600"
                                                        : c.status === "completed"
                                                            ? "bg-blue-600"
                                                            : "bg-gray-600"
                                                    }`}>
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
                                            <td className="p-3 flex space-x-3">
                                                <button onClick={() => handleView(c.id)} className="text-[#c2831f] hover:text-white transition-colors duration-200">
                                                    <FiEye className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleEdit(c.id)} className="text-[#c2831f] hover:text-white transition-colors duration-200">
                                                    <FiEdit className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDelete(c.id)} className="text-[#c2831f] hover:text-white transition-colors duration-200">
                                                    <FiTrash2 className="w-5 h-5" />
                                                </button>
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
                <div className="bg-[#111] p-6 rounded-xl border border-gray-800 text-white relative">
                    {/* State and Handlers */}
                    <>
                        {/* Required States */}
                        <input
                            type="file"
                            accept=".csv"
                            id="csvUploader"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                const reader = new FileReader();
                                reader.onload = (event) => {
                                    const csvText = event.target.result;
                                    const rows = csvText.split("\n");
                                    const parsed = rows.map((row) => row.split(","));
                                    console.log("Parsed CSV:", parsed);
                                    alert("CSV Imported Successfully! Check console.");
                                };
                                reader.readAsText(file);
                            }}
                        />

                        {/* Add Contact Modal */}
                        {showAddModal && (
                            <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center">
                                <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4">Add New Contact</h3>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (
                                                !newContact.name ||
                                                !newContact.email ||
                                                !newContact.phone ||
                                                !newContact.company ||
                                                !newContact.status
                                            ) {
                                                alert("Please fill in all fields.");
                                                return;
                                            }
                                            handleAddContact(); // <-- call backend
                                        }}
                                        className="space-y-4"
                                    >
                                        <input
                                            type="text"
                                            placeholder="Name"
                                            value={newContact.name}
                                            onChange={(e) =>
                                                setNewContact({ ...newContact, name: e.target.value })
                                            }
                                            className="w-full px-4 py-2 rounded-md bg-black border border-gray-600 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={newContact.email}
                                            onChange={(e) =>
                                                setNewContact({ ...newContact, email: e.target.value })
                                            }
                                            className="w-full px-4 py-2 rounded-md bg-black border border-gray-600 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Phone"
                                            value={newContact.phone}
                                            onChange={(e) =>
                                                setNewContact({ ...newContact, phone: e.target.value })
                                            }
                                            className="w-full px-4 py-2 rounded-md bg-black border border-gray-600 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Company"
                                            value={newContact.company}
                                            onChange={(e) =>
                                                setNewContact({ ...newContact, company: e.target.value })
                                            }
                                            className="w-full px-4 py-2 rounded-md bg-black border border-gray-600 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Status"
                                            value={newContact.status}
                                            onChange={(e) =>
                                                setNewContact({ ...newContact, status: e.target.value })
                                            }
                                            className="w-full px-4 py-2 rounded-md bg-black border border-gray-600 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                        />

                                        <div className="flex justify-end space-x-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowAddModal(false)}
                                                className="px-4 py-2 text-gray-300 hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md font-semibold"
                                            >
                                                Save Contact
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                    </>

                    {/* Header */}
                    <h3 className="text-xl font-bold mb-2 flex items-center">
                        <MdPeople className="text-yellow-500 text-2xl mr-2" />
                        Contact Management
                    </h3>
                    <p className="text-gray-400 mb-6">
                        Manage your email subscribers and contact lists
                    </p>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-black p-6 rounded-lg border border-gray-800 text-center">
                            <h2 className="text-3xl font-bold text-yellow-400">42,870</h2>
                            <p className="text-gray-400 mt-2">Total Contacts</p>
                        </div>
                        <div className="bg-black p-6 rounded-lg border border-gray-800 text-center">
                            <h2 className="text-3xl font-bold text-green-400">2,847</h2>
                            <p className="text-gray-400 mt-2">Active Subscribers</p>
                        </div>
                        <div className="bg-black p-6 rounded-lg border border-gray-800 text-center">
                            <h2 className="text-3xl font-bold text-orange-400">156</h2>
                            <p className="text-gray-400 mt-2">Unsubscribed</p>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-3 mb-8">
                        <button
                            className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-md font-medium hover:bg-yellow-600 transition"
                            onClick={() => setShowAddModal(true)}
                        >
                            <MdAdd className="w-5 h-5" />
                            Add Contact
                        </button>
                        <button
                            className="flex items-center gap-2 bg-black border border-gray-600 px-4 py-2 rounded-md font-medium hover:border-yellow-500 transition"
                            onClick={() => document.getElementById("csvUploader").click()}
                        >
                            <MdOpenInNew className="w-5 h-5" />
                            Import CSV
                        </button>
                    </div>

                    {/* Placeholder Table */}
                    <div className="flex flex-col items-center justify-center py-12 border-t border-gray-800">
                        <MdPeople className="text-4xl text-gray-500 mb-2" />
                        <p className="text-gray-400">Contact management interface would go here</p>
                        <p className="text-gray-500 text-sm">
                            Add, edit, and organize your email subscribers
                        </p>
                    </div>
                </div>
            )}
            {activeTab === "templates" && (
                <div className="">
                    <Templets />
                </div>
            )}
        </div>

    );
};

export default Dashboard;
