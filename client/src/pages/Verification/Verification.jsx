import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";

const Verification = () => {
  const [singleEmail, setSingleEmail] = useState("");
  const [bulkEmails, setBulkEmails] = useState("");
  const [file, setFile] = useState(null);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [results, setResults] = useState([]);

  const handleSingleVerify = () => {
    if (!singleEmail) return;
    const status = getRandomStatus();
    setResults([...results, { email: singleEmail, status }]);
    setSingleEmail("");
  };

  const handleBulkVerify = () => {
    if (!bulkEmails && !file) return;
    const emails = bulkEmails
      .split(/[\n,]+/)
      .map(e => e.trim())
      .filter(e => e);

    const bulkResults = emails.map(email => ({
      email,
      status: getRandomStatus()
    }));
    setResults([...results, ...bulkResults]);
    setBulkEmails("");
    setFile(null);
  };

  const getRandomStatus = () => {
    const statuses = ["Valid", "Invalid", "Risky"];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const handleDelete = (index) => {
    const updated = [...results];
    updated.splice(index, 1);
    setResults(updated);
  };

  const handleEdit = (index) => {
    const emailToEdit = results[index].email;
    setSingleEmail(emailToEdit);
    handleDelete(index);
  };

  const handleView = (email, status) => {
    alert(`Email: ${email}\nStatus: ${status}`);
  };

  const filteredResults = results.filter(r => {
    const matchesEmail = r.email.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    return matchesEmail && matchesStatus;
  });

  const handleDownload = (type) => {
    let content = "";
    if (type === "CSV") {
      content = "Email,Status\n" + results.map(r => `${r.email},${r.status}`).join("\n");
    } else if (type === "TXT") {
      content = results.map(r => `${r.email} - ${r.status}`).join("\n");
    } else if (type === "Excel") {
      content = "Email\tStatus\n" + results.map(r => `${r.email}\t${r.status}`).join("\n");
    } else if (type === "PDF") {
      alert("PDF download feature to be implemented with jsPDF or similar library.");
      return;
    }
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `results.${type.toLowerCase()}`;
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="verification-container">
        <h2>Email Verification</h2>

        {/* Single Email */}
        <div className="section">
          <h3>Single Email Verification</h3>
          <input
            type="email"
            placeholder="Enter email"
            value={singleEmail}
            onChange={(e) => setSingleEmail(e.target.value)}
          />
          <button onClick={handleSingleVerify}>Verify</button>
        </div>

        {/* Bulk Email */}
        <div className="section">
          <h3>Bulk Email Verification</h3>
          <textarea
            placeholder="Paste emails here (one per line or comma separated)"
            value={bulkEmails}
            onChange={(e) => setBulkEmails(e.target.value)}
          />
          <input
            type="file"
            accept=".csv,.xlsx,.xls,.txt,.pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button onClick={handleBulkVerify}>Verify Bulk Emails</button>
        </div>

        {/* Filter */}
        <div className="section">
          <h3>Filter Results</h3>
          <input
            type="text"
            placeholder="Search email..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Valid">Valid</option>
            <option value="Invalid">Invalid</option>
            <option value="Risky">Risky</option>
          </select>
        </div>

        {/* Results */}
        <div className="section">
          <h3>Verification Results</h3>
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((r, index) => (
                <tr key={index}>
                  <td>{r.email}</td>
                  <td>{r.status}</td>
                  <td>
                    <button className="view-btn" onClick={() => handleView(r.email, r.status)}>View</button>
                    <button className="edit-btn" onClick={() => handleEdit(index)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(index)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Download */}
        <div className="section">
          <h3>Download Results</h3>
          <div className="download-buttons">
            <button onClick={() => handleDownload("CSV")}>CSV</button>
            <button onClick={() => handleDownload("TXT")}>TXT</button>
            <button onClick={() => handleDownload("PDF")}>PDF</button>
            <button onClick={() => handleDownload("Excel")}>Excel</button>
          </div>
        </div>
      </div>

      {/* CSS */}
      <style jsx>{`
        .verification-container {
          padding: 20px;
          color: white;
          background-color: #000;
        }
        h2 {
          color: #c2831f;
          margin-bottom: 15px;
        }
        .section {
          margin-bottom: 20px;
        }
        input, textarea, select {
          width: 100%;
          padding: 10px;
          margin: 5px 0;
          border: 1px solid #c2831f;
          border-radius: 5px;
          background: black;
          color: white;
        }
        button {
          background: #c2831f;
          color: black;
          padding: 8px 15px;
          margin: 5px 5px 0 0;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        button:hover {
          opacity: 0.9;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: #111;
        }
        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #333;
        }
        tr:nth-child(even) {
          background: #1a1a1a;
        }
        .view-btn { background: #2196F3; color: white; }
        .edit-btn { background: #FF9800; color: white; }
        .delete-btn { background: #F44336; color: white; }
      `}</style>
    </DashboardLayout>
  );
};

export default Verification;
