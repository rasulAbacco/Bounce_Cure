// server/routes/user.js
import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * 🧩 GET user's current active plan
 * Endpoint: GET /api/user/:userId/plan
 */
router.get("/user/:userId/plan", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("📋 Fetching plan for user:", userId);

    const parsedId = parseInt(userId);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // 🟢 Fetch all successful payments for this user
    const payments = await prisma.payment.findMany({
      where: {
        userId: parsedId,
        status: "succeeded",
      },
      orderBy: {
        paymentDate: "desc",
      },
    });

    if (!payments || payments.length === 0) {
      console.log("❌ No payments found — returning Free plan");
      return res.json({
        planName: "Free",
        emailVerificationCredits: 50,
        emailSendCredits: 50,
        isActive: true,
        message: "User is on Free plan",
      });
    }

    const now = new Date();

    // 🧮 Filter to only active (non-expired) payments
    const activePayments = payments.filter((p) => {
      if (!p.nextPaymentDate) return true; // no expiry set, consider active
      const expiry = new Date(p.nextPaymentDate);
      const isActive = expiry > now;
      console.log(`🔎 Plan ${p.planName} (id ${p.id}) active?`, isActive, "| expires:", expiry.toISOString());
      return isActive;
    });

    if (activePayments.length === 0) {
      console.log("⚠️ All plans expired — reverting to Free");
      return res.json({
        planName: "Free",
        emailVerificationCredits: 50,
        emailSendCredits: 50,
        isActive: false,
        message: "All plans expired, using Free tier",
      });
    }

    // 🧮 Sum credits for all active plans
    const totalVerifications = activePayments.reduce(
      (sum, p) => sum + (p.emailVerificationCredits || 0),
      0
    );
    const totalEmails = activePayments.reduce(
      (sum, p) => sum + (p.emailSendCredits || 0),
      0
    );

    // 🏆 Use latest active plan
    const latestActive = activePayments[0];

    console.log("✅ Active plan summary:", {
      planName: latestActive.planName,
      totalVerifications,
      totalEmails,
    });

    return res.json({
      planName: latestActive.planName,
      planType: latestActive.planType,
      emailVerificationCredits: totalVerifications,
      emailSendCredits: totalEmails,
      isActive: true,
      paymentDate: latestActive.paymentDate,
      expiresAt: latestActive.nextPaymentDate,
      status: latestActive.status,
      message: "Active plan",
    });
  } catch (error) {
    console.error("🔥 Error fetching user plan:", error);
    res.status(500).json({ error: error.message });
  }
});


/**
 * 🧍 GET user profile with current plan info
 * Endpoint: GET /api/user/:userId
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch user's most recent successful payment
    const payment = await prisma.payment.findFirst({
      where: {
        userId: parseInt(userId),
        status: "succeeded",
      },
      orderBy: {
        paymentDate: "desc",
      },
    });

    // Determine current plan
    const planName = payment ? payment.planName : "Free";
    const planType = payment ? payment.planType : "Free";
    const planActive = payment ? true : false;

    res.json({
      ...user,
      currentPlan: planName,
      planType,
      planActive,
      emailVerificationCredits: payment?.emailVerificationCredits ?? 50,
      emailSendCredits: payment?.emailSendCredits ?? 50,
      expiresAt: payment?.nextPaymentDate ?? null,
    });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
