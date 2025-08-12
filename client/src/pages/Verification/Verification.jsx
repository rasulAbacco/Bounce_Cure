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
      const res = await axios.post("http://localhost:5000/verify-single", {
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
      const res = await axios.post("http://localhost:5000/verify-bulk", formData, {
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
      const blob = new Blob(
        [data.map((r) => `${r.email} - ${r.status}`).join("\n")],
        { type: "text/plain;charset=utf-8" }
      );
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
      <div style={styles.page}>
        {/* Tabs */}
        <div style={styles.tabContainer}>
          <button
            style={activeTab === "single" ? styles.activeTabBtn : styles.tabBtn}
            onClick={() => setActiveTab("single")}
          >
            Single Verification
          </button>
          <button
            style={activeTab === "bulk" ? styles.activeTabBtn : styles.tabBtn}
            onClick={() => setActiveTab("bulk")}
          >
            Bulk Verification
          </button>
        </div>

        {/* Single Tab */}
        {activeTab === "single" && (
          <div>
            <h2 style={styles.sectionTitle}>Single Email Verification</h2>
            <div style={{ marginBottom: "20px" }}>
              <input
                type="email"
                value={singleEmail}
                onChange={(e) => setSingleEmail(e.target.value)}
                placeholder="Enter email"
                style={{ ...styles.input, color: "#c2831f", fontWeight: "bold" }}
              />
              <button onClick={verifySingle} style={{ ...styles.verifyBtn, color: "#c2831f" }}>
                Verify
              </button>
            </div>
            {singleResult && (
              <div style={{ marginBottom: "40px" }}>
                <strong>{singleResult.email}</strong> -{" "}
                <span style={styles.statusBadge(singleResult.status)}>
                  {singleResult.status.toUpperCase()}
                </span>
              </div>
            )}

            {/* Single Verification History */}
            <div style={styles.historySection}>
              <h3 style={styles.sectionTitle}>Single Verification History</h3>
              {singleHistory.length === 0 ? (
                <p>No single verification history.</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ ...styles.th, color: "#c2831f" }}>Email</th>
                      <th style={{ ...styles.th, color: "#c2831f" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {singleHistory.map((item, idx) => (
                      <tr key={idx}>
                        <td style={styles.td}>{item.email}</td>
                        <td style={styles.td}>
                          <span style={styles.statusBadge(item.status)}>{item.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Bulk Tab */}
        {activeTab === "bulk" && (
          <div>
            <h2 style={styles.sectionTitle}>Bulk Email Verification</h2>

            <div style={styles.uploadSection}>
              <input
                type="file"
                accept=".csv,.xlsx,.txt"
                onChange={handleBulkUpload}
                style={{ ...styles.input, cursor: "pointer", color: "#c2831f", backgroundColor: "#000" }}
              />
            </div>

            {viewingBatch && (
              <>
                <div
                  style={{
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    flexWrap: "wrap",
                    position: "relative",
                  }}
                >
                  {["all", "valid", "invalid", "risky"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      style={{
                        ...styles.filterBtn(filter === f),
                        color: "#fff",
                        borderColor: "#c2831f",
                      }}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}

                  {/* Single Download Icon */}
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => setDownloadDropdownOpen((prev) => !prev)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#c2831f",
                        cursor: "pointer",
                        fontSize: "24px",
                        padding: "4px 8px",
                      }}
                      title={`Download ${filter} emails`}
                      aria-label={`Download ${filter} emails`}
                    >
                      <HiOutlineDownload />
                    </button>

                    {downloadDropdownOpen && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 6px)",
                          right: 0,
                          backgroundColor: "#111",
                          border: "1px solid #444",
                          borderRadius: "6px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.8)",
                          zIndex: 1000,
                          minWidth: "140px",
                        }}
                      >
                        {["csv", "xlsx", "txt", "json"].map((format) => (
                          <button
                            key={format}
                            onClick={() => downloadFile(format, filteredResults)}
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "8px 12px",
                              background: "transparent",
                              border: "none",
                              color: "#eee",
                              textAlign: "left",
                              cursor: "pointer",
                              fontWeight: "600",
                              fontSize: "14px",
                            }}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = "#333")}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                          >
                            Download {format.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Results Table */}
                <div style={styles.resultsTable}>
                  {filteredResults.length > 0 ? (
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={{ ...styles.th, color: "#c2831f" }}>Email</th>
                          <th style={{ ...styles.th, color: "#c2831f" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredResults.map((res, i) => (
                          <tr key={i}>
                            <td style={styles.td}>{res.email}</td>
                            <td style={styles.td}>
                              <span style={styles.statusBadge(res.status)}>{res.status}</span>
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

            {/* Bulk History List BELOW results */}
            <div style={styles.historySection}>
              <h3 style={styles.sectionTitle}>Bulk Verification History</h3>
              {bulkHistory.length === 0 ? (
                <p>No bulk verification history.</p>
              ) : (
                <div>
                  {bulkHistory.map((batch) => (
                    <div
                      key={batch.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: "1px solid #444",
                        borderRadius: 6,
                        color: "#c2831f",
                        padding: 12,
                        marginBottom: 12,
                        backgroundColor:
                          viewingBatchId === batch.id ? "#222" : "transparent",
                        cursor: "pointer",
                        transition: "background-color 0.3s ease",
                      }}
                      onClick={() => setViewingBatchId(batch.id)}
                      onKeyDown={(e) => e.key === "Enter" && setViewingBatchId(batch.id)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View batch results for ${batch.filename}`}
                    >
                      <div>
                        <strong>{batch.filename}</strong> <br />
                        <small style={{ color: "#888" }}>{batch.timestamp}</small>
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          style={styles.actionBtn}
                          title="View Results"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingBatchId(batch.id);
                          }}
                        >
                          <FaEye />
                        </button>
                        <button
                          style={styles.actionBtn}
                          title="Edit Batch"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert("Edit functionality to be implemented");
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          style={styles.actionBtn}
                          title="Delete Batch"
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
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const styles = {
  page: {

    marginTop: "7%",
    padding: "30px 60px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#000",
    color: "#eee",
    minHeight: "100vh",
    maxWidth: 1400,
    
    userSelect: "none",
  },
  tabContainer: {
    marginBottom: "20px",
    display: "flex",
    gap: "10px",
    justifyContent: "center",
  },
  tabBtn: {
    flex: "0 0 320px",
    padding: "10px",
    background: "transparent",
    color: "#eee",
    border: `1px solid #c2831f`,
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  activeTabBtn: {
    flex: "0 0 340px",
    padding: "10px",
    background: "#fff",
    color: "#c2831f",
    border: `2px solid #c2831f`,
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "700",
    boxShadow: "0 0 8px #fff",
    transition: "all 0.3s ease",
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #444",
    marginRight: "10px",
    background: "#111",
    color: "#eee",
    fontSize: "16px",
    transition: "border-color 0.3s ease",
  },
  verifyBtn: {
    padding: "10px 16px",
    background: "#fff",
    color: "#000",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "700",
    transition: "background 0.3s ease",
  },
  sectionTitle: {
    borderBottom: "2px solid #555",
    paddingBottom: "8px",
    marginBottom: "20px",
    fontSize: "22px",
    fontWeight: "700",
  },
  uploadSection: {
    marginBottom: "30px",
  },
  filtersSection: {
    marginBottom: "20px",
    borderColor: "#fff",
  },
  downloadsSection: {
    marginBottom: "30px",
  },
  resultsTable: {
    marginBottom: "40px",
  },
  historySection: {
    marginTop: "30px",
  },
  filterBtn: (active) => ({
    padding: "6px 14px",
    margin: "0 6px 10px 0",
    background: active ? "#444" : "transparent",
    color: active ? "#eee" : "#aaa",
    border: `1px solid #444`,
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
    minWidth: "120px",
    textAlign: "center",
  }),
  downloadBtn: {
    padding: "8px 14px",
    margin: "0 8px 12px 0",
    background: "#444",
    color: "#eee",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background 0.3s ease",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "14px",
    borderBottom: `2px solid #444`,
    textAlign: "left",
    background: "#111",
    color: "#ccc",
    fontWeight: "700",
    fontSize: "16px",
  },
  td: {
    padding: "14px",
    borderBottom: `1px solid #222`,
    color: "#ddd",
    fontSize: "15px",
  },
  statusBadge: (status) => ({
    padding: "5px 12px",
    borderRadius: "12px",
    color: "#fff",
    background:
      status === "valid"
        ? "#28a745"
        : status === "invalid"
        ? "#dc3545"
        : "#ffc107",
    fontWeight: "700",
    textTransform: "capitalize",
    fontSize: "14px",
    userSelect: "none",
  }),
  actionBtn: {
    padding: "6px 10px",
    margin: "0 4px",
    border: `1px solid #444`,
    borderRadius: "6px",
    background: "transparent",
    color: "#c2831f",
    cursor: "pointer",
    fontWeight: "700",
    transition: "all 0.3s ease",
  },
};

export default Verification;
