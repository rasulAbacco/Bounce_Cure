// File: CustomFields/CustomRecordModal.jsx
import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import CustomFieldsDropdown from "./CustomFieldsDropdown";
import axios from "axios";

const CustomRecordModal = ({ isOpen, onClose, record, mode, onSave }) => {
  const [formData, setFormData] = useState({
    recordType: "",
    name: "",
    email: "",
    company: "",
    source: "manual",
    status: "",
    score: "",
    last: new Date().toISOString().split("T")[0],
  });

  const [customFields, setCustomFields] = useState([]);
  const [customFieldValues, setCustomFieldValues] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (record && mode !== "create") {
        setFormData({
          recordType: record.recordType || "",
          name: record.name || "",
          email: record.email || "",
          company: record.company || "",
          source: record.source || "manual",
          status: record.status || "",
          score: record.score ?? "",
          last: record.last
            ? new Date(record.last).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        });

        const values = {};
        if (record.customFields) {
          Object.entries(record.customFields).forEach(([key, value]) => {
            values[key] = value;
          });
        }
        setCustomFieldValues(values);
      } else {
        setFormData({
          recordType: "",
          name: "",
          email: "",
          company: "",
          source: "manual",
          status: "",
          score: "",
          last: new Date().toISOString().split("T")[0],
        });
        setCustomFieldValues({});
      }

      const saved = localStorage.getItem("customFields");
      setCustomFields(saved ? JSON.parse(saved) : []);
    }
  }, [isOpen, record, mode]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCustomFieldChange = (fieldKey, value) => {
    setCustomFieldValues((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.recordType) {
      alert("Please select a record type");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        score:
          formData.score === "" || formData.score === null
            ? null
            : Number(formData.score),
        customFields: customFieldValues,
        id: record?.id,
      };

      await onSave(payload);
    } catch (err) {
      console.error("❌ Error saving record:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-black border border-gray-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-yellow-400">
            {mode === "view"
              ? "View Record"
              : mode === "edit"
              ? "Edit Record"
              : "Create New Record"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Record Type */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Record Type
              </label>
              <CustomFieldsDropdown
                selectedField={customFields.find(
                  (f) => f.name === formData.recordType
                )}
                onSelect={(field) => handleChange("recordType", field.name)}
                placeholder="Select a record type"
                disabled={mode === "view"}
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white focus:ring-1 focus:ring-yellow-500 outline-none"
                disabled={mode === "view"}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white focus:ring-1 focus:ring-yellow-500 outline-none"
                disabled={mode === "view"}
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white focus:ring-1 focus:ring-yellow-500 outline-none"
                disabled={mode === "view"}
              />
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Source</label>
              <select
                value={formData.source}
                onChange={(e) => handleChange("source", e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white focus:ring-1 focus:ring-yellow-500 outline-none"
                disabled={mode === "view"}
              >
                <option value="manual">Manual</option>
                <option value="email">Email</option>
                <option value="webform">Web Form</option>
                <option value="import">Import</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white focus:ring-1 focus:ring-yellow-500 outline-none"
                disabled={mode === "view"}
              >
                <option value="">Select Status</option>
                <option value="Opened">Opened</option>
                <option value="Clicked">Clicked</option>
                <option value="Bounced">Bounced</option>
                <option value="Unsubscribed">Unsubscribed</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Prospect">Prospect</option>
                <option value="Customer">Customer</option>
              </select>
            </div>

            {/* Score */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Engagement Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) => handleChange("score", e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white focus:ring-1 focus:ring-yellow-500 outline-none"
                disabled={mode === "view"}
              />
            </div>

            {/* Last Contact */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Last Contact
              </label>
              <input
                type="date"
                value={formData.last}
                onChange={(e) => handleChange("last", e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white focus:ring-1 focus:ring-yellow-500 outline-none"
                disabled={mode === "view"}
              />
            </div>
          </div>

          {/* Custom Fields */}
          {customFields.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-yellow-400 mb-2">
                Custom Fields
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customFields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm text-gray-400 mb-1">
                      {field.name}
                    </label>
                    <input
                      type="text"
                      value={customFieldValues[field.name] || ""}
                      onChange={(e) =>
                        handleCustomFieldChange(field.name, e.target.value)
                      }
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white focus:ring-1 focus:ring-yellow-500 outline-none"
                      disabled={mode === "view"}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode !== "view" && (
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Record
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CustomRecordModal;
