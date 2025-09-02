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
  const [singleHistory, setSingleHistory] = useState([]);
  const [bulkHistory, setBulkHistory] = useState([]);
  const [viewingBatchId, setViewingBatchId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false);
  const [loadingBulk, setLoadingBulk] = useState(false);
  const [loadingSingle, setLoadingSingle] = useState(false);
  const [progress, setProgress] = useState(0);

  // --- SINGLE VERIFICATION ---
  const verifySingle = async () => {
    if (!singleEmail) return alert("Enter an email");
    
    setLoadingSingle(true);

    try {
      const res = await axios.post("http://localhost:5000/verification/verify-single", {
        email: singleEmail,
      });

      setSingleResult(res.data);
      setSingleHistory((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error(err);
      alert("Single verification failed: " + (err.response?.data?.error || err.message));
    } finally {
      setSingleEmail("");
      setLoadingSingle(false);
    }
  };

  // --- BULK VERIFICATION ---
  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "txt"].includes(ext)) return alert("Only CSV, XLSX, TXT allowed");

    setLoadingBulk(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    // Simulate smooth progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 3;
      });
    }, 200);

    try {
      const res = await axios.post("http://localhost:5000/verification/verify-bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newBatch = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        filename: file.name,
        results: res.data.results,
        summary: {
          total: res.data.total,
          valid: res.data.valid,
          invalid: res.data.invalid,
          risky: res.data.risky,
          disposable: res.data.disposable,
          role_based: res.data.role_based,
          catch_all: res.data.catch_all
        }
      };

      setBulkHistory((prev) => [newBatch, ...prev]);
      setViewingBatchId(newBatch.id);
      setFilter("all");
      setDownloadDropdownOpen(false);
      setProgress(100);
    } catch (err) {
      console.error(err);
      alert("Bulk verification failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLoadingBulk(false);
      e.target.value = "";
      setTimeout(() => setProgress(0), 500);
    }
  };

  // --- DOWNLOAD FUNCTION ---
  const downloadFile = (format, data) => {
    if (!data?.length) return alert("No results to download");
    
    // Enhanced data for download with all verification details
    const enhancedData = data.map(r => ({
      email: r.email,
      status: r.status,
      score: r.score + '%',
      syntax_valid: r.syntax_valid ? 'Yes' : 'No',
      domain_valid: r.domain_valid ? 'Yes' : 'No',
      mailbox_exists: r.mailbox_exists ? 'Yes' : 'No',
      catch_all: r.catch_all ? 'Yes' : 'No',
      disposable: r.disposable ? 'Yes' : 'No',
      role_based: r.role_based ? 'Yes' : 'No',
      greylisted: r.greylisted ? 'Yes' : 'No'
    }));
    
    if (["csv", "xlsx"].includes(format)) {
      const ws = XLSX.utils.json_to_sheet(enhancedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Results");
      XLSX.writeFile(wb, `verification_results.${format}`);
    } else if (format === "txt") {
      const blob = new Blob([enhancedData.map((r) => `${r.email} - ${r.status} (${r.score})`).join("\n")], {
        type: "text/plain;charset=utf-8",
      });
      saveAs(blob, "verification_results.txt");
    } else {
      const blob = new Blob([JSON.stringify(enhancedData, null, 2)], { type: "application/json" });
      saveAs(blob, "verification_results.json");
    }
    setDownloadDropdownOpen(false);
  };

  // Enhanced status badge component
  const StatusBadge = ({ result }) => {
    const getStatusColor = (status, score) => {
      if (status === "valid" && score >= 90) return "bg-green-600";
      if (status === "valid" && score >= 70) return "bg-green-500";
      if (status === "risky") return "bg-yellow-500";
      if (status === "invalid") return "bg-red-600";
      return "bg-gray-500";
    };

    return (
      <div className="flex items-center gap-2">
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-bold text-white ${getStatusColor(result.status, result.score)}`}
        >
          {result.status.toUpperCase()}
        </span>
        <span className="text-xs text-gray-400">({result.score}%)</span>
      </div>
    );
  };

  // Detailed result component
  const DetailedResult = ({ result }) => (
    <div className="bg-[#111] p-4 rounded-md border border-gray-700 mb-4">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-bold text-yellow-600">{result.email}</h4>
        <StatusBadge result={result} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className={`p-2 rounded ${result.syntax_valid ? 'bg-green-900' : 'bg-red-900'}`}>
          <div className="text-gray-300">Syntax</div>
          <div className="font-bold">{result.syntax_valid ? '✅' : '❌'}</div>
        </div>
        <div className={`p-2 rounded ${result.domain_valid ? 'bg-green-900' : 'bg-red-900'}`}>
          <div className="text-gray-300">Domain</div>
          <div className="font-bold">{result.domain_valid ? '✅' : '❌'}</div>
        </div>
        <div className={`p-2 rounded ${result.mailbox_exists ? 'bg-green-900' : 'bg-red-900'}`}>
          <div className="text-gray-300">Mailbox</div>
          <div className="font-bold">{result.mailbox_exists ? '✅' : '❌'}</div>
        </div>
        <div className={`p-2 rounded ${result.catch_all ? 'bg-yellow-900' : 'bg-gray-800'}`}>
          <div className="text-gray-300">Catch-All</div>
          <div className="font-bold">{result.catch_all ? '⚠️' : '✅'}</div>
        </div>
        <div className={`p-2 rounded ${result.disposable ? 'bg-red-900' : 'bg-green-900'}`}>
          <div className="text-gray-300">Disposable</div>
          <div className="font-bold">{result.disposable ? '❌' : '✅'}</div>
        </div>
        <div className={`p-2 rounded ${result.role_based ? 'bg-yellow-900' : 'bg-green-900'}`}>
          <div className="text-gray-300">Role-Based</div>
          <div className="font-bold">{result.role_based ? '⚠️' : '✅'}</div>
        </div>
        <div className={`p-2 rounded ${result.greylisted ? 'bg-yellow-900' : 'bg-green-900'}`}>
          <div className="text-gray-300">Greylisted</div>
          <div className="font-bold">{result.greylisted ? '⚠️' : '✅'}</div>
        </div>
        <div className="p-2 rounded bg-blue-900">
          <div className="text-gray-300">Score</div>
          <div className="font-bold text-blue-300">{result.score}%</div>
        </div>
      </div>
    </div>
  );

  const viewingBatch = bulkHistory.find((b) => b.id === viewingBatchId);
  const filteredResults =
    viewingBatch && filter !== "all"
      ? viewingBatch.results.filter((r) => {
          if (filter === "valid") return r.status === "valid";
          if (filter === "invalid") return r.status === "invalid";
          if (filter === "risky") return r.status === "risky";
          if (filter === "disposable") return r.disposable;
          if (filter === "role_based") return r.role_based;
          if (filter === "catch_all") return r.catch_all;
          return true;
        })
      : viewingBatch?.results || [];

  return (
    <DashboardLayout>
      <div className="bg-black text-gray-200 font-sans mt-[20%] sm:mt-[15%] md:mt-[10%] lg:mt-[5%] px-4 sm:px-6 lg:px-16 py-10 max-w-[1400px] mx-auto">
        {/* Tabs */}
        <div className="flex flex-wrap justify-center mt:5 gap-3 mb-8">
          {["single", "bulk"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${activeTab === tab
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
              7-Layer Email Verification
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
                disabled={loadingSingle}
                className={`px-4 py-2 rounded-md font-bold ${loadingSingle
                    ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                    : "bg-white text-yellow-700 hover:bg-gray-100"
                  }`}
              >
                {loadingSingle ? "Verifying..." : "Verify"}
              </button>
            </div>

            {singleResult && <DetailedResult result={singleResult} />}

            <h3 className="text-lg font-bold border-b border-gray-600 pb-2 mb-4">
              Verification History
            </h3>
            {singleHistory.length === 0 ? (
              <p>No verification history.</p>
            ) : (
              <div className="space-y-3">
                {singleHistory.map((item, idx) => (
                  <div key={idx} className="bg-[#111] p-3 rounded-md border border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.email}</span>
                      <StatusBadge result={item} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BULK VERIFICATION */}
        {activeTab === "bulk" && (
          <div>
            <h2 className="text-xl font-bold border-b border-gray-600 pb-2 mb-4">
              Bulk 7-Layer Verification
            </h2>

            {/* File upload & progress */}
            <div className="mb-6 w-full sm:w-[300px]">
              {loadingBulk && (
                <div className="w-full h-1 bg-gray-700 mb-2 rounded-full overflow-hidden">
                  <div
                    className="bg-yellow-500 h-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}

              <input
                type="file"
                accept=".csv,.xlsx,.txt"
                onChange={handleBulkUpload}
                disabled={loadingBulk}
                className="bg-black text-yellow-600 border border-gray-600 rounded-md px-4 py-2 w-full cursor-pointer disabled:opacity-50"
              />
            </div>

            {/* Summary Stats */}
            {viewingBatch && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                <div className="bg-[#111] p-3 rounded-md text-center">
                  <div className="text-2xl font-bold text-blue-400">{viewingBatch.summary.total}</div>
                  <div className="text-xs text-gray-400">Total</div>
                </div>
                <div className="bg-[#111] p-3 rounded-md text-center">
                  <div className="text-2xl font-bold text-green-400">{viewingBatch.summary.valid}</div>
                  <div className="text-xs text-gray-400">Valid</div>
                </div>
                <div className="bg-[#111] p-3 rounded-md text-center">
                  <div className="text-2xl font-bold text-red-400">{viewingBatch.summary.invalid}</div>
                  <div className="text-xs text-gray-400">Invalid</div>
                </div>
                <div className="bg-[#111] p-3 rounded-md text-center">
                  <div className="text-2xl font-bold text-yellow-400">{viewingBatch.summary.risky}</div>
                  <div className="text-xs text-gray-400">Risky</div>
                </div>
                <div className="bg-[#111] p-3 rounded-md text-center">
                  <div className="text-2xl font-bold text-orange-400">{viewingBatch.summary.disposable}</div>
                  <div className="text-xs text-gray-400">Disposable</div>
                </div>
                <div className="bg-[#111] p-3 rounded-md text-center">
                  <div className="text-2xl font-bold text-purple-400">{viewingBatch.summary.role_based}</div>
                  <div className="text-xs text-gray-400">Role-Based</div>
                </div>
                <div className="bg-[#111] p-3 rounded-md text-center">
                  <div className="text-2xl font-bold text-cyan-400">{viewingBatch.summary.catch_all}</div>
                  <div className="text-xs text-gray-400">Catch-All</div>
                </div>
              </div>
            )}

            {/* Filters and download */}
            {viewingBatch && (
              <>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {["all", "valid", "invalid", "risky", "disposable", "role_based", "catch_all"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 rounded-md border text-sm ${
                        filter === f ? "bg-gray-700 text-white" : "text-gray-400"
                      } border-yellow-600`}
                    >
                      {f.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </button>
                  ))}

                  <div className="relative">
                    <button
                      onClick={() => setDownloadDropdownOpen((p) => !p)}
                      className="text-yellow-600 text-2xl"
                      title="Download filtered results"
                    >
                      <HiOutlineDownload />
                    </button>
                    {downloadDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 bg-[#111] border border-gray-700 rounded-md z-50">
                        {["csv", "xlsx", "txt", "json"].map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => downloadFile(fmt, filteredResults)}
                            className="block px-4 py-2 w-full text-left hover:bg-gray-700 text-gray-200"
                          >
                            Download {fmt.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Results table */}
                <div className="overflow-x-auto mb-6">
                  {filteredResults.length ? (
                    <table className="w-full min-w-[800px] border-collapse">
                      <thead>
                        <tr className="bg-[#111]">
                          <th className="px-4 py-3 text-yellow-600 text-left">Email</th>
                          <th className="px-4 py-3 text-yellow-600 text-left">Status</th>
                          <th className="px-4 py-3 text-yellow-600 text-left">Score</th>
                          <th className="px-4 py-3 text-yellow-600 text-left">Flags</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredResults.map((r, i) => (
                          <tr key={i}>
                            <td className="px-4 py-3 border-b border-gray-800">{r.email}</td>
                            <td className="px-4 py-3 border-b border-gray-800">
                              <StatusBadge result={r} />
                            </td>
                            <td className="px-4 py-3 border-b border-gray-800">
                              <span className="font-bold">{r.score}%</span>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-800">
                              <div className="flex gap-1">
                                {r.disposable && <span className="text-xs bg-red-600 px-1 rounded">DISP</span>}
                                {r.role_based && <span className="text-xs bg-purple-600 px-1 rounded">ROLE</span>}
                                {r.catch_all && <span className="text-xs bg-yellow-600 px-1 rounded">CATCH</span>}
                                {r.greylisted && <span className="text-xs bg-orange-600 px-1 rounded">GREY</span>}
                              </div>
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

            {/* Bulk verification history */}
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
                    className={`flex justify-between items-center p-4 border rounded-md cursor-pointer ${
                      viewingBatchId === batch.id ? "bg-gray-800" : "border-gray-600"
                    }`}
                  >
                    <div>
                      <strong>{batch.filename}</strong>
                      <div className="text-sm text-gray-400">{batch.timestamp}</div>
                      <div className="text-xs text-gray-500">
                        {batch.summary.total} emails • {batch.summary.valid} valid • {batch.summary.invalid} invalid
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        title="View"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingBatchId(batch.id);
                        }}
                        className="text-yellow-500 hover:text-yellow-300"
                      >
                        <FaEye />
                      </button>
                      <button className="text-yellow-500 hover:text-yellow-300" disabled>
                        <FaEdit />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBulkHistory((p) => p.filter((b) => b.id !== batch.id));
                        }}
                        className="text-red-500 hover:text-red-400"
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