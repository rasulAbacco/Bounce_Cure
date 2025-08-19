import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ChevronUp, ChevronDown, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatusBadge = ({ status }) => {
    const statusColors = {
        active: 'bg-green-500/20 text-green-400',
        paused: 'bg-yellow-500/20 text-yellow-400',
        draft: 'bg-gray-500/20 text-gray-400',
        completed: 'bg-blue-500/20 text-blue-400'
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-500/20'}`}>
            {status}
        </span>
    );
};

const campaignsData = [
    {
        id: 1,
        name: 'Welcome Series',
        type: 'Email',
        status: 'active',
        sent: 1500,
        openRate: 45.3,
        createdAt: '2025-01-12',
    },
    {
        id: 2,
        name: 'Product Launch',
        type: 'Sequence',
        status: 'paused',
        sent: 1200,
        openRate: 38.7,
        createdAt: '2025-02-05',
    },
    {
        id: 3,
        name: 'Holiday Sale',
        type: 'Email',
        status: 'draft',
        sent: 0,
        openRate: 0,
        createdAt: '2025-03-18',
    },
];

const CampaignTable = ({ activeTab, searchTerm, onSelectCampaigns }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [selectedIds, setSelectedIds] = useState([]);

    const filteredCampaigns = useMemo(() => {
        return campaignsData
            .filter((campaign) => activeTab === 'all' || campaign.status === activeTab)
            .filter((campaign) =>
                campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [activeTab, searchTerm]);

    const sortedCampaigns = useMemo(() => {
        if (!sortConfig.key) return filteredCampaigns;

        return [...filteredCampaigns].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (typeof aValue === 'string') {
                return sortConfig.direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            if (typeof aValue === 'number') {
                return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
            }

            return 0;
        });
    }, [filteredCampaigns, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortArrow = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="inline ml-1 h-4 w-4" />;
        return sortConfig.direction === 'asc' ?
            <ChevronUp className="inline ml-1 h-4 w-4" /> :
            <ChevronDown className="inline ml-1 h-4 w-4" />;
    };

    const toggleSelectCampaign = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
        onSelectCampaigns(selectedIds);
    };

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">
                            <input
                                type="checkbox"
                                className="rounded border-gray-600 bg-gray-700 text-[#c2831f] focus:ring-[#c2831f]"
                                checked={selectedIds.length === filteredCampaigns.length}
                                onChange={() => {
                                    if (selectedIds.length === filteredCampaigns.length) {
                                        setSelectedIds([]);
                                    } else {
                                        setSelectedIds(filteredCampaigns.map(c => c.id));
                                    }
                                }}
                            />
                        </th>
                        <th
                            onClick={() => requestSort('name')}
                            className="cursor-pointer px-6 py-3 text-left text-sm font-medium text-gray-300"
                        >
                            <div className="flex items-center">
                                Name
                                {getSortArrow('name')}
                            </div>
                        </th>
                        <th
                            onClick={() => requestSort('type')}
                            className="cursor-pointer px-6 py-3 text-left text-sm font-medium text-gray-300"
                        >
                            <div className="flex items-center">
                                Type
                                {getSortArrow('type')}
                            </div>
                        </th>
                        <th
                            onClick={() => requestSort('status')}
                            className="cursor-pointer px-6 py-3 text-left text-sm font-medium text-gray-300"
                        >
                            <div className="flex items-center">
                                Status
                                {getSortArrow('status')}
                            </div>
                        </th>
                        <th
                            onClick={() => requestSort('sent')}
                            className="cursor-pointer px-6 py-3 text-right text-sm font-medium text-gray-300"
                        >
                            <div className="flex items-center justify-end">
                                Sent
                                {getSortArrow('sent')}
                            </div>
                        </th>
                        <th
                            onClick={() => requestSort('openRate')}
                            className="cursor-pointer px-6 py-3 text-right text-sm font-medium text-gray-300"
                        >
                            <div className="flex items-center justify-end">
                                Open Rate
                                {getSortArrow('openRate')}
                            </div>
                        </th>
                        <th
                            onClick={() => requestSort('createdAt')}
                            className="cursor-pointer px-6 py-3 text-right text-sm font-medium text-gray-300"
                        >
                            <div className="flex items-center justify-end">
                                Created At
                                {getSortArrow('createdAt')}
                            </div>
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-medium text-gray-300">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 bg-gray-900">
                    {sortedCampaigns.length === 0 && (
                        <tr>
                            <td colSpan="8" className="px-6 py-4 text-center text-gray-400">
                                No campaigns found. Create your first campaign to get started.
                            </td>
                        </tr>
                    )}

                    {sortedCampaigns.map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-gray-800">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-600 bg-gray-700 text-[#c2831f] focus:ring-[#c2831f]"
                                    checked={selectedIds.includes(campaign.id)}
                                    onChange={() => toggleSelectCampaign(campaign.id)}
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <Link
                                    to={`/campaigns/${campaign.id}`}
                                    className="text-[#c2831f] hover:underline font-medium"
                                >
                                    {campaign.name}
                                </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                {campaign.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge status={campaign.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-300">
                                {campaign.sent.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end">
                                    <span className="text-gray-300 mr-2">{campaign.openRate.toFixed(1)}%</span>
                                    <div className="w-16 bg-gray-700 rounded-full h-1.5">
                                        <div
                                            className="bg-[#c2831f] h-1.5 rounded-full"
                                            style={{ width: `${Math.min(100, campaign.openRate)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-300">
                                {new Date(campaign.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button className="text-gray-400 hover:text-white">
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CampaignTable;