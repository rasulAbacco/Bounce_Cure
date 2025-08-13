import React, { useEffect, useState, useRef } from "react";
import {
  FaUser,
  FaLock,
  FaBell,
  FaKey,
  FaCreditCard,
  FaExclamationTriangle,
  FaCopy,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import DashboardLayout from "../../components/DashboardLayout";

const sections = [
  { id: "profile", label: "Profile", icon: <FaUser /> },
  { id: "security", label: "Security", icon: <FaLock /> },
  { id: "notifications", label: "Notifications", icon: <FaBell /> },
  { id: "apikeys", label: "API Keys", icon: <FaKey /> },
  { id: "billing", label: "Billing", icon: <FaCreditCard /> },
  { id: "danger", label: "Danger Zone", icon: <FaExclamationTriangle /> },
];

const glassCard =
  "backdrop-blur-md bg-black/10 border border-white/20 shadow-lg rounded-2xl p-6 text-white";

const inputStyle =
  "w-full px-4 py-2 rounded-lg bg-black/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400";

const btnSecondary =
  "px-4 py-2 rounded-lg text-white font-semibold transition cursor-pointer bg-gray-500 hover:bg-gray-600";

const btnDanger =
  "px-4 py-2 rounded-lg text-white font-semibold shadow-md transition cursor-pointer bg-red-500 hover:bg-red-600";

const iconBtn =
  "p-2 bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center justify-center cursor-pointer";

function BackgroundSquares() {
  const squares = Array.from({ length: 20 });
  return (
    <>
      <style>{`
        @keyframes floatMove {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.4;
          }
          50% {
            transform: translate(10px, -10px) rotate(180deg);
            opacity: 0.7;
          }
          100% {
            transform: translate(0, 0) rotate(360deg);
            opacity: 0.4;
          }
        }
        .background-square {
          position: absolute;
          background-color: rgba(194, 131, 31, 0.15);
          width: 15px;
          height: 15px;
          border-radius: 3px;
          animation-name: floatMove;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-direction: alternate;
          filter: drop-shadow(0 0 1px rgba(194, 131, 31, 0.4));
        }
        .horizontal-line {
          height: 1px;
          background-color: #c2831f; /* GOLD */
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          border-radius: 1px;
        }
      `}</style>
      {squares.map((_, i) => {
        const style = {
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDuration: `${5 + Math.random() * 10}s`,
          animationDelay: `${Math.random() * 10}s`,
          width: 8 + Math.random() * 12 + "px",
          height: 8 + Math.random() * 12 + "px",
        };
        return <div key={i} className="background-square" style={style} />;
      })}
    </>
  );
}

function SectionNav({ sections, active, onSelect }) {
  return (
    <nav className="max-w-4xl mx-auto relative z-10 mb-10">
      <div className="flex gap-4 items-center justify-center overflow-x-auto backdrop-blur-md border border-white/20 rounded-2xl p-3">
        {sections.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap flex-shrink-0 transition-colors duration-200 cursor-pointer ${active === id
              ? "bg-yellow-600 text-white shadow-lg"
              : "text-white/80 hover:text-white"
              }`}
            style={{ minWidth: 100 }}
            aria-current={active === id ? "page" : undefined}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
      <div className="horizontal-line" />
    </nav>
  );
}


function ApiKeyItem({ keyValue, onCopy, onDelete }) {
  return (
    <li className="flex justify-between items-center  bg-white/10 p-2 rounded-lg relative z-10">
      <span className="truncate ">{keyValue}</span>
      <div className="flex gap-2">
        <button
          onClick={() => onCopy(keyValue)}
          className={iconBtn}
          title="Copy API Key"
        >
          <FaCopy />
        </button>
        <button
          onClick={() => onDelete(keyValue)}
          className={`${iconBtn} bg-yellow-600 hover:bg-yellow-700 text-white`}
          title="Delete API Key"
        >
          <FaTrash />
        </button>
      </div>
    </li>
  );
}


function BillingSection() {
  const [email, setEmail] = useState("user@example.com");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [country, setCountry] = useState("United States");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [paymentHistory, setPaymentHistory] = useState([]);

  // Track how long user stayed on page (seconds)
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const timerRef = useRef(null);

  // Start timer on mount
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSessionSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Calculate next payment date (+1 month)
  const calcNextPaymentDate = (date) => {
    const next = new Date(date);
    next.setMonth(next.getMonth() + 1);
    return next.toLocaleDateString();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert("Please agree to the terms.");
      return;
    }
    const now = new Date();
    const newPayment = {
      id: now.getTime(),
      email,
      cardNumber: cardNumber.replace(/\s/g, ""),
      expiry,
      // cvc removed here for security
      nameOnCard,
      billingAddress,
      country,
      submittedAt: now.toLocaleString(),
      nextPaymentDate: calcNextPaymentDate(now),
      sessionDuration: formatDuration(sessionSeconds),
    };
    setPaymentHistory((prev) => [newPayment, ...prev]);

    alert("Payment submitted!");

    // Reset form fields except email
    setCardNumber("");
    setExpiry("");
    setCvc(""); // clear local cvc but NOT saved
    setNameOnCard("");
    setBillingAddress("");
    setCountry("United States");
    setAgreeTerms(false);
    setSessionSeconds(0); // reset timer
  };

  // CSV download function with masked CVC
  const downloadCSV = () => {
    if (paymentHistory.length === 0) {
      alert("No history to download");
      return;
    }
    const headers = [
      "Email",
      "Card Number",
      "Expiry",
      "CVC",
      "Name On Card",
      "Billing Address",
      "Country",
      "Submitted At",
      "Next Payment Date",
      "Session Duration",
    ];

    const rows = paymentHistory.map((p) => [
      p.email,
      p.cardNumber,
      p.expiry,
      "***", // Masked CVC for security
      p.nameOnCard,
      `"${p.billingAddress.replace(/"/g, '""')}"`,
      p.country,
      p.submittedAt,
      p.nextPaymentDate,
      p.sessionDuration,
    ]);

    const csvContent =
      [headers, ...rows]
        .map((e) => e.join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "payment_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={glassCard + " max-w-4xl mx-auto"}>
      <h2 className="text-2xl font-bold mb-6 text-yellow-600">Billing Information</h2>
      <p className="mb-4 text-white">
        Time spent on page: <strong>{formatDuration(sessionSeconds)}</strong>
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 text-white">
        <div>
          <label htmlFor="email" className="block mb-1 font-semibold">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            className={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="cardNumber" className="block mb-1 font-semibold">
            Card Number
          </label>
          <input
            type="text"
            id="cardNumber"
            maxLength={19}
            placeholder="1234 5678 9012 3456"
            className={inputStyle}
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="expiry" className="block mb-1 font-semibold">
              Expiry Date (MM/YY)
            </label>
            <input
              type="text"
              id="expiry"
              maxLength={5}
              placeholder="MM/YY"
              className={inputStyle}
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              required
            />
          </div>
          <div className="w-24">
            <label htmlFor="cvc" className="block mb-1 font-semibold">
              CVC
            </label>
            <input
              type="text"
              id="cvc"
              maxLength={4}
              placeholder="123"
              className={inputStyle}
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="nameOnCard" className="block mb-1 font-semibold">
            Name on Card
          </label>
          <input
            type="text"
            id="nameOnCard"
            className={inputStyle}
            value={nameOnCard}
            onChange={(e) => setNameOnCard(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="billingAddress" className="block mb-1 font-semibold">
            Billing Address
          </label>
          <textarea
            id="billingAddress"
            rows={3}
            className={inputStyle}
            value={billingAddress}
            onChange={(e) => setBillingAddress(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="country" className="block mb-1 font-semibold">
            Country
          </label>
          <select
            id="country"
            className={inputStyle}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option style={{ color: "black" }}>United States</option>
            <option style={{ color: "black" }}>India</option>
            <option style={{ color: "black" }}>United Kingdom</option>
            <option style={{ color: "black" }}>Canada</option>
            <option style={{ color: "black" }}>Australia</option>
          </select>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mr-3"
            required
          />
          I agree to the{" "}
          <a href="/terms" target="_blank" className="underline">
            Terms and Conditions
          </a>
        </label>
        <button
          type="submit"
          disabled={!agreeTerms}
          className={`w-full py-3 rounded-md font-semibold text-white transition ${agreeTerms
            ? "bg-[#ffa007] hover:bg-[#f38e01]"
            : "bg-[#d9a54c] cursor-not-allowed"
            }`}
        >
          Submit Payment
        </button>

      </form>

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <div className="mt-10 text-white">
          <h3 className="text-xl font-semibold mb-4">Payment History</h3>
          <button
            onClick={downloadCSV}
            className="mb-4 px-4 py-2 bg-yellow-700 hover:bg-yellow-700 rounded-md"
          >
            Download History (CSV)
          </button>
          <div className="overflow-x-auto max-h-64">
            <table className="min-w-full table-auto border-collapse border border-gray-600 text-sm">
              <thead>
                <tr>
                  <th className="border border-gray-600 px-2 py-1">Email</th>
                  <th className="border border-gray-600 px-2 py-1">Card Number</th>
                  <th className="border border-gray-600 px-2 py-1">Expiry</th>
                  <th className="border border-gray-600 px-2 py-1">CVC</th>
                  <th className="border border-gray-600 px-2 py-1">Name on Card</th>
                  <th className="border border-gray-600 px-2 py-1">Billing Address</th>
                  <th className="border border-gray-600 px-2 py-1">Country</th>
                  <th className="border border-gray-600 px-2 py-1">Submitted At</th>
                  <th className="border border-gray-600 px-2 py-1">Next Payment Date</th>
                  <th className="border border-gray-600 px-2 py-1">Session Duration</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((p) => (
                  <tr key={p.id} className="odd:bg-gray-800 even:bg-gray-700">
                    <td className="border border-gray-600 px-2 py-1">{p.email}</td>
                    <td className="border border-gray-600 px-2 py-1">{p.cardNumber}</td>
                    <td className="border border-gray-600 px-2 py-1">{p.expiry}</td>
                    <td className="border border-gray-600 px-2 py-1">***</td> {/* masked CVC */}
                    <td className="border border-gray-600 px-2 py-1">{p.nameOnCard}</td>
                    <td className="border border-gray-600 px-2 py-1">{p.billingAddress}</td>
                    <td className="border border-gray-600 px-2 py-1">{p.country}</td>
                    <td className="border border-gray-600 px-2 py-1">{p.submittedAt}</td>
                    <td className="border border-gray-600 px-2 py-1">{p.nextPaymentDate}</td>
                    <td className="border border-gray-600 px-2 py-1">{p.sessionDuration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GlassSettings() {
  const [active, setActive] = useState("profile");
  const [apiKeys, setApiKeys] = useState(["abc123xyz", "def456uvw"]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setShowDeleteModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const addApiKey = () => {
    const newKey = Math.random().toString(36).substring(2, 15);
    setApiKeys((prev) => [...prev, newKey]);
  };

  const deleteApiKey = (key) => {
    setApiKeys((prev) => prev.filter((k) => k !== key));
  };

  const copyApiKey = (key) => {
    navigator.clipboard.writeText(key);
    alert("API Key copied!");
  };

  const performDeleteAccount = async () => {
    setDeleting(true);
    await new Promise((res) => setTimeout(res, 1200));
    setDeleting(false);
    setShowDeleteModal(false);
    setConfirmText("");
    alert("Account deleted (simulation). Redirect or cleanup here.");
  };

  const renderSection = () => {
    switch (active) {
      case "profile":
        return (
          <div className={`${glassCard} space-y-4 relative z-20`}>
            <h2 className="text-2xl font-bold text-yellow-600">Profile Settings</h2>
            <input className={inputStyle} placeholder="Full Name" />
            <input className={inputStyle} placeholder="Email Address" type="email" />
            <input className={inputStyle} type="file" />
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-lg text-white font-semibold shadow-md transition cursor-pointer bg-yellow-600 hover:bg-yellow-700">
                Save
              </button>
              <button className="px-4 py-2 rounded-lg text-white font-semibold transition cursor-pointer bg-yellow-700 hover:bg-yellow-800">
                Cancel
              </button>
            </div>
          </div>
        );
      case "security":
        return (
          <div className={`${glassCard} space-y-4 relative z-20`}>
            <h2 className="text-2xl font-bold text-yellow-600">Security Settings</h2>
            <input className={inputStyle} placeholder="Current Password" type="password" />
            <input className={inputStyle} placeholder="New Password" type="password" />
            <label className="flex items-center gap-2 cursor-pointer text-yellow-600">
              <input type="checkbox" className="cursor-pointer" /> Enable Two-Factor Authentication
            </label>
            <button className="px-4 py-2 rounded-lg text-white font-semibold shadow-md transition cursor-pointer bg-yellow-600 hover:bg-yellow-700">
              Update Password
            </button>
          </div>
        );
      case "notifications":
        return (
          <div className={`${glassCard} space-y-4 relative z-20`}>
            <h2 className="text-2xl font-bold">Notifications</h2>
            {["Email", "SMS", "Push"].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="cursor-pointer" /> {type} Notifications
              </label>
            ))}
            <button className="px-4 py-2 rounded-lg text-white font-semibold shadow-md transition cursor-pointer bg-yellow-600 hover:bg-yellow-700">
              Save Preferences
            </button>
          </div>
        );
      case "apikeys":
        return (
          <div className={`${glassCard} space-y-4 relative z-20`}>
            <h2 className="text-2xl font-bold">API Keys</h2>
            <ul className="space-y-2">
              {apiKeys.map((key) => (
                <ApiKeyItem key={key} keyValue={key} onCopy={copyApiKey} onDelete={deleteApiKey} />
              ))}
            </ul>
            <button
              onClick={addApiKey}
              className="px-4 py-2 rounded-lg text-white font-semibold shadow-md transition cursor-pointer bg-yellow-600 hover:bg-yellow-700 flex items-center gap-2"
            >
              <FaPlus /> Generate New Key
            </button>
          </div>
        );
      case "billing":
        return <BillingSection />;
      case "danger":
        return (
          <div className={`${glassCard} space-y-6 relative `}>
            <h2 className="text-2xl font-bold text-red-600">Danger Zone</h2>
            <p>Delete your account here. This action is irreversible.</p>
            <button onClick={() => setShowDeleteModal(true)} className={btnDanger}>
              Delete Account
            </button>
            {showDeleteModal && (
              <div className="fixed inset-0 bg-black bg-opacity-10  items-center z-30 p-6">
                <div className="bg-black/90 p-6 rounded-xl max-w-md w-full text-white space-y-6 relative">
                  <button
                    className="absolute top-2 right-2 text-white/70 hover:text-white text-2xl font-bold"
                    onClick={() => setShowDeleteModal(false)}
                    aria-label="Close modal"
                  >
                    ×
                  </button>
                  <p>
                    <strong>Warning:</strong> This action is irreversible. To delete your
                    account, type <code>DELETE MY ACCOUNT</code> below and confirm.
                  </p>
                  <input
                    type="text"
                    className={inputStyle}
                    placeholder="DELETE MY ACCOUNT"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    autoFocus
                  />
                  <button
                    disabled={confirmText !== "DELETE MY ACCOUNT" || deleting}
                    onClick={performDeleteAccount}
                    className={`w-full px-4 py-2 rounded-lg font-semibold transition ${confirmText === "DELETE MY ACCOUNT" && !deleting
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-red-900 cursor-not-allowed"
                      } text-white`}
                  >
                    {deleting ? "Deleting..." : "Confirm Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <BackgroundSquares />
      <main className="relative z-20 min-h-screen text-white px-4 py-8 max-w-6xl mx-auto ">
        <SectionNav sections={sections} active={active} onSelect={setActive} />
        {renderSection()}
      </main>
    </DashboardLayout>
  );
}
