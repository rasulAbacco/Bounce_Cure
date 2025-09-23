// Signin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

export default function Signin() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the pending plan from storage or location state
  const [selectedPlan, setSelectedPlan] = useState(() => {
    console.log("=== INITIALIZING SIGNIN COMPONENT ===");
    
    // First check location state
    if (location.state?.plan) {
      console.log("Found plan in location state:", location.state.plan);
      return location.state.plan;
    }
    
    // Then check sessionStorage
    const sessionPlan = sessionStorage.getItem("pendingUpgradePlan");
    if (sessionPlan) {
      try {
        const parsed = JSON.parse(sessionPlan);
        console.log("Found plan in sessionStorage:", parsed);
        return parsed;
      } catch (e) {
        console.error("Error parsing session plan:", e);
      }
    }
    
    // Finally check localStorage
    const localPlan = localStorage.getItem("pendingUpgradePlan");
    if (localPlan) {
      try {
        const parsed = JSON.parse(localPlan);
        console.log("Found plan in localStorage:", parsed);
        return parsed;
      } catch (e) {
        console.error("Error parsing local plan:", e);
      }
    }
    
    console.log("No plan found");
    return null;
  });

  const redirectTo = location.state?.redirectTo || null;
  const requirePlan = location.state?.requirePlan ?? false; // ✅ Safe fallback
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Run this only if requirePlan is true
  useEffect(() => {
    console.log("=== SIGNIN USE EFFECT ===");
    console.log("requirePlan:", requirePlan);
    console.log("selectedPlan:", selectedPlan);
    
    if (requirePlan && !selectedPlan) {
      toast.error("No plan selected. Redirecting to pricing...", { duration: 5000 });
      navigate("/pricing", { replace: true });
    }
  }, [requirePlan, selectedPlan, navigate]);

  const handleBack = () => {
    if (selectedPlan) {
      navigate("/pricing", { state: { plan: selectedPlan }, replace: true });
    } else {
      navigate("/pricing", { replace: true });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    console.log("=== LOGIN PROCESS START ===");
    console.log("Email:", email);
    console.log("Selected plan:", selectedPlan);
    console.log("Redirect to:", redirectTo);

    // Validate inputs before sending
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      toast.error("Email and password are required");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting login with:", { email: email.trim() });
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim(), 
          password: password.trim() 
        }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        // Try to get more detailed error message
        let errorMessage = "Login failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error("Server error response:", errorData);
        } catch (e) {
          console.error("Could not parse error response");
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Login successful, received data:", data);
      
      // Check if token exists in response
      if (!data.token) {
        throw new Error("No authentication token received from server");
      }

      const token = data.token;
      localStorage.setItem("authToken", token);
      sessionStorage.setItem("authToken", token);

      toast.success("Login successful!");

      // Determine where to redirect after login
      if (redirectTo) {
        if (redirectTo === "/payment") {
          console.log("Redirecting to payment with plan");
          navigate("/payment", { state: { plan: selectedPlan }, replace: true });
        } else {
          console.log("Redirecting to:", redirectTo);
          navigate(redirectTo, { replace: true });
        }
      } else if (selectedPlan) {
        console.log("Redirecting to payment with plan");
        navigate("/payment", { state: { plan: selectedPlan }, replace: true });
      } else {
        console.log("Redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      }

      // Clean up stored plan data after successful login
      localStorage.removeItem("pendingUpgradePlan");
      sessionStorage.removeItem("pendingUpgradePlan");
      
      console.log("=== LOGIN PROCESS END ===");
      
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please try again.");
      toast.error(error.message || "Login failed. Please try again.");
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
        {/* Back button */}
        <button
          type="button"
          onClick={handleBack}
          className="absolute top-4 left-4 text-[#c2831f] hover:text-[#dba743] flex items-center text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </button>

        <h2 className="text-2xl font-bold text-[#c2831f] mb-6 mt-2">Sign In</h2>

        {selectedPlan && (
          <div className="mb-6 p-4 bg-gray-700 rounded-lg border-l-4 border-[#c2831f]">
            <p className="text-gray-300 text-sm mb-1">Selected Plan:</p>
            <p className="text-[#c2831f] font-semibold text-lg">
              {selectedPlan.planName || selectedPlan.name || "Selected Plan"}
            </p>
            {selectedPlan.basePrice && (
              <p className="text-gray-300 text-sm mt-1">
                ${selectedPlan.basePrice.toFixed(2)}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg">{error}</div>
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
            <Link to="/signup" className="text-[#c2831f] hover:underline font-medium">
              Sign up
            </Link>
          </p>
          <p className="mt-2">
            <Link to="/forgot-password" className="text-[#c2831f] hover:underline">
              Forgot password?
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}