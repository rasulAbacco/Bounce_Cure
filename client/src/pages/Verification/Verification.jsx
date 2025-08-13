import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { HiOutlineDownload } from "react-icons/hi";
import DashboardLayout from "../../components/DashboardLayout";

const Verification = () => {
  const [activeTab, setActiveTab] = useState("single");
  const [singleEmail, setSingleEmail] = useState("");
  const [singleResult, setSingleResult] = useState(null);
  const [filter, setFilter] = useState("all");
  const [singleHistory, setSingleHistory] = useState([]);
  const [bulkHistory, setBulkHistory] = useState([]);
  const [viewingBatchId, setViewingBatchId] = useState(null);
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false);

  const verifySingle = async () => {
    if (!singleEmail) return alert("Enter an email");
    try {
      const res = await axios.post("http://localhost:5000/verification/verify-single", {
        email: singleEmail,
      });
      setSingleResult(res.data);
      setSingleHistory((prev) => [res.data, ...prev]);
    } catch (error) {
      alert("Error verifying email");
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/verification/verify-bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newBatch = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        filename: file.name,
        results: res.data.results,
      };

      setBulkHistory((prev) => [newBatch, ...prev]);
      setViewingBatchId(newBatch.id);
      setFilter("all");
      setDownloadDropdownOpen(false);
    } catch (error) {
      alert("Error uploading bulk file");
    }
  };

  const downloadFile = (format, data) => {
    if (!data || data.length === 0) return alert("No results to download");

    if (format === "csv" || format === "xlsx") {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Results");
      XLSX.writeFile(wb, `verification_results.${format}`);
    } else if (format === "txt") {
      const blob = new Blob([data.map((r) => `${r.email} - ${r.status}`).join("\n")], {
        type: "text/plain;charset=utf-8",
      });
      saveAs(blob, "verification_results.txt");
    } else if (format === "json") {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      saveAs(blob, "verification_results.json");
    }

    setDownloadDropdownOpen(false);
  };

  const viewingBatch = bulkHistory.find((batch) => batch.id === viewingBatchId);
  const filteredResults =
    viewingBatch && filter !== "all"
      ? viewingBatch.results.filter((r) => r.status === filter)
      : viewingBatch
      ? viewingBatch.results
      : [];

  return (
    <DashboardLayout>
      <div className="bg-black text-gray-200 font-sans mt-[2%] px-4 sm:px-6 lg:px-16 py-10 max-w-[1400px] mx-auto">
        {/* Tabs */}
        <div className="flex flex-wrap mt-15 justify-center gap-3 mb-6">
          {["single", "bulk"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? "bg-white text-yellow-700 border-2 border-yellow-600 shadow-md font-bold"
                  : "bg-transparent text-gray-200 border border-yellow-600 font-semibold"
              } px-6 py-2 rounded-md transition-all duration-300 w-full sm:w-[300px] text-center`}
            >
              {tab === "single" ? "Single Verification" : "Bulk Verification"}
            </button>
          ))}
        </div>

        {/* SINGLE VERIFICATION */}
        {activeTab === "single" && (
          <div>
            <h2 className="text-xl font-bold border-b border-gray-600 pb-2 mb-5">
              Single Email Verification
            </h2>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
              <input
                type="email"
                value={singleEmail}
                onChange={(e) => setSingleEmail(e.target.value)}
                placeholder="Enter email"
                className="bg-[#111] text-yellow-600 font-bold px-4 py-2 rounded-md border border-gray-600 w-full sm:w-80"
              />
              <button
                onClick={verifySingle}
                className="bg-white text-yellow-700 font-bold px-4 py-2 rounded-md hover:bg-gray-100"
              >
                Verify
              </button>
            </div>

            {singleResult && (
              <div className="mb-8">
                <strong>{singleResult.email}</strong> -{" "}
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-bold text-white ${
                    singleResult.status === "valid"
                      ? "bg-green-600"
                      : singleResult.status === "invalid"
                      ? "bg-red-600"
                      : "bg-yellow-500"
                  }`}
                >
                  {singleResult.status.toUpperCase()}
                </span>
              </div>
            )}

            <h3 className="text-lg font-bold border-b border-gray-600 pb-2 mb-4">
              Single Verification History
            </h3>

            {singleHistory.length === 0 ? (
              <p>No single verification history.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse mb-6 min-w-[500px]">
                  <thead>
                    <tr className="bg-[#111]">
                      <th className="text-left px-4 py-3 text-yellow-600 text-sm font-bold border-b border-gray-700">
                        Email
                      </th>
                      <th className="text-left px-4 py-3 text-yellow-600 text-sm font-bold border-b border-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {singleHistory.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 border-b border-gray-800">{item.email}</td>
                        <td className="px-4 py-3 border-b border-gray-800">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-bold text-white ${
                              item.status === "valid"
                                ? "bg-green-600"
                                : item.status === "invalid"
                                ? "bg-red-600"
                                : "bg-yellow-500"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BULK VERIFICATION */}
        {activeTab === "bulk" && (
          <div>
            <h2 className="text-xl font-bold border-b border-gray-600 pb-2 mb-4">
              Bulk Email Verification
            </h2>

            <div className="mb-6">
              <input
                type="file"
                accept=".csv,.xlsx,.txt"
                onChange={handleBulkUpload}
                className="bg-black text-yellow-600 border border-gray-600 rounded-md px-4 py-2 w-full sm:w-[300px] cursor-pointer"
              />
            </div>

            {/* Filters + Download */}
            {viewingBatch && (
              <>
                <div className="flex flex-wrap items-center gap-3 mb-6 relative">
                  {["all", "valid", "invalid", "risky"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 rounded-md border ${
                        filter === f
                          ? "bg-gray-700 text-white"
                          : "bg-transparent text-gray-400"
                      } border-yellow-600 font-semibold min-w-[100px]`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}

                  <div className="relative">
                    <button
                      onClick={() => setDownloadDropdownOpen((prev) => !prev)}
                      className="text-yellow-600 text-2xl"
                      title={`Download ${filter} emails`}
                    >
                      <HiOutlineDownload />
                    </button>
                    {downloadDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 bg-[#111] border border-gray-700 rounded-md shadow-md z-50 w-[140px]">
                        {["csv", "xlsx", "txt", "json"].map((format) => (
                          <button
                            key={format}
                            onClick={() => downloadFile(format, filteredResults)}
                            className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-700"
                          >
                            Download {format.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Results Table */}
                <div className="overflow-x-auto mb-6">
                  {filteredResults.length > 0 ? (
                    <table className="w-full border-collapse min-w-[500px]">
                      <thead>
                        <tr className="bg-[#111]">
                          <th className="text-left px-4 py-3 text-yellow-600 text-sm font-bold border-b border-gray-700">
                            Email
                          </th>
                          <th className="text-left px-4 py-3 text-yellow-600 text-sm font-bold border-b border-gray-700">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredResults.map((res, i) => (
                          <tr key={i}>
                            <td className="px-4 py-3 border-b border-gray-800">{res.email}</td>
                            <td className="px-4 py-3 border-b border-gray-800">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-bold text-white ${
                                  res.status === "valid"
                                    ? "bg-green-600"
                                    : res.status === "invalid"
                                    ? "bg-red-600"
                                    : "bg-yellow-500"
                                }`}
                              >
                                {res.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No results for this filter.</p>
                  )}
                </div>
              </>
            )}

            {/* Bulk History */}
            <h3 className="text-lg font-bold border-b border-gray-600 pb-2 mb-4">
              Bulk Verification History
            </h3>
            {bulkHistory.length === 0 ? (
              <p>No bulk verification history.</p>
            ) : (
              <div className="space-y-4">
                {bulkHistory.map((batch) => (
                  <div
                    key={batch.id}
                    onClick={() => setViewingBatchId(batch.id)}
                    className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border border-gray-700 rounded-md px-4 py-3 cursor-pointer transition-colors ${
                      viewingBatchId === batch.id ? "bg-gray-800" : ""
                    }`}
                  >
                    <div>
                      <strong>{batch.filename}</strong>
                      <div className="text-sm text-gray-400">{batch.timestamp}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="text-yellow-600 hover:text-yellow-400"
                        title="View"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingBatchId(batch.id);
                        }}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="text-yellow-600 hover:text-yellow-400"
                        title="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert("Edit functionality to be implemented");
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-yellow-600 hover:text-red-500"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBulkHistory((prev) => prev.filter((b) => b.id !== batch.id));
                          if (viewingBatchId === batch.id) setViewingBatchId(null);
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Verification;
