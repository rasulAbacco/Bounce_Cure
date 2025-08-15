import React, { useEffect, useState } from 'react';
import { Shield, Calendar, MapPin, Monitor, Activity } from 'lucide-react';
import authService from '../../services/authService';

const SecurityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await authService.getSecurityLogs();
                setLogs(res);
            } catch (err) {
                console.error("Failed to fetch security logs:", err);
                setError("Unable to load security logs.");
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    return (
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-gray-400/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/5 rounded-lg backdrop-blur-sm">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Security Logs</h2>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white"></div>
                        <span className="ml-3 text-gray-300">Loading security logs...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                        <p className="text-red-400 font-medium">{error}</p>
                    </div>
                )}

                {!loading && logs.length === 0 && (
                    <div className="text-center py-12">
                        <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
                        <p className="text-gray-400 text-lg">No security logs found</p>
                        <p className="text-gray-500 text-sm mt-1">Security activities will appear here</p>
                    </div>
                )}

                {logs.length > 0 && (
                    <div className="space-y-4">
                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-black/20 border-b border-white/10">
                                            <th className="text-left py-2 px-2 text-gray-300 font-semibold">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Calendar className="w-4 h-4" />
                                                    Date & Time
                                                </div>
                                            </th>
                                            <th className="text-left py-2 px-2 text-gray-300 font-semibold">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <MapPin className="w-4 h-4" />
                                                    IP Address
                                                </div>
                                            </th>
                                            <th className="text-left py-4 px-6 text-gray-300 font-semibold">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Monitor className="w-4 h-4" />
                                                    Device
                                                </div>
                                            </th>
                                            <th className="text-left py-2 px-2 text-gray-300 font-semibold text-xs">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    Location
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log, i) => (
                                            <tr
                                                key={i}
                                                className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                                            >
                                                <td className="py-4 px-6 text-white text-xs">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </td>
                                                <td className="py-4 px-6 text-gray-300 font-mono text-xs">
                                                    {log.ipAddress || 'N/A'}
                                                </td>
                                                <td className="py-4 px-6 text-gray-300 text-xs">
                                                    {log.device || 'Unknown Device'}
                                                </td>
                                                <td className="py-4 px-6 text-gray-300 text-xs">
                                                    {log.location || 'Unknown'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-3">
                            {logs.map((log, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-white font-medium">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-300 font-mono">
                                                {log.ipAddress || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Monitor className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-300">
                                                {log.device || 'Unknown Device'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-300">
                                                {log.location || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Log Count */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Activity className="w-4 h-4" />
                                <span className="text-sm">
                                    Showing {logs.length} security {logs.length === 1 ? 'log' : 'logs'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SecurityLogs;