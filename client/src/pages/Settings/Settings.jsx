import React, { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useNotificationContext } from "../../components/NotificationContext";
import Select from "react-select";

// Reusable rotating SVG wrapper (uses Tailwind's animate-spin and custom duration)
const RotatingSvg = ({ className = "", children, ...props }) => (
  <svg
    className={`w-4 h-4 animate-spin ${className}`}
    style={{ animationDuration: "18s" }} // slow spin
    fill="currentColor"
    viewBox="0 0 20 20"
    {...props}
  >
    {children}
  </svg>
);


const FaBell = (props) => (
  <RotatingSvg {...props}>
    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
  </RotatingSvg>
);
const FaKey = (props) => (
  <RotatingSvg {...props}>
    <path
      fillRule="evenodd"
      d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
      clipRule="evenodd"
    />
  </RotatingSvg>
);
const FaExclamationTriangle = (props) => (
  <RotatingSvg {...props}>
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </RotatingSvg>
);

// ---------- Dark Theme Glassmorphism Design Tokens (Tailwind) ----------
const TOKENS = {
  card: "backdrop-blur-xl bg-black/30 border border-white/10 shadow-2xl rounded-2xl p-6 text-white w-full",

  input: "w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#c2831f]/70 placeholder-white/40 text-white",

  btnPrimary: "px-4 py-2 rounded-xl text-white font-semibold shadow-md transition cursor-pointer bg-gradient-to-r from-[#c2831f] to-[#a66e19] hover:from-[#a66e19] hover:to-[#8f5c15] focus-visible:ring-2 focus-visible:ring-[#c2831f]/70",

  btnSecondary: "px-4 py-2 rounded-xl text-white font-semibold transition cursor-pointer bg-white/10 hover:bg-white/20",

  btnDanger: "px-4 py-2 rounded-xl text-white font-semibold shadow-md transition cursor-pointer bg-red-700/80 hover:bg-red-600/90 focus-visible:ring-2 focus-visible:ring-red-500/70",

  iconBtn: "p-2 bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-white/30",
};

const options = [
  { value: "realtime", label: "Real-time" },
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily Summary" },
  { value: "weekly", label: "Weekly Summary" },
];

// ---------- Utility ----------
const cls = (...xs) => xs.filter(Boolean).join(" ");

const SECTIONS = [
  { id: "notifications", label: "Notifications", icon: <FaBell /> },
  { id: "apikeys", label: "API Keys", icon: <FaKey /> },
  { id: "danger", label: "Danger Zone", icon: <FaExclamationTriangle /> },
];

// ---------- Background FX ----------
function BackgroundFX() {
  const blobs = useMemo(
    () => Array.from({ length: 6 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: 40 + Math.random() * 40,
      d: 8 + Math.random() * 10,
    })),
    []
  );

  return (
    <>
      {/* Floating blobs background */}
      <style>{`
    @keyframes floaty {
      0% { transform: translate3d(0,0,0) scale(1); opacity: .6; }
      50% { transform: translate3d(10px,-20px,0) scale(1.05); opacity: .9; }
      100% { transform: translate3d(0,0,0) scale(1); opacity: .6; }
    }
    @keyframes moveSquares {
      0% { background-position: 0 0, 0 0; }
      100% { background-position: 40px 40px, 40px 40px; }
    }
  `}</style>

      {/* Gradient layer */}
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(1200px_800px_at_-20%_-10%,rgba(245,158,11,0.25),transparent),radial-gradient(1000px_600px_at_120%_110%,rgba(253,224,71,0.25),transparent)]" />

      {/* Floating blobs */}
      {blobs.map((b, i) => (
        <div
          key={i}
          className="pointer-events-none fixed -z-10 rounded-full blur-3xl"
          style={{
            top: `${b.y}%`,
            left: `${b.x}%`,
            width: `${b.s}vmin`,
            height: `${b.s}vmin`,
            background:
              i % 2 === 0
                ? "radial-gradient(circle at 30% 30%, rgba(245,158,11,.35), transparent 60%)"
                : "radial-gradient(circle at 70% 70%, rgba(253,224,71,.35), transparent 60%)",
            animation: `floaty ${b.d}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </>
  );
}

// ---------- Section Tabs ----------
function SectionTabs({ sections, active, onChange }) {
  const listRef = useRef(null);
  const idx = sections.findIndex((s) => s.id === active);

  function onKeyDown(e) {
    if (!listRef.current) return;
    const last = sections.length - 1;
    let nextIdx = idx;
    if (e.key === "ArrowRight") nextIdx = Math.min(last, idx + 1);
    if (e.key === "ArrowLeft") nextIdx = Math.max(0, idx - 1);
    if (e.key === "Home") nextIdx = 0;
    if (e.key === "End") nextIdx = last;
    if (nextIdx !== idx) {
      e.preventDefault();
      onChange(sections[nextIdx].id);
      const btn = listRef.current.querySelectorAll("button")[nextIdx];
      btn?.focus();
    }
  }

  return (
    <nav aria-label="Settings sections" className="relative z-10 mt-20">
      {/* Tab list */}
      <div
        role="tablist"
        aria-orientation="horizontal"
        ref={listRef}
        onKeyDown={onKeyDown}
        className="flex justify-center gap-2 overflow-x-auto px-4 sm:px-0 backdrop-blur-xl border border-white/10 rounded-2xl py-3"
      >
        {sections.map(({ id, label, icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={active === id}
            aria-controls={`panel-${id}`}
            onClick={() => onChange(id)}
            className={cls(
              "flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap flex-shrink-0 transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-white/30 relative overflow-hidden",
              active === id
                ? "text-white shadow-lg before:absolute before:inset-0 before:bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.15)_0px,rgba(255,255,255,0.15)_10px,transparent_10px,transparent_20px),repeating-linear-gradient(-45deg,rgba(255,255,255,0.15)_0px,rgba(255,255,255,0.15)_10px,transparent_10px,transparent_20px)] before:bg-[#c2831f] before:bg-[length:40px_40px] before:animate-[moveSquares_3s_linear_infinite] z-10"
                : "text-white/80 hover:text-white"
            )}
          >
            <span className="relative z-20">{icon}</span>
            <span className="hidden sm:inline relative z-20">{label}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="mt-3 h-px w-full bg-[#c2831f]" aria-hidden="true" />

      {/* Tailwind animation keyframes */}
      <style>
        {`
      @keyframes moveSquares {
        0% { background-position: 0 0, 0 0; }
        100% { background-position: 40px 40px, 40px 40px; }
      }
    `}
      </style>
    </nav>

  );
}

// ---------- Reusable Components ----------
function LabeledInput({ label, hint, className, ...props }) {
  return (
    <label className="block">
      <span className="text-white/90 text-sm font-medium">{label}</span>
      <input {...props} className={cls(TOKENS.input, "mt-1", className)} />
      {hint && <span className="text-white/50 text-xs mt-1 block">{hint}</span>}
    </label>
  );
}

function LabeledSelect({ label, children, className, ...props }) {
  return (
    <label className="block">
      <span className="text-white/90 text-sm font-medium">{label}</span>
      <select {...props} className={cls(TOKENS.input, "mt-1", className)}>
        {children}
      </select>
    </label>
  );
}

// ---------- Sections ----------
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
    { value: "weekly", label: "Weekly" }
  ];

  const ToggleButton = ({ active, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${active ? "bg-gray-500 border-gray-500" : "bg-gray-700 border-gray-500"
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
    });
    alert("Preferences saved successfully!");
  };

  return (
    <div
      className={`${TOKENS.card} space-y-6`}
      id="panel-notifications"
      role="tabpanel"
    >
      <h2 className="text-2xl font-bold text-[#c2831f]">Notifications</h2>

      <div className="flex items-center gap-3">
        <ToggleButton active={emailNotif} onChange={setEmailNotif} />
        <span>Email Notifications</span>
      </div>

      <div className="flex items-center gap-3">
        <ToggleButton active={smsNotif} onChange={setSmsNotif} />
        <span>SMS Notifications</span>
      </div>

      <div className="flex items-center gap-3">
        <ToggleButton active={pushNotif} onChange={setPushNotif} />
        <span>Push Notifications</span>
      </div>

      <div className="flex items-center gap-3">
        <ToggleButton active={inAppNotif} onChange={setInAppNotif} />
        <span>In-App Notifications</span>
      </div>

      <Select
        options={options}
        value={options.find((o) => o.value === frequency)}
        onChange={(opt) => setFrequency(opt.value)}
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: "rgba(255,255,255,0.05)",
            borderColor: "rgba(255,255,255,0.1)",
            color: "white"
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: "black"
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? "#c2831f" : "black",
            color: "white"
          }),
          singleValue: (base) => ({
            ...base,
            color: "white"
          })
        }}
      />

      <button className={TOKENS.btnPrimary} onClick={handleSave}>
        Save Preferences
      </button>
    </div>
  );
}

function ApiKeysSection() {
  const [keys, setKeys] = useState([{ id: 1, name: "Default Key", value: "sk-1234abcd...", created: "2025-08-01" }]);
  function generateKey() {
    const newKey = {
      id: Date.now(),
      name: `Key ${keys.length + 1}`,
      value: "sk-" + Math.random().toString(36).slice(2),
      created: new Date().toISOString().slice(0, 10),
    };
    setKeys((prev) => [...prev, newKey]);
  }
  function revokeKey(id) {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }
  return (
    <div className={cls(TOKENS.card, "space-y-6")} id="panel-apikeys" role="tabpanel">
      <h2 className="text-2xl font-bold text-[#c2831f]">API Keys</h2>

      <div>
        <button
          onClick={generateKey}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-white font-medium shadow-sm transition cursor-pointer bg-[#c2831f] hover:bg-[#a66e19] focus-visible:ring-2 focus-visible:ring-[#c2831f]/70"
        >

          Generate New Key
        </button>


      </div>

      <div className="space-y-3">
        {keys.map((key) => (
          <div
            key={key.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10"
          >
            <div>
              <div className="font-semibold">{key.name}</div>
              <div className="text-white/60 text-sm">{key.value}</div>
              <div className="text-white/40 text-xs">Created: {key.created}</div>
            </div>
            <button
              onClick={() => revokeKey(key.id)}
              className={cls(TOKENS.btnDanger, "mt-2 sm:mt-0")}
            >
              Revoke
            </button>
          </div>
        ))}
      </div>
    </div>

  );
}



function DangerSection() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDeleteClick = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setLoading(true);
    try {
      // ✅ get token from localStorage (where you saved it on login)
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/settings/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ pass JWT
        },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete account");
      }

      alert("Account permanently deleted");
      localStorage.removeItem("token"); // ✅ clear token after deletion
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("Error deleting account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cls(TOKENS.card, "space-y-4 border border-amber-700/50")}
      id="panel-danger"
      role="tabpanel"
    >
      <h2 className="text-2xl font-bold text-[#c2831f]">Danger Zone</h2>
      <p className="text-white/80">
        Proceed with caution. These actions are irreversible.
      </p>

      {confirming ? (
        <div className="flex flex-col sm:flex-row gap-2 animate-fadeIn">
          <button
            className={TOKENS.btnDanger}
            onClick={handleDeleteClick}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Yes, delete"}
          </button>
          <button
            className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500"
            onClick={() => setConfirming(false)}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button className={TOKENS.btnDanger} onClick={handleDeleteClick}>
          Delete Account
        </button>
      )}
    </div>
  );
}



function Container({ children }) {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <BackgroundFX />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {children}
      </div>
      <footer className="py-10 text-center text-white/50 text-sm relative z-10">
        © {new Date().getFullYear()} NeoGlass • Settings
      </footer>
    </div>
  );
}

export default function SettingsPage() {
  // Default to Notifications now that Profile/Security are removed
  const [active, setActive] = useState("notifications");
  return (
    <DashboardLayout>
      <Container>
        <SectionTabs sections={SECTIONS} active={active} onChange={setActive} />
        <main className="relative z-10 mt-6 grid grid-cols-1 gap-6">
          {active === "notifications" && <NotificationsSection />}
          {active === "apikeys" && <ApiKeysSection />}
          {active === "danger" && <DangerSection />}
        </main>
      </Container>
    </DashboardLayout>
  );
}
