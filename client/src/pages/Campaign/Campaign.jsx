import React from 'react'
import Dashboard from './pages/Dashboard'

const Campaign = () => {
  return (
    <div>
      <Dashboard />
    </div>
  )
}

<<<<<<< HEAD
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
                      : 'text-gray-100'
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
                <button className="px-4 py-2 border border-gray-200 rounded-lg flex items-center space-x-2 focus:border-[#c2831f] focus:outline-none">
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
=======
export default Campaign
>>>>>>> main
