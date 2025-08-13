import React, { useEffect, useState } from 'react';
import authService from '../../services/authService';

const ActiveSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await authService.getActiveSessions();
                setSessions(res.data); // ✅ Extract the array from response
            } catch (err) {
                console.error("Failed to fetch sessions:", err);
                setError("Failed to load active sessions.");
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    const logoutSession = async (id) => {
        try {
            await authService.logoutSession(id);
            setSessions(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error("Failed to logout session:", err);
            alert("Could not log out session. Please try again.");
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5">
            <h2 className="text-xl font-semibold text-white mb-3">Active Sessions</h2>

            {loading && <p className="text-gray-300">Loading sessions...</p>}
            {error && <p className="text-red-400">{error}</p>}

            {!loading && sessions.length === 0 && (
                <p className="text-gray-400">No active sessions found.</p>
            )}

            {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between border-b border-white/10 py-2">
                    <div>
                        <p>{session.device || "Unknown Device"}</p>
                        <p className="text-gray-400 text-sm">{session.ipAddress || "IP not available"}</p>
                    </div>
                    <button
                        onClick={() => logoutSession(session.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                    >
                        Logout
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ActiveSessions;