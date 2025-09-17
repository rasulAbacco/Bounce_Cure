// client/src/components/inbox/AccountManager.jsx
import React, { useState, useEffect } from "react";
import { api } from "../../api"; // Adjust the path as needed

export default function AccountManager({ onAccountSelected, onAccountAdded, currentSelectedAccount }) {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [form, setForm] = useState({
    userId: 1, // replace with dynamic user ID if available
    email: "",
    imapHost: "",
    imapPort: 993,
    imapUser: "",
    encryptedPass: "",
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [accountToLogout, setAccountToLogout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Update selected account ID when the prop changes
  useEffect(() => {
    if (currentSelectedAccount) {
      setSelectedAccountId(currentSelectedAccount.id);
    }
  }, [currentSelectedAccount]);

  // Hide success message after 3 seconds
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/accounts");
      setAccounts(res.data);
      
      // Auto-select the first account if none is selected
      if (res.data.length > 0 && !selectedAccountId && !currentSelectedAccount) {
        const firstAccount = res.data[0];
        setSelectedAccountId(firstAccount.id);
        if (onAccountSelected) {
          onAccountSelected(firstAccount);
        }
      }
    } catch (err) {
      console.error("Error fetching accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/accounts", form);
      const newAccount = response.data;
      
      // Reset form
      setForm({
        ...form,
        email: "",
        imapHost: "",
        imapPort: 993,
        imapUser: "",
        encryptedPass: "",
      });
      
      // Refresh accounts list
      await fetchAccounts();
      
      // Auto-select the new account
      setSelectedAccountId(newAccount.id);
      if (onAccountSelected) {
        onAccountSelected(newAccount, true); // Pass true to indicate navigation should happen
      }
      
      // Show success message
      setShowSuccessMessage(true);
      
      // Notify parent component that account was added
      if (onAccountAdded) {
        onAccountAdded();
      }
    } catch (err) {
      console.error("Error adding account:", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmLogout = (accountId) => {
    setAccountToLogout(accountId);
    setShowLogoutConfirm(true);
  };

  const logoutAccount = async () => {
    if (!accountToLogout) return;
    
    setLoading(true);
    try {
      await api.delete(`/accounts/${accountToLogout}`);
      const updatedAccounts = accounts.filter((acc) => acc.id !== accountToLogout);
      setAccounts(updatedAccounts);
      
      // If we're logging out the selected account, select another one or clear selection
      if (selectedAccountId === accountToLogout) {
        if (updatedAccounts.length > 0) {
          const nextAccount = updatedAccounts[0];
          setSelectedAccountId(nextAccount.id);
          if (onAccountSelected) {
            onAccountSelected(nextAccount);
          }
        } else {
          setSelectedAccountId(null);
          if (onAccountSelected) {
            onAccountSelected(null);
          }
        }
      }
      
      setShowLogoutConfirm(false);
      setAccountToLogout(null);
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = (account) => {
    setSelectedAccountId(account.id);
    if (onAccountSelected) {
      onAccountSelected(account, true); // Pass true to indicate navigation should happen
    }
  };

  return (
    <div className="p-6 bg-gray-800 min-h-screen">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-4 p-3 bg-green-600 text-white rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Account added successfully!
        </div>
      )}

      <h2 className="text-lg font-bold mb-4 text-white">Email Accounts</h2>

      <div className="mb-6">
        {loading && accounts.length === 0 ? (
          <div className="text-gray-400 mb-4">Loading accounts...</div>
        ) : accounts.length === 0 ? (
          <div className="text-gray-400 mb-4">No accounts configured. Add an account to get started.</div>
        ) : (
          <div className="mb-4">
            <h3 className="text-white mb-2">Select an account to view emails:</h3>
            <div className="space-y-2">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className={`border p-3 rounded cursor-pointer transition-colors ${
                    selectedAccountId === acc.id 
                      ? "bg-blue-900 border-blue-500" 
                      : "bg-black hover:bg-gray-900"
                  }`}
                  onClick={() => handleAccountSelect(acc)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedAccountId === acc.id 
                          ? "border-blue-400 bg-blue-400" 
                          : "border-gray-400"
                      }`}></div>
                      <div>
                        <div className="font-medium text-white">{acc.email}</div>
                        <div className="text-sm text-gray-500">
                          {acc.imapHost}:{acc.imapPort}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmLogout(acc.id);
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
            <h3 className="text-white text-lg font-bold mb-4">Confirm Logout</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to logout this email account? This will remove the account and all its emails.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={logoutAccount}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                disabled={loading}
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}

      <h3 className="text-white mb-2">Add New Account</h3>
      <form onSubmit={addAccount} className="space-y-3 bg-gray-700 p-4 rounded shadow">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded text-black"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="IMAP Host"
          className="w-full p-2 border rounded text-black"
          value={form.imapHost}
          onChange={(e) => setForm({ ...form, imapHost: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="IMAP Port"
          className="w-full p-2 border rounded text-black"
          value={form.imapPort}
          onChange={(e) =>
            setForm({ ...form, imapPort: parseInt(e.target.value) })
          }
          required
        />
        <input
          type="text"
          placeholder="IMAP Username"
          className="w-full p-2 border rounded text-black"
          value={form.imapUser}
          onChange={(e) => setForm({ ...form, imapUser: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded text-black"
          value={form.encryptedPass}
          onChange={(e) =>
            setForm({ ...form, encryptedPass: e.target.value })
          }
          required
        />
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
          disabled={loading}
        >
          {loading ? "Adding Account..." : "Add Account"}
        </button>
      </form>
    </div>
  );
}