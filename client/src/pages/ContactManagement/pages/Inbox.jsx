import React, { useState, useEffect } from "react";
import {
  Mail,
  Trash2,
  Filter,
  Star,
  StarOff,
  CheckSquare,
  Square,
  Search,
} from "lucide-react";
import AddEmailModal from './AddEmailForm';

const InboxPage = ({ fromEmail }) => {
  const [mails, setMails] = useState([]);
  const [selectedMail, setSelectedMail] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filter, setFilter] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch emails from backend
  useEffect(() => {
    const fetchMails = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = fromEmail
          ? `http://localhost:5000/api/inbox/${fromEmail}`
          : `http://localhost:5000/api/emails`;

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("Failed to fetch inbox");
        const data = await res.json();
        setMails(data);
      } catch (err) {
        console.error("Inbox fetch error:", err);
        setError("Failed to load inbox.");
      } finally {
        setLoading(false);
      }
    };

    fetchMails();
  }, [fromEmail]);

  // Toggle select
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Delete selected
  const deleteSelected = () => {
    setMails((prev) => prev.filter((m) => !selectedIds.includes(m.id)));
    setSelectedIds([]);
    setSelectedMail(null);
  };

  // Toggle star
  const toggleStar = (id) => {
    setMails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m))
    );
  };

  // Filter + search
  const filteredMails = mails.filter((mail) => {
    if (filter === "Unread" && !mail.unread) return false;
    if (filter === "Starred" && !mail.starred) return false;
    if (
      search &&
      !mail.subject.toLowerCase().includes(search.toLowerCase()) &&
      !mail.from.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700 bg-zinc-800 relative">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Mail className="w-5 h-5" /> Inbox {fromEmail && `for ${fromEmail}`}
        </h1>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={deleteSelected}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-sm"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}
           <div className="relative">
      <div className="flex items-center gap-3">
        {/* Add Email Button */}
        <AddEmailModal />

        {/* Filter Button */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-1 bg-zinc-700 hover:bg-zinc-600 px-3 py-1 rounded-lg text-sm"
          >
            <Filter className="w-4 h-4" /> {filter}
          </button>
          {filterOpen && (
            <div className="absolute right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg w-32 z-10">
              {["All", "Unread", "Starred"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setFilter(opt);
                    setFilterOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-zinc-700 text-sm"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden h-20">
        {/* Mail List */}
        <div className="w-1/3 border-r border-zinc-700 flex flex-col">
          {/* Search bar */}
          <div className="p-3 border-b border-zinc-700 bg-zinc-800 flex items-center gap-2">
            <Search className="w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search mails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm placeholder-zinc-500"
            />
          </div>

          {/* Loading/Error */}
          {loading ? (
            <p className="text-center text-zinc-500 py-6">Loading mails...</p>
          ) : error ? (
            <p className="text-center text-red-500 py-6">{error}</p>
          ) : filteredMails.length > 0 ? (
            <div className="overflow-y-auto flex-1">
              {filteredMails.map((mail) => (
                <div
                  key={mail.id}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-zinc-800 cursor-pointer ${
                    selectedMail?.id === mail.id
                      ? "bg-zinc-800"
                      : "hover:bg-zinc-800"
                  }`}
                >
                  <button onClick={() => toggleSelect(mail.id)}>
                    {selectedIds.includes(mail.id) ? (
                      <CheckSquare className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Square className="w-5 h-5 text-zinc-500" />
                    )}
                  </button>
                  <div
                    className="flex-1"
                    onClick={() => setSelectedMail(mail)}
                  >
                    <div className="flex justify-between text-sm font-medium">
                      <span>{mail.from}</span>
                      <span className="text-xs text-zinc-400">
                        {mail.time}
                      </span>
                    </div>
                    <p
                      className={`text-sm ${
                        mail.unread ? "font-semibold" : ""
                      }`}
                    >
                      {mail.subject}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {mail.preview}
                    </p>
                  </div>
                  <button onClick={() => toggleStar(mail.id)}>
                    {mail.starred ? (
                      <Star className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <StarOff className="w-4 h-4 text-zinc-500" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-zinc-500 py-6">No mails found</p>
          )}
        </div>

        {/* Mail Detail */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedMail ? (
            <>
              <h2 className="text-lg font-semibold mb-1">
                {selectedMail.subject}
              </h2>
              <p className="text-sm text-zinc-400 mb-4">
                From: {selectedMail.from} • {selectedMail.time}
              </p>
              <div
                className="text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: selectedMail.body }}
              ></div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-500">
              Select a mail to read
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default InboxPage;
