import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Filter,
  Mail,
  User,
  BarChart3,
  Activity,
  X,
  Calendar,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";

const API_URL = "http://localhost:5000/api/leads";

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for new lead form
  const [showForm, setShowForm] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    campaign: "Welcome Series",
    source: "Signup Form",
    status: "Opened",
    score: 50,
    last: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  });
  
  // State for edit lead form
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  
  // State for view lead modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingLead, setViewingLead] = useState(null);
  
  // State for filters
  const [filters, setFilters] = useState({
    status: "",
    campaign: "",
    source: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // State for search
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch leads from API
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL);
        setLeads(response.data);
      } catch (err) {
        setError("Failed to fetch leads. Please try again.");
        console.error("Error fetching leads:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeads();
  }, []);
  
  // Handle form input changes for new lead
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLead({
      ...newLead,
      [name]: value,
    });
  };
  
  // Handle form input changes for editing lead
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingLead({
      ...editingLead,
      [name]: value,
    });
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };
  
  // Add new lead
  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(API_URL, newLead);
      setLeads([response.data, ...leads]);
      setNewLead({
        name: "",
        email: "",
        campaign: "Welcome Series",
        source: "Signup Form",
        status: "Opened",
        score: 50,
        last: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
      setShowForm(false);
    } catch (err) {
      setError("Failed to add lead. Please try again.");
      console.error("Error adding lead:", err);
    }
  };
  
  // Update existing lead
  const handleUpdateLead = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_URL}/${editingLead.id}`, editingLead);
      setLeads(leads.map(lead => 
        lead.id === editingLead.id ? response.data : lead
      ));
      setShowEditForm(false);
      setEditingLead(null);
    } catch (err) {
      setError("Failed to update lead. Please try again.");
      console.error("Error updating lead:", err);
    }
  };
  
  // Open edit form with lead data
  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setShowEditForm(true);
  };
  
  // Open view modal with lead data
  const handleViewLead = (lead) => {
    setViewingLead(lead);
    setShowViewModal(true);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: "",
      campaign: "",
      source: "",
    });
    setSearchTerm("");
  };
  
  // Delete a lead
  const handleDeleteLead = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setLeads(leads.filter(lead => lead.id !== id));
      } catch (err) {
        setError("Failed to delete lead. Please try again.");
        console.error("Error deleting lead:", err);
      }
    }
  };
  
  // Update lead status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const lead = leads.find(l => l.id === id);
      if (lead) {
        const updatedLead = { ...lead, status: newStatus };
        const response = await axios.put(`${API_URL}/${id}`, updatedLead);
        setLeads(leads.map(l => 
          l.id === id ? response.data : l
        ));
      }
    } catch (err) {
      setError("Failed to update status. Please try again.");
      console.error("Error updating status:", err);
    }
  };
  
  // Filter leads based on filters and search term
  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = filters.status ? lead.status === filters.status : true;
    const matchesCampaign = filters.campaign ? lead.campaign === filters.campaign : true;
    const matchesSource = filters.source ? lead.source === filters.source : true;
    const matchesSearch = searchTerm 
      ? lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.campaign.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesStatus && matchesCampaign && matchesSource && matchesSearch;
  });
  
  // Get unique campaigns and sources for filter dropdowns
  const campaigns = [...new Set(leads.map(lead => lead.campaign))];
  const sources = [...new Set(leads.map(lead => lead.source))];
  
  const badgeStyle = {
    Opened: "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-700",
    Clicked: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700",
    Bounced: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700",
    Unsubscribed: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700",
  };
  
  return (
    <div className="space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-yellow-500 flex items-center gap-2">
          <Mail className="w-7 h-7" /> Email Campaign Leads
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-sm">
          Track and manage your email campaign leads, engagement, and campaign performance.
        </p>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: leads.length },
          { label: "Active Campaigns", value: campaigns.length },
          { label: "Open Rate", value: "68%" },
          { label: "Click Rate", value: "42%" },
        ].map((stat) => (
          <div key={stat.label} className="bg-black dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <p className="text-white dark:text-zinc-400">{stat.label}</p>
            <p className="text-white font-bold dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
      
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="flex items-center gap-2 bg-black dark:bg-zinc-900 border border-[#c2831f] dark:border-zinc-800 rounded-lg px-3 py-2 w-full sm:w-1/3">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search leads..."
            className="bg-transparent outline-none w-full text-sm text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <button 
            className="flex items-center gap-2 px-3 py-2 bg-black dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-white dark:text-zinc-200 transition"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button 
            className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-xl font-medium hover:bg-yellow-400 transition"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4" /> New Lead
          </button>
        </div>
      </div>
      
      {/* Filters Panel */}
      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-black dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800"
        >
          <div className="flex flex-wrap gap-4">
            <div className="w-full sm:w-48">
              <label className="block text-sm font-medium text-zinc-300 mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-black border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-white"
              >
                <option value="">All Statuses</option>
                <option value="Opened">Opened</option>
                <option value="Clicked">Clicked</option>
                <option value="Bounced">Bounced</option>
                <option value="Unsubscribed">Unsubscribed</option>
              </select>
            </div>
            <div className="w-full sm:w-48">
              <label className="block text-sm font-medium text-zinc-300 mb-1">Campaign</label>
              <select
                name="campaign"
                value={filters.campaign}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-black border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-white"
              >
                <option value="">All Campaigns</option>
                {campaigns.map(campaign => (
                  <option key={campaign} value={campaign}>{campaign}</option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-48">
              <label className="block text-sm font-medium text-zinc-300 mb-1">Source</label>
              <select
                name="source"
                value={filters.source}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-black border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-white"
              >
                <option value="">All Sources</option>
                {sources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={resetFilters}
                className="px-4 py-2 bg-white dark:bg-zinc-700 text-black dark:text-zinc-200 rounded-lg text-sm hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Leads Table */}
      <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Campaign</th>
                <th className="px-4 py-3 text-left">Source</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Engagement</th>
                <th className="px-4 py-3 text-left">Last Contacted</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
                    <td className="px-4 py-3 flex items-center gap-2 font-medium text-zinc-800 dark:text-white">
                      <User className="w-4 h-4 text-yellow-500" />
                      {lead.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{lead.email}</td>
                    <td className="px-4 py-3">{lead.campaign}</td>
                    <td className="px-4 py-3 text-zinc-500">{lead.source}</td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${badgeStyle[lead.status]}`}
                      >
                        <option value="Opened">Opened</option>
                        <option value="Clicked">Clicked</option>
                        <option value="Bounced">Bounced</option>
                        <option value="Unsubscribed">Unsubscribed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-500" />
                      {lead.score}%
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{lead.last}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button 
                        onClick={() => handleViewLead(lead)}
                        className="text-blue-500 hover:text-blue-700"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditLead(lead)}
                        className="text-green-500 hover:text-green-700"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteLead(lead.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-zinc-500">
                    No leads found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Campaign Insights Chart Placeholder */}
      <div className="bg-black dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-semibold text-yellow-500 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Campaign Insights
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
          Opens vs Clicks over the past 30 days. (Integrate Recharts or Chart.js here.)
        </p>
        <div className="h-40 flex items-center justify-center text-zinc-500 text-sm border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
          📊 Chart Placeholder
        </div>
      </div>
      
      {/* New Lead Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-70"
            onClick={() => setShowForm(false)}
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto z-10"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-yellow-500">Add New Lead</h2>
                <button 
                  onClick={() => setShowForm(false)}
                  className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800"
                >
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>
              
              <form onSubmit={handleAddLead} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={newLead.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={newLead.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Campaign</label>
                  <select
                    name="campaign"
                    value={newLead.campaign}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg"
                  >
                    <option value="Welcome Series">Welcome Series</option>
                    <option value="Product Launch">Product Launch</option>
                    <option value="Re-engagement">Re-engagement</option>
                    <option value="Discount Promo">Discount Promo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Source</label>
                  <select
                    name="source"
                    value={newLead.source}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg"
                  >
                    <option value="Signup Form">Signup Form</option>
                    <option value="Landing Page">Landing Page</option>
                    <option value="Newsletter">Newsletter</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
                  <select
                    name="status"
                    value={newLead.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg"
                  >
                    <option value="Opened">Opened</option>
                    <option value="Clicked">Clicked</option>
                    <option value="Bounced">Bounced</option>
                    <option value="Unsubscribed">Unsubscribed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Engagement Score</label>
                  <input
                    type="range"
                    name="score"
                    min="0"
                    max="100"
                    value={newLead.score}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>0</span>
                    <span>{newLead.score}</span>
                    <span>100</span>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400"
                  >
                    Add Lead
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Edit Lead Form Modal */}
      {showEditForm && editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-70"
            onClick={() => setShowEditForm(false)}
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto z-10"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-yellow-500">Edit Lead</h2>
                <button 
                  onClick={() => setShowEditForm(false)}
                  className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800"
                >
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateLead} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={editingLead.name}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={editingLead.email}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Campaign</label>
                  <select
                    name="campaign"
                    value={editingLead.campaign}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg"
                  >
                    <option value="Welcome Series">Welcome Series</option>
                    <option value="Product Launch">Product Launch</option>
                    <option value="Re-engagement">Re-engagement</option>
                    <option value="Discount Promo">Discount Promo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Source</label>
                  <select
                    name="source"
                    value={editingLead.source}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg"
                  >
                    <option value="Signup Form">Signup Form</option>
                    <option value="Landing Page">Landing Page</option>
                    <option value="Newsletter">Newsletter</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
                  <select
                    name="status"
                    value={editingLead.status}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg"
                  >
                    <option value="Opened">Opened</option>
                    <option value="Clicked">Clicked</option>
                    <option value="Bounced">Bounced</option>
                    <option value="Unsubscribed">Unsubscribed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Engagement Score</label>
                  <input
                    type="range"
                    name="score"
                    min="0"
                    max="100"
                    value={editingLead.score}
                    onChange={handleEditInputChange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>0</span>
                    <span>{editingLead.score}</span>
                    <span>100</span>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400"
                  >
                    Update Lead
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* View Lead Modal */}
      {showViewModal && viewingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-70"
            onClick={() => setShowViewModal(false)}
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-lg w-full max-w-md z-10"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-yellow-500">Lead Details</h2>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800"
                >
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-zinc-500">Name</h3>
                  <p className="text-lg">{viewingLead.name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-zinc-500">Email</h3>
                  <p className="text-lg">{viewingLead.email}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-zinc-500">Campaign</h3>
                  <p className="text-lg">{viewingLead.campaign}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-zinc-500">Source</h3>
                  <p className="text-lg">{viewingLead.source}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-zinc-500">Status</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeStyle[viewingLead.status]}`}>
                    {viewingLead.status}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-zinc-500">Engagement Score</h3>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span className="text-lg">{viewingLead.score}%</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-zinc-500">Last Contacted</h3>
                  <p className="text-lg">{viewingLead.last}</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditLead(viewingLead);
                  }}
                  className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Leads;