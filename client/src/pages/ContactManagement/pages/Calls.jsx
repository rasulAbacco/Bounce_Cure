import React, { useState } from "react";
import { PhoneCall, PhoneMissed, PhoneOutgoing, Trash2, Search } from "lucide-react";

const CallLog = () => {
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState([
    { id: 1, name: "John Doe", number: "+1 202-555-0123", type: "incoming", time: "09:30 AM" },
    { id: 2, name: "Jane Smith", number: "+1 202-555-0145", type: "outgoing", time: "10:15 AM" },
    { id: 3, name: "Mike Johnson", number: "+1 202-555-0199", type: "missed", time: "11:45 AM" },
    { id: 4, name: "Sarah Lee", number: "+1 202-555-0111", type: "incoming", time: "01:20 PM" },
  ]);

  const handleDelete = (id) => {
    setLogs(logs.filter((log) => log.id !== id));
  };


  const filteredLogs = logs.filter(
    (log) =>
      log.name.toLowerCase().includes(search.toLowerCase()) ||
      log.number.includes(search)
  );

  const getIcon = (type) => {
    switch (type) {
      case "incoming":
        return <PhoneCall className="text-green-600" size={20} />;
      case "outgoing":
        return <PhoneOutgoing className="text-blue-600" size={20} />;
      case "missed":
        return <PhoneMissed className="text-red-600" size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-xl max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">📞 Call Log</h2>

      {/* Search bar */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search by name or number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
      </div>

      {/* Call list */}
      <ul className="divide-y">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <li
              key={log.id}
              className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getIcon(log.type)}
                <div>
                  <p className="font-semibold">{log.name}</p>
                  <p className="text-sm text-gray-500">{log.number}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-400">{log.time}</span>
                <button
                  onClick={() => handleDelete(log.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No calls found</p>
        )}
      </ul>
    </div>
  );
};

export default CallLog;
