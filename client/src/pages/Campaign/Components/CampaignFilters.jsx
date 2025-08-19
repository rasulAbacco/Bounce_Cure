import React, { useState } from 'react';
import { Search, Filter, ChevronDown, X } from 'lucide-react';

const CampaignFilters = ({ activeTab, setActiveTab, searchTerm, setSearchTerm }) => {
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({
        type: null,
        dateRange: null,
        minOpenRate: null
    });

    const tabs = ['all', 'active', 'paused', 'completed', 'draft'];

    const clearFilters = () => {
        setSelectedFilters({
            type: null,
            dateRange: null,
            minOpenRate: null
        });
    };

    const hasFilters = Object.values(selectedFilters).some(filter => filter !== null);

    return (
        <div className="rounded-lg border border-gray-700 p-6 mb-6 bg-gray-900">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg capitalize text-sm ${activeTab === tab
                                ? 'bg-[#c2831f] text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex space-x-3 w-full sm:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#c2831f] focus:ring-[#c2831f]"
                        />
                    </div>
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-sm ${hasFilters
                            ? 'bg-[#c2831f]/20 border border-[#c2831f] text-[#c2831f]'
                            : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        <Filter size={18} />
                        <span>Filters</span>
                        {hasFilters && <span className="ml-1">•</span>}
                        <ChevronDown size={18} className={`transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {showAdvancedFilters && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    {hasFilters && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {selectedFilters.type && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-[#c2831f]/20 text-[#c2831f]">
                                    Type: {selectedFilters.type}
                                    <button
                                        onClick={() => setSelectedFilters({ ...selectedFilters, type: null })}
                                        className="ml-1.5"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            )}
                            {selectedFilters.dateRange && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-[#c2831f]/20 text-[#c2831f]">
                                    Date: {selectedFilters.dateRange}
                                    <button
                                        onClick={() => setSelectedFilters({ ...selectedFilters, dateRange: null })}
                                        className="ml-1.5"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            )}
                            {selectedFilters.minOpenRate && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-[#c2831f]/20 text-[#c2831f]">
                                    Open Rate  {selectedFilters.minOpenRate}%
                                    <button
                                        onClick={() => setSelectedFilters({ ...selectedFilters, minOpenRate: null })}
                                        className="ml-1.5"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            )}
                            <button
                                onClick={clearFilters}
                                className="text-xs text-gray-400 hover:text-white ml-2"
                            >
                                Clear all
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Campaign Type</label>
                            <select
                                value={selectedFilters.type || ''}
                                onChange={(e) => setSelectedFilters({ ...selectedFilters, type: e.target.value || null })}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                            >
                                <option value="">All Types</option>
                                <option>Email</option>
                                <option>Sequence</option>
                                <option>Social</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Date Range</label>
                            <select
                                value={selectedFilters.dateRange || ''}
                                onChange={(e) => setSelectedFilters({ ...selectedFilters, dateRange: e.target.value || null })}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                            >
                                <option value="">Any Time</option>
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>Last 90 Days</option>
                                <option>Custom Range</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Minimum Open Rate</label>
                            <select
                                value={selectedFilters.minOpenRate || ''}
                                onChange={(e) => setSelectedFilters({ ...selectedFilters, minOpenRate: e.target.value || null })}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                            >
                                <option value="">Any Rate</option>
                                <option value="20">20%+</option>
                                <option value="30">30%+</option>
                                <option value="40">40%+</option>
                                <option value="50">50%+</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignFilters;