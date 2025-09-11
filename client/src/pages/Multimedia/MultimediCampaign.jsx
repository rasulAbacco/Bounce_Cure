import React, { useState } from 'react';
import { MessageCircle, Send, Users, BarChart3, Calendar, Settings, Image, Video, FileText, Plus, Play, Pause, Edit, Trash2, Eye, X, ArrowRight } from 'lucide-react';
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from 'react-router-dom';

function MultimediaCampaign() {
  const [activeTab, setActiveTab] = useState('whatsapp');
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const navigate = useNavigate();  // ✅ Add this line


  const handleNewCampaign = (type) => {
  setShowNewCampaignModal(false);
  if (type === 'whatsapp') {
    navigate('/whatsapp');
  } else if (type === 'sms') {
    navigate('/sms');
  }
};

  
  const [campaigns, setCampaigns] = useState({
    whatsapp: [
      {
        id: 1,
        name: 'Product Launch 2024',
        status: 'active',
        sent: 2547,
        delivered: 2398,
        opened: 1876,
        clicked: 445,
        mediaType: 'image',
        lastSent: '2 hours ago'
      },
      {
        id: 2,
        name: 'Holiday Promotions',
        status: 'scheduled',
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        mediaType: 'video',
        lastSent: 'Scheduled for tomorrow'
      }
    ],
    sms: [
      {
        id: 3,
        name: 'Flash Sale Alert',
        status: 'completed',
        sent: 15420,
        delivered: 14965,
        opened: 12340,
        clicked: 2890,
        mediaType: 'text',
        lastSent: '1 day ago'
      },
      {
        id: 4,
        name: 'Appointment Reminders',
        status: 'active',
        sent: 890,
        delivered: 876,
        opened: 654,
        clicked: 123,
        mediaType: 'text',
        lastSent: '30 minutes ago'
      }
    ]
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'scheduled': return 'bg-blue-600';
      case 'completed': return 'bg-gray-600';
      case 'paused': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleCampaignAction = (campaignId, action) => {
    console.log(`Action: ${action} on campaign ${campaignId}`);
    // Implement actual functionality here
  };

  // const handleNewCampaign = (type) => {
  //   console.log(`Creating new ${type} campaign`);
  //   setShowNewCampaignModal(false);
  //   // Implement campaign creation logic here
  // };

  const CampaignCard = ({ campaign, type }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-[#c2831f] transition-all duration-300 hover:shadow-lg hover:shadow-[#c2831f]/20">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getMediaIcon(campaign.mediaType)}
            <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(campaign.status)}`}>
            {campaign.status}
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleCampaignAction(campaign.id, 'view')}
            className="p-2 text-gray-400 hover:text-[#c2831f] hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleCampaignAction(campaign.id, 'edit')}
            className="p-2 text-gray-400 hover:text-[#c2831f] hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleCampaignAction(campaign.id, 'delete')}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#c2831f]">{campaign.sent.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Sent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{campaign.delivered.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Delivered</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{campaign.opened.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Opened</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{campaign.clicked.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Clicked</div>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-400">
        <span>Last sent: {campaign.lastSent}</span>
        <div className="flex gap-2">
          {campaign.status === 'active' && (
            <button 
              onClick={() => handleCampaignAction(campaign.id, 'pause')}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
          )}
          {campaign.status === 'paused' && (
            <button 
              onClick={() => handleCampaignAction(campaign.id, 'resume')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Resume
            </button>
          )}
          {campaign.status === 'scheduled' && (
            <button 
              onClick={() => handleCampaignAction(campaign.id, 'send_now')}
              className="px-4 py-2 bg-[#c2831f] hover:bg-[#a66f1a] text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send Now
            </button>
          )}
          <button 
            onClick={() => handleCampaignAction(campaign.id, 'analytics')}
            className="px-4 py-2 bg-[#c2831f] hover:bg-[#a66f1a] text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
        </div>
      </div>
    </div>
  );

const NewCampaignModal = () => (
  <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#c2831f]">Create New Campaign</h2>
        <button 
          onClick={() => setShowNewCampaignModal(false)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <p className="text-gray-400 mb-8">Choose the type of campaign you want to create</p>
      
      <div className="flex gap-4">
        <button
          onClick={() => handleNewCampaign('whatsapp')}
          className="flex-1 p-6 bg-gray-800/40 hover:bg-gray-700/50 border border-gray-600/50 hover:border-[#25D366]/60 rounded-xl transition-all duration-300 flex flex-col items-center text-center group shadow-lg hover:shadow-xl hover:shadow-[#25D366]/10"
        >
          <div className="p-4 bg-[#25D366]/20 rounded-xl group-hover:bg-[#25D366]/30 transition-all duration-300 group-hover:scale-105 mb-4">
            <MessageCircle className="w-8 h-8 text-[#25D366] group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-white group-hover:text-[#25D366] transition-colors mb-2">
            WhatsApp Campaign
          </h3>
          <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors mb-4">
            Send multimedia messages via WhatsApp
          </p>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#25D366] transition-all duration-300 group-hover:translate-x-1" />
        </button>

        <button
          onClick={() => handleNewCampaign('sms')}
          className="flex-1 p-6 bg-gray-800/40 hover:bg-gray-700/50 border border-gray-600/50 hover:border-[#007BFF]/60 rounded-xl transition-all duration-300 flex flex-col items-center text-center group shadow-lg hover:shadow-xl hover:shadow-[#007BFF]/10"
        >
          <div className="p-4 bg-[#007BFF]/20 rounded-xl group-hover:bg-[#007BFF]/30 transition-all duration-300 group-hover:scale-105 mb-4">
            <Send className="w-8 h-8 text-[#007BFF] group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-white group-hover:text-[#007BFF] transition-colors mb-2">
            SMS Campaign
          </h3>
          <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors mb-4">
            Send text messages via SMS
          </p>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#007BFF] transition-all duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  </div>
);

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-black text-white mt-16">
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#c2831f] mb-2">Multimedia Campaigns</h1>
            <p className="text-gray-400">Manage your WhatsApp and SMS marketing campaigns</p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Settings
            </button>
            <button 
              onClick={() => setShowNewCampaignModal(true)}
              className="px-6 py-3 bg-[#c2831f] hover:bg-[#a66f1a] text-white rounded-lg transition-colors flex items-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              New Campaign
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#c2831f] bg-opacity-20 rounded-lg">
                <MessageCircle className="w-6 h-6 text-[#fff]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">24</div>
                <div className="text-sm text-gray-400">Active Campaigns</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#c2831f] bg-opacity-20 rounded-lg">
                <Send className="w-6 h-6 text-[#fff]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">98.7%</div>
                <div className="text-sm text-gray-400">Delivery Rate</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#c2831f] bg-opacity-20 rounded-lg">
                <Users className="w-6 h-6 text-[#fff]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">156K</div>
                <div className="text-sm text-gray-400">Total Reach</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#c2831f] bg-opacity-20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-[#fff]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">23.4%</div>
                <div className="text-sm text-gray-400">Engagement Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Tabs */}
       <div className="mb-6">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg border border-gray-700">
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex-1 px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'whatsapp'
                  ? 'bg-gray-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Campaigns  
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`flex-1 px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'sms'
                  ? 'bg-gray-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Send className="w-5 h-5" />
              SMS Campaigns  
            </button>
          </div>
        </div>


        {/* Campaign Grid */}
        <div className="space-y-6">
          {campaigns[activeTab].map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} type={activeTab} />
          ))}
        </div>

        {/* Empty State */}
        {campaigns[activeTab].length === 0 && (
          <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="w-16 h-16 bg-[#c2831f] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'whatsapp' ? 
                <MessageCircle className="w-8 h-8 text-[#c2831f]" /> :
                <Send className="w-8 h-8 text-[#c2831f]" />
              }
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No {activeTab === 'whatsapp' ? 'WhatsApp' : 'SMS'} campaigns yet</h3>
            <p className="text-gray-400 mb-6">Create your first campaign to start reaching your audience</p>
            <button 
              onClick={() => setShowNewCampaignModal(true)}
              className="px-6 py-3 bg-[#c2831f] hover:bg-[#a66f1a] text-white rounded-lg transition-colors font-semibold"
            >
              Create Campaign
            </button>
          </div>
        )}
      </div>

      {/* New Campaign Modal */}
      {showNewCampaignModal && <NewCampaignModal />}
    </div>
    </DashboardLayout>
  );
}

export default MultimediaCampaign;
