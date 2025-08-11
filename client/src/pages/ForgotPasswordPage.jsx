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
            <div className="min-h-screen bg-black flex flex-col md:flex-row w-full">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-difference filter blur-xl opacity-3 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full mix-blend-difference filter blur-xl opacity-3 animate-pulse"></div>
                    <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-white rounded-full mix-blend-difference filter blur-xl opacity-2 animate-pulse"></div>
                </div>

                {/* Left Side */}
                <div className="flex-1 flex items-center justify-center p-6 sm:p-8  relative z-10">
                    <div className="w-full max-w-lg text-center md:text-left">
                        {/* Header */}
                        <div className="mb-8 sm:mb-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-3xl mb-6 sm:mb-8 transform hover:scale-110 transition-transform duration-300">
                                <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-black" />
                            </div>
                            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                                Password
                                <br />
                                <span className="block mt-1 sm:mt-2">Recovery</span>
                            </h1>
                            <p className="text-base sm:text-xl text-gray-300 leading-relaxed">
                                Secure account recovery made simple. We'll help you regain access to your Bounce Cure dashboard safely.
                            </p>
                        </div>

                        {/* Steps */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 mb-6 sm:mb-8">
                            <h3 className="text-white font-semibold mb-4 sm:mb-6 text-base sm:text-lg">Recovery Process</h3>
                            <div className="space-y-3 sm:space-y-4">
                                {steps.map((stepItem, index) => (
                                    <div key={index} className="flex items-center gap-3 sm:gap-4">
                                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${stepItem.status === 'completed'
                                            ? 'bg-white text-black'
                                            : stepItem.status === 'current'
                                                ? 'bg-white/20 text-white border-2 border-white'
                                                : 'bg-white/10 text-gray-400 border border-white/20'
                                            }`}>
                                            {stepItem.status === 'completed' ? (
                                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                            ) : (
                                                stepItem.step
                                            )}
                                        </div>
                                        <div className={`transition-colors duration-300 text-sm sm:text-base ${stepItem.status === 'current' ? 'text-white font-medium' :
                                            stepItem.status === 'completed' ? 'text-gray-300' : 'text-gray-500'
                                            }`}>
                                            {stepItem.title}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Security */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
                            <h3 className="text-white font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                                Security First
                            </h3>
                            <div className="space-y-2 sm:space-y-3">
                                {securityFeatures.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 sm:gap-3 text-gray-300 hover:text-white transition-colors duration-300"
                                    >
                                        <div className="text-white">
                                            {feature.icon}
                                        </div>
                                        <span className="text-xs sm:text-sm">{feature.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative z-10">
                    <div className="w-full max-w-md">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
                            {step === 'request' && (
                                <>
                                    <div className="text-center mb-6 sm:mb-8">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                                            Reset Password
                                        </h2>
                                        <p className="text-gray-300 text-sm sm:text-base">
                                            Enter your email to receive a reset link
                                        </p>
                                        <div className="w-12 sm:w-16 h-1 bg-white mx-auto mt-3 sm:mt-4 rounded-full"></div>
                                    </div>

                                    <div className="space-y-5 sm:space-y-6">
                                        <div className="relative group">
                                            <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-white' : 'text-gray-400'
                                                }`} />
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="Enter your email address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                onFocus={() => setFocusedField('email')}
                                                onBlur={() => setFocusedField('')}
                                                className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-4 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300"
                                                required
                                            />
                                        </div>

                                        <button
                                            onClick={handleSubmit}
                                            disabled={!email || isLoading}
                                            className="w-full bg-white text-black font-bold py-2.5 sm:py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-white/25 hover:bg-gray-100 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                                    <span>Sending...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Send Reset Link</span>
                                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                                </>
                                            )}
                                        </button>

                                        <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10 text-xs sm:text-sm">
                                            <p className="text-gray-300">
                                                <span className="text-white font-medium">Having trouble?</span> Make sure you enter the email address associated with your Bounce Cure account.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 'sent' && (
                                <>
                                    <div className="text-center mb-6 sm:mb-8">
                                        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl mb-4 sm:mb-6">
                                            <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-black" />
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                                            Check Your Email
                                        </h2>
                                        <p className="text-gray-300 text-sm sm:text-base">
                                            We've sent a password reset link to
                                        </p>
                                        <p className="text-white font-medium mt-1 text-sm sm:text-base">{email}</p>
                                        <div className="w-12 sm:w-16 h-1 bg-white mx-auto mt-3 sm:mt-4 rounded-full"></div>
                                    </div>

                                    <div className="space-y-5 sm:space-y-6">
                                        <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10 text-xs sm:text-sm">
                                            <h3 className="text-white font-medium mb-2 sm:mb-3">Next Steps:</h3>
                                            <ol className="text-gray-300 space-y-1.5 sm:space-y-2">
                                                <li className="flex items-start gap-1.5 sm:gap-2">
                                                    <span className="text-white font-bold">1.</span>
                                                    Check your email inbox (and spam folder)
                                                </li>
                                                <li className="flex items-start gap-1.5 sm:gap-2">
                                                    <span className="text-white font-bold">2.</span>
                                                    Click the reset link in the email
                                                </li>
                                                <li className="flex items-start gap-1.5 sm:gap-2">
                                                    <span className="text-white font-bold">3.</span>
                                                    Create your new secure password
                                                </li>
                                            </ol>
                                        </div>

                                        <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10 text-center text-xs sm:text-sm">
                                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white mx-auto mb-1.5 sm:mb-2" />
                                            <p className="text-gray-300">
                                                Link expires in <span className="text-white font-medium">60 minutes</span>
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleResend}
                                            disabled={isLoading}
                                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-2.5 sm:py-3 px-4 text-white font-medium flex items-center justify-center gap-2 hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                                    <span>Resending...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    <span>Resend Email</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}

                            <div className="mt-6 sm:mt-8 text-center">
                                <a
                                    href="/login"
                                    className="inline-flex items-center gap-1.5 sm:gap-2 text-gray-400 hover:text-white transition-colors duration-300 group text-xs sm:text-sm"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                                    <span>Back to Sign In</span>
                                </a>
                            </div>
                        </div>

                        <div className="mt-4 sm:mt-6 text-center">
                            <div className="inline-flex items-center gap-1.5 sm:gap-2 text-gray-400 bg-white/5 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 border border-white/10 text-xs sm:text-sm">
                                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span>Secure password recovery</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default ModernForgotPassword;
