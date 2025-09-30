import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Wallet, Shield, CheckCircle } from 'lucide-react';

export default function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedPayment, setSelectedPayment] = useState("stripe");
    const [plan, setPlan] = useState(null);


    

    useEffect(() => {
        const incomingPlan = location.state?.plan;
        if (incomingPlan) {
            setPlan(incomingPlan);
        } else {
            const storedPlan = localStorage.getItem("pendingUpgradePlan");
            if (storedPlan) {
                setPlan(JSON.parse(storedPlan));
            } else {
                navigate("/pricing");
            }
        }
    }, [location.state, navigate]);

    const handlePay = () => {
        navigate(`/${selectedPayment}`);
    };

    const calculateTax = (amount) => +(amount * 0.10).toFixed(2);
    const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

    const paymentMethods = [
        { id: "creditcard", name: "Credit Card", icon: CreditCard },
        { id: "razorpay", name: "Razorpay", icon: Wallet },
        { id: "stripe", name: "Stripe", icon: Shield },
        { id: "UPI", name: "UPI", icon: Wallet }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
                <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 flex items-center justify-center py-12 px-4">
                <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl">
                    {/* Left Panel - Payment Details */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 w-full lg:w-3/5 border border-slate-700/50 shadow-2xl">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Complete Your Purchase
                            </h2>
                            <p className="text-slate-400">
                                You're just a step away from unlocking <span className="text-blue-400 font-semibold">{plan?.planName || 'Pro Plan'}</span>
                            </p>
                        </div>

                        {/* Email Input */}
                        <div className="mb-6">
                            <label className="text-sm font-medium text-slate-300 mb-2 block">
                                Email Address <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="email"
                                defaultValue="rasulpanari01@gmail.com"
                                className="w-full p-4 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Promotional Banner */}
                        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold py-4 px-6 rounded-xl mb-8 text-center shadow-lg">
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-2xl">🎉</span>
                                <span>50% off for 12 months!</span>
                            </div>
                            <p className="text-sm mt-1 font-normal">Special discount for {plan?.planName || 'Pro Plan'} users</p>
                        </div>

                        {/* Payment Methods */}
                        <div className="mb-8">
                            <p className="text-sm font-medium text-slate-300 mb-4">Select Payment Method:</p>
                            <div className="grid grid-cols-2 gap-4">
                                {paymentMethods.map(method => {
                                    const Icon = method.icon;
                                    return (
                                        <button
                                            key={method.id}
                                            onClick={() => setSelectedPayment(method.id)}
                                            className={`py-4 px-6 rounded-xl font-semibold transition-all duration-300 border-2 flex items-center justify-center gap-3 group hover:scale-105 ${selectedPayment === method.id
                                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-500 shadow-lg shadow-blue-500/50'
                                                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                                }`}
                                        >
                                            <Icon size={20} className={selectedPayment === method.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'} />
                                            <span>{method.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-950/30 border border-blue-800/30 text-blue-300 p-4 rounded-xl flex items-start gap-3">
                            <Shield size={20} className="mt-0.5 flex-shrink-0" />
                            <p className="text-sm">
                                You will be redirected to the selected payment gateway to complete your payment securely.
                            </p>
                        </div>
                    </div>

                    {/* Right Panel - Order Summary */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 w-full lg:w-2/5 border border-slate-700/50 shadow-2xl h-fit">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <CheckCircle size={24} className="text-green-400" />
                            Order Summary
                        </h3>

                        <div className="space-y-4 mb-6">
                            {plan ? (
                                <>
                                    <div className="flex justify-between text-slate-300">
                                        <span>Plan:</span>
                                        <span className="font-semibold text-white">{plan.planName}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-300">
                                        <span>Slots/Contacts:</span>
                                        <span className="font-semibold text-white">{plan.slots}</span>
                                    </div>
                                    <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-4"></div>
                                    <div className="flex justify-between text-slate-300">
                                        <span>Base Price:</span>
                                        <span className="font-semibold text-white">{formatCurrency(plan.basePrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-300">
                                        <span>Subtotal:</span>
                                        <span className="font-semibold text-white">{formatCurrency(plan.totalCost)}</span>
                                    </div>
                                    <div className="flex justify-between text-green-400">
                                        <span>Discount:</span>
                                        <span className="font-semibold">– {formatCurrency(plan.additionalSlotsCost)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-300">
                                        <span>Tax (10%):</span>
                                        <span className="font-semibold text-white">{formatCurrency(calculateTax(plan.totalCost))}</span>
                                    </div>
                                    <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent my-4"></div>
                                    <div className="flex justify-between text-xl font-bold">
                                        <span>Total:</span>
                                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                            {formatCurrency(plan.totalCost + calculateTax(plan.totalCost))}
                                        </span>
                                    </div>
                                    <div className="bg-green-950/30 border border-green-800/30 text-green-300 p-3 rounded-lg mt-4">
                                        <p className="text-sm font-medium">
                                            💰 You're saving {formatCurrency(plan.basePrice - plan.totalCost)} with this offer!
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                                    <p className="mt-4 text-slate-400">Loading plan details...</p>
                                </div>
                            )}
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start gap-3 mb-6 p-4 bg-slate-900/50 rounded-lg">
                            <input
                                type="checkbox"
                                className="mt-1 w-4 h-4 accent-blue-500"
                                defaultChecked
                            />
                            <label className="text-sm text-slate-300">
                                I agree to the{' '}
                                <a href="#" className="text-blue-400 hover:text-blue-300 underline">Terms of Service</a>
                                {' '}and{' '}
                                <a href="#" className="text-blue-400 hover:text-blue-300 underline">Privacy Policy</a>
                            </label>
                        </div>

                        {/* Pay Button */}
                        <button
                            onClick={handlePay}
                            disabled={!plan}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105"
                        >
                            {plan ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Shield size={20} />
                                    Pay {formatCurrency(plan.totalCost + calculateTax(plan.totalCost))} with {selectedPayment.charAt(0).toUpperCase() + selectedPayment.slice(1)}
                                </span>
                            ) : (
                                'Loading...'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}