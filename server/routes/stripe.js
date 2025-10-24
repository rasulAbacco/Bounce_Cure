// server/routes/stripe.js
import express from "express";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { sendInvoiceEmail } from "../config/sendgrid.js";
import { generateInvoice } from "../utils/invoiceGenerator.js";
import { generatePrintingInvoice } from "../utils/printInvoiceGen.js";
import { invoiceEmailTemplate } from "../utils/invoiceEmailTemplate.js";
import cron from "node-cron";  // 🕒 Add this line

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
/**
 * 🧮 Utility: Get next payment date based on plan type
 * Supports: monthly (30 days), quarterly (90 days), yearly (365 days)
 */
export const getNextPaymentDate = (currentDate, planType) => {
  const date = new Date(currentDate);
  const normalized = planType?.toLowerCase() || "";

  if (["month", "monthly"].includes(normalized)) {
    date.setDate(date.getDate() + 30);
  } else if (["quarter", "quarterly"].includes(normalized)) {
    date.setDate(date.getDate() + 90);
  } else if (["year", "yearly", "annual", "annually"].includes(normalized)) {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    console.warn(`⚠️ Unknown planType "${planType}", defaulting to +30 days`);
    date.setDate(date.getDate() + 30);
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
// ✅ Save Payment + Generate & Email Invoice

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

    if (!name || !planName || !email || !transactionId || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    const paymentDateObj = paymentDate ? new Date(paymentDate) : new Date();
    const nextPaymentDate = getNextPaymentDate(paymentDateObj, planType);

    // 🧩 Validate user
    const user = await prisma.user.findUnique({ where: { id: userIdInt } });
    if (!user) {
      return res.status(400).json({ error: `User with ID ${userIdInt} not found` });
    }

    // 🎁 FREE PLAN - Always force 50/50 credits
    let emailVerificationCredits;
    let emailSendCredits;

    if (planName?.toLowerCase() === "free") {
      emailVerificationCredits = 50;  // ✅ ALWAYS 50 for free
      emailSendCredits = 50;           // ✅ ALWAYS 50 for free
      console.log("🎁 FREE PLAN DETECTED - Forced 50/50 credits");
    } else {
      // 💳 PAID PLANS - Extract from request body
      emailVerificationCredits = Number(
        req.body.emailVerificationCredits ||
          req.body.verificationCredits ||
          req.body.emailValidations ||
          req.body.contacts ||
          0
      );
      emailSendCredits = Number(
        req.body.emailSendCredits ||
          req.body.emails ||
          req.body.emailLimit ||
          0
      );
      console.log("💳 PAID PLAN - Credits from request:", {
        emailVerificationCredits,
        emailSendCredits,
      });
    }

    // 💾 Build payment object
    const paymentData = {
      userId: userIdInt,
      name,
      email,
      transactionId,
      planName: planName?.toLowerCase(),
      planType: planType?.toLowerCase(),
      provider: provider || "system",
      emailVerificationCredits,  // ✅ Will be 50 for free, custom for paid
      emailSendCredits,           // ✅ Will be 50 for free, custom for paid
      amount: planName?.toLowerCase() === "free" ? 0 : Number(amount),
      currency: currency || "usd",
      planPrice: planName?.toLowerCase() === "free" ? 0 : Number(planPrice) || Number(amount),
      discount: Number(discount) || 0,
      paymentMethod: planName?.toLowerCase() === "free" ? "system" : (paymentMethod || "card"),
      cardLast4: cardLast4 || "",
      billingAddress: billingAddress || "",
      paymentDate: paymentDateObj,
      nextPaymentDate: new Date(nextPaymentDate),
      status: status || "succeeded",
    };

    console.log("💾 Final paymentData being saved:", {
      planName: paymentData.planName,
      emailVerificationCredits: paymentData.emailVerificationCredits,
      emailSendCredits: paymentData.emailSendCredits,
      amount: paymentData.amount,
    });

    // ✅ Save payment in DB
    const payment = await prisma.payment.create({ data: paymentData });

    console.log("✅ Payment saved to DB:", {
      id: payment.id,
      emailVerificationCredits: payment.emailVerificationCredits,
      emailSendCredits: payment.emailSendCredits,
    });

    // ✅ Update user credits
// ✅ Fetch existing user first
 

    // ✅ Add new credits on top of existing
    await prisma.user.update({
      where: { id: userIdInt },
      data: {
        plan: planName?.toLowerCase(),
        hasPurchasedBefore: true,
        contactLimit: (user.contactLimit || 0) + emailVerificationCredits,
        emailLimit: (user.emailLimit || 0) + emailSendCredits,
      },
    });


    console.log("✅ User credits updated:", {
      userId: userIdInt,
      contactLimit: emailVerificationCredits,
      emailLimit: emailSendCredits,
    });

    // 🧾 Generate and send invoice (even for Free)
    const pdfBuffer = await generateInvoice(payment);
    const pdfBuffers = await generatePrintingInvoice(payment);
    const html = invoiceEmailTemplate({
      transactionId: payment.transactionId,
      planName: payment.planName,
      total: payment.amount,
      currency: payment.currency?.toUpperCase() || "USD",
    });

    await sendInvoiceEmail({
      to: payment.email,
      subject: `Invoice ${payment.transactionId} - ${payment.planName}`,
      html,
      pdfBuffer,
      pdfBuffers,
      fileName: `invoice-${payment.transactionId}.pdf`,
    });

    res.json({
      success: true,
      message: "Payment and credits saved successfully",
      payment: {
        id: payment.id,
        transactionId: payment.transactionId,
        planName: payment.planName,
        emailVerificationCredits: payment.emailVerificationCredits,
        emailSendCredits: payment.emailSendCredits,
        amount: payment.amount,
      },
    });
  } catch (err) {
    console.error("❌ Error saving payment:", err);
    res.status(500).json({ error: err.message });
  }
});
 


// 🕒 Every midnight, check and expire outdated plans
cron.schedule("0 0 * * *", async () => {
  console.log("🧹 Running daily plan expiry check...");

  const now = new Date();

  try {
    // Find expired users
    const expiredUsers = await prisma.payment.findMany({
      where: {
        nextPaymentDate: { lt: now },
        status: "succeeded",
      },
      include: { user: true },
    });

    for (const record of expiredUsers) {
      // Reset user's credits
      await prisma.user.update({
        where: { id: record.userId },
        data: {
          emailLimit: 0,
          contactLimit: 0,
          plan: "Expired",
        },
      });

      // Mark payment as expired
      await prisma.payment.update({
        where: { id: record.id },
        data: { status: "expired" },
      });

      console.log(`🚫 Expired plan for user ${record.userId}`);
    }

    console.log(`✅ Plan expiry check completed (${expiredUsers.length} users updated).`);
  } catch (err) {
    console.error("❌ Error running expiry check:", err);
  }
});

export default router;


