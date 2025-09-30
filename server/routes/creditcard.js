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
router.post('/creditcard/save', async (req, res) => {
    const {
        userId = 1,
        email,
        transactionId,
        amount,
        currency,
        paymentMethod,
        cardLast4,
        paymentDate,
        status,
    } = req.body;

    try {
        const saved = await prisma.payment.create({
            data: {
                userId,
                email,
                transactionId,
                planName: 'One-Time Card Payment',
                planType: 'one-time',
                provider: 'Stripe',
                contacts: 0,
                amount,
                currency,
                paymentMethod,
                cardLast4,
                paymentDate: new Date(paymentDate),
                nextPaymentDate: null,
                status,
            },
        });

        res.json({ success: true, payment: saved });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save credit card payment" });
    }
});

export default router;
