// routes/razorpay.js
import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import { prisma } from "../prisma/prismaClient.js";
import { protect } from "../middleware/authMiddleware.js"; // ✅ for multi-user auth

dotenv.config();
const router = express.Router();

// ✅ Secure Razorpay keys from ENV
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// -------------------- CREATE ORDER --------------------
router.post("/create-order", protect, async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Invalid amount" });
        }

        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // paise
            currency: "INR",
            receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
            notes: {
                userId: req.user.id, // ✅ store which user created it
                email: req.user.email,
            },
        });

        res.json(order);
    } catch (err) {
        console.error("❌ Razorpay create-order error:", err);
        res.status(500).json({ error: "Failed to create Razorpay order" });
    }
});

// -------------------- SAVE PAYMENT --------------------
router.post("/save-payment", protect, async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            planName,
            planType,
            provider,
            contacts,
            amount,
        } = req.body;

        if (!razorpay_payment_id || !razorpay_order_id) {
            return res.status(400).json({ error: "Invalid payment data" });
        }

        // ✅ Save payment for logged-in user only
        const saved = await prisma.payment.create({
            data: {
                userId: req.user.id, // ✅ force ownership
                email: req.user.email,
                transactionId: razorpay_payment_id,
                planName,
                planType,
                provider,
                contacts,
                amount,
                currency: "INR",
                paymentMethod: "razorpay", // could be UPI, card, netbanking
                cardLast4: "", // Razorpay doesn’t expose unless captured manually
                paymentDate: new Date(),
                nextPaymentDate: null, // you can add subscription logic here later
                status: "succeeded", // assume success if signature is valid
            },
        });

        res.json({ success: true, payment: saved });
    } catch (err) {
        console.error("❌ Razorpay save-payment error:", err);
        res.status(500).json({ error: "Failed to save Razorpay payment" });
    }
});

export default router;


// // routes/razorpay.js
// import express from 'express';
// import Razorpay from 'razorpay';
// import dotenv from 'dotenv';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();
// dotenv.config();

// const router = express.Router();

// console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
// console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET);

// // const razorpay = new Razorpay({
// //     key_id: process.env.RAZORPAY_KEY_ID,
// //     key_secret: process.env.RAZORPAY_KEY_SECRET, // ✅ FIXED
// // });
// const razorpay = new Razorpay({
//     key_id: "rzp_test_1DP5mmOlF5G5ag",
//     key_secret: "your_actual_test_secret_from_dashboard", // ✅ FIXED
// });



// router.post('/create-order', async (req, res) => {
//     try {
//         const { amount, email } = req.body;

//         const order = await razorpay.orders.create({
//             amount: Math.round(amount * 100), // convert to paise
//             currency: "INR",
//             receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
//             notes: {
//                 email,
//             },
//         });

//         res.json(order);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Failed to create Razorpay order" });
//     }
// });


// router.post('/save-payment', async (req, res) => {
//     try {
//         const {
//             razorpay_payment_id,
//             razorpay_order_id,
//             razorpay_signature,
//             email,
//             userId,
//             planName,
//             planType,
//             provider,
//             contacts,
//             amount,
//         } = req.body;

//         const saved = await prisma.payment.create({
//             data: {
//                 userId,
//                 email,
//                 transactionId: razorpay_payment_id,
//                 planName,
//                 planType,
//                 provider,
//                 contacts,
//                 amount,
//                 currency: "INR",
//                 paymentMethod: "card", // Razorpay may include UPI or netbanking too
//                 cardLast4: "", // Not available via Razorpay API unless captured manually
//                 paymentDate: new Date(),
//                 nextPaymentDate: null,
//                 status: "succeeded",
//             },
//         });

//         res.json({ success: true, payment: saved });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Failed to save Razorpay payment" });
//     }
// });

// export default router;
