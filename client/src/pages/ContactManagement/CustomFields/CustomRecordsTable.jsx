// File: CustomFields/CustomRecordsTable.jsx
import React, { useState, useEffect } from "react";
import { MoreHorizontal, Eye, Edit, Trash2, Mail, Phone, Building, Calendar } from "lucide-react";

const CustomRecordsTable = ({ records = [], onEdit, onDelete, onView }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedRecords = React.useMemo(() => {
    // Ensure records is an array before sorting
    if (!Array.isArray(records) || !sortConfig.key) return records || [];
    
    return [...records].sort((a, b) => {
      // Handle undefined values
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [records, sortConfig]);

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getEngagementColor = (score) => {
    if (!score) return 'text-gray-400';
    const numScore = parseInt(score);
    if (numScore >= 80) return 'text-green-400';
    if (numScore >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-500/20 text-gray-400';
    
    switch(status.toLowerCase()) {
      case 'opened': return 'bg-blue-500/20 text-blue-400';
      case 'clicked': return 'bg-green-500/20 text-green-400';
      case 'bounced': return 'bg-red-500/20 text-red-400';
      case 'unsubscribed': return 'bg-gray-500/20 text-gray-400';
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'inactive': return 'bg-gray-500/20 text-gray-400';
      case 'prospect': return 'bg-yellow-500/20 text-yellow-400';
      case 'customer': return 'bg-purple-500/20 text-purple-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'in progress': return 'bg-blue-500/20 text-blue-400';
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'open': return 'bg-blue-500/20 text-blue-400';
      case 'processed': return 'bg-purple-500/20 text-purple-400';
      case 'delivered': return 'bg-green-500/20 text-green-400';
      case 'paid': return 'bg-emerald-500/20 text-emerald-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Ensure sortedRecords is always an array
  const displayRecords = Array.isArray(sortedRecords) ? sortedRecords : [];

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="w-full text-sm">
        <thead className="bg-gray-900/60 border-b border-gray-800">
          <tr>
            <th 
              className="py-3 px-4 text-left text-yellow-400 cursor-pointer hover:text-yellow-300"
              onClick={() => handleSort('name')}
            >
              Name{getSortIndicator('name')}
            </th>
            <th 
              className="py-3 px-4 text-left text-yellow-400 cursor-pointer hover:text-yellow-300"
              onClick={() => handleSort('email')}
            >
              Email{getSortIndicator('email')}
            </th>
            <th 
              className="py-3 px-4 text-left text-yellow-400 cursor-pointer hover:text-yellow-300"
              onClick={() => handleSort('company')}
            >
              Company{getSortIndicator('company')}
            </th>
            <th 
              className="py-3 px-4 text-left text-yellow-400 cursor-pointer hover:text-yellow-300"
              onClick={() => handleSort('source')}
            >
              Source{getSortIndicator('source')}
            </th>
            <th 
              className="py-3 px-4 text-left text-yellow-400 cursor-pointer hover:text-yellow-300"
              onClick={() => handleSort('status')}
            >
              Status{getSortIndicator('status')}
            </th>
            <th 
              className="py-3 px-4 text-left text-yellow-400 cursor-pointer hover:text-yellow-300"
              onClick={() => handleSort('score')}
            >
              Engagement{getSortIndicator('score')}
            </th>
            <th 
              className="py-3 px-4 text-left text-yellow-400 cursor-pointer hover:text-yellow-300"
              onClick={() => handleSort('last')}
            >
              Last Contact{getSortIndicator('last')}
            </th>
            <th className="py-3 px-4 text-left text-yellow-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayRecords.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-8 text-center text-gray-400">
                No records found
              </td>
            </tr>
          ) : (
            displayRecords.map((record) => (
              <tr key={record.id || record._id || Math.random()} className="border-b border-gray-800 hover:bg-gray-900/30">
                <td className="py-3 px-4 font-medium text-white">
                  {record.name || 'N/A'}
                </td>
                <td className="py-3 px-4 text-white">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {record.email || 'N/A'}
                  </div>
                </td>
                <td className="py-3 px-4 text-white">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    {record.company || 'N/A'}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-300">
                  {record.source || 'N/A'}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(record.status)}`}>
                    {record.status || 'N/A'}
                  </span>
                </td>
                <td className={`py-3 px-4 font-medium ${getEngagementColor(record.score)}`}>
                  {record.score ? `${record.score}%` : 'N/A'}
                </td>
                <td className="py-3 px-4 text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {record.last || formatDate(record.createdAt) || 'N/A'}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(record.id || record._id || Math.random());
                      }}
                      className="p-1.5 rounded bg-gray-800 hover:bg-gray-700"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    {openDropdownId === (record.id || record._id) && (
                      <div className="absolute right-0 mt-1 w-40 bg-gray-900 border border-gray-800 rounded-md shadow-lg z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(record);
                            setOpenDropdownId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(record);
                            setOpenDropdownId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(record);
                            setOpenDropdownId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomRecordsTable;