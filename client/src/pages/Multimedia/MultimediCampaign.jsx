import React, { useState } from "react";
import {
  MessageCircle,
  Send,
  Users,
  BarChart3,
  Settings,
  Image,
  Video,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  ArrowRight,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";

function MultimediaCampaign() {
  const [activeTab, setActiveTab] = useState("whatsapp");
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messageResult, setMessageResult] = useState(null);
  const [recipientsText, setRecipientsText] = useState("");
  const navigate = useNavigate();

  // Dummy campaign stats (for UI only)
  const [campaigns, setCampaigns] = useState({
    whatsapp: [
      {
        id: 1,
        name: "WhatsApp Demo Campaign",
        status: "active",
        sent: 245,
        delivered: 220,
        opened: 180,
        clicked: 60,
        mediaType: "image",
        lastSent: "2 hours ago",
      },
    ],
    sms: [
      {
        id: 2,
        name: "SMS Demo Campaign",
        status: "active",
        sent: 1200,
        delivered: 1100,
        opened: 950,
        clicked: 200,
        mediaType: "text",
        lastSent: "1 day ago",
      },
    ],
  });

  // 🟢 Send campaign using backend Twilio API
  const sendCampaignNow = async (type) => {
    setIsSending(true);
    setMessageResult(null);

    try {
      // Parse user-entered recipients
      const recipients = recipientsText
        .split(/[\n, ]+/)
        .map((num) => num.trim())
        .filter((num) => num.length > 0);

      if (recipients.length === 0) {
        alert("Please enter at least one recipient number");
        setIsSending(false);
        return;
      }

      const message =
        type === "whatsapp"
          ? "🔥 WhatsApp campaign test from Twilio integration!"
          : "📢 SMS campaign test from Twilio integration!";

      console.log("API URL:", `${import.meta.env.VITE_API_URL}/multimedia-campaign/send`);
      console.log("Sending to:", recipients);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/multimedia-campaign/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic QUNhZDY0NzczYjEyNGNjMjQ3ZjUzODEzYWMxNWUxMGM1MToyN2YwZDc3YmJhY2JmNGVhNTkwOTcwMzRiNTZhMzIzYQ=="
        },
        body: JSON.stringify({ channel: type, recipients, message }),
      });


      const data = await res.json();
      console.log("Response:", data);

      if (res.ok) {
        setMessageResult({
          success: true,
          message: `✅ ${type.toUpperCase()} campaign sent successfully!`,
          details: data,
        });
      } else {
        setMessageResult({
          success: false,
          message: `❌ Failed to send ${type.toUpperCase()} campaign`,
          details: data,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessageResult({
        success: false,
        message: `⚠️ Error sending ${type.toUpperCase()} campaign`,
        details: { error: error.message },
      });
    } finally {
      setIsSending(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-600";
      case "scheduled":
        return "bg-blue-600";
      case "completed":
        return "bg-gray-600";
      case "paused":
        return "bg-yellow-600";
      default:
        return "bg-gray-600";
    }
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case "image":
        return <Image className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleNewCampaign = (type) => {
    setShowNewCampaignModal(false);
    navigate(type === "whatsapp" ? "/whatsapp" : "/sms");
  };

  const CampaignCard = ({ campaign, type }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-[#c2831f] transition-all duration-300 hover:shadow-lg hover:shadow-[#c2831f]/20">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {getMediaIcon(campaign.mediaType)}
          <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
              campaign.status
            )}`}
          >
            {campaign.status}
          </span>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-gray-400 hover:text-[#c2831f] hover:bg-gray-800 rounded-lg transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-[#c2831f] hover:bg-gray-800 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#c2831f]">
            {campaign.sent.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Sent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {campaign.delivered.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Delivered</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">
            {campaign.opened.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Opened</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">
            {campaign.clicked.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Clicked</div>
        </div>
      </div>

      {/* Recipients Input */}
      <div className="mt-4">
        <label className="block text-gray-300 mb-2">Recipients</label>
        <textarea
          className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
          placeholder="Enter phone numbers separated by commas or new lines (e.g. +919876543210, +911234567890)"
          rows={3}
          value={recipientsText}
          onChange={(e) => setRecipientsText(e.target.value)}
        />
      </div>

      {/* Send Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => sendCampaignNow(type)}
          disabled={isSending || recipientsText.trim() === ""}
          className={`px-4 py-2 ${isSending ? "bg-gray-500" : "bg-[#c2831f] hover:bg-[#a66f1a]"
            } text-white rounded-lg transition-colors flex items-center gap-2`}
        >
          <Send className="w-4 h-4" />
          {isSending ? "Sending..." : "Send Campaign"}
        </button>
      </div>
    </div>
  );

  const NewCampaignModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#c2831f]">
            Create New Campaign
          </h2>
          <button
            onClick={() => setShowNewCampaignModal(false)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-400 mb-8">
          Choose the type of campaign you want to create
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => handleNewCampaign("whatsapp")}
            className="flex-1 p-6 bg-gray-800/40 hover:bg-gray-700/50 border border-gray-600/50 hover:border-[#25D366]/60 rounded-xl transition-all duration-300 flex flex-col items-center text-center group shadow-lg hover:shadow-xl hover:shadow-[#25D366]/10"
          >
            <MessageCircle className="w-8 h-8 text-[#25D366]" />
            <h3 className="text-lg font-semibold text-white mt-4">
              WhatsApp Campaign
            </h3>
          </button>

          <button
            onClick={() => handleNewCampaign("sms")}
            className="flex-1 p-6 bg-gray-800/40 hover:bg-gray-700/50 border border-gray-600/50 hover:border-[#007BFF]/60 rounded-xl transition-all duration-300 flex flex-col items-center text-center group shadow-lg hover:shadow-xl hover:shadow-[#007BFF]/10"
          >
            <Send className="w-8 h-8 text-[#007BFF]" />
            <h3 className="text-lg font-semibold text-white mt-4">
              SMS Campaign
            </h3>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white mt-16">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#c2831f] mb-2">
                Multimedia Campaigns
              </h1>
              <p className="text-gray-400">
                Manage your WhatsApp and SMS marketing campaigns
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings
              </button>
              <button
                onClick={() => setShowNewCampaignModal(true)}
                className="px-6 py-3 bg-[#c2831f] hover:bg-[#a66f1a] text-white rounded-lg flex items-center gap-2 font-semibold"
              >
                <Plus className="w-5 h-5" />
                New Campaign
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg border border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab("whatsapp")}
              className={`flex-1 px-6 py-3 rounded-md flex items-center justify-center gap-2 ${activeTab === "whatsapp"
                  ? "bg-gray-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Campaigns
            </button>
            <button
              onClick={() => setActiveTab("sms")}
              className={`flex-1 px-6 py-3 rounded-md flex items-center justify-center gap-2 ${activeTab === "sms"
                  ? "bg-gray-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
            >
              <Send className="w-5 h-5" />
              SMS Campaigns
            </button>
          </div>

          {/* Campaign Cards */}
          <div className="space-y-6">
            {campaigns[activeTab].map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} type={activeTab} />
            ))}
          </div>

          {/* API Response */}
          {messageResult && (
            <div
              className={`mt-8 p-4 rounded-lg ${messageResult.success ? "bg-green-900/40" : "bg-red-900/40"
                } border border-gray-700`}
            >
              <p className="font-semibold mb-2">{messageResult.message}</p>
              <pre className="text-sm text-gray-300 overflow-x-auto">
                {JSON.stringify(messageResult.details, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {showNewCampaignModal && <NewCampaignModal />}
      </div>
    </DashboardLayout>
  );
}

export default MultimediaCampaign;
