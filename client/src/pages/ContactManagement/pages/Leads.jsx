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
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Users,
  MousePointerClick,
  MailOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = import.meta.env.VITE_VRI_URL;

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for new lead form
  const [showForm, setShowForm] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    company: "",
    source: "email",
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
    company: "",
    source: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // State for search
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch leads from API
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(`${API_URL}/api/leads`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLeads(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch leads. Please try again.");
      console.error("Error fetching leads:", err.response || err.message);
    } finally {
      setLoading(false);
    }
  };

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
      const token = localStorage.getItem('token');
      if (!token) {
        setError("No authentication token found. Please log in again.");
        return;
      }

      const leadToSubmit = {
        ...newLead,
        score: Number(newLead.score),
      };

      const response = await axios.post(
        `${API_URL}/api/leads`,
        leadToSubmit,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLeads([response.data, ...leads]);

      setNewLead({
        name: "",
        email: "",
        company: "",
        source: "email",
        status: "Opened",
        score: 50,
        last: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      });

      setShowForm(false);
      setError(null);
    } catch (err) {
      setError("Failed to add lead. Please try again.");
      console.error("Error adding lead:", err.response?.data || err.message);
    }
  };

  // Update existing lead
  const handleUpdateLead = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      const leadToUpdate = {
        ...editingLead,
        score: Number(editingLead.score),
      };

      const response = await axios.put(
        `${API_URL}/api/leads/${editingLead.id}`,
        leadToUpdate,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLeads(leads.map(lead =>
        lead.id === editingLead.id ? response.data : lead
      ));
      setShowEditForm(false);
      setEditingLead(null);
      setError(null);
    } catch (err) {
      setError("Failed to update lead. Please try again.");
      console.error("Error updating lead:", err.response || err.message);
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
      company: "",
      source: "",
    });
    setSearchTerm("");
  };

  // Delete a lead
  const handleDeleteLead = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        const token = localStorage.getItem('token');

        await axios.delete(`${API_URL}/api/leads/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setLeads(leads.filter(lead => lead.id !== id));
        setError(null);
      } catch (err) {
        setError("Failed to delete lead. Please try again.");
        console.error("Error deleting lead:", err.response || err.message);
      }
    }
  };

  // Update lead status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const lead = leads.find(l => l.id === id);
      if (!lead) {
        setError("Lead not found");
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError("No authentication token found. Please log in.");
        return;
      }

      const updatedLead = { ...lead, status: newStatus };

      const response = await axios.put(
        `${API_URL}/api/leads/${id}`,
        updatedLead,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLeads(leads.map(l => (l.id === id ? response.data : l)));
      setError(null);
    } catch (err) {
      setError("Failed to update status. Please try again.");
      console.error("Error updating status:", err.response?.data || err.message);
    }
  };

  // Filter leads
  const safeLeads = Array.isArray(leads) ? leads : [];

  const filteredLeads = safeLeads.filter((lead) => {
    const matchesStatus = filters.status ? lead.status === filters.status : true;
    const matchesCompany = filters.company ? lead.company === filters.company : true;
    const matchesSource = filters.source ? lead.source === filters.source : true;
    const matchesSearch = searchTerm
      ? lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;

    return matchesStatus && matchesCompany && matchesSource && matchesSearch;
  });

  // Get unique companies and sources for filter dropdowns
  const companies = [...new Set(safeLeads.map(lead => lead.company).filter(Boolean))];
  const sources = [...new Set(safeLeads.map(lead => lead.source).filter(Boolean))];

  // Calculate stats
  const totalLeads = safeLeads.length;
  const openedLeads = safeLeads.filter(l => l.status === "Opened").length;
  const clickedLeads = safeLeads.filter(l => l.status === "Clicked").length;
  const avgEngagement = safeLeads.length > 0 
    ? Math.round(safeLeads.reduce((sum, l) => sum + (l.score || 0), 0) / safeLeads.length) 
    : 0;

  const badgeStyle = {
    Opened: "bg-green-900/40 text-green-400 border border-green-700",
    Clicked: "bg-blue-900/40 text-blue-400 border border-blue-700",
    Bounced: "bg-red-900/40 text-red-400 border border-red-700",
    Unsubscribed: "bg-yellow-900/40 text-yellow-400 border border-yellow-700",
  };

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8 bg-black min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center gap-3">
            <Mail className="w-8 h-8 text-yellow-500" /> Email Campaign Leads
          </h1>
          <p className="text-gray-400 mt-2">
            Track and manage your email campaign leads, engagement, and performance metrics.
          </p>
        </div>
        <button
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 py-3 rounded-xl font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-5 h-5" /> New Lead
        </button>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: "Total Leads", 
            value: totalLeads, 
            icon: Users, 
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-gray-900"
          },
          { 
            label: "Unique Companies", 
            value: companies.length, 
            icon: BarChart3, 
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-gray-900"
          },
          { 
            label: "Opened", 
            value: openedLeads, 
            icon: MailOpen, 
            color: "from-green-500 to-green-600",
            bgColor: "bg-gray-900"
          },
          { 
            label: "Avg Engagement", 
            value: `${avgEngagement}%`, 
            icon: TrendingUp, 
            color: "from-yellow-500 to-yellow-600",
            bgColor: "bg-gray-900"
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bgColor} p-6 rounded-2xl border border-gray-800 shadow-sm hover:shadow-md transition-all`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-sm">
        <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 w-full sm:w-1/2 lg:w-1/3">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            className="bg-transparent outline-none w-full text-sm text-white placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className="flex items-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-700 transition-all"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4" /> {showFilters ? "Hide" : "Show"} Filters
        </button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-sm"
          >
            <div className="flex flex-wrap gap-4">
              <div className="w-full sm:w-56">
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="Opened">Opened</option>
                  <option value="Clicked">Clicked</option>
                  <option value="Bounced">Bounced</option>
                  <option value="Unsubscribed">Unsubscribed</option>
                </select>
              </div>
              <div className="w-full sm:w-56">
                <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                <select
                  name="company"
                  value={filters.company}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                >
                  <option value="">All Companies</option>
                  {companies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-56">
                <label className="block text-sm font-medium text-gray-300 mb-2">Source</label>
                <select
                  name="source"
                  value={filters.source}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-yellow-500 outline-none"
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
                  className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-lg text-sm font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-md"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leads Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-800">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Engagement</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead, index) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-medium text-white">{lead.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">{lead.email}</td>
                      <td className="px-6 py-4 text-gray-200 text-sm font-medium">{lead.company || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium">
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={lead.status}
                          onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${badgeStyle[lead.status]}`}
                        >
                          <option value="Opened">Opened</option>
                          <option value="Clicked">Clicked</option>
                          <option value="Bounced">Bounced</option>
                          <option value="Unsubscribed">Unsubscribed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all"
                              style={{ width: `${lead.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-300 min-w-[45px]">
                            {lead.score}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{lead.last}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewLead(lead)}
                            className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditLead(lead)}
                            className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Mail className="w-16 h-16 text-gray-700" />
                        <p className="text-gray-500 text-lg font-medium">No leads found</p>
                        <p className="text-gray-600 text-sm">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Lead Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10 border border-gray-800"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600">
                    Add New Lead
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleAddLead} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={newLead.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                      placeholder="Acme Inc"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Source
                    </label>
                    <select
                      name="source"
                      value={newLead.source}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                    >
                      <option value="email">Email</option>
                      <option value="Signup Form">Signup Form</option>
                      <option value="Landing Page">Landing Page</option>
                      <option value="Newsletter">Newsletter</option>
                      <option value="Referral">Referral</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={newLead.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                    >
                      <option value="Opened">Opened</option>
                      <option value="Clicked">Clicked</option>
                      <option value="Bounced">Bounced</option>
                      <option value="Unsubscribed">Unsubscribed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Engagement Score: {newLead.score}%
                    </label>
                    <input
                      type="range"
                      name="score"
                      min="0"
                      max="100"
                      value={newLead.score}
                      onChange={handleInputChange}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-6 py-3 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-800 transition-all font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg"
                    >
                      Add Lead
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Lead Form Modal */}
      <AnimatePresence>
        {showEditForm && editingLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowEditForm(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10 border border-gray-800"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600">
                    Edit Lead
                  </h2>
                  <button
                    onClick={() => setShowEditForm(false)}
                    className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleUpdateLead} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editingLead.name}
                      onChange={handleEditInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editingLead.email}
                      onChange={handleEditInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={editingLead.company || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Source
                    </label>
                    <select
                      name="source"
                      value={editingLead.source}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                    >
                      <option value="email">Email</option>
                      <option value="Signup Form">Signup Form</option>
                      <option value="Landing Page">Landing Page</option>
                      <option value="Newsletter">Newsletter</option>
                      <option value="Referral">Referral</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={editingLead.status}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                    >
                      <option value="Opened">Opened</option>
                      <option value="Clicked">Clicked</option>
                      <option value="Bounced">Bounced</option>
                      <option value="Unsubscribed">Unsubscribed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Engagement Score: {editingLead.score}%
                    </label>
                    <input
                      type="range"
                      name="score"
                      min="0"
                      max="100"
                      value={editingLead.score}
                      onChange={handleEditInputChange}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditForm(false)}
                      className="px-6 py-3 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-800 transition-all font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg"
                    >
                      Update Lead
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Lead Modal */}
      <AnimatePresence>
        {showViewModal && viewingLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowViewModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg z-10 border border-gray-800"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600">
                    Lead Details
                  </h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-800">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{viewingLead.name}</h3>
                      <p className="text-gray-400">{viewingLead.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Company
                      </h4>
                      <p className="text-lg font-medium text-white">
                        {viewingLead.company || 'Not specified'}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Source
                      </h4>
                      <span className="inline-block px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm font-medium">
                        {viewingLead.source}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Status
                      </h4>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${badgeStyle[viewingLead.status]}`}>
                        {viewingLead.status}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Engagement Score
                      </h4>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all"
                            style={{ width: `${viewingLead.score}%` }}
                          />
                        </div>
                        <span className="text-lg font-bold text-white min-w-[50px]">
                          {viewingLead.score}%
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Last Contacted
                      </h4>
                      <p className="text-lg font-medium text-white">{viewingLead.last}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-800">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-6 py-3 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-800 transition-all font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditLead(viewingLead);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg"
                  >
                    Edit Lead
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leads;