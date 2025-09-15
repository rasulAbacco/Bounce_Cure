import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
const API_URL = import.meta.env.VITE_API_URL; // ✅ Make sure you have this in your .env

export default function Signin() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Get selected plan from location OR localStorage
// Get selected plan from location OR localStorage
const [selectedPlan, setSelectedPlan] = useState(
  location.state?.plan || JSON.parse(localStorage.getItem("selectedPlan")) || null
);

  const redirectTo = location.state?.redirectTo || null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Save plan to localStorage if passed from previous page
 useEffect(() => {
  console.log("Location state:", location.state);
}, [location.state]);


  // ✅ Redirect to pricing page if no plan
  useEffect(() => {
    if (!selectedPlan) {
      toast.error("No plan selected. Redirecting to pricing...");
      navigate("/pricing", { replace: true });
    }
  }, [selectedPlan, navigate]);

const handleBack = () => {
  // Always go back to pricing with selected plan if exists
  if (selectedPlan) {
    navigate("/pricing", { state: { plan: selectedPlan }, replace: true });
  } else {
    navigate("/pricing", { replace: true });
  }
};

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        // ✅ Save token securely
        localStorage.setItem("authToken", data.token);
        // ✅ Clear saved plan after login
        localStorage.removeItem("selectedPlan");
        toast.success("Login successful 🎉");
        // ✅ Redirect user based on selected plan or dashboard
       if (selectedPlan?.planName === "Free Plan") {
          navigate("/dashboard"); // Free plan → dashboard
        } else if (redirectTo && selectedPlan) {
          navigate(redirectTo, { state: selectedPlan }); // Paid plans → payment
        } else if (selectedPlan) {
          navigate("/payment", { state: selectedPlan });
        } else {
          navigate("/dashboard");
        }

      } else {
        setError(data.message || "Invalid email or password");
        toast.error(data.message || "Login failed ❌");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Server error. Please try again.");
      setError("Unable to login. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black backdrop-blur-md text-white">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md relative"
      >
        {/* ✅ Back button */}
        <button
          type="button"
          onClick={handleBack}
          className="absolute top-4 left-4 text-[#c2831f] hover:text-[#dba743] flex items-center text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        
        <h2 className="text-2xl font-bold text-[#c2831f] mb-6 mt-2">Sign In</h2>
        
        {/* ✅ Display selected plan information */}
        {selectedPlan && (
          <div className="mb-6 p-4 bg-gray-700 rounded-lg border-l-4 border-[#c2831f]">
            <p className="text-gray-300 text-sm mb-1">Selected Plan:</p>
            <p className="text-[#c2831f] font-semibold text-lg">
              {selectedPlan.planName || selectedPlan.name || "Selected Plan"}
            </p>
            {selectedPlan.basePlanPrice && (
              <p className="text-gray-300 text-sm mt-1">
                ${selectedPlan.basePlanPrice.toFixed(2)}
              </p>
            )}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg">
            {error}
          </div>
        )}
        
        <label className="block text-sm mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600"
          required
          placeholder="Enter your email"
        />
        
        <label className="block text-sm mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-6 rounded bg-gray-700 border border-gray-600"
          required
          placeholder="Enter your password"
        />
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full font-semibold py-2 rounded cursor-pointer ${
            isLoading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-[#c2831f] hover:bg-[#dba743] text-black"
          }`}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
        
        <div className="mt-6 text-center text-sm">
          <p>
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[#c2831f] hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
          <p className="mt-2">
            <Link
              to="/forgot-password"
              className="text-[#c2831f] hover:underline"
            >
              Forgot password?
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}