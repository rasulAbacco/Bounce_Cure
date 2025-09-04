import React, { useState } from "react";
import {
  User,
  Search,
  Filter,
  Phone,
  Mail,
  Building2,
  BarChart3,
  Plus,
} from "lucide-react";
import { CSVLink } from "react-csv"; // Make sure to import CSVLink if used
import { motion } from "framer-motion"; // Also import motion if used
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Tooltip,
  Legend,
} from "recharts"; // Assuming you're using recharts for the chart

const statusColors = {
  Active: "#22c55e",    // green
  Inactive: "#ef4444",  // red
  Prospect: "#3b82f6",  // blue
  Customer: "#eab308",  // yellow
};

function ContactsPage() {
  const initialContacts = [
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
  ];

  const badgeStyle = {
    Active:
      "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700",
    Inactive:
      "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700",
    Prospect:
      "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700",
    Customer:
      "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700",
  };

  const [contacts, setContacts] = useState(initialContacts);
  const [modalOpen, setModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "Prospect",
    last: "",
  });

  // Chart data aggregation
  const chartData = Object.entries(
    contacts.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ name: status, value: count }));

  const addContact = (e) => {
    e.preventDefault();
    setContacts([{ id: Date.now(), ...newContact }, ...contacts]);
    setModalOpen(false);
  };

  const headers = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Company", key: "company" },
    { label: "Status", key: "status" },
    { label: "Last Interaction", key: "last" },
  ];

  

  return (
    <div className="space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-yellow-500 flex items-center gap-2">
          <User className="w-7 h-7" /> Contacts
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-sm">
          Manage all your contacts, companies, and recent interactions in one
          place.
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
          <div
            key={i}
            className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
            <p className="text-2xl font-bold text-zinc-800 dark:text-white mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 w-full sm:w-1/3">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="bg-transparent outline-none w-full text-sm text-zinc-800 dark:text-white"
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-yellow-500 flex items-center gap-2">
            <User className="w-7 h-7" /> Contacts
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
            Manage all your contacts, companies, and interactions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CSVLink
            data={contacts}
            headers={headers}
            filename={`contacts_export_${Date.now()}.csv`}
            className="bg-green-500 text-black px-4 py-2 rounded-lg hover:bg-green-400 transition"
          >
            Export CSV
          </CSVLink>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-400 transition"
          >
            <Plus className="w-4 h-4" /> Add Contact
          </button>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              {[
                "Name",
                "Email",
                "Phone",
                "Company",
                "Status",
                "Last Interaction",
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr
                key={c.id}
                className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
              >
                <td className="px-4 py-3 whitespace-nowrap text-zinc-800 dark:text-white">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-yellow-500" />
                    {c.name}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-zinc-600 dark:text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-zinc-400" />
                    {c.email}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-zinc-600 dark:text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-zinc-400" />
                    {c.phone}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
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
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                  {c.last}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bar Chart Insights */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h2 className="text-xl font-semibold text-yellow-500 mb-4 flex items-center gap-2">
          <BarChart3 className="w-[1rem] h-5" /> Contacts by Status
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#FBBF24" />
              <YAxis stroke="#FBBF24" />

              <Legend />
              <Bar dataKey="value" fill="#F59E0B" className="w-[1rem]" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add Contact Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setModalOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-300 dark:border-zinc-800 shadow-xl w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-yellow-500 mb-4">
              Add New Contact
            </h3>
            <form onSubmit={addContact} className="space-y-4">
              {["name", "email", "phone", "company", "status", "last"].map(
                (field) => (
                  <div key={field} className="flex flex-col">
                    <label className="text-sm text-zinc-700 dark:text-zinc-400 mb-1 capitalize">
                      {field}
                    </label>
                    <input
                      value={newContact[field]}
                      onChange={(e) =>
                        setNewContact({ ...newContact, [field]: e.target.value })
                      }
                      className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none text-zinc-800 dark:text-zinc-100"
                      required
                    />
                  </div>
                )
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-yellow-500 text-black hover:bg-yellow-400 transition"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {["Contact Growth", "Active vs Inactive", "Customer Conversion"].map(
          (title, i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-yellow-500 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" /> {title}
              </h2>
              <div className="h-40 flex items-center justify-center text-zinc-500 text-sm border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
                📊 Chart Placeholder
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default ContactsPage;
