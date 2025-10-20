// server/utils/autofreeplan.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Ensure that a user has a Free Plan entry in the Payment table.
 * Called automatically on first login or Google sign-in.
 */
export const ensureFreePlan = async (user) => {
  if (!user || !user.id || !user.email) {
    console.error("❌ ensureFreePlan: Missing user information");
    return;
  }

  try {
    const existingPayment = await prisma.payment.findFirst({
      where: { userId: user.id },
    });

    if (existingPayment) {
      console.log("ℹ️ User already has a payment entry, skipping free plan:", user.email);
      return;
    }

    console.log("🆕 Creating free plan for first-time user:", user.email);

    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(now.getFullYear() + 1); // ✅ Avoid null in nextPaymentDate

    await prisma.payment.create({
      data: {
        userId: user.id,
        email: user.email,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
        transactionId: `FREE-${Date.now()}`,
        planName: "Free",
        planType: "lifetime",
        provider: "system",
        amount: 0,
        currency: "usd",
        planPrice: 0,
        discount: 100,
        paymentMethod: "none",
        cardLast4: "",
        billingAddress: "",
        paymentDate: now,
        nextPaymentDate: oneYearLater, // ✅ never null
        status: "succeeded",
        emailVerificationCredits: 50,
        emailSendCredits: 50,
      },
    });

    console.log("✅ Free plan stored successfully for:", user.email);
  } catch (err) {
    console.error("❌ Error ensuring free plan:", err.message);
  }
};
