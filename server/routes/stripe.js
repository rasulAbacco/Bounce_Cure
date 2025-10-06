
// server/routes/stripe.js
import express from "express";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

import { sendInvoiceEmail } from "../config/sendgrid.js";
import { generateInvoice } from "../utils/invoiceGenerator.js";
import { invoiceEmailTemplate } from "../utils/invoiceEmailTemplate.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

/**
 * Utility: Get next payment date from plan type
 */
export const getNextPaymentDate = (currentDate, planType) => {
    const date = new Date(currentDate);
    if (planType === "month") {
        date.setMonth(date.getMonth() + 1);
    } else if (planType === "year") {
        date.setFullYear(date.getFullYear() + 1);
    }
    return date.toISOString();
};

/**
 * Create Stripe Payment Intent
 */
router.post("/create-payment-intent", async (req, res) => {
    const { amount, email, planName, planType, currency = "usd" } = req.body;

    if (!amount || !email) {
        return res.status(400).json({ error: "Amount and email are required" });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe requires cents
            currency,
            receipt_email: email,
            description: `${planName || "Subscription"} for ${email}`,
            payment_method_types: ["card"], // Explicitly allow card
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            transactionId: paymentIntent.id,
        });
    } catch (err) {
        console.error("Stripe error:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * Save Payment + Generate & Email Invoice
 */
router.post("/save-payment", async (req, res) => {
    try {
        const {
            amount,
            discount,
            planPrice,
            paymentDate,
            billingAddress = "",
            planName,
            planType,
            email,
            transactionId,
            userId,
            provider,
            contacts,
        } = req.body;

        if (!amount || !planName || !email || !transactionId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const paymentDateObj = new Date(paymentDate || new Date());
        const nextPaymentDate = getNextPaymentDate(paymentDateObj, planType);

        const paymentData = {
            amount: Number(amount),
            discount: Number(discount ?? amount),
            planPrice: Number(planPrice ?? amount),
            billingAddress,
            planName,
            planType,
            email,
            transactionId,
            userId,
            provider,
            contacts,
            paymentDate: paymentDateObj,
            nextPaymentDate,
        };

        // Save payment in DB
        const payment = await prisma.payment.create({ data: paymentData });

        // Generate invoice PDF
        const pdfBuffer = await generateInvoice(payment);
        if (!pdfBuffer) throw new Error("Invoice PDF generation failed");

        // Prepare HTML email
        const html = invoiceEmailTemplate({
            transactionId: payment.transactionId,
            planName: payment.planName,
            total: payment.amount,
        });

        // Send invoice email
        await sendInvoiceEmail({
            to: payment.email,
            subject: `Invoice ${payment.transactionId} - ${payment.planName}`,
            html,
            pdfBuffer,
            fileName: `invoice-${payment.transactionId}.pdf`,
        });

        res.json(payment);
    } catch (err) {
        console.error("Error saving payment:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;


// // server/routes/stripe.js
// import express from 'express';
// import Stripe from 'stripe';
// import { PrismaClient } from '@prisma/client';

// import { sendInvoiceEmail } from "../config/sendgrid.js";
// import { generateInvoice } from "../utils/invoiceGenerator.js";
// import { invoiceEmailTemplate } from "../utils/invoiceEmailTemplate.js";


// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const prisma = new PrismaClient();


// // At the top of stripe.js
// export const getNextPaymentDate = (currentDate, planType) => {
//     const date = new Date(currentDate);
//     if (planType === 'month') {
//         date.setMonth(date.getMonth() + 1);
//     } else if (planType === 'year') {
//         date.setFullYear(date.getFullYear() + 1);
//     }
//     return date.toISOString();
// };



// router.post('/create-payment-intent', async (req, res) => {
//     const {
//         amount, // in dollars
//         email,
//         userId,
//         planName,
//         planType,
//         provider,
//         contacts,
//         currency = 'usd',
//     } = req.body;

//     try {
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: Math.round(amount * 100),
//             currency,
//             receipt_email: email,
//             description: `Pro Plan Subscription for ${email}`,
//             automatic_payment_methods: { enabled: false }, // disable automatic methods for now
//             payment_method_types: ['card'], // explicitly set
//         });


//         res.send({
//             clientSecret: paymentIntent.client_secret,
//             transactionId: paymentIntent.id,
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: err.message });
//     }
// });



// // routes/payment.js

// router.post("/save-payment", async (req, res) => {
//     try {
   
//         const {
//             amount,
//             discount = amount,
//             planPrice = amount,
//             paymentDate,
//             billingAddress = "",
//             ...rest
//         } = req.body;

//         console.log("Discount:", discount);
//         const paymentDateObj = new Date(paymentDate || new Date());

//         const nextPaymentDate = new Date(paymentDateObj);
//         nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
//         console.log("nextPaymentDate being saved:", nextPaymentDate.toISOString());
//         console.log(req.discoutnt);

//         const paymentData = {
//             ...rest,
//             amount: Number(amount),
//             discount: Number(discount),
//             planPrice: Number(planPrice),
//             billingAddress,
//             paymentDate: paymentDateObj,
//             nextPaymentDate: nextPaymentDate.toISOString(),
//         };

//         const payment = await prisma.payment.create({
//             data: paymentData,
//         });

//         const pdfBuffer = await generateInvoice(payment);

//         if (!pdfBuffer) {
//             throw new Error("Invoice PDF generation failed");
//         }

//         const html = invoiceEmailTemplate({
//             transactionId: payment.transactionId,
//             planName: payment.planName,
//             total: payment.amount,
//         });

//         await sendInvoiceEmail({
//             to: payment.email,
//             subject: `Invoice ${payment.transactionId} - ${payment.planName}`,
//             html,
//             pdfBuffer,
//             fileName: `invoice-${payment.transactionId}.pdf`,
//         });

//         res.json(payment);
//     } catch (err) {
//         console.error("Error saving payment:", err);
//         res.status(500).json({ error: err.message });
//     }
// });


// export default router;





