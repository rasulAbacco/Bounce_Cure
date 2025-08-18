import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Play, Pause, Edit, Trash2, Eye, Mail, Users, TrendingUp, Clock } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const Campaign = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateStep, setTemplateStep] = useState('choose');
  const [searchTerm, setSearchTerm] = useState('');

  const templates = [
    {
      id: 1,
      name: 'Product Launch',
      category: 'Marketing',
      description: 'Perfect for announcing new products or features',
      preview: 'Exciting news! We\'re thrilled to introduce...',
      openRate: '45%',
      clickRate: '8.2%',
      thumbnail: 'bg-blue-500'
    },
    {
      id: 2,
      name: 'Sales Outreach',
      category: 'Sales',
      description: 'Professional cold outreach template',
      preview: 'Hi {{firstName}}, I noticed your company...',
      openRate: '38%',
      clickRate: '6.8%',
      thumbnail: 'bg-green-500'
    },
    {
      id: 3,
      name: 'Customer Onboarding',
      category: 'Customer Success',
      description: 'Welcome new customers with style',
      preview: 'Welcome to our platform! Let\'s get you started...',
      openRate: '72%',
      clickRate: '15.4%',
      thumbnail: 'bg-purple-500'
    },
    {
      id: 4,
      name: 'Event Invitation',
      category: 'Events',
      description: 'Invite customers to webinars and events',
      preview: 'You\'re invited to our exclusive webinar...',
      openRate: '52%',
      clickRate: '12.1%',
      thumbnail: 'bg-red-500'
    },
    {
      id: 5,
      name: 'Newsletter',
      category: 'Content',
      description: 'Regular newsletter template',
      preview: 'This week in our newsletter: industry insights...',
      openRate: '41%',
      clickRate: '5.9%',
      thumbnail: 'bg-indigo-500'
    },
    {
      id: 6,
      name: 'Follow-up Sequence',
      category: 'Sales',
      description: 'Multi-touch follow-up sequence',
      preview: 'Following up on our previous conversation...',
      openRate: '35%',
      clickRate: '7.3%',
      thumbnail: 'bg-yellow-500'
    }
  ];

  const campaigns = [
    {
      id: 1,
      name: 'Product Launch Q4',
      status: 'active',
      type: 'email',
      recipients: 1250,
      sent: 1200,
      opens: 480,
      clicks: 96,
      replies: 24,
      created: '2024-01-15',
      lastActivity: '2 hours ago'
    },
    {
      id: 2,
      name: 'Customer Onboarding',
      status: 'paused',
      type: 'sequence',
      recipients: 890,
      sent: 750,
      opens: 340,
      clicks: 68,
      replies: 15,
      created: '2024-01-10',
      lastActivity: '1 day ago'
    },
    {
      id: 3,
      name: 'Holiday Promotion',
      status: 'completed',
      type: 'email',
      recipients: 2100,
      sent: 2100,
      opens: 945,
      clicks: 210,
      replies: 52,
      created: '2024-01-01',
      lastActivity: '5 days ago'
    },
    {
      id: 4,
      name: 'Sales Outreach - Tech',
      status: 'draft',
      type: 'sequence',
      recipients: 0,
      sent: 0,
      opens: 0,
      clicks: 0,
      replies: 0,
      created: '2024-01-20',
      lastActivity: 'Never'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'paused': return 'text-yellow-500';
      case 'completed': return 'text-blue-500';
      case 'draft': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 border-green-500/20';
      case 'paused': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'completed': return 'bg-blue-500/10 border-blue-500/20';
      case 'draft': return 'bg-gray-400/10 border-gray-400/20';
      default: return 'bg-gray-400/10 border-gray-400/20';
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (activeTab !== 'all' && campaign.status !== activeTab) return false;
    if (searchTerm && !campaign.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const TemplateSelectionModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] overflow-hidden">
        {templateStep === 'choose' ? (
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-black">Create New Campaign</h2>
                <p className="text-gray-600 mt-1">Choose how you want to start</p>
              </div>
              <button onClick={() => setShowTemplateModal(false)} className="text-gray-400 hover:text-black text-2xl">
                ×
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div
                  onClick={() => {
                    setShowTemplateModal(false);
                    setShowCreateModal(true);
                  }}
                  className="bg-white border-2 border-gray-200 rounded-xl p-8 cursor-pointer hover:border-[#c2831f] hover:shadow-lg transition-all group"
                >
                  <div className="text-center">
                    <div className="w-20 h-20 bg-[#c2831f]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#c2831f]/20 transition-colors">
                      <Plus className="text-[#c2831f]" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-black mb-3">Start from Scratch</h3>
                    <p className="text-gray-600 mb-6">Create a completely custom campaign with your own content and design</p>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <span>• Full customization</span>
                      <span>• Advanced options</span>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setTemplateStep('templates')}
                  className="bg-white border-2 border-gray-200 rounded-xl p-8 cursor-pointer hover:border-[#c2831f] hover:shadow-lg transition-all group"
                >
                  <div className="text-center">
                    <div className="w-20 h-20 bg-[#c2831f]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#c2831f]/20 transition-colors">
                      <Mail className="text-[#c2831f]" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-black mb-3">Choose Template</h3>
                    <p className="text-gray-600 mb-6">Start with a professionally designed template and customize it to your needs</p>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <span>• 50+ templates</span>
                      <span>• Proven designs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setTemplateStep('choose')}
                    className="text-gray-400 hover:text-black"
                  >
                    ←
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-black">Choose Template</h2>
                    <p className="text-gray-600">Select a template to get started</p>
                  </div>
                </div>
                <button onClick={() => setShowTemplateModal(false)} className="text-gray-400 hover:text-black text-2xl">
                  ×
                </button>
              </div>

              <div className="flex space-x-2 mt-4">
                <button className="px-4 py-2 bg-[#c2831f] text-white rounded-lg text-sm">All</button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Marketing</button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Sales</button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Customer Success</button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Events</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-[#c2831f] transition-all cursor-pointer group"
                    onClick={() => {
                      setShowTemplateModal(false);
                      setShowCreateModal(true);
                    }}
                  >
                    <div className={`${template.thumbnail} h-32 relative`}>
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="text-white text-center">
                          <Mail size={24} className="mx-auto mb-2" />
                          <div className="text-xs">Preview</div>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="bg-white/90 text-xs px-2 py-1 rounded text-black">
                          {template.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-black mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <p className="text-xs text-gray-500 mb-3">{template.preview}</p>

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Open: {template.openRate}</span>
                        <span>Click: {template.clickRate}</span>
                      </div>

                      <button className="w-full mt-3 bg-[#c2831f] text-white py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        Use Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const CreateCampaignModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">Create New Campaign</h2>
          <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-black">
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Campaign Name</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:border-[#c2831f] focus:outline-none text-black"
              placeholder="Enter campaign name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Campaign Type</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:border-[#c2831f] focus:outline-none text-black">
              <option>Email Campaign</option>
              <option>Email Sequence</option>
              <option>Drip Campaign</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Recipients List</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:border-[#c2831f] focus:outline-none text-black">
              <option>Select recipient list</option>
              <option>Prospects - Tech (1,245)</option>
              <option>Existing Customers (890)</option>
              <option>Newsletter Subscribers (2,100)</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 border border-gray-200 text-black rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-[#c2831f] text-white rounded-lg hover:bg-[#c2831f]/90">
              Create Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen mt-[5%]">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Campaigns</h1>
              <p className="text-white mt-1">Manage your email campaigns and sequences</p>
            </div>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="bg-[#c2831f] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#c2831f]/90"
            >
              <Plus size={20} />
              <span>New Campaign</span>
            </button>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm C">Total Campaigns</p>
                  <p className="text-2xl font-bold text-white mt-1">24</p>
                </div>
                <Mail className="text-[#c2831f]" size={24} />
              </div>
            </div>
            <div className="p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Total Recipients</p>
                  <p className="text-2xl font-bold text-white mt-1">12.5K</p>
                </div>
                <Users className="text-[#c2831f]" size={24} />
              </div>
            </div>
            <div className=" p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-100">Open Rate</p>
                  <p className="text-2xl font-bold text-white mt-1">42.3%</p>
                </div>
                <TrendingUp className="text-[#c2831f]" size={24} />
              </div>
            </div>
            <div className="p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-100">Active Campaigns</p>
                  <p className="text-2xl font-bold text-white mt-1">8</p>
                </div>
                <Clock className="text-[#c2831f]" size={24} />
              </div>
            </div>
          </div>

          <div className=" rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex space-x-1">
                {['all', 'active', 'paused', 'completed', 'draft'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg capitalize ${activeTab === tab
                      ? 'bg-[#c2831f] text-white'
                      : 'text-gray-100 hover:bg-gray-100'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-[#c2831f] focus:outline-none"
                  />
                </div>
                <button className="px-4 py-2 border border-gray-200 rounded-lg flex items-center space-x-2 hover:bg-gray-50">
                  <Filter size={20} />
                  <span>Filter</span>
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Recipients
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Sent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Opens
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Replies
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-900">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{campaign.name}</div>
                          <div className="text-sm text-gray-500">{campaign.type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBg(campaign.status)} ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {campaign.recipients.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {campaign.sent.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{campaign.opens}</div>
                        <div className="text-xs text-gray-500">
                          {campaign.sent > 0 ? ((campaign.opens / campaign.sent) * 100).toFixed(1) : 0}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{campaign.clicks}</div>
                        <div className="text-xs text-gray-500">
                          {campaign.opens > 0 ? ((campaign.clicks / campaign.opens) * 100).toFixed(1) : 0}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {campaign.replies}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {campaign.status === 'active' ? (
                            <button className="text-yellow-600 hover:text-yellow-900">
                              <Pause size={16} />
                            </button>
                          ) : campaign.status === 'paused' ? (
                            <button className="text-green-600 hover:text-green-900">
                              <Play size={16} />
                            </button>
                          ) : null}
                          <button className="text-gray-100 hover:text-gray-900">
                            <Eye size={16} />
                          </button>
                          <button className="text-gray-100 hover:text-gray-900">
                            <Edit size={16} />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 size={16} />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-100">
              Showing 1 to {filteredCampaigns.length} of {filteredCampaigns.length} campaigns
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-100 rounded text-sm hover:bg-gray-800 disabled:opacity-50 text-white" disabled>
                Previous
              </button>
              <button className="px-3 py-1 bg-[#c2831f] text-white rounded text-sm">
                1
              </button>
              <button className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>

        {showCreateModal && <CreateCampaignModal />}
        {showTemplateModal && <TemplateSelectionModal />}
      </div>
    </DashboardLayout>
  );
};

export default Campaign;