import express from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

import { sendInvoiceEmail } from "../config/sendgrid.js";
import { generateInvoice } from "../utils/invoiceGenerator.js";
import { invoiceEmailTemplate } from "../utils/invoiceEmailTemplate.js";


const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

router.post('/create-payment-intent', async (req, res) => {
    const {
        amount, // in dollars
        email,
        userId,
        planName,
        planType,
        provider,
        contacts,
        currency = 'usd',
    } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
            receipt_email: email,
            description: `Pro Plan Subscription for ${email}`,
            automatic_payment_methods: { enabled: false }, // disable automatic methods for now
            payment_method_types: ['card'], // explicitly set
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



router.post("/save-payment", async (req, res) => {
    try {
        const payment = await prisma.payment.create({
            data: {
                ...req.body,
                paymentDate: new Date(req.body.paymentDate),
                nextPaymentDate: req.body.nextPaymentDate ? new Date(req.body.nextPaymentDate) : null,
            },
        });

        const pdfBuffer = await generateInvoice(payment);
        if (!pdfBuffer) {
            throw new Error("Invoice PDF generation failed");
        }

        const html = invoiceEmailTemplate({
            transactionId: payment.transactionId,
            planName: payment.planName,
            total: payment.amount,
        });

        await sendInvoiceEmail({
            to: payment.email,
            subject: `Invoice ${payment.transactionId} - ${payment.planName}`,
            html,
            pdfBuffer,
            fileName: `invoice-${payment.transactionId}.pdf`,
        });

        res.json(payment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
