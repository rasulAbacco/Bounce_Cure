// src/pages/Contacts.js
import React from "react";
import { MdPeople } from "react-icons/md";

const Campaigncontacts = () => {
  return (
    <div className="bg-[#111] p-6 rounded-xl border border-gray-800 text-white min-h-[70vh]">
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
          <h2 className="text-3xl font-bold text-white">42,870</h2>
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
      <div className="flex space-x-3 mb-12">
        <button className="bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
          + Add Contact
        </button>
        <button className="bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
          ⬆ Import CSV
        </button>
      </div>

      {/* Placeholder for contact list / table */}
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <MdPeople className="text-5xl mb-3 opacity-50" />
        <p>Contact management interface would go here</p>
        <p className="text-sm">Add, edit, and organize your email subscribers</p>
      </div>
    </div>
  );
};

export default Campaigncontacts;
