import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard as CreditCardIcon, Lock, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_VRI_URL;

export default function CreditCard() {
    const stripe = useStripe();
    const elements = useElements();
    const location = useLocation();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [plan, setPlan] = useState(null);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

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

        if (!stripe || !elements || !plan) return;

        setLoading(true);

        // Use the total cost from the plan (already includes tax and discount)
        const amount = parseFloat(plan.totalCost || 0);

        try {
            const { data } = await axios.post(`${API_URL}/api/creditcard/charge`, {
                amount,
                email,
            });

            const result = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name,
                        email,
                    },
                },
            });

            if (result.error) {
                setStatus(`❌ ${result.error.message}`);
            } else if (result.paymentIntent.status === 'succeeded') {
                setStatus('✅ Payment successful!');

                const paymentIntent = result.paymentIntent;

                await axios.post(`${API_URL}/api/creditcard/save`, {
                    userId: 1,
                    email,
                    name,
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
                    status: paymentIntent.status,
                    discount: plan?.discountAmount || 0,
                    planPrice: amount - (plan?.discountAmount || 0),
                });
            }
        } catch (error) {
            console.error(error);
            setStatus('❌ Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        const num = Number(amount);
        return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white px-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl top-1/4 left-1/4 animate-pulse"></div>
                <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl bottom-1/4 right-1/4 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="relative z-10 w-full max-w-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-slate-700/50 space-y-6"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-4">
                        <CreditCardIcon size={32} />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Pay with Card
                    </h2>
                    <p className="text-slate-400 mt-2">Secure payment powered by Stripe</p>
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Full Name</label>
                    <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-slate-700 bg-slate-900/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                        className="w-full px-4 py-3 border border-slate-700 bg-slate-900/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                </div>

                <div className="bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border border-indigo-800/30 rounded-xl p-4">
                    <p className="text-center text-white text-2xl font-bold">
                        {plan ? formatCurrency(plan.totalCost) : '$0.00'}
                    </p>
                    <p className="text-center text-slate-400 text-sm mt-1">Total Amount</p>
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Card Details</label>
                    <div className="px-4 py-4 border border-slate-700 rounded-xl bg-slate-900/50 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
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

                <button
                    type="submit"
                    disabled={!stripe || !plan || loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-105 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <svg
                            className="animate-spin h-6 w-6 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 010 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                            ></path>
                        </svg>
                    ) : (
                        <>
                            <Lock size={20} />
                            {plan ? `Pay ${formatCurrency(plan.totalCost)}` : "Loading..."}
                        </>
                    )}
                </button>

                {status && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${status.includes('✅')
                        ? 'bg-green-950/30 border border-green-800/30 text-green-300'
                        : 'bg-red-950/30 border border-red-800/30 text-red-300'
                        }`}>
                        <AlertCircle size={20} />
                        <p className="text-sm font-medium">{status}</p>
                    </div>
                )}

                <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                    <Lock size={16} />
                    <span>Secured by Stripe - Your payment info is encrypted</span>
                </div>
            </form>
        </div>
    );
}