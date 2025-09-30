import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Lock, CheckCircle, AlertCircle, MapPin } from 'lucide-react';

function Stripe() {
    const stripe = useStripe();
    const elements = useElements();
    const location = useLocation();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [line1, setLine1] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [status, setStatus] = useState('');
    const [plan, setPlan] = useState(null);

    useEffect(() => {
        const incomingPlan = location.state?.plan;
        const incomingEmail = location.state?.email;
        const incomingName = location.state?.name;

        if (incomingPlan) setPlan(incomingPlan);
        if (incomingEmail) setEmail(incomingEmail);
        if (incomingName) setName(incomingName);

        if (!incomingPlan) {
            const storedPlan = localStorage.getItem("pendingUpgradePlan");
            if (storedPlan) {
                setPlan(JSON.parse(storedPlan));
            } else {
                navigate("/pricing");
            }
        }
    }, [location.state, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!plan) return;

        const amount = parseFloat((plan.totalCost * 1.10).toFixed(2));
        const userId = 1;

        try {
            const { data } = await axios.post('http://localhost:5000/api/stripe/create-payment-intent', {
                amount,
                email,
                userId,
                planName: plan.planName,
                planType: plan.billingPeriod,
                provider: 'Stripe',
                contacts: plan.slots,
            });

            const result = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name,
                        email,
                        address: {
                            line1,
                            city,
                            country: 'IN',
                            postal_code: postalCode,
                        },
                    },
                },
            });

            if (result.error) {
                setStatus(`❌ ${result.error.message}`);
            } else if (result.paymentIntent.status === 'succeeded') {
                setStatus('✅ Payment successful!');

                const paymentIntent = result.paymentIntent;

                await axios.post('http://localhost:5000/api/stripe/save-payment', {
                    userId,
                    email,
                    name,  // Added here
                    transactionId: paymentIntent.id,
                    planName: plan.planName,
                    planType: plan.billingPeriod,
                    provider: 'Stripe',
                    contacts: plan.slots,
                    amount,
                    currency: paymentIntent.currency,
                    paymentMethod: paymentIntent.payment_method_types[0],
                    cardLast4: paymentIntent.charges?.data[0]?.payment_method_details?.card?.last4 || '',
                    paymentDate: new Date().toISOString(),
                    nextPaymentDate: null,
                    status: paymentIntent.status,
                });
            }
        } catch (error) {
            console.error(error);
            setStatus('❌ Something went wrong. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex justify-center items-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl top-1/3 left-1/4 animate-pulse"></div>
                <div className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl bottom-1/3 right-1/4 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="relative z-10 w-full max-w-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-slate-700/50 space-y-6"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
                        <Shield size={32} />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        {plan ? `Subscribe to ${plan.planName}` : "Loading..."}
                    </h2>
                    <p className="text-slate-400 mt-2">Complete your subscription with Stripe</p>
                </div>

                {/* Plan Summary Card */}
                {plan && (
                    <div className="bg-gradient-to-r from-blue-950/30 to-indigo-950/30 border border-blue-800/30 rounded-xl p-5 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Total Amount</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    ${(plan.totalCost * 1.10).toFixed(2)}
                                </p>
                                <p className="text-slate-400 text-xs mt-1">Including taxes</p>
                            </div>
                            <div className="text-right">
                                <p className="text-blue-400 font-semibold">{plan.planName}</p>
                                <p className="text-slate-400 text-sm">{plan.slots} contacts</p>
                                <p className="text-slate-400 text-sm">{plan.billingPeriod}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Full Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full text-white px-4 py-3 border border-slate-700 bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Email Address</label>
                        <input
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full text-white px-4 py-3 border border-slate-700 bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Billing Address */}
                <div className="space-y-5">
                    <div className="flex items-center gap-2 text-slate-300">
                        <MapPin size={18} />
                        <span className="font-medium">Billing Address</span>
                    </div>

                    <input
                        type="text"
                        placeholder="Street Address"
                        value={line1}
                        onChange={(e) => setLine1(e.target.value)}
                        required
                        className="w-full text-white px-4 py-3 border border-slate-700 bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <input
                            type="text"
                            placeholder="City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                            className="w-full text-white px-4 py-3 border border-slate-700 bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />

                        <input
                            type="text"
                            placeholder="Postal Code"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            required
                            className="w-full text-white px-4 py-3 border border-slate-700 bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Card Element */}
                <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Card Details</label>
                    <div className="px-4 py-4 border border-slate-700 rounded-xl bg-slate-900/50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                        <CardElement
                            options={{
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: '#ffffff',
                                        '::placeholder': { color: '#64748b' },
                                        fontFamily: 'system-ui, -apple-system, sans-serif',
                                    },
                                    invalid: { color: '#ef4444' },
                                },
                            }}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!stripe || !plan}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 flex items-center justify-center gap-2"
                >
                    <Lock size={20} />
                    {plan ? `Pay ${(plan.totalCost * 1.10).toFixed(2)}` : "Loading..."}
                </button>

                {/* Status Message */}
                {status && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${status.includes('✅')
                        ? 'bg-green-950/30 border border-green-800/30 text-green-300'
                        : 'bg-red-950/30 border border-red-800/30 text-red-300'
                        }`}>
                        {status.includes('✅') ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <p className="text-sm font-medium">{status}</p>
                    </div>
                )}

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-slate-400 text-sm pt-4 border-t border-slate-700/50">
                    <Shield size={16} />
                    <span>256-bit SSL encrypted payment</span>
                </div>
            </form>
        </div>
    );
}

export default Stripe;
