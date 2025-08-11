import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    Users, Mail, Eye, MousePointer, TrendingUp, TrendingDown,
    Plus, Upload, Bell, Calendar, CheckCircle, AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const Dashboard = () => {
    // Sample data for charts
    const campaignData = [
        { name: 'Jan', opens: 4000, clicks: 2400, bounces: 400 },
        { name: 'Feb', opens: 3000, clicks: 1398, bounces: 300 },
        { name: 'Mar', opens: 2000, clicks: 9800, bounces: 200 },
        { name: 'Apr', opens: 2780, clicks: 3908, bounces: 278 },
        { name: 'May', opens: 1890, clicks: 4800, bounces: 189 },
        { name: 'Jun', opens: 2390, clicks: 3800, bounces: 239 },
    ];

    const contactListData = [
        { name: 'Active Subscribers', value: 4500, color: '#3b82f6' },
        { name: 'Inactive Users', value: 1200, color: '#ef4444' },
        { name: 'New Signups', value: 800, color: '#10b981' },
        { name: 'Unsubscribed', value: 300, color: '#f59e0b' },
    ];

    const segmentData = [
        { name: 'High Engagement', value: 35, color: '#10b981' },
        { name: 'Medium Engagement', value: 45, color: '#3b82f6' },
        { name: 'Low Engagement', value: 20, color: '#f59e0b' },
    ];

    const recentCampaigns = [
        { name: 'Summer Sale Campaign', date: '2024-08-10', status: 'Sent', open: '24.5%', click: '8.2%', bounce: '2.1%' },
        { name: 'Product Launch Alert', date: '2024-08-08', status: 'Sent', open: '32.1%', click: '12.4%', bounce: '1.8%' },
        { name: 'Weekly Newsletter #32', date: '2024-08-05', status: 'Sent', open: '18.7%', click: '5.3%', bounce: '3.2%' },
        { name: 'Flash Sale Announcement', date: '2024-08-03', status: 'Sent', open: '41.2%', click: '15.6%', bounce: '1.9%' },
    ];

    const topContacts = [
        { name: 'Sarah Johnson', email: 'sarah@example.com', engagement: '98%' },
        { name: 'Mike Chen', email: 'mike@example.com', engagement: '95%' },
        { name: 'Emma Davis', email: 'emma@example.com', engagement: '92%' },
        { name: 'Alex Wilson', email: 'alex@example.com', engagement: '89%' },
        { name: 'Lisa Brown', email: 'lisa@example.com', engagement: '87%' },
    ];

    const notifications = [
        { type: 'success', message: 'Campaign "Summer Sale" delivered successfully', time: '2 hours ago' },
        { type: 'warning', message: 'Low engagement detected in segment A', time: '4 hours ago' },
        { type: 'info', message: 'New contacts imported: 145 added', time: '6 hours ago' },
    ];

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-black text-white">


                <div className="max-w-7xl mx-auto p-6 space-y-6">
                    {/* Stats Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-300 text-sm">Total Contacts</p>
                                    <p className="text-3xl font-bold text-white">6,800</p>
                                    <div className="flex items-center mt-2">
                                        <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                                        <span className="text-green-400 text-sm">+12.5%</span>
                                    </div>
                                </div>
                                <Users className="w-12 h-12 text-blue-400" />
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-300 text-sm">Campaigns Sent</p>
                                    <p className="text-3xl font-bold text-white">24</p>
                                    <div className="flex items-center mt-2">
                                        <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                                        <span className="text-green-400 text-sm">+8.2%</span>
                                    </div>
                                </div>
                                <Mail className="w-12 h-12 text-purple-400" />
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-300 text-sm">Open Rate</p>
                                    <p className="text-3xl font-bold text-white">28.4%</p>
                                    <div className="flex items-center mt-2">
                                        <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                                        <span className="text-red-400 text-sm">-2.1%</span>
                                    </div>
                                </div>
                                <Eye className="w-12 h-12 text-green-400" />
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-300 text-sm">Click Rate</p>
                                    <p className="text-3xl font-bold text-white">9.7%</p>
                                    <div className="flex items-center mt-2">
                                        <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                                        <span className="text-green-400 text-sm">+4.3%</span>
                                    </div>
                                </div>
                                <MousePointer className="w-12 h-12 text-yellow-400" />
                            </div>
                        </div>
                    </div>

                    {/* Graphs Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Line Chart */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/10">
                            <h3 className="text-xl font-semibold text-white mb-4">Campaign Performance Over Time</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={campaignData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="name" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(31, 41, 55, 0.9)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="opens" stroke="#3b82f6" strokeWidth={2} />
                                    <Line type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={2} />
                                    <Line type="monotone" dataKey="bounces" stroke="#ef4444" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Pie Chart */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/10">
                            <h3 className="text-xl font-semibold text-white mb-4">Contact List Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={contactListData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {contactListData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(31, 41, 55, 0.9)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Campaigns Table */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/10">
                        <h3 className="text-xl font-semibold text-white mb-4">Recent Campaigns</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/20">
                                        <th className="text-left text-gray-300 py-3">Campaign Name</th>
                                        <th className="text-left text-gray-300 py-3">Date Sent</th>
                                        <th className="text-left text-gray-300 py-3">Status</th>
                                        <th className="text-left text-gray-300 py-3">Open %</th>
                                        <th className="text-left text-gray-300 py-3">Click %</th>
                                        <th className="text-left text-gray-300 py-3">Bounce %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentCampaigns.map((campaign, index) => (
                                        <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                            <td className="py-3 text-white">{campaign.name}</td>
                                            <td className="py-3 text-gray-300">{campaign.date}</td>
                                            <td className="py-3">
                                                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-sm">
                                                    {campaign.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-white">{campaign.open}</td>
                                            <td className="py-3 text-white">{campaign.click}</td>
                                            <td className="py-3 text-white">{campaign.bounce}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Contact Insights Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Contacts */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/10">
                            <h3 className="text-xl font-semibold text-white mb-4">Top 5 Most Engaged Contacts</h3>
                            <div className="space-y-3">
                                {topContacts.map((contact, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                        <div>
                                            <p className="text-white font-medium">{contact.name}</p>
                                            <p className="text-gray-400 text-sm">{contact.email}</p>
                                        </div>
                                        <span className="text-green-400 font-semibold">{contact.engagement}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Segment Distribution */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/10">
                            <h3 className="text-xl font-semibold text-white mb-4">Segment Distribution</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={segmentData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, value }) => `${name} ${value}%`}
                                    >
                                        {segmentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(31, 41, 55, 0.9)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Notifications Panel */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/10">
                            <div className="flex items-center mb-4">
                                <Bell className="w-5 h-5 text-yellow-400 mr-2" />
                                <h3 className="text-xl font-semibold text-white">Recent Notifications</h3>
                            </div>
                            <div className="space-y-3">
                                {notifications.map((notification, index) => (
                                    <div key={index} className="flex items-start p-3 bg-white/5 rounded-lg">
                                        <div className="mr-3 mt-1">
                                            {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
                                            {notification.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-400" />}
                                            {notification.type === 'info' && <Bell className="w-4 h-4 text-blue-400" />}
                                        </div>
                                        <div>
                                            <p className="text-white text-sm">{notification.message}</p>
                                            <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/10">
                            <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
                            <div className="space-y-4">
                                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center">
                                    <Plus className="w-5 h-5 mr-2" />
                                    Create New Campaign
                                </button>
                                <button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center">
                                    <Upload className="w-5 h-5 mr-2" />
                                    Upload Contacts
                                </button>
                                <button className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 border border-white/20 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    Schedule Campaign
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;