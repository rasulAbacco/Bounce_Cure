import React, { useState } from "react";
import {
  User,
  Search,
  Filter,
  Phone,
  Mail,
  Building2,
  BarChart3,
} from "lucide-react";

function ContactsPage() {
  const [contacts] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 555-0100",
      company: "Acme Inc.",
      status: "Active",
      last: "Aug 20",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1 555-0110",
      company: "XYZ Corp",
      status: "Prospect",
      last: "Aug 18",
    },
    {
      id: 3,
      name: "Sam Brown",
      email: "sam@example.com",
      phone: "+1 555-0120",
      company: "Freelance",
      status: "Customer",
      last: "Aug 17",
    },
    {
      id: 4,
      name: "Alice Johnson",
      email: "alice@example.com",
      phone: "+1 555-0130",
      company: "Startup Hub",
      status: "Inactive",
      last: "Aug 15",
    },
  ]);

  const badgeStyle = {
    Active: "bg-green-900/40 text-green-400 border border-green-700",
    Inactive: "bg-red-900/40 text-red-400 border border-red-700",
    Prospect: "bg-blue-900/40 text-blue-400 border border-blue-700",
    Customer: "bg-yellow-900/40 text-yellow-400 border border-yellow-700",
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
          <User className="w-7 h-7 text-yellow-400" /> Contacts
        </h1>
        <p className="text-zinc-400 mt-2">
          Manage all your contacts, companies, and recent interactions in one place.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Contacts", value: "2,150" },
          { label: "Active Contacts", value: "1,780" },
          { label: "Companies", value: "320" },
          { label: "Recently Added", value: "45" },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900/60 p-5 rounded-xl border border-zinc-800">
            <p className="text-sm text-zinc-400">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 w-full sm:w-1/3">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="bg-transparent outline-none w-full text-sm text-zinc-200"
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm hover:bg-zinc-800 text-zinc-200">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="overflow-x-auto border border-zinc-800 rounded-xl">
        <table className="table-auto w-full text-sm">
          <thead>
            <tr className="bg-zinc-900/60 text-zinc-400 border-b border-zinc-800">
              {["Name", "Email", "Phone", "Company", "Status", "Last Interaction"].map((header) => (
                <th key={header} className="px-4 py-3 text-left whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-b border-zinc-800 hover:bg-zinc-900/40">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-zinc-200">
                    <User className="w-4 h-4 text-yellow-400" />
                    {c.name}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Mail className="w-4 h-4 text-zinc-400" />
                    {c.email}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Phone className="w-4 h-4 text-zinc-400" />
                    {c.phone}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Building2 className="w-4 h-4 text-zinc-400" />
                    {c.company}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${badgeStyle[c.status]}`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">{c.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {["Contact Growth", "Active vs Inactive", "Customer Conversion"].map((title, i) => (
          <div key={i} className="bg-zinc-900/60 p-6 rounded-xl border border-zinc-800">
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

export default ContactsPage;