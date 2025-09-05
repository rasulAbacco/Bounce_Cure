import React, { useState } from "react";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";

const Lists = () => {

  const [lists, setLists] = useState([
    {
      id: "LST-001",
      name: "Newsletter Subscribers",
      count: 1200,
      created: "2025-08-10",
      email: "newsletter@example.com",
      phone: "+1 202-555-0123",
    },
    {
      id: "LST-002",
      name: "Active Customers",
      count: 540,
      created: "2025-08-25",
      email: "customers@example.com",
      phone: "+1 202-555-0145",
    },
    {
      id: "LST-003",
      name: "Leads - Campaign A",
      count: 980,
      created: "2025-09-01",
      email: "leads@example.com",
      phone: "+1 202-555-0199",
    },
  ]);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewData, setViewData] = useState(null); // For viewing details

  const filteredLists = lists.filter(
    (list) =>
      list.name.toLowerCase().includes(search.toLowerCase()) ||
      list.id.toLowerCase().includes(search.toLowerCase()) ||
      list.email.toLowerCase().includes(search.toLowerCase()) ||
      list.phone.includes(search)
  );

  const handleSave = (e) => {
    e.preventDefault();
    const form = e.target;
    const id = editData ? editData.id : `LST-${(lists.length + 1).toString().padStart(3, "0")}`;
    const name = form.name.value;
    const count = parseInt(form.count.value, 10);
    const email = form.email.value;
    const phone = form.phone.value;
    const created = editData ? editData.created : new Date().toISOString().split("T")[0];

    const newList = { id, name, count, email, phone, created };

    if (editData) {
      setLists(lists.map((l) => (l.id === editData.id ? newList : l)));
    } else {
      setLists([...lists, newList]);
    }

    setModalOpen(false);
    setEditData(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this list?")) {
      setLists(lists.filter((l) => l.id !== id));
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <div className="flex-1 flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">📋 Your Lists</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center px-4 py-2 bg-[#154c7c] text-white rounded-lg hover:bg-[#0f3659]"
          >
            <Plus className="mr-2" size={18} /> New List
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search lists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#EAA64D]"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-gray-900 rounded-lg shadow-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#154c7c] text-left text-sm font-semibold text-white">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">List Name</th>
                <th className="px-4 py-3">Contacts</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLists.map((list, index) => (
                <tr
                  key={list.id}
                  className={`border-t border-gray-700 ${index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                    } hover:bg-gray-700 transition`}
                >
                  <td className="px-4 py-3 text-sm">{list.id}</td>
                  <td className="px-4 py-3 font-medium">{list.name}</td>
                  <td className="px-4 py-3">{list.count}</td>
                  <td className="px-4 py-3">{list.email}</td>
                  <td className="px-4 py-3">{list.phone}</td>
                  <td className="px-4 py-3">{list.created}</td>
                  <td className="px-4 py-3 flex justify-center space-x-3">
                    <button
                      onClick={() => setViewData(list)}
                      className="text-gray-300 hover:text-white flex items-center"
                    >
                      <Eye size={16} className="mr-1" /> View
                    </button>
                    <button
                      onClick={() => {
                        setEditData(list);
                        setModalOpen(true);
                      }}
                      className="text-[#EAA64D] hover:text-yellow-400 flex items-center"
                    >
                      <Edit size={16} className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(list.id)}
                      className="text-red-500 hover:text-red-400 flex items-center"
                    >
                      <Trash2 size={16} className="mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredLists.length === 0 && (
          <p className="text-gray-400 text-center mt-10">No lists found.</p>
        )}

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-800">
                {editData ? "Edit List" : "Create New List"}
              </h3>
              <form onSubmit={handleSave} className="space-y-4 text-gray-800">
                <div>
                  <label className="block text-sm font-medium">List Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editData?.name || ""}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Contacts Count</label>
                  <input
                    type="number"
                    name="count"
                    defaultValue={editData?.count || ""}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editData?.email || ""}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={editData?.phone || ""}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      setEditData(null);
                    }}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#154c7c] text-white rounded hover:bg-[#0f3659]"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewData && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 text-gray-800">
              <h3 className="text-lg font-bold mb-4">👁️ View List</h3>
              <div className="space-y-2">
                <p><span className="font-semibold">ID:</span> {viewData.id}</p>
                <p><span className="font-semibold">Name:</span> {viewData.name}</p>
                <p><span className="font-semibold">Contacts:</span> {viewData.count}</p>
                <p><span className="font-semibold">Email:</span> {viewData.email}</p>
                <p><span className="font-semibold">Phone:</span> {viewData.phone}</p>
                <p><span className="font-semibold">Created:</span> {viewData.created}</p>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setViewData(null)}
                  className="px-4 py-2 bg-[#154c7c] text-white rounded hover:bg-[#0f3659]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lists;
