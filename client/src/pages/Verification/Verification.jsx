import React, { useState, useRef } from "react";
import {
  Download,
  Upload,
  Mail,
  User,
  CreditCard,
   
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";

const Verification = () => {
  const [activeTab, setActiveTab] = useState("instant");
  const [emails, setEmails] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [bulkResults, setBulkResults] = useState([]);
  const [instantResults, setInstantResults] = useState([]);
  const [creditsUsed, setCreditsUsed] = useState(47);
  const [totalCredits] = useState(1000);
  const fileInputRef = useRef(null);

  // Mock verification results
  const mockInstantResults = [
    {
      email: "john@example.com",
      date: "2024-08-12",
      status: "Valid",
      subStatus: "Deliverable",
      action: "Send",
    },
    {
      email: "invalid@test.com",
      date: "2024-08-12",
      status: "Invalid",
      subStatus: "Syntax Error",
      action: "Remove",
    },
    {
      email: "risky@domain.com",
      date: "2024-08-12",
      status: "Risky",
      subStatus: "Catch-All",
      action: "Review",
    },
  ];

  const mockBulkResults = [
    {
      email: "user1@company.com",
      status: "Valid",
      verifiedBy: "SMTP",
      uploadTime: "2024-08-12 10:30",
    },
    {
      email: "user2@company.com",
      status: "Invalid",
      verifiedBy: "DNS",
      uploadTime: "2024-08-12 10:30",
    },
    {
      email: "user3@company.com",
      status: "Risky",
      verifiedBy: "SMTP",
      uploadTime: "2024-08-12 10:30",
    },
  ];

  const handleInstantVerify = () => {
    if (!emails.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      setInstantResults(mockInstantResults);
      setCreditsUsed(
        (prev) => prev + emails.split(/[,\n]/).filter((e) => e.trim()).length
      );
      setIsLoading(false);
    }, 2000);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleBulkVerify = () => {
    if (!uploadedFile) return;

    setIsLoading(true);
    setTimeout(() => {
      setBulkResults(mockBulkResults);
      setCreditsUsed((prev) => prev + mockBulkResults.length);
      setIsLoading(false);
    }, 3000);
  };

  const exportToCSV = (data, filename) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => `"${row[header]}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "valid":
        return "text-green-400 bg-green-900";
      case "invalid":
        return "text-red-400 bg-red-900";
      case "risky":
        return "text-yellow-400 bg-yellow-900";
      default:
        return "text-gray-400 bg-gray-800";
    }
  };

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-600 border-t-yellow-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Mail className="w-6 h-6 text-yellow-500" />
        </div>
      </div>
      <p className="mt-4 text-gray-400">Verifying emails...</p>
    </div>
  );

  return (
     <DashboardLayout>
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            {/* <Mail className="w-8 h-8 text-yellow-500" />
            <h1 className="text-2xl font-bold" style={{ color: '#c2831f' }}>
              Email Verification
            </h1> */}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
              <CreditCard className="w-5 h-5 text-yellow-500" />
              <span className="font-medium text-white">
                Credits: {totalCredits - creditsUsed} / {totalCredits}
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
              <User className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-300">Premium Plan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white px-6 py-4 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold" style={{ color: '#c2831f' }}>
              Get 30% on Your First Purchase
            </span>
            <div className="flex space-x-2">
              <span className="text-sm text-gray-300">Time Left</span>
              <div className="flex space-x-1">
                {[0, 23, 41, 57].map((num, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-700 px-2 py-1 rounded text-sm font-mono text-yellow-400"
                  >
                    {num.toString().padStart(2, "0")}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors">
            Buy Credits
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex justify-center">
          <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg w-fit border border-gray-700">
            <button
              onClick={() => setActiveTab("instant")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === "instant"
                  ? "bg-yellow-500 text-black"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Instant Verification
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === "bulk"
                  ? "bg-yellow-500 text-black"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Bulk Verification
            </button>
          </div>
        </div>

        {/* Instant Verification Tab */}
        {activeTab === "instant" && (
          <div className="space-y-8">
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#c2831f' }}>
                Instant Verification
              </h2>
              <p className="text-gray-300 mb-6">
                Enter up to 25 emails, separated by commas or line breaks and
                verify with a single click
                <br />
                <span className="text-sm text-gray-400">
                  (Each verification deducts one credit)
                </span>
              </p>

              <div className="space-y-4">
                <textarea
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  placeholder="Enter Email..."
                  className="w-full h-32 px-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none placeholder-gray-400"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    {emails
                      ? emails.split(/[,\n]/).filter((e) => e.trim()).length
                      : 0}{" "}
                    / 25 emails
                  </span>
                  <button
                    onClick={handleInstantVerify}
                    disabled={!emails.trim() || isLoading}
                    className="bg-yellow-500 text-black px-8 py-2 rounded-lg font-medium hover:bg-yellow-400 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-lg font-semibold" style={{ color: '#c2831f' }}>Result</h3>
                {instantResults.length > 0 && (
                  <button
                    onClick={() =>
                      exportToCSV(
                        instantResults,
                        "instant-verification-results.csv"
                      )
                    }
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export to CSV</span>
                  </button>
                )}
              </div>

              <div className="p-6">
                {isLoading ? (
                  <LoadingSpinner />
                ) : instantResults.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3 text-gray-400 font-medium">
                            Email
                          </th>
                          <th className="text-left py-3 text-gray-400 font-medium">
                            Date
                          </th>
                          <th className="text-left py-3 text-gray-400 font-medium">
                            Status
                          </th>
                          <th className="text-left py-3 text-gray-400 font-medium">
                            Sub Status
                          </th>
                          <th className="text-left py-3 text-gray-400 font-medium">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {instantResults.map((result, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-800"
                          >
                            <td className="py-4 text-white">{result.email}</td>
                            <td className="py-4 text-gray-300">
                              {result.date}
                            </td>
                            <td className="py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                  result.status
                                )}`}
                              >
                                {result.status}
                              </span>
                            </td>
                            <td className="py-4 text-gray-300">
                              {result.subStatus}
                            </td>
                            <td className="py-4">
                              <button className="text-yellow-400 hover:text-yellow-300 font-medium">
                                {result.action}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                      Start Verification! Enter up to 25 emails and click
                      Verify.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bulk Verification Tab */}
        {activeTab === "bulk" && (
          <div className="space-y-8">
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
              <div
                className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center hover:border-yellow-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-white">
                  Choose a file or drag & drop it here
                </h3>
                <p className="text-gray-400 mb-4">
                  CSV format, up to 5000 emails
                </p>
                <button
                  type="button"
                  className="bg-gray-700 text-gray-200 px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Browse File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {uploadedFile && (
                <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium text-yellow-400">
                      File uploaded: {uploadedFile.name}
                    </p>
                    <p className="text-sm text-gray-300">
                      Ready for verification
                    </p>
                  </div>
                  <button
                    onClick={handleBulkVerify}
                    disabled={isLoading}
                    className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-medium hover:bg-yellow-400 disabled:bg-gray-600 transition-colors"
                  >
                    Bulk Verify
                  </button>
                </div>
              )}
            </div>

            {/* Bulk Results Section */}
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-lg font-semibold" style={{ color: '#c2831f' }}>Result</h3>
                <div className="flex space-x-2">
                  {bulkResults.length > 0 && (
                    <>
                      <button
                        onClick={() =>
                          exportToCSV(
                            bulkResults,
                            "bulk-verification-results.csv"
                          )
                        }
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Results</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="p-6">
                {isLoading ? (
                  <LoadingSpinner />
                ) : bulkResults.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3 font-medium" style={{ color: '#c2831f' }}>
                            File Name
                          </th>
                          <th className="text-left py-3 font-medium" style={{ color: '#c2831f' }}>
                            Total Emails
                          </th>
                          <th className="text-left py-3 font-medium" style={{ color: '#c2831f' }}>
                            Upload Time
                          </th>
                          <th className="text-left py-3 font-medium" style={{ color: '#c2831f' }}>
                            Verified By
                          </th>
                          <th className="text-left py-3 font-medium" style={{ color: '#c2831f' }}>
                            Status
                          </th>
                          <th className="text-left py-3 font-medium" style={{ color: '#c2831f' }}>
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-800">
                          <td className="py-4 text-yellow-400 font-medium">
                            {uploadedFile?.name || "bulk-emails.csv"}
                          </td>
                          <td className="py-4 text-white">{bulkResults.length}</td>
                          <td className="py-4 text-gray-300">
                            2024-08-12 10:30
                          </td>
                          <td className="py-4 text-gray-300">System</td>
                          <td className="py-4">
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-900 text-green-400">
                              Completed
                            </span>
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() =>
                                exportToCSV(
                                  bulkResults,
                                  "bulk-verification-results.csv"
                                )
                              }
                              className="text-yellow-400 hover:text-yellow-300 font-medium"
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                      No verification results. Upload a CSV file to get
                      started.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
};

export default Verification;