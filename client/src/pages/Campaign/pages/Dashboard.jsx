// client/src/pages/Campaign/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { 
  MdRefresh, MdCampaign, MdPeople, MdOpenInNew, MdTrendingUp, 
  MdAdd, MdAnalytics, MdDescription, MdPlayCircle, 
  MdPause, MdDelete, MdMoreVert, MdSend, MdWarning, MdVerified, 
  MdShield, MdClose, MdSearch, MdFilterList, MdCheckBox, 
  MdCheckBoxOutlineBlank, MdEmail, MdSchedule, MdCheckCircle, MdCancel,
  MdEvent, MdToday, MdAccessTime, MdDateRange
} from "react-icons/md";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { getCampaigns } from "../../../services/campaignService";
import Button from "../Components/UI/Button";
import Templets from "./Templets";

const Dashboard = () => {
    // Existing states
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [activeTab, setActiveTab] = useState("dashboard");
    const [showOptions, setShowOptions] = useState(false);
    
    // New states for automation features
    const [logs, setLogs] = useState([]);
    const [scheduledCampaigns, setScheduledCampaigns] = useState([]);
    const [campaignStats, setCampaignStats] = useState({
        sent: 0,
        pending: 0,
        processing: 0,
        failed: 0,
        scheduled: 0,
        recurring: 0
    });
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCampaigns, setSelectedCampaigns] = useState([]);
    const [showActionMenu, setShowActionMenu] = useState(null);
    const [senderVerified, setSenderVerified] = useState(false);
    const [triggerMessage, setTriggerMessage] = useState("");
    const [showTriggerMessage, setShowTriggerMessage] = useState(false);

    const navigate = useNavigate();

    // Fetch automation data
    const fetchAutomationData = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/automation/logs");
            if (response.ok) {
                const data = await response.json();
                setLogs(data);
                
                // Calculate stats from logs
                const stats = data.reduce((acc, log) => {
                    acc[log.status] = (acc[log.status] || 0) + 1;
                    return acc;
                }, {});
                
                setCampaignStats(prev => ({
                    ...prev,
                    ...stats
                }));
            }
        } catch (error) {
            console.error("Error fetching automation data:", error);
        }
    };

    const fetchScheduledCampaigns = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/automation/scheduled");
            if (response.ok) {
                const data = await response.json();
                setScheduledCampaigns(data);
                
                // Update scheduled count
                setCampaignStats(prev => ({
                    ...prev,
                    scheduled: data.filter(c => c.status === 'scheduled').length,
                    recurring: data.filter(c => c.recurringFrequency).length
                }));
            }
        } catch (error) {
            console.error("Error fetching scheduled campaigns:", error);
        }
    };

    const checkSenderVerification = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/automation/sender/verification");
            if (response.ok) {
                const data = await response.json();
                setSenderVerified(data.verified);
            }
        } catch (error) {
            console.error("Error checking sender verification:", error);
        }
    };

    const handleTriggerSend = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/automation/trigger-cron", {
                method: 'POST',
            });
            const data = await response.json();
            
            // Fetch the latest scheduled campaigns
            await fetchScheduledCampaigns();
            
            // Create message based on scheduled campaigns
            const scheduledCount = scheduledCampaigns.filter(c => c.status === 'scheduled').length;
            
            if (scheduledCount > 0) {
                const campaignList = scheduledCampaigns
                    .filter(c => c.status === 'scheduled')
                    .map(c => `- ${c.campaignName}: ${new Date(c.scheduledDateTime).toLocaleString()}`)
                    .join('\n');
                
                setTriggerMessage(`Found ${scheduledCount} scheduled campaigns:\n${campaignList}`);
            } else {
                setTriggerMessage("No scheduled campaigns found.");
            }
            
            setShowTriggerMessage(true);
            
            // Hide message after 5 seconds
            setTimeout(() => setShowTriggerMessage(false), 5000);
        } catch (error) {
            console.error("Error triggering cron job:", error);
            setTriggerMessage("Failed to trigger cron job");
            setShowTriggerMessage(true);
            setTimeout(() => setShowTriggerMessage(false), 5000);
        }
    };

    const handleCampaignAction = async (campaignId, action) => {
        try {
            const response = await fetch(`http://localhost:5000/api/automation/${campaignId}/${action}`, {
                method: 'POST',
            });
            
            if (response.ok) {
                await fetchScheduledCampaigns();
                setShowActionMenu(null);
            } else {
                const error = await response.json();
                alert(`Failed to ${action} campaign: ${error.error || error.message}`);
            }
        } catch (error) {
            console.error(`Error ${action} campaign:`, error);
            alert(`Failed to ${action} campaign: ${error.message}`);
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedCampaigns.length === 0) return;
        
        try {
            const promises = selectedCampaigns.map(id => 
                fetch(`http://localhost:5000/api/automation/${id}/${action}`, {
                    method: 'POST',
                })
            );
            
            await Promise.all(promises);
            await fetchScheduledCampaigns();
            setSelectedCampaigns([]);
        } catch (error) {
            console.error(`Error performing bulk ${action}:`, error);
        }
    };

    const toggleCampaignSelection = (campaignId) => {
        setSelectedCampaigns(prev => 
            prev.includes(campaignId) 
                ? prev.filter(id => id !== campaignId)
                : [...prev, campaignId]
        );
    };

    // Fetch campaigns
    const fetchCampaigns = async () => {
        try {
            const data = await getCampaigns();
            setCampaigns(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching campaigns:", error);
            setLoading(false);
        }
    };

    // Campaign handlers
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

    // Initialize data
    useEffect(() => {
        fetchCampaigns();
        fetchAutomationData();
        fetchScheduledCampaigns();
        checkSenderVerification();

        // Refresh data every 30 seconds
        const interval = setInterval(() => {
            fetchAutomationData();
            fetchScheduledCampaigns();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

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

    // Helper functions for automation
    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'text-blue-400 bg-blue-400/20';
            case 'sent': return 'text-green-400 bg-green-400/20';
            case 'paused': return 'text-yellow-400 bg-yellow-400/20';
            case 'failed': return 'text-red-400 bg-red-400/20';
            case 'processing': return 'text-purple-400 bg-purple-400/20';
            default: return 'text-gray-400 bg-gray-400/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'scheduled': return <MdSchedule size={14} />;
            case 'sent': return <MdCheckCircle size={14} />;
            case 'paused': return <MdPause size={14} />;
            case 'failed': return <MdCancel size={14} />;
            case 'processing': return <MdRefresh size={14} className="animate-spin" />;
            default: return <MdWarning size={14} />;
        }
    };

    const formatDateTime = (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };


    // Render scheduled campaigns
    const renderScheduledCampaigns = () => {
        const upcomingCampaigns = scheduledCampaigns
            .filter(c => c.status === 'scheduled')
            .sort((a, b) => new Date(a.scheduledDateTime) - new Date(b.scheduledDateTime))
            .slice(0, 5);

        return (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Upcoming Scheduled Campaigns</h3>
                    <Link to="/automation" className="text-yellow-400 hover:text-yellow-300 text-sm">
                        View All
                    </Link>
                </div>
                
                {upcomingCampaigns.length === 0 ? (
                    <div className="text-center py-8">
                        <MdEvent className="mx-auto text-gray-600 mb-4" size={48} />
                        <h3 className="text-gray-400 font-medium mb-2">No scheduled campaigns</h3>
                        <p className="text-gray-500 mb-4">Create your first scheduled campaign to see it here</p>
                        <button
                            onClick={() => window.location.href = '/send-campaign'}
                            className="px-4 py-2 bg-[#c2831f] text-white rounded-lg hover:bg-[#d09025]"
                        >
                            Schedule Campaign
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {upcomingCampaigns.map((campaign) => (
                            <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-2 rounded-lg ${getStatusColor(campaign.status)}`}>
                                        {getStatusIcon(campaign.status)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">{campaign.campaignName}</div>
                                        <div className="text-sm text-gray-400">{campaign.subject}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white">{formatDateTime(campaign.scheduledDateTime)}</div>
                                    {campaign.recurringFrequency && (
                                        <div className="text-xs text-gray-400">
                                            Recurring {campaign.recurringFrequency}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Filter campaigns for the campaigns tab
    const filteredScheduledCampaigns = scheduledCampaigns.filter(campaign => {
        const matchesSearch = campaign.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" || campaign.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

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
                            <MdRefresh className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Trigger Send Button */}
                    <div className="relative">
                        <button
                            onClick={handleTriggerSend}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                        >
                            <MdSend size={16} />
                            Trigger Send
                        </button>
                        
                        {/* Message popup */}
                        {showTriggerMessage && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium text-white">Scheduled Campaigns</h3>
                                    <button 
                                        onClick={() => setShowTriggerMessage(false)}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        <MdClose size={16} />
                                    </button>
                                </div>
                                <div className="text-sm text-gray-300 whitespace-pre-line">
                                    {triggerMessage}
                                </div>
                            </div>
                        )}
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
                                onClick={() => setShowOptions(false)}
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
                                            localStorage.removeItem("canvasData");
                                            navigate("/editor", {
                                                state: {
                                                    template: {
                                                        pages: [{ id: 1, elements: [] }],
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
                                <p className="text-gray-400">Scheduled Campaigns</p>
                            </div>
                            <h2 className="text-3xl font-bold mt-2">{campaignStats.scheduled || 0}</h2>
                            <p className="text-green-400 text-sm mt-1">↑ 5% vs last month</p>
                        </div>
                    </div>

                    {/* Deliverability Tips */}
                    {/* {renderDeliverabilityTips()} */}

                    {/* Scheduled Campaigns */}
                    {renderScheduledCampaigns()}

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

                                <Link to="/automation">
                                    <div className="border border-purple-400 hover:bg-purple-600/20 transition rounded-lg py-3 px-4 flex flex-col items-center justify-center text-purple-400 cursor-pointer">
                                        <MdSchedule className="text-xl mb-1" />
                                        <span className="text-sm font-semibold">Automation</span>
                                    </div>
                                </Link>

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

                    {/* Recently Updated Campaigns */}
{/* Recent Automation Campaigns */}
<div className="bg-[#111] p-6 rounded-xl border border-gray-800">
    <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Recent Automation Campaigns</h3>
        <Link to="/automation" className="text-yellow-400 hover:text-yellow-300 text-sm">
            View All
        </Link>
    </div>
    <div className="space-y-4">
        {scheduledCampaigns.length > 0 ? (
            [...scheduledCampaigns]
                .sort((a, b) => new Date(b.createdAt || b.scheduledDateTime) - new Date(a.createdAt || a.scheduledDateTime))
                .slice(0, 5)
                .map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700/50 transition">
                        <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${getStatusColor(campaign.status)}`}>
                                {getStatusIcon(campaign.status)}
                            </div>
                            <div>
                                <div className="font-medium text-white">{campaign.campaignName}</div>
                                <div className="text-sm text-gray-400">{campaign.subject || 'No subject'}</div>
                                {campaign.recurringFrequency && (
                                    <div className="text-xs text-yellow-400 mt-1">
                                        Recurring: {campaign.recurringFrequency}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="text-white">
                                    {formatDateTime(campaign.scheduledDateTime || campaign.createdAt)}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {campaign.recipientCount || 0} recipients
                                </div>
                            </div>
                            <button
                                onClick={() => handleCampaignAction(campaign.id, 'delete')}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition"
                                title="Delete Campaign"
                            >
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))
        ) : (
            <div className="text-center py-8">
                <MdSchedule className="mx-auto text-gray-600 mb-4" size={48} />
                <h3 className="text-gray-400 font-medium mb-2">No automation campaigns found</h3>
                <p className="text-gray-500 mb-4">Create your first scheduled campaign to see it here</p>
                <button
                    onClick={() => window.location.href = '/send-campaign'}
                    className="px-4 py-2 bg-[#c2831f] text-white rounded-lg hover:bg-[#d09025]"
                >
                    Schedule Campaign
                </button>
            </div>
        )}
    </div>
</div>
                </>
            )}

            {/* Campaigns Tab - Updated to match Automation page style */}
            {activeTab === "campaigns" && (
                <div className="space-y-6">
                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex gap-4">
                            <div className="relative">
                                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search campaigns..."
                                    className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c2831f] w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#c2831f]"
                            >
                                <option value="all">All Status</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="sent">Sent</option>
                                <option value="paused">Paused</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                        
                        {selectedCampaigns.length > 0 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleBulkAction('pause')}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
                                >
                                    <MdPause size={16} />
                                    Pause Selected
                                </button>
                                <button
                                    onClick={() => handleBulkAction('delete')}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                                >
                                    <MdDelete size={16} />
                                    Delete Selected
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Campaigns Table */}
                    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <th className="w-12 p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedCampaigns.length === filteredScheduledCampaigns.length && filteredScheduledCampaigns.length > 0}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedCampaigns(filteredScheduledCampaigns.map(c => c.id));
                                                    } else {
                                                        setSelectedCampaigns([]);
                                                    }
                                                }}
                                                className="accent-[#c2831f]"
                                            />
                                        </th>
                                        <th className="text-left p-4 text-gray-300 font-medium">Campaign</th>
                                        <th className="text-left p-4 text-gray-300 font-medium">Recipients</th>
                                        <th className="text-left p-4 text-gray-300 font-medium">Schedule</th>
                                        <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                                        <th className="text-left p-4 text-gray-300 font-medium">Type</th>
                                        <th className="w-24 p-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredScheduledCampaigns.map((campaign) => (
                                        <tr key={campaign.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCampaigns.includes(campaign.id)}
                                                    onChange={() => toggleCampaignSelection(campaign.id)}
                                                    className="accent-[#c2831f]"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <div className="font-medium text-white">{campaign.campaignName}</div>
                                                    <div className="text-sm text-gray-400 truncate">{campaign.subject}</div>
                                                    {campaign.error && (
                                                        <div className="text-xs text-red-400 mt-1">{campaign.error}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center text-gray-300">
                                                    <MdPeople size={16} className="mr-2" />
                                                    {campaign.recipientCount || 0}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-white">
                                                    {campaign.scheduledDateTime ? formatDateTime(campaign.scheduledDateTime) : 'N/A'}
                                                </div>
                                                {campaign.recurringFrequency && (
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        Recurring {campaign.recurringFrequency}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                                                    {getStatusIcon(campaign.status)}
                                                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-gray-400">
                                                    {campaign.recurringFrequency ? 'Recurring' : 'One-time'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setShowActionMenu(showActionMenu === campaign.id ? null : campaign.id)}
                                                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                                                    >
                                                        <MdMoreVert size={20} />
                                                    </button>
                                                    
                                                    {showActionMenu === campaign.id && (
                                                        <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                                                            <div className="py-1">
                                                                <button
                                                                    onClick={() => console.log('View campaign')}
                                                                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                                                >
                                                                    <FiEye size={14} />
                                                                    View Details
                                                                </button>
                                                                {campaign.status === 'scheduled' && (
                                                                    <button
                                                                        onClick={() => handleCampaignAction(campaign.id, 'pause')}
                                                                        className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                                                    >
                                                                        <MdPause size={14} />
                                                                        Pause
                                                                    </button>
                                                                )}
                                                                {campaign.status === 'paused' && (
                                                                    <button
                                                                        onClick={() => handleCampaignAction(campaign.id, 'resume')}
                                                                        className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                                                    >
                                                                        <MdPlayCircle size={14} />
                                                                        Resume
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => console.log('Edit campaign')}
                                                                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                                                >
                                                                    <FiEdit size={14} />
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleCampaignAction(campaign.id, 'delete')}
                                                                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center gap-2"
                                                                >
                                                                    <FiTrash2 size={14} />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {filteredScheduledCampaigns.length === 0 && (
                            <div className="text-center py-12">
                                <MdEvent className="mx-auto text-gray-600 mb-4" size={48} />
                                <h3 className="text-gray-400 font-medium mb-2">No scheduled campaigns</h3>
                                <p className="text-gray-500 mb-4">Create your first scheduled campaign to see it here</p>
                                <button
                                    onClick={() => window.location.href = '/send-campaign'}
                                    className="px-4 py-2 bg-[#c2831f] text-white rounded-lg hover:bg-[#d09025]"
                                >
                                    Schedule Campaign
                                </button>
                            </div>
                        )}
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