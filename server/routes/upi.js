// server/routes/upi.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { sendInvoiceEmail } from "../config/sendgrid.js";
import { generateInvoice } from "../utils/invoiceGenerator.js";
import { invoiceEmailTemplate } from "../utils/invoiceEmailTemplate.js";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Utility: Get next payment date (reuse logic from stripe route, keep same behaviour)
 */
// export const getNextPaymentDate = (currentDate, planType) => {
//     const date = new Date(currentDate);
//     if (planType === "month") {
//         date.setMonth(date.getMonth() + 1);
//     } else if (planType === "year") {
//         date.setFullYear(date.getFullYear() + 1);
//     }
//     return date.toISOString();
// };

/**
 * POST /api/upi/create-order
 * Creates a DB record for a pending UPI order and returns a UPI deeplink + QR url
 *
 * Expected body: { amount, currency, email, name, planName, planType }
 * 
 * 
 */

// server/routes/upi.js



export const getNextPaymentDate = (currentDate, planType) => {
    const date = new Date(currentDate);
    if (planType === "month") date.setMonth(date.getMonth() + 1);
    else if (planType === "year") date.setFullYear(date.getFullYear() + 1);
    return date.toISOString();
};

/* ---------------- New endpoints ---------------- */

/**
 * POST /api/upi/create-request
 * Simulates sending a UPI collect (payment request) to user's UPI ID
 */
router.post("/create-request", async (req, res) => {
    try {
        const { upiId, amount, currency, email, name, planName, planType } = req.body;
        if (!upiId || !amount || !email)
            return res.status(400).json({ error: "upiId, amount and email required" });

        const orderId = `UPI-${Date.now()}`;
        const order = await prisma.payment.create({
            data: {
                userId: 0,
                name,
                email,
                transactionId: orderId,
                planName,
                planType,
                provider: "UPI",
                contacts: 0,
                amount: Number(amount),
                currency,
                planPrice: Number(amount),
                discount: 0,
                paymentMethod: "UPI",
                paymentDate: new Date(),
                nextPaymentDate: new Date(getNextPaymentDate(new Date(), planType)),
                status: "pending",
            },
        });

        // Simulate a payment gateway sending a push request to the user's UPI app.
        // In real integration, you'd call Razorpay/Cashfree API here.

        res.json({ orderId, upiId, amount, currency });
    } catch (err) {
        console.error("UPI create-request error:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/upi/verify-payment/:orderId
 * Poll endpoint for frontend to check if payment completed
 * (simulate success after random delay)
 */
router.get("/verify-payment/:orderId", async (req, res) => {
    const { orderId } = req.params;
    try {
        const payment = await prisma.payment.findFirst({ where: { transactionId: orderId } });
        if (!payment) return res.status(404).json({ error: "Order not found" });

        // Simulate success after 10 s
        const elapsed = Date.now() - parseInt(orderId.split("-")[1]);
        if (elapsed > 10000 && payment.status !== "succeeded") {
            // mark as paid and send invoice
            const updated = await prisma.payment.update({
                where: { id: payment.id },
                data: { status: "succeeded" },
            });

            const pdf = await generateInvoice(updated);
            const html = invoiceEmailTemplate({
                transactionId: updated.transactionId,
                planName: updated.planName,
                total: updated.amount,
            });
            await sendInvoiceEmail({
                to: updated.email,
                subject: `Invoice ${updated.transactionId} - ${updated.planName}`,
                html,
                pdfBuffer: pdf,
                fileName: `invoice-${updated.transactionId}.pdf`,
            });
            return res.json({ status: "succeeded" });
        }

        res.json({ status: payment.status });
    } catch (err) {
        console.error("verify-payment error:", err);
        res.status(500).json({ error: err.message });
    }
});

/* ------------------------------------------------ */


router.post("/create-order", async (req, res) => {
    try {
        const { amount, currency = "INR", email, name, planName, planType = "month" } = req.body;
        if (!amount || !email) return res.status(400).json({ error: "amount and email required" });

        // Generate a simple order id (could be uuid). Use timestamp for simplicity:
        const orderId = `UPI-${Date.now()}`;

        // UPI ID from env or fallback
        const upiId = process.env.UPI_ID || "bouncecure@kotak";
        const payeeName = process.env.UPI_NAME || "Bouncecure";

        // Create UPI deeplink. Note: many UPI apps accept the standard deeplink.
        const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${encodeURIComponent(Number(amount).toFixed(2))}&cu=${encodeURIComponent(currency)}&tn=${encodeURIComponent(planName || "Payment")}`;

        // Simple QR URL (you can also generate server-side QR image). We'll return a Google Chart QR URL as a convenience (client can use it)
        const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(upiLink)}`;

        // Save order in DB (payments table or upi_orders table — we'll reuse payments but status pending)
        const order = await prisma.payment.create({
            data: {
                userId: 0, // client should update with actual userId when confirming payment (or pass userId in request)
                name: name || "",
                email,
                transactionId: orderId,
                planName: planName || "",
                planType,
                provider: "UPI",
                contacts: 0,
                amount: Number(amount),
                currency,
                planPrice: Number(amount),
                discount: 0,
                paymentMethod: "UPI",
                cardLast4: "",
                billingAddress: "",
                paymentDate: new Date(),
                nextPaymentDate: new Date(getNextPaymentDate(new Date(), planType)),
                status: "pending",
            }
        });

        res.json({
            orderId,
            upiId,
            upiLink,
            qrUrl,
            amount: Number(amount),
            currency,
            dbId: order.id
        });

    } catch (err) {
        console.error("Error creating UPI order:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/upi/save-payment
 * Save a completed UPI payment (called after user enters transaction id)
 *
 * Expected body fields (similar to stripe save-payment):
 * {
 *   userId, name, email, amount, transactionId, planName, planType,
 *   provider, paymentMethod, currency, contacts, planPrice, discount
 * }
 */
router.post("/save-payment", async (req, res) => {
    try {
        const {
            userId, name, amount, discount, planPrice, paymentDate,
            billingAddress, planName, planType, email, transactionId,
            provider, contacts, currency, paymentMethod, cardLast4, status
        } = req.body;

        if (!name || !amount || !planName || !email || !transactionId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const userIdInt = parseInt(userId, 10) || 0;

        const paymentDateObj = paymentDate ? new Date(paymentDate) : new Date();
        const nextPaymentDate = getNextPaymentDate(paymentDateObj, planType);

        const paymentData = {
            userId: userIdInt,
            name,
            email,
            transactionId,
            planName,
            planType,
            provider: provider || "UPI",
            contacts: Number(contacts) || 0,
            amount: Number(amount),
            currency: currency || "INR",
            planPrice: Number(planPrice) || Number(amount),
            discount: Number(discount) || 0,
            paymentMethod: paymentMethod || "UPI",
            cardLast4: cardLast4 || "",
            billingAddress: billingAddress || "",
            paymentDate: paymentDateObj,
            nextPaymentDate: new Date(nextPaymentDate),
            status: status || "succeeded",
        };

        // Save payment in DB (create new row)
        const payment = await prisma.payment.create({ data: paymentData });

        // Generate invoice PDF and send email (reuse your existing utilities)
        const pdfBuffer = await generateInvoice(payment);
        if (!pdfBuffer) throw new Error("Invoice PDF generation failed");

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
            fileName: `invoice-${payment.transactionId}.pdf`
        });

        res.json(payment);

    } catch (err) {
        console.error("Error saving UPI payment:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
