// frontend/pages/ResetPasswordPage.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Key, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(""); // "success" | "error"
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setStatus("");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("✅ Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setStatus("error");
        setMessage(data.message || "❌ Something went wrong. Try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("❌ Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center px-6">
      {/* Company Name Header */}
      <header className="w-full py-6 text-center border-b border-gray-800 mb-20 mt-20">
        <h1 className="text-9xl md:text-7xl font-bold text-[#c2831f] ">
          Bounce Cure
        </h1>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-5xl">
        {/* LEFT SIDE: Info text */}
        <div className="flex flex-col justify-center text-gray-300 p-6 md:p-10">
          <h2 className="text-4xl font-bold text-white mb-6 flex items-center gap-2">
            Reset Your Password <span className="text-[#c2831f]">🔒</span>
          </h2>
          <p className="text-lg text-gray-400 mb-6 leading-relaxed">
            Forgot your password? No worries. Just create a new one and get back
            into your account.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-3 text-base">
            <li>Password must be at least 8 characters long</li>
            <li>Use a mix of letters, numbers, and symbols</li>
            <li>Don’t reuse your old password</li>
          </ul>
        </div>

        {/* RIGHT SIDE: Reset Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-black border border-gray-800 p-8 rounded-2xl shadow-lg"
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Key className="w-6 h-6 text-[#c2831f]" />
            <h3 className="text-2xl font-semibold text-white">Reset Password</h3>
          </div>

          {/* Input: New Password */}
          <label className="block mb-2 text-sm font-medium text-gray-300">
            New Password
          </label>
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white placeholder-gray-500 
            focus:outline-none focus:ring-2 focus:ring-[#c2831f]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-[#c2831f] transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Input: Confirm Password */}
          <label className="block mb-2 text-sm font-medium text-gray-300">
            Confirm Password
          </label>
          <div className="relative mb-6">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white placeholder-gray-500 
            focus:outline-none focus:ring-2 focus:ring-[#c2831f]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-[#c2831f] transition"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#c2831f] text-black font-medium shadow hover:bg-[#c2831f] transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          {/* Message */}
          {message && (
            <p
              className={`mt-4 text-center text-sm font-medium ${status === "success" ? "text-green-400" : "text-red-400"
                }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>

  );
}
