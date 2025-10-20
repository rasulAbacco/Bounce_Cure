// server/routes/stripe.js
import express from "express";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { sendInvoiceEmail } from "../config/sendgrid.js";
import { generateInvoice } from "../utils/invoiceGenerator.js";
import { generatePrintingInvoice } from "../utils/printInvoiceGen.js";
import { invoiceEmailTemplate } from "../utils/invoiceEmailTemplate.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

// Check Stripe secret key validity on server start
stripe.customers.list({ limit: 1 })
  .then(() => console.log('✅ Stripe SECRET key is valid'))
  .catch(err => console.error('❌ Stripe SECRET key error:', err.message));

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
      amount: Math.round(amount * 100), // Stripe expects cents
      currency,
      receipt_email: email,
      description: `${planName || "Subscription"} for ${email}`,
      payment_method_types: ["card"],
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
      name,
      amount,
      discount,
      planPrice,
      paymentDate,
      billingAddress,
      planName,
      planType,
      email,
      transactionId,
      userId,
      provider,
      contacts,
      currency,
      paymentMethod,
      cardLast4,
      status,
    } = req.body;

    // Validate required fields
    if (!name || !amount || !planName || !email || !transactionId || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Convert userId to integer
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    // Safe defaults and type conversions
    const paymentDateObj = paymentDate ? new Date(paymentDate) : new Date();
    const nextPaymentDate = getNextPaymentDate(paymentDateObj, planType);
    
  const paymentData = {
    userId: userIdInt,
    name,
    email,
    transactionId,
    planName,
    planType,
    provider,

    // ✅ New credit fields
    emailVerificationCredits: 
        Number(req.body.emailVerificationCredits || req.body.contacts || 0),
    emailSendCredits:
      Number(req.body.emailSendCredits || req.body.emails || 0),

    amount: Number(amount),
    currency: currency || "usd",
    planPrice: Number(planPrice) || Number(amount),
    discount: Number(discount) || 0,
    paymentMethod: paymentMethod || "card",
    cardLast4: cardLast4 || "",
    billingAddress: billingAddress || "",
    paymentDate: paymentDateObj,
    nextPaymentDate: new Date(nextPaymentDate),
    status: status || "succeeded",
  };


    // Save payment in database
    const payment = await prisma.payment.create({ data: paymentData });
    await prisma.user.update({
      where: { id: userIdInt },
      data: {
        plan: planName,
        hasPurchasedBefore: true,
        contactLimit: paymentData.emailVerificationCredits,
        emailLimit: paymentData.emailSendCredits,
      },
    });


    // Generate invoice PDF
    const pdfBuffer = await generateInvoice(payment);
    const pdfBuffers = await generatePrintingInvoice(payment);
    if (!pdfBuffer) throw new Error("Invoice PDF generation failed");
    if (!pdfBuffers) throw new Error("Printing Invoice PDF generation failed");

    // Prepare HTML email
    const html = invoiceEmailTemplate({
      transactionId: payment.transactionId,
      planName: payment.planName,
      total: payment.amount,
      currency: payment.currency?.toUpperCase() || "USD",
    });


    // Send invoice email
    await sendInvoiceEmail({
      to: payment.email,
      subject: `Invoice ${payment.transactionId} - ${payment.planName}`,
      html,
      pdfBuffer,
      pdfBuffers,
      fileName: `invoice-${payment.transactionId}.pdf`,
    });

    res.json(payment);

  } catch (err) {
    console.error("Error saving payment:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
