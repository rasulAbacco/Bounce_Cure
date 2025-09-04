import React, { useState, useEffect } from "react";
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



  const [modalOpen, setModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "Prospect",
    priority: "new",  // default priority
    last: "",
  });




  const [contacts, setContacts] = useState([]);
  const [page, setPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1); // REMOVE THIS LINE

  const [search, setSearch] = useState('');
  const [editPriority, setEditPriority] = useState({});


  const [totalPages, setTotalPages] = useState(1);


  // Chart data aggregation
  const chartData = Object.entries(
    contacts.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ name: status, value: count }));


  const headers = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Company", key: "company" },
    { label: "Status", key: "status" },
    { label: "Last Interaction", key: "last" },
  ];

  const handleImport = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const res = await fetch("http://localhost:5000/contact/import", {
        method: "POST",
        body: formData, // let browser set the headers
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Import failed');
      }

      alert('Import successful!');
      e.target.reset();
      setPage(1);
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    }
  };



  const addContact = async (e) => {
    e.preventDefault();

    // Call the backend to create new contact
    const res = await fetch("http://localhost:5000/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newContact),
    });

    if (!res.ok) {
      console.error("Failed to add contact:", res.statusText);
      return;
    }

    const created = await res.json();

    // Option 1: Refresh page from server
    // setContacts((prev) => [created, ...prev]);

    // Option 2: Refetch page 1 so regen pagination and stats
    setPage(1);

    setModalOpen(false);
  };

  const updatePriority = async (id) => {
    const newVal = editPriority[id];

    console.log("Sending update for ID:", id, "with priority:", newVal);

    try {
      const res = await fetch(`http://localhost:5000/contact/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priority: newVal }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to update:", res.status, text);
        return;
      }

      const updated = await res.json();
      console.log("Update successful:", updated);

      // Clear local state and re-fetch
      setEditPriority((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      setPage(page); // This triggers useEffect to re-fetch from DB
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;

    await fetch(`http://localhost:5000/contact/${id}`, {
      method: "DELETE",
    });

    // Refresh list after deletion
    setContacts(contacts.filter((c) => c.id !== id));
  };




  useEffect(() => {
    fetch(`http://localhost:5000/contact?page=${page}&search=${search}`)
      .then((res) => res.json())
      .then((data) => {
        setContacts(data.data);
        setTotalPages(data.totalPages);
      });
  }, [page, search]);


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

      { /*Import Files*/}
      {/* <form
        onSubmit={handleImport}
        encType="multipart/form-data"
        className="w-full max-w-md mx-auto p-6 bg-white shadow-md rounded-lg flex flex-col gap-4"
      >
        <h2 className="text-xl font-semibold text-gray-800">Import Contacts</h2>

        <input
          type="file"
          name="file"
          accept=".csv,.xlsx,.txt"
          required
          className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100 cursor-pointer"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          Import
        </button>
      </form> */}



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
                "Priority",
                "Status",
                "Last Interaction",
                "Action"
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
                <td className="px-4 py-3 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                  <select
                    value={editPriority[c.id] ?? c.priority}
                    onChange={(e) =>
                      setEditPriority({
                        ...editPriority,
                        [c.id]: e.target.value,
                      })
                    }
                    className="border px-2 py-1 rounded"
                  >
                    <option value="vip">VIP</option>
                    <option value="subscriber">Subscriber</option>
                    <option value="new">New</option>
                  </select>

                  <button
                    onClick={() => updatePriority(c.id)}
                    disabled={
                      editPriority[c.id] === undefined ||
                      editPriority[c.id] === c.priority
                    }
                    className={`ml-2 px-2 py-1 rounded ${editPriority[c.id] !== undefined &&
                      editPriority[c.id] !== c.priority
                      ? "bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
                      : "bg-gray-300 text-black font-bold cursor-not-allowed"
                      }`}
                  >
                    Save
                  </button>
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
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => deleteContact(c.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-bold"
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-zinc-400">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="px-3 py-1 text-sm rounded bg-zinc-700 text-white hover:bg-zinc-600 disabled:opacity-40"
          >
            First
          </button>
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm rounded bg-zinc-700 text-white hover:bg-zinc-600 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm rounded bg-zinc-700 text-white hover:bg-zinc-600 disabled:opacity-40"
          >
            Next
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm rounded bg-zinc-700 text-white hover:bg-zinc-600 disabled:opacity-40"
          >
            Last
          </button>
        </div>

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
              <Bar dataKey="value" fill="#F59E0B" barSize={30} />
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
              {["name", "email", "phone", "company", "priority", "status",].map(
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
