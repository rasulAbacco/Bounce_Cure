// client/src/pages/Pricing/Signin.jsx
import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../../components/UserContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Zap, Users, CheckCircle } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

const Signin = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    
    const [focusedField, setFocusedField] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useContext(UserContext);
    
    // Get redirect path from location state or default to pricing
    const from = location.state?.redirectTo || '/pricingdash';
    
    // Get plan details from location state if available
    const planDetails = location.state?.plan;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json().catch(err => {
                console.error("JSON parse error:", err);
                return {};
            });

            if (res.ok && data.token) {
                // Store token securely
                localStorage.setItem("token", data.token);
                
                // Update user context with plan information
                if (data.user) {
                    setUser({
                        id: data.user.id,
                        name: data.user.name || "",
                        email: data.user.email || "",
                        profileImage: "",
                        plan: data.user.plan || "Free",
                        hasPurchasedBefore: data.user.hasPurchasedBefore || false,
                        contactLimit: data.user.contactLimit || 500,
                        emailLimit: data.user.emailLimit || 1000
                    });
                    
                    // Store user info in localStorage
                    localStorage.setItem("userName", data.user.name || "");
                    localStorage.setItem("userEmail", data.user.email || "");
                    localStorage.setItem("userPlan", data.user.plan || "Free");
                    localStorage.setItem("hasPurchasedBefore", (data.user.hasPurchasedBefore || false).toString());
                    localStorage.setItem("contactLimit", (data.user.contactLimit || 500).toString());
                    localStorage.setItem("emailLimit", (data.user.emailLimit || 1000).toString());
                }
                
                toast.success("Login successful! 🎉");
                console.log("Token saved, redirecting to:", from);
                navigate(from, { replace: true });
                window.location.reload();
            } else {
                // Clear any old token to avoid using stale credentials
                localStorage.removeItem("token");
                setError(data.message || "Login failed");
                toast.error(data.message || "Login failed");
            }
        } catch (err) {
            console.error("Error:", err);
            setError("Something went wrong!");
            toast.error("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { icon: <Users className="w-6 h-6" />, number: "400K+", label: "Active Users" },
        { icon: <CheckCircle className="w-6 h-6" />, number: "99.9%", label: "Accuracy Rate" },
        { icon: <Zap className="w-6 h-6" />, number: "<2s", label: "Response Time" },
        { icon: <Shield className="w-6 h-6" />, number: "100%", label: "Secure" }
    ];

    const testimonials = [
        {
            quote: "Bounce Cure transformed our email campaigns with 99% accuracy.",
            author: "Sarah Chen",
            company: "TechStart Inc"
        },
        {
            quote: "The fastest and most reliable email validation service we've used.",
            author: "Michael Rodriguez",
            company: "Digital Marketing Pro"
        },
        {
            quote: "Saved us thousands in email costs with precise validation.",
            author: "Emma Thompson",
            company: "E-commerce Solutions"
        }
    ];

    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <PageLayout>
            <div className="min-h-screen mt-[5%] sm:mt-0 flex flex-col md:flex-row w-full">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-difference filter blur-xl opacity-3 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full mix-blend-difference filter blur-xl opacity-3 animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full mix-blend-difference filter blur-xl opacity-2 animate-pulse"></div>
                </div>

                {/* Left Side */}
                <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative z-10 mt-[5%]">
                    <div className="w-full max-w-lg text-center md:text-left">
                        {/* Welcome Section */}
                        <div className="mb-8 sm:mb-12 mt-8 md:mt-0">
                            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-3xl mb-6 sm:mb-8 transform hover:scale-110 transition-transform duration-300">
                                <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-[#dea923]" />
                            </div>
                            <h1 className="text-3xl sm:text-5xl font-bold text-[#c2831f] mb-3 sm:mb-4 leading-tight">
                                Welcome Back to
                                <br />
                                <span className="block mt-2">Bounce Cure</span>
                            </h1>
                            <p className="text-base sm:text-xl text-gray-300 leading-relaxed">
                                Sign in to access your account and upgrade to a premium plan with exclusive features.
                            </p>
                        </div>

                        
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative z-10">
                    <div className="w-full max-w-md">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
                            {/* Header */}
                            <div className="text-center mb-6 sm:mb-8">
                                <h2 className="text-2xl sm:text-3xl font-bold text-[#c2831f] mb-2">
                                    Sign In to Upgrade
                                </h2>
                                <p className="text-gray-300 text-sm sm:text-base">
                                    Access your account to purchase a premium plan
                                </p>
                                
                                {/* Selected Plan Display */}
                                {planDetails && (
                                    <div className="mt-4 bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-gray-400">Selected Plan</p>
                                                <p className="text-lg font-bold text-white">{planDetails.planName}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400">Price</p>
                                                <p className="text-lg font-bold text-[#c2831f]">
                                                    ${planDetails.basePrice.toFixed(2)}
                                                    <span className="text-sm text-gray-400 font-normal">
                                                        /{planDetails.billingPeriod === 'year' ? 'year' : 'month'}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* {planDetails.discountApplied && (
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-xs text-green-400">New Customer Discount (50%)</span>
                                                <span className="text-xs text-green-400">
                                                    Save ${planDetails.discountAmount.toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-xs text-gray-400">Contacts</span>
                                            <span className="text-xs text-white">
                                                {planDetails.contactCount === Infinity ? 'Unlimited' : planDetails.contactCount.toLocaleString()}
                                            </span>
                                        </div> */}
                                    </div>
                                )}
                                
                                <div className="w-12 sm:w-16 h-1 bg-white mx-auto mt-3 sm:mt-4 rounded-full"></div>
                            </div>

                            {error && (
                                <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 text-red-200 text-sm mb-6">
                                    {error}
                                </div>
                            )}

                            {/* Google Button */}
                            <button
                                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-2 sm:py-3 px-4 text-white font-medium flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all duration-300 mb-6 group"
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
                                <div className="w-5 h-5 bg-[#c2831f] rounded-full flex items-center justify-center group-hover:bg-black transition-colors duration-300">
                                    <span className="text-xs font-bold text-black group-hover:text-white">G</span>
                                </div>
                                <span className={`transition-transform text-[#c2831f] duration-300 ${isHovered ? 'translate-x-1' : ''}`}>
                                    Continue with Google
                                </span>
                            </button>

                            {/* Divider */}
                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-600"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-black/50 text-gray-400">or sign in with email</span>
                                </div>
                            </div>

                            {/* Login Form */}
                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                <div className="relative group">
                                    <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-white' : 'text-gray-400'}`} />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField('')}
                                        className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl py-2 sm:py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300"
                                        required
                                    />
                                </div>

                                <div className="relative group">
                                    <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'password' ? 'text-white' : 'text-gray-400'}`} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField('')}
                                        className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl py-2 sm:py-3 pl-10 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Remember Me & Forgot Password */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="sr-only"
                                            />
                                            <div className={`w-5 h-5 border-2 border-white/20 rounded transition-all duration-300 ${rememberMe ? 'bg-white border-white' : 'group-hover:border-white/40'}`}>
                                                {rememberMe && (
                                                    <CheckCircle className="w-3 h-3 text-black absolute top-0.5 left-0.5" />
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-gray-300 text-sm group-hover:text-white transition-colors duration-300">
                                            Remember me
                                        </span>
                                    </label>

                                    <a href="/forgot-password" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">
                                        Forgot password?
                                    </a>
                                </div>

                                {/* Sign In Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#c2831f] text-black font-bold py-2 sm:py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-white/25 hover:bg-gray-100 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-t-2 border-black border-solid rounded-full animate-spin"></div>
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            <span>Sign In</span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Sign Up Link */}
                            <p className="text-center text-gray-400 mt-6 text-sm sm:text-base">
                                Don't have an account?{' '}
                                <a href="/signupd" className="text-[#c2831f] hover:text-gray-300 transition-colors duration-300 underline font-medium">
                                    Create free account
                                </a>
                            </p>
                        </div>

                        {/* Security Badge */}
                        <div className="mt-6 text-center">
                            <div className="inline-flex items-center gap-2 text-gray-400 bg-white/5 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 border border-white/10 text-xs sm:text-sm">
                                <Shield className="w-4 h-4" />
                                <span>256-bit SSL secured</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default Signin;