// src/pages/Razorpay.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
const API_URL = import.meta.env.VITE_VRI_URL;
export default function Razorpay() {
    const location = useLocation();
    const navigate = useNavigate();

    const plan = location.state?.plan || JSON.parse(localStorage.getItem("pendingUpgradePlan"));

    useEffect(() => {
        if (!plan) {
            navigate('/pricing');
            return;
        }

        const loadRazorpayScript = () => {
            return new Promise((resolve) => {
                const script = document.createElement("script");
                script.src = "https://checkout.razorpay.com/v1/checkout.js";
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.body.appendChild(script);
            });
        };

        const startPayment = async () => {
            const res = await loadRazorpayScript();
            if (!res) {
                alert("Razorpay SDK failed to load. Are you online?");
                return;
            }

            try {
                const amount = parseFloat((plan.totalCost * 1.10).toFixed(2)); // Add 10% tax
                const userId = 1; // Replace with actual user ID
                const email = "testuser@example.com"; // Replace or collect from user

                const { data: order } = await axios.post(`${API_URL}/api/razorpay/create-order`, {
                    amount,
                    userId,
                    planName: plan.planName,
                    planType: plan.billingPeriod,
                    provider: 'Razorpay',
                    contacts: plan.slots,
                    email,
                });

                const options = {
                    // key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                    key: "rzp_test_1DP5mmOlF5G5ag",
                    amount: order.amount,
                    currency: order.currency,
                    name: "My SaaS App",
                    description: `Subscription for ${plan.planName}`,
                    order_id: order.id,
                    handler: async function (response) {
                        const paymentData = {
                            ...response,
                            email,
                            userId,
                            planName: plan.planName,
                            planType: plan.billingPeriod,
                            provider: 'Razorpay',
                            contacts: plan.slots,
                            amount,
                        };

                        await axios.post(`${API_URL}/api/razorpay/save-payment`, paymentData);

                        alert("✅ Payment successful!");
                        navigate('/dashboard');
                    },
                    prefill: {
                        name: "Test User",
                        email,
                    },
                    theme: { color: "#6366F1" },
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            } catch (error) {
                console.error(error);
                alert("❌ Payment initialization failed.");
            }
        };

        startPayment();
    }, [navigate, plan]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">Processing with Razorpay...</h1>
                <p className="text-lg">Please wait while we redirect you to complete payment.</p>
            </div>
        </div>
    );
}
