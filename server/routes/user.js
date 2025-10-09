// server/routes/user.js (or create new file)
import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Get user's current active plan
 * GET /api/user/:userId/plan
 */
router.get("/user/:userId/plan", async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('📋 Fetching plan for user:', userId);

    // Get the most recent active payment for this user
    const payment = await prisma.payment.findFirst({
      where: {
        userId: parseInt(userId),
        status: "succeeded",
      },
      orderBy: {
        paymentDate: "desc",
      },
    });

    if (!payment) {
      console.log('No payment found, user is on Free plan');
      return res.json({
        planName: "Free",
        isActive: true,
        message: "User is on Free plan",
      });
    }

    // Check if plan is still active (check expiry date)
    const now = new Date();
    const nextPayment = payment.nextPaymentDate ? new Date(payment.nextPaymentDate) : null;

    // If there's an expiry date and it has passed, downgrade to Free
    if (nextPayment && now > nextPayment) {
      console.log('Plan expired, downgrading to Free');
      return res.json({
        planName: "Free",
        isActive: false,
        expiresAt: payment.nextPaymentDate,
        message: "Plan has expired",
      });
    }

    console.log('Active plan found:', payment.planName);

    // Return active plan
    res.json({
      planName: payment.planName,
      planType: payment.planType,
      contacts: payment.contacts,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      expiresAt: payment.nextPaymentDate,
      isActive: true,
      transactionId: payment.transactionId,
    });
  } catch (error) {
    console.error("Error fetching user plan:", error);
    res.status(500).json({
      error: error.message,
      planName: "Free", // Default to Free on error
    });
  }
});

/**
 * Get user profile with plan information
 * GET /api/user/:userId
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user data (adjust according to your user model)
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's plan
    const payment = await prisma.payment.findFirst({
      where: {
        userId: parseInt(userId),
        status: "succeeded",
      },
      orderBy: {
        paymentDate: "desc",
      },
    });

    const planName = payment ? payment.planName : "Free";

    res.json({
      ...user,
      currentPlan: planName,
      planActive: payment ? true : false,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;