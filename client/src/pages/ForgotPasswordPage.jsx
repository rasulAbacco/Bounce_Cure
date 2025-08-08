import React, { useState } from 'react';
import { Mail, ArrowRight, Shield, Clock, CheckCircle, ArrowLeft, RefreshCw, Lock } from 'lucide-react';
import PageLayout from '../components/PageLayout';

const ModernForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState('request'); // 'request' or 'sent'
    const [focusedField, setFocusedField] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setStep('sent');
        }, 2000);
    };

    const handleResend = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 1500);
    };

    const securityFeatures = [
        { icon: <Shield className="w-5 h-5" />, text: "Secure password reset link" },
        { icon: <Clock className="w-5 h-5" />, text: "Link expires in 1 hour for security" },
        { icon: <Lock className="w-5 h-5" />, text: "256-bit SSL encryption" },
        { icon: <CheckCircle className="w-5 h-5" />, text: "Account verification required" }
    ];

    const steps = [
        { step: 1, title: "Enter Email", status: step === 'request' ? 'current' : 'completed' },
        { step: 2, title: "Check Inbox", status: step === 'sent' ? 'current' : step === 'request' ? 'upcoming' : 'completed' },
        { step: 3, title: "Reset Password", status: 'upcoming' }
    ];

    return (
        <PageLayout>
            <div className="min-h-screen bg-black flex w-[100vw]">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-difference filter blur-xl opacity-3 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full mix-blend-difference filter blur-xl opacity-3 animate-pulse"></div>
                    <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-white rounded-full mix-blend-difference filter blur-xl opacity-2 animate-pulse"></div>
                </div>

                {/* Left Side - Information & Steps */}
                <div className="flex-1 flex items-center justify-center p-8 relative z-10">
                    <div className="w-full max-w-lg">
                        {/* Header Section */}
                        <div className="mb-12">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl mb-8 transform hover:scale-110 transition-transform duration-300">
                                <Lock className="w-10 h-10 text-black" />
                            </div>
                            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                                Password
                                <br />
                                <span className="block mt-2">Recovery</span>
                            </h1>
                            <p className="text-xl text-gray-300 leading-relaxed">
                                Secure account recovery made simple. We'll help you regain access to your Bounce Cure dashboard safely.
                            </p>
                        </div>

                        {/* Process Steps */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
                            <h3 className="text-white font-semibold mb-6 text-lg">Recovery Process</h3>
                            <div className="space-y-4">
                                {steps.map((stepItem, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${stepItem.status === 'completed'
                                            ? 'bg-white text-black'
                                            : stepItem.status === 'current'
                                                ? 'bg-white/20 text-white border-2 border-white'
                                                : 'bg-white/10 text-gray-400 border border-white/20'
                                            }`}>
                                            {stepItem.status === 'completed' ? (
                                                <CheckCircle className="w-4 h-4" />
                                            ) : (
                                                stepItem.step
                                            )}
                                        </div>
                                        <div className={`transition-colors duration-300 ${stepItem.status === 'current' ? 'text-white font-medium' :
                                            stepItem.status === 'completed' ? 'text-gray-300' : 'text-gray-500'
                                            }`}>
                                            {stepItem.title}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Security Features */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Security First
                            </h3>
                            <div className="space-y-3">
                                {securityFeatures.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors duration-300"
                                    >
                                        <div className="text-white">
                                            {feature.icon}
                                        </div>
                                        <span className="text-sm">{feature.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute top-16 left-16 w-20 h-20 border border-white/5 rounded-full animate-pulse"></div>
                        <div className="absolute bottom-16 right-16 w-12 h-12 border border-white/10 rounded-full animate-pulse"></div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="flex-1 flex items-center justify-center p-8 relative z-10">
                    <div className="w-full max-w-md">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">

                            {step === 'request' && (
                                <>
                                    {/* Header */}
                                    <div className="text-center mb-8">
                                        <h2 className="text-3xl font-bold text-white mb-2">
                                            Reset Password
                                        </h2>
                                        <p className="text-gray-300">
                                            Enter your email to receive a reset link
                                        </p>
                                        <div className="w-16 h-1 bg-white mx-auto mt-4 rounded-full"></div>
                                    </div>

                                    {/* Form */}
                                    <div className="space-y-6">
                                        <div className="relative group">
                                            <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-white' : 'text-gray-400'
                                                }`} />
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="Enter your email address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                onFocus={() => setFocusedField('email')}
                                                onBlur={() => setFocusedField('')}
                                                className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300"
                                                required
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!email || isLoading}
                                            className="w-full bg-white text-black font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-white/25 hover:bg-gray-100 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                                    <span>Sending...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Send Reset Link</span>
                                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                                </>
                                            )}
                                        </button>

                                        {/* Help Text */}
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                            <p className="text-gray-300 text-sm">
                                                <span className="text-white font-medium">Having trouble?</span> Make sure you enter the email address associated with your Bounce Cure account.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 'sent' && (
                                <>
                                    {/* Success Header */}
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-6">
                                            <CheckCircle className="w-8 h-8 text-black" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-white mb-2">
                                            Check Your Email
                                        </h2>
                                        <p className="text-gray-300">
                                            We've sent a password reset link to
                                        </p>
                                        <p className="text-white font-medium mt-1">{email}</p>
                                        <div className="w-16 h-1 bg-white mx-auto mt-4 rounded-full"></div>
                                    </div>

                                    {/* Instructions */}
                                    <div className="space-y-6">
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                            <h3 className="text-white font-medium mb-3">Next Steps:</h3>
                                            <ol className="text-gray-300 text-sm space-y-2">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-white font-bold">1.</span>
                                                    Check your email inbox (and spam folder)
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-white font-bold">2.</span>
                                                    Click the reset link in the email
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-white font-bold">3.</span>
                                                    Create your new secure password
                                                </li>
                                            </ol>
                                        </div>

                                        {/* Timer */}
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                                            <Clock className="w-5 h-5 text-white mx-auto mb-2" />
                                            <p className="text-gray-300 text-sm">
                                                Link expires in <span className="text-white font-medium">60 minutes</span>
                                            </p>
                                        </div>

                                        {/* Resend Button */}
                                        <button
                                            onClick={handleResend}
                                            disabled={isLoading}
                                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-white font-medium flex items-center justify-center gap-2 hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                                    <span>Resending...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="w-5 h-5" />
                                                    <span>Resend Email</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Back to Login */}
                            <div className="mt-8 text-center">
                                <a
                                    href="/login"
                                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 group"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                                    <span>Back to Sign In</span>
                                </a>
                            </div>
                        </div>

                        {/* Security Badge */}
                        <div className="mt-6 text-center">
                            <div className="inline-flex items-center gap-2 text-gray-400 bg-white/5 rounded-full px-4 py-2 border border-white/10">
                                <Shield className="w-4 h-4" />
                                <span className="text-sm">Secure password recovery</span>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute top-8 right-8 w-16 h-16 border border-white/5 rounded-full animate-pulse"></div>
                        <div className="absolute bottom-8 left-8 w-10 h-10 border border-white/10 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default ModernForgotPassword;