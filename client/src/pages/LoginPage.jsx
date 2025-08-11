import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Zap, Users, CheckCircle } from 'lucide-react';
import PageLayout from '../components/PageLayout';

const ModernLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [focusedField, setFocusedField] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
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
            <div className="min-h-screen bg-black flex w-[100vw]">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-difference filter blur-xl opacity-3 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full mix-blend-difference filter blur-xl opacity-3 animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full mix-blend-difference filter blur-xl opacity-2 animate-pulse"></div>
                </div>

                {/* Left Side - Welcome & Stats */}
                <div className="flex-1 flex items-center justify-center p-8 relative z-10">
                    <div className="w-full max-w-lg">
                        {/* Welcome Section */}
                        <div className="mb-12">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl mb-8 transform hover:scale-110 transition-transform duration-300">
                                <Mail className="w-10 h-10 text-[#dea923]" />
                            </div>
                            <h1 className="text-5xl font-bold text-[#c2831f] mb-4 leading-tight">
                                Welcome Back to
                                <br />
                                <span className="block mt-2">Bounce Cure</span>
                            </h1>
                            <p className="text-xl text-gray-300 leading-relaxed">
                                The world's most trusted email validation platform. Continue your journey with precision and reliability.
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                                >
                                    <div className="text-[#c2831f] group-hover:scale-110 transition-transform duration-300 mb-3">
                                        {stat.icon}
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                                    <div className="text-gray-400 text-sm">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Testimonial Carousel */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 relative overflow-hidden">
                            <div className="absolute top-4 right-4">
                                <div className="flex gap-2">
                                    {testimonials.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentTestimonial ? 'bg-white' : 'bg-white/20'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="transition-all duration-500 ease-in-out">
                                <p className="text-white text-lg mb-4 italic">
                                    "{testimonials[currentTestimonial].quote}"
                                </p>
                                <div className="text-gray-300">
                                    <div className="font-semibold">{testimonials[currentTestimonial].author}</div>
                                    <div className="text-sm text-gray-400">{testimonials[currentTestimonial].company}</div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute top-20 left-20 w-24 h-24 border border-white/5 rounded-full animate-pulse"></div>
                        <div className="absolute bottom-20 right-20 w-16 h-16 border border-white/10 rounded-full animate-pulse"></div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="flex-1 flex items-center justify-center p-8 relative z-10">
                    <div className="w-full max-w-md">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-[#c2831f] mb-2">
                                    Sign In
                                </h2>
                                <p className="text-gray-300">
                                    Access your email validation dashboard
                                </p>
                                <div className="w-16 h-1 bg-white mx-auto mt-4 rounded-full"></div>
                            </div>

                            {/* Google Button */}
                            <button
                                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-white font-medium flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all duration-300 mb-6 group"
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
                            <div className="space-y-6">
                                <div className="relative group">
                                    <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-white' : 'text-gray-400'
                                        }`} />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField('')}
                                        className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300"
                                    />
                                </div>

                                <div className="relative group">
                                    <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'password' ? 'text-white' : 'text-gray-400'
                                        }`} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField('')}
                                        className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl py-3 pl-10 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300"
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
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="sr-only"
                                            />
                                            <div className={`w-5 h-5 border-2 border-white/20 rounded transition-all duration-300 ${rememberMe ? 'bg-white border-white' : 'group-hover:border-white/40'
                                                }`}>
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
                                    onClick={(e) => {
                                        e.preventDefault();
                                        console.log('Login submitted:', formData);
                                    }}
                                    className="w-full bg-[#c2831f] text-black font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-white/25 hover:bg-gray-100 flex items-center justify-center gap-2 group"
                                >
                                    <span>Sign In</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                </button>
                            </div>

                            {/* Sign Up Link */}
                            <p className="text-center text-gray-400 mt-6">
                                Don't have an account?{' '}
                                <a href="/signup" className="text-[#c2831f] hover:text-gray-300 transition-colors duration-300 underline font-medium">
                                    Create free account
                                </a>
                            </p>
                        </div>

                        {/* Security Badge */}
                        <div className="mt-6 text-center">
                            <div className="inline-flex items-center gap-2 text-gray-400 bg-white/5 rounded-full px-4 py-2 border border-white/10">
                                <Shield className="w-4 h-4" />
                                <span className="text-sm">256-bit SSL secured</span>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute top-10 right-10 w-20 h-20 border border-white/5 rounded-full animate-pulse"></div>
                        <div className="absolute bottom-10 left-10 w-12 h-12 border border-white/10 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default ModernLogin;