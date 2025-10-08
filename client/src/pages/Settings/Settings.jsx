// Settings.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNotificationContext } from "../../components/NotificationContext";
import Select from "react-select";
import { Toaster, toast } from "react-hot-toast";
import { Shield, Bell, Trash2, AlertCircle } from 'lucide-react';
const API_URL = import.meta.env.VITE_VRI_URL;

// Icons
const FaBell = (props) => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" {...props}>
    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
  </svg>
);

const FaExclamationTriangle = (props) => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" {...props}>
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

// Utility
const cls = (...xs) => xs.filter(Boolean).join(" ");

// Sections
function NotificationsSection() {
  const { preferences, setPreferences } = useNotificationContext();
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(false);
  const [inAppNotif, setInAppNotif] = useState(false);
  const [frequency, setFrequency] = useState("daily");

  const options = [
    { value: "instant", label: "Instant" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
  ];

  const ToggleButton = ({ active, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${active ? "bg-[#c2831f] border-[#c2831f]" : "bg-gray-700 border-gray-500"
        }`}
    >
      {active && (
        <svg
          className="w-4 h-4 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );

  const handleSave = () => {
    setPreferences({
      email: emailNotif,
      sms: smsNotif,
      push: pushNotif,
      inApp: inAppNotif,
      frequency,
    });

    toast.success("Preferences Saved Successfully!");
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
      <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#c2831f]/10 rounded-lg">
            <Bell className="w-6 h-6 text-[#c2831f]" />
          </div>
          <h2 className="text-2xl font-bold text-white">Notification Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-white">Email Notifications</span>
            <ToggleButton active={emailNotif} onChange={setEmailNotif} />
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-white">SMS Notifications</span>
            <ToggleButton active={smsNotif} onChange={setSmsNotif} />
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-white">Push Notifications</span>
            <ToggleButton active={pushNotif} onChange={setPushNotif} />
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-white">In-App Notifications</span>
            <ToggleButton active={inAppNotif} onChange={setInAppNotif} />
          </div>

          <div className="mt-4">
            <span className="text-white/90 text-sm font-medium block mb-2">Notification Frequency</span>
            <Select
              options={options}
              value={options.find((o) => o.value === frequency)}
              onChange={(opt) => setFrequency(opt.value)}
              styles={{
                control: (base) => ({ 
                  ...base, 
                  backgroundColor: "rgba(255,255,255,0.05)", 
                  borderColor: "rgba(255,255,255,0.1)", 
                  color: "white",
                  borderRadius: "0.5rem"
                }),
                menu: (base) => ({ ...base, backgroundColor: "black", borderRadius: "0.5rem" }),
                option: (base, state) => ({ 
                  ...base, 
                  backgroundColor: state.isFocused ? "#c2831f" : "black", 
                  color: "white" 
                }),
                singleValue: (base) => ({ ...base, color: "white" }),
              }}
            />
          </div>

          <button 
            onClick={handleSave}
            className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-[#c2831f] to-[#a66e19] hover:from-[#a66e19] hover:to-[#8f5c15] text-white font-medium rounded-lg transition-all duration-300"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

// Danger Section
function DangerSection() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDeleteClick = async () => {
    if (!confirming) {
      setConfirming(true);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      console.log("Attempting to delete account at:", `${API_URL}/api/settings/delete-account`);
      console.log("Using token:", token.substring(0, 10) + "...");

      const res = await fetch(`${API_URL}/api/settings/delete-account`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        credentials: "include",
      });

      console.log("Response status:", res.status);
      console.log("Response ok:", res.ok);

      if (!res.ok) {
        let errorMessage = "Failed to Delete Account!";
        
        try {
          const data = await res.json();
          console.log("Error response data:", data);
          errorMessage = data?.message || data?.error || errorMessage;
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          try {
            const text = await res.text();
            console.log("Error response text:", text);
            errorMessage = text || errorMessage;
          } catch (textError) {
            console.error("Failed to get error text:", textError);
            errorMessage = `${errorMessage} (Status: ${res.status})`;
          }
        }
        
        throw new Error(errorMessage);
      }

      // Success
      toast.success("Account permanently deleted");
      localStorage.removeItem("token");
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
      
    } catch (err) {
      console.error("Delete account error:", err);
      setError(err.message);
      toast.error(err.message || "Error deleting account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-red-400/20 to-pink-400/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
      <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-red-400">Danger Zone</h2>
        </div>
        
        <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 mb-6">
          <p className="text-white/80">
            Deleting your account will remove all your data permanently. This action cannot be undone.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800/50 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-300 font-medium">Error:</p>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </div>
        )}

        <button
          className={`w-full px-4 py-3 font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${confirming 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-red-900/50 hover:bg-red-900/70 border border-red-800/50 text-red-300'}`}
          disabled={loading}
          onClick={handleDeleteClick}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Deleting...
            </>
          ) : confirming ? "Click again to confirm deletion" : "Delete Account"}
        </button>
      </div>
    </div>
  );
}

// Main Page
export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/5 rounded-xl backdrop-blur-sm">
            <Shield className="w-8 h-8 text-[#c2831f]" />
          </div>
          <h1 className="text-3xl font-bold text-white">Account Settings</h1>
        </div>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Manage your account preferences and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <NotificationsSection />
        <DangerSection />
      </div>
      
      <Toaster position="bottom-right" />
    </div>
  );
}