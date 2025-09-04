import React, { useState, useEffect } from "react";
import { Star, StarOff, Trash2, RefreshCcw } from "lucide-react";

const Inbox = () => {
  const [mails, setMails] = useState([]);
  const [selectedMail, setSelectedMail] = useState(null);
  const [starredMails, setStarredMails] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch replies from backend
  const fetchReplies = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/replies");
      const data = await res.json();
      setMails(data);
    } catch (err) {
      console.error("Error fetching replies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReplies();
    const interval = setInterval(fetchReplies, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const toggleStar = (id) => {
    setStarredMails((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleDelete = (id) => {
    setMails((prev) => prev.filter((m) => m.id !== id));
    if (selectedMail?.id === id) setSelectedMail(null);
  };

  return (
    <div className="flex h-full min-h-screen bg-black text-white rounded-lg shadow overflow-hidden">
      {/* Sidebar - Mail List */}
      <div className="w-[400px] flex flex-col border-r border-gray-700">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-black">
          <h2 className="font-semibold text-gray-200">Inbox</h2>
          <button
            onClick={fetchReplies}
            className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-md hover:bg-gray-700 text-sm"
          >
            <RefreshCcw size={14} />
            Refresh
          </button>
        </div>

        {/* Mail List */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="p-4 text-gray-400 text-sm">Loading...</div>
          )}
          {mails.length === 0 && !loading && (
            <div className="p-4 text-gray-400 text-sm">No messages yet</div>
          )}
          {mails.map((mail) => (
            <div
              key={mail.id}
              onClick={() => setSelectedMail(mail)}
              className={`flex items-center justify-between p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-800 ${
                selectedMail?.id === mail.id ? "bg-gray-700" : ""
              }`}
            >
              <div className="flex-1 pr-2">
                <p className="font-semibold text-white truncate">
                  {mail.contact?.name || mail.contact?.email}
                </p>
                <p className="text-sm text-gray-300 truncate">
                  {mail.subject || "Reply"}
                </p>
                <p className="text-xs text-gray-500 truncate">{mail.message}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(mail.id);
                  }}
                >
                  {starredMails.includes(mail.id) ? (
                    <Star className="text-yellow-400" size={16} />
                  ) : (
                    <StarOff className="text-gray-500" size={16} />
                  )}
                </button>
                <span className="text-xs text-gray-400">
                  {new Date(mail.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <Trash2
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(mail.id);
                  }}
                  className="text-gray-500 hover:text-red-500 cursor-pointer"
                  size={16}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Mail Preview */}
      <div className="flex-1 bg-black">
        {selectedMail ? (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white">
              {selectedMail.subject || "Reply"}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              From: {selectedMail.contact?.name} (
              {selectedMail.contact?.email})
            </p>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {selectedMail.message}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a mail to read
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
