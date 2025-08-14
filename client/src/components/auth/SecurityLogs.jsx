import React, { useEffect, useState } from 'react';
import authService from '../../services/authService';

const SecurityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await authService.getSecurityLogs();
                setLogs(res); // now res is the actual array
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
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5">
            <h2 className="text-xl font-semibold text-white mb-3">Security Logs</h2>

            {loading && <p className="text-gray-300">Loading logs...</p>}
            {error && <p className="text-red-400">{error}</p>}

            {!loading && logs.length === 0 && (
                <p className="text-gray-400">No security logs found.</p>
            )}

            {logs.length > 0 && (
                <table className="w-full text-white text-sm">
                    <thead>
                        <tr className="text-gray-400">
                            <th className="text-left">Date</th>
                            <th>IP Address</th>
                            <th>Device</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log, i) => (
                            <tr key={i} className="border-t border-white/10">
                                <td>{new Date(log.createdAt).toLocaleString()}</td>
                                <td>{log.ipAddress || 'N/A'}</td>
                                <td>{log.device || 'Unknown Device'}</td>
                                <td>{log.location || 'Unknown'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default SecurityLogs;