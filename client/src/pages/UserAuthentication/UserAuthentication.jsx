import React, { createContext, useContext, useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";

const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  function saveUser(userData) {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }

  function login(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockUser = {
          email: "user@example.com",
          name: "John Doe",
          verified: false,
        };

        if (email === mockUser.email && password === "password123") {
          if (!mockUser.verified) {
            reject(
              "Email not verified. Please verify your email before logging in."
            );
            return;
          }
          saveUser(mockUser);
          resolve(mockUser);
        } else {
          reject("Invalid email or password");
        }
      }, 1000);
    });
  }

  function register(name, email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email.includes("@")) {
          reject("Invalid email");
        } else if (password.length < 6) {
          reject("Password must be at least 6 characters");
        } else {
          const userData = { email, name, verified: false };
          saveUser(userData);
          resolve(userData);
        }
      }, 1000);
    });
  }

  function forgotPassword(email) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email.includes("@")) {
          resolve("Password reset link sent to your email.");
        } else {
          reject("Please enter a valid email.");
        }
      }, 1000);
    });
  }

  function sendVerificationEmail() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("Verification email sent! Please check your inbox.");
      }, 1500);
    });
  }

  function verifyEmail() {
    if (user) {
      const updatedUser = { ...user, verified: true };
      saveUser(updatedUser);
    }
  }

  function updateDetails(newName, newEmail) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!newEmail.includes("@")) {
          reject("Invalid email");
          return;
        }
        const updatedUser = { ...user, name: newName };
        if (newEmail !== user.email) {
          updatedUser.email = newEmail;
          updatedUser.verified = false;
        }
        saveUser(updatedUser);
        resolve(updatedUser);
      }, 1000);
    });
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("user");
  }

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        forgotPassword,
        loading,
        sendVerificationEmail,
        verifyEmail,
        updateDetails,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

function useUser() {
  return useContext(UserContext);
}

// All forms shown simultaneously with tabs
function Auth() {
  const { user, logout, sendVerificationEmail, verifyEmail } = useUser();
  const [activeTab, setActiveTab] = useState("login");
  const [message, setMessage] = useState("");

  // Email verification resend logic if logged in and unverified
  const handleSendVerification = async () => {
    setMessage("");
    try {
      const res = await sendVerificationEmail();
      setMessage(res);
      setTimeout(() => {
        verifyEmail();
        setMessage(
          "Email verified successfully! Please logout and login again."
        );
      }, 3000);
    } catch {
      setMessage("Failed to send verification email.");
    }
  };

  if (user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a1a2f] px-6 py-10 text-white max-w-md mx-auto">
        <h1 className="text-3xl mb-6 text-center">Welcome, {user.name}!</h1>

        {!user.verified && (
          <div className="mb-6 p-4 bg-yellow-600 rounded text-center w-full">
            Your email is not verified.
            <button
              onClick={handleSendVerification}
              className="ml-2 px-3 py-1 bg-[#EAA64D] rounded hover:bg-[#d18b3d] text-[#0a1a2f] font-semibold transition"
            >
              Send Verification Email
            </button>
            {message && <p className="mt-2 text-sm">{message}</p>}
          </div>
        )}

        {user.verified && <ProfileUpdate onLogout={logout} />}

        <button
          onClick={logout}
          className="mt-8 bg-[#EAA64D] px-6 py-2 rounded font-semibold text-[#0a1a2f] hover:bg-[#d18b3d] transition"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen px-6 py-10 text-white flex flex-col items-center">
        <div className="max-w-4xl w-full bg-gradient-to-br from-[#12263f] to-[#0a1a2f] rounded-lg shadow-lg p-8 border border-white flex gap-8">
          <nav className="flex flex-col gap-4 min-w-[150px]">
            {["login", "register", "forgot", "profile"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 rounded text-left hover:bg-[#154c7c] transition ${
                  activeTab === tab ? "bg-[#EAA64D] text-[#0a1a2f]" : ""
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>

          <div className="flex-1">
            <div className={`${activeTab === "login" ? "block" : "hidden"}`}>
              <LoginForm />
            </div>
            <div className={`${activeTab === "register" ? "block" : "hidden"}`}>
              <RegisterForm />
            </div>
            <div className={`${activeTab === "forgot" ? "block" : "hidden"}`}>
              <ForgotPasswordForm />
            </div>
            <div className={`${activeTab === "profile" ? "block" : "hidden"}`}>
              <ProfileUpdate onLogout={() => {}} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Login Form
function LoginForm() {
  const { login } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-white text-center">Login</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          className="w-full px-4 py-2 rounded bg-[#0f2036] text-white border border-gray-600 focus:border-white outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
        />
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            required
            placeholder="Password"
            className="w-full px-4 py-2 rounded bg-[#0f2036] text-white border border-gray-600 focus:border-white outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200 transition"
          >
            {showPass ? "Hide" : "Show"}
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#EAA64D] hover:bg-[#d18b3d] text-[#0a1a2f] font-semibold py-2 rounded transition disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </>
  );
}

// Register Form
function RegisterForm() {
  const { register } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-white text-center">Register</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          required
          placeholder="Full Name"
          className="w-full px-4 py-2 rounded bg-[#0f2036] text-white border border-gray-600 focus:border-white outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
        <input
          type="email"
          required
          placeholder="Email"
          className="w-full px-4 py-2 rounded bg-[#0f2036] text-white border border-gray-600 focus:border-white outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            required
            placeholder="Password"
            className="w-full px-4 py-2 rounded bg-[#0f2036] text-white border border-gray-600 focus:border-white outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200 transition"
          >
            {showPass ? "Hide" : "Show"}
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#EAA64D] hover:bg-[#d18b3d] text-[#0a1a2f] font-semibold py-2 rounded transition disabled:opacity-60"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </>
  );
}

// Forgot Password Form
function ForgotPasswordForm() {
  const { forgotPassword } = useUser();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setMessage(res);
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-white text-center">
        Forgot Password
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {message && <p className="text-green-500 mb-4">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Enter your email"
          className="w-full px-4 py-2 rounded bg-[#0f2036] text-white border border-gray-600 focus:border-white outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#EAA64D] hover:bg-[#d18b3d] text-[#0a1a2f] font-semibold py-2 rounded transition disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}

// Profile Update Form - fixed top bar with controlled inputs defaulted to current user info
function ProfileUpdate({ onLogout }) {
  const { user, updateDetails } = useUser();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="text-center p-4 text-gray-300">
        Please log in to update your profile.
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await updateDetails(name, email);
      setMessage("Details updated successfully.");
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  }

  return (
    <div className="fixed top-0 left-0 w-full border-b border-white px-6 py-3 flex items-center justify-between shadow-lg z-50">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-4 max-w-4xl mx-auto w-full"
      >
        <input
          type="text"
          placeholder="Full Name"
          className="px-3 py-1 rounded bg-[#0f2036] text-white border border-gray-600 focus:border-white outline-none w-40"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="px-3 py-1 rounded bg-[#0f2036] text-white border border-gray-600 focus:border-white outline-none w-56"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#EAA64D] hover:bg-[#d18b3d] text-[#0a1a2f] font-semibold px-4 py-1 rounded transition disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update"}
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="ml-auto bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-1 rounded transition"
        >
          Logout
        </button>
      </form>

      {(error || message) && (
        <div className="absolute top-full left-0 w-full max-w-4xl mx-auto mt-1 px-4 text-center text-sm">
          {error && <p className="text-red-500">{error}</p>}
          {message && <p className="text-green-500">{message}</p>}
        </div>
      )}
    </div>
  );
}

// App wrapper
export default function App() {
  return (
    <UserProvider>
      <Auth />
    </UserProvider>
  );
}
