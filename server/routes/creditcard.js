import express from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

// ✅ Create PaymentIntent for Credit Card (One-time)
router.post('/creditcard/charge', async (req, res) => {
    const { amount, email } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // amount in cents
            currency: 'usd',
            receipt_email: email,
            description: `One-time card payment for ${email}`,
            payment_method_types: ['card'],
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
            transactionId: paymentIntent.id,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Save Payment (optional)
// ✅ Save Payment (STRICT - Prisma required fields)
router.post('/creditcard/save', async (req, res) => {
    const {
        userId = 1,
        email,
        name,               // 👈 cardholder or user name
        transactionId,
        amount,
        currency,
        paymentMethod,
        cardLast4,
        billingAddress,     // 👈 optional but we’ll pass null if not provided
        paymentDate,
        status,
    } = req.body;

    try {
        const saved = await prisma.payment.create({
            data: {
                userId,
                email,
                name: name || email, // fallback to email if name not provided
                transactionId,
                planName: 'One-Time Card Payment',
                planType: 'one-time',
                provider: 'Stripe',
                contacts: 0,
                amount,
                currency,
                planPrice: amount,    // 👈 one-time → planPrice == amount
                discount: 0,          // 👈 default no discount
                paymentMethod,
                cardLast4,
                billingAddress: billingAddress || null,
                paymentDate: new Date(paymentDate),
                nextPaymentDate: new Date(paymentDate), // 👈 required, so set = same as paymentDate
                status,
                notified: false,      // 👈 default
            },
        });

        res.json({ success: true, payment: saved });
    } catch (err) {
        console.error("[/creditcard/save] Error:", err);
        res.status(500).json({ error: "Failed to save credit card payment" });
    }
});

export default router;
