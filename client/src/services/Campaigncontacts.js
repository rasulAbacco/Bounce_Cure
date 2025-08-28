// src/pages/Contacts.js
import React, { useState } from "react";
import { MdPeople, MdClose } from "react-icons/md";
import Papa from "papaparse";

const Campaigncontacts = () => {
  const [contacts, setContacts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", email: "" });

  // Handle add contact modal
  const handleAddContact = () => {
    if (newContact.name && newContact.email) {
      setContacts((prev) => [...prev, newContact]);
      setNewContact({ name: "", email: "" });
      setShowAddModal(false);
    } else {
      alert("Please enter name and email.");
    }
  };

  // Handle CSV import
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedContacts = results.data.map((row) => ({
          name: row.name,
          email: row.email,
        }));
        setContacts((prev) => [...prev, ...parsedContacts]);
      },
    });
  };

  return (
    <div className="bg-[#111] p-6 rounded-xl border border-gray-800 text-white min-h-[70vh] relative">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <MdPeople className="text-yellow-500 text-xl" />
        <h3 className="text-xl font-bold">Contact Management</h3>
      </div>
      <p className="text-gray-400 mb-6">
        Manage your email subscribers and contact lists
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-black border border-gray-800 p-6 rounded-lg text-center">
          <h2 className="text-3xl font-bold text-white">{contacts.length}</h2>
          <p className="text-gray-400">Total Contacts</p>
        </div>
        <div className="bg-black border border-gray-800 p-6 rounded-lg text-center">
          <h2 className="text-3xl font-bold text-green-400">2,847</h2>
          <p className="text-gray-400">Active Subscribers</p>
        </div>
        <div className="bg-black border border-gray-800 p-6 rounded-lg text-center">
          <h2 className="text-3xl font-bold text-orange-400">156</h2>
          <p className="text-gray-400">Unsubscribed</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3 mb-8">
        <button
          className="bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
          onClick={() => setShowAddModal(true)}
        >
          + Add Contact
        </button>

        <label className="cursor-pointer bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
          ⬆ Import CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Contact Table */}
      {contacts.length > 0 ? (
        <div className="overflow-x-auto border border-gray-700 rounded-lg">
          <table className="min-w-full">
            <thead className="bg-[#222] text-gray-400 text-left">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact, idx) => (
                <tr key={idx} className="border-t border-gray-800">
                  <td className="px-4 py-2">{contact.name}</td>
                  <td className="px-4 py-2">{contact.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
          <MdPeople className="text-5xl mb-3 opacity-50" />
          <p>No contacts added yet</p>
          <p className="text-sm">Use "Add Contact" or "Import CSV" above</p>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center">
          <div className="bg-[#1c1c1c] p-6 rounded-xl w-full max-w-md border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Add Contact</h2>
              <button onClick={() => setShowAddModal(false)}>
                <MdClose className="text-white w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newContact.name}
                onChange={(e) =>
                  setNewContact({ ...newContact, name: e.target.value })
                }
                className="w-full p-2 rounded bg-[#222] text-white border border-gray-600 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newContact.email}
                onChange={(e) =>
                  setNewContact({ ...newContact, email: e.target.value })
                }
                className="w-full p-2 rounded bg-[#222] text-white border border-gray-600 focus:outline-none"
              />
              <button
                onClick={handleAddContact}
                className="w-full bg-yellow-500 text-black py-2 rounded font-semibold hover:bg-yellow-400"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigncontacts;
