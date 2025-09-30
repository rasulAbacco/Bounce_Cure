// src/pages/Pricing/components/StripeWrapper.jsx
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Stripe from './Stripe';
import CreditCard from './CreditCard';

// Replace with your actual publishable key from Stripe dashboard
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_12345');

const StripeWrapper = () => {
    return (
        <Elements stripe={stripePromise}>
            <CreditCard />
        </Elements>
    );
};

export default StripeWrapper;
