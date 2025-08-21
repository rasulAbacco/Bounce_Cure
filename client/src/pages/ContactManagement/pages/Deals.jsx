import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Briefcase,
  User,
  Calendar,
  DollarSign,
  BarChart3,
} from "lucide-react";

function Deals() {
  const [deals, setDeals] = useState([
    {
      id: 1,
      name: "Website Redesign",
      client: "Acme Inc.",
      stage: "Negotiation",
      value: "$12,000",
      closing: "2025-09-10",
      status: "Open",
    },
    {
      id: 2,
      name: "SEO Package",
      client: "XYZ Corp",
      stage: "Proposal Sent",
      value: "$5,000",
      closing: "2025-08-25",
      status: "Open",
    },
    {
      id: 3,
      name: "Mobile App Development",
      client: "Startup Hub",
      stage: "Closed Won",
      value: "$20,000",
      closing: "2025-08-15",
      status: "Won",
    },
    {
      id: 4,
      name: "Digital Marketing",
      client: "Freelance Client",
      stage: "Closed Lost",
      value: "$3,500",
      closing: "2025-08-05",
      status: "Lost",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newDeal, setNewDeal] = useState({
    name: "",
    client: "",
    stage: "Negotiation",
    value: "",
    closing: "",
    status: "Open",
  });

  const badgeStyle = {
    Open: "bg-blue-900/40 text-blue-400 border border-blue-700",
    Won: "bg-green-900/40 text-green-400 border border-green-700",
    Lost: "bg-red-900/40 text-red-400 border border-red-700",
  };

  const handleAddDeal = (e) => {
    e.preventDefault();
    if (!newDeal.name.trim() || !newDeal.client.trim()) return;

    setDeals([
      ...deals,
      {
        id: deals.length + 1,
        ...newDeal,
      },
    ]);

    setNewDeal({
      name: "",
      client: "",
      stage: "Negotiation",
      value: "",
      closing: "",
      status: "Open",
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
          <Briefcase className="w-7 h-7 text-yellow-400" /> Deals
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-xl font-medium hover:bg-yellow-400"
        >
          <Plus className="w-4 h-4" /> {showForm ? "Close" : "New Deal"}
        </button>
      </div>

      {/* Add Deal Form */}
      {showForm && (
        <form
          onSubmit={handleAddDeal}
          className="bg-zinc-900/60 p-6 rounded-xl border border-zinc-800 space-y-4"
        >
          <div>
            <label className="block text-sm text-zinc-400">Deal Name</label>
            <input
              type="text"
              value={newDeal.name}
              onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
              placeholder="Enter deal name"
              className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400">Client</label>
            <input
              type="text"
              value={newDeal.client}
              onChange={(e) => setNewDeal({ ...newDeal, client: e.target.value })}
              placeholder="Enter client name"
              className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400">Stage</label>
              <select
                value={newDeal.stage}
                onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm"
              >
                <option>Negotiation</option>
                <option>Proposal Sent</option>
                <option>Closed Won</option>
                <option>Closed Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400">Value ($)</label>
              <input
                type="number"
                value={newDeal.value}
                onChange={(e) => setNewDeal({ ...newDeal, value: `$${e.target.value}` })}
                placeholder="Enter value"
                className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400">Closing Date</label>
              <input
                type="date"
                value={newDeal.closing}
                onChange={(e) => setNewDeal({ ...newDeal, closing: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400">Status</label>
              <select
                value={newDeal.status}
                onChange={(e) => setNewDeal({ ...newDeal, status: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm"
              >
                <option>Open</option>
                <option>Won</option>
                <option>Lost</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-500 text-black py-2 rounded-lg font-medium hover:bg-yellow-400"
          >
            Save Deal
          </button>
        </form>
      )}

      {/* Deals Table */}
      <div className="overflow-x-auto border border-zinc-800 rounded-xl">
        <table className="table-auto w-full text-sm">
          <thead>
            <tr className="bg-zinc-900/60 text-zinc-400 border-b border-zinc-800">
              {["Deal Name", "Client", "Stage", "Value", "Closing Date", "Status"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left whitespace-nowrap"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {deals.map((d) => (
              <tr
                key={d.id}
                className="border-b border-zinc-800 hover:bg-zinc-900/40"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-zinc-200">
                    <Briefcase className="w-4 h-4 text-yellow-400" />
                    {d.name}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <User className="w-4 h-4 text-zinc-400" />
                    {d.client}
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                  {d.stage}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-zinc-300">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    {d.value}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-zinc-400">
                  {d.closing}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${badgeStyle[d.status]}`}
                  >
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {["Pipeline Overview", "Deal Conversion Rate"].map((title, i) => (
          <div
            key={i}
            className="bg-zinc-900/60 p-6 rounded-xl border border-zinc-800"
          >
            <h2 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-yellow-400" /> {title}
            </h2>
            <div className="h-40 flex items-center justify-center text-zinc-500 text-sm border border-dashed border-zinc-700 rounded-lg">
              📊 Chart Placeholder
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Deals;
