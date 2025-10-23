import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

// Helper: Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

/**
 * ==============================
 *  POST /api/users/signup
 * ==============================
 * New users get a free plan + 50/50 credits
 */
/**
 * ==============================
 *  POST /api/users/signup
 * ==============================
 * New users get a free plan + 50/50 credits
 */
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // 1️⃣ Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2️⃣ Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create new user with Free Plan (50/50 credits)
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        plan: "free",
        hasPurchasedBefore: false,
        contactLimit: 50,
        emailLimit: 50,
      },
    });

    console.log(`✅ User created: ID=${newUser.id}, Email=${email}`);

    // 5️⃣ Create Payment record for Free Plan - WITHOUT try-catch so errors are visible
    const paymentData = {
      userId: newUser.id,
      name: `${firstName} ${lastName}`,
      email: email,
      transactionId: `FREE-${Date.now()}-${newUser.id}`,
      planName: "free",
      planType: "free",
      provider: "system",
      emailVerificationCredits: 50,
      emailSendCredits: 50,
      amount: 0,
      currency: "usd",
      planPrice: 0,
      discount: 0,
      paymentMethod: "system",
      cardLast4: "",
      billingAddress: "",
      paymentDate: new Date(),
      nextPaymentDate: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000), // 100 years from now
      status: "succeeded",
    };

    console.log("💳 Attempting to create payment record:", paymentData);

    const freePayment = await prisma.payment.create({
      data: paymentData,
    });

    console.log(`✅ Payment record created: ID=${freePayment.id}, Transaction=${freePayment.transactionId}`);

    // 6️⃣ Generate JWT token
    const token = generateToken(newUser);

    // 7️⃣ Return success response
    res.status(201).json({
      message: "User created successfully with Free Plan",
      token,
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        plan: newUser.plan,
        contactLimit: newUser.contactLimit,
        emailLimit: newUser.emailLimit,
        hasPurchasedBefore: newUser.hasPurchasedBefore,
      },
      credits: {
        emailVerificationCredits: 50,
        emailSendCredits: 50,
      },
      paymentRecord: {
        id: freePayment.id,
        transactionId: freePayment.transactionId,
      },
    });
  } catch (error) {
    console.error("❌ SIGNUP ERROR:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });

    // If user was created but payment failed, log it
    if (error.message?.includes("payment")) {
      console.error("⚠️ User was created but payment record failed!");
    }

    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * ==============================
 *  POST /api/users/login
 * ==============================
 * Existing users keep previous credits, no reset
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 1️⃣ Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2️⃣ Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3️⃣ Generate token
    const token = generateToken(user);

    // 4️⃣ Get latest payment
    let latestPayment = await prisma.payment.findFirst({
      where: { userId: user.id },
      orderBy: { paymentDate: "desc" },
    });

    // 5️⃣ If payment record missing (edge case), recreate with current credits
    if (!latestPayment) {
      latestPayment = await prisma.payment.create({
        data: {
          userId: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          transactionId: `RESTORE-${Date.now()}`,
          planName: user.plan || "free",
          planType: user.plan || "free",
          provider: "system",
          emailVerificationCredits: user.contactLimit ?? 0,
          emailSendCredits: user.emailLimit ?? 0,
          amount: 0,
          currency: "usd",
          planPrice: 0,
          discount: 0,
          paymentMethod: "none",
          paymentDate: new Date(),
          nextPaymentDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 100)
          ),
          status: "succeeded",
        },
      });
      console.log(`🧾 Restored missing payment for existing user ${user.email}`);
    }

    // 6️⃣ Respond with actual credits (no reset)
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        plan: user.plan,
        contactLimit: user.contactLimit,
        emailLimit: user.emailLimit,
        hasPurchasedBefore: user.hasPurchasedBefore,
      },
      credits: {
        emailSendCredits: latestPayment.emailSendCredits,
        emailVerificationCredits: latestPayment.emailVerificationCredits,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});




/**
 * -------------------------
 *  PUT /api/users/plan
 * -------------------------
 * Update user's plan after purchase
 */
router.put("/plan", protect, async (req, res) => {
  try {
    const { planName, contactLimit, emailLimit } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        plan: planName,
        hasPurchasedBefore: true,
        contactLimit: contactLimit,
        emailLimit: emailLimit,
      },
    });

    res.json({
      message: "Plan updated successfully",
      user: {
        id: updatedUser.id,
        plan: updatedUser.plan,
        hasPurchasedBefore: updatedUser.hasPurchasedBefore,
        contactLimit: updatedUser.contactLimit,
        emailLimit: updatedUser.emailLimit,
      },
    });
  } catch (error) {
    console.error("Plan update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * -------------------------
 *  GET /api/users/me
 * -------------------------
 */
router.get("/me", protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User info retrieved successfully",
      user,
    });
  } catch (error) {
    console.error("Fetch /me error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.get("/credits", protect, async (req, res) => {
  try {
    // 1️⃣ Get latest payment (if user has purchased any)
    const latestPayment = await prisma.payment.findFirst({
      where: { userId: req.user.id },
      orderBy: { paymentDate: "desc" },
    });

    // 2️⃣ Get user (for free/default plan fallback)
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        emailLimit: true,
        contactLimit: true,
        plan: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 3️⃣ Return live credits
    const emailSendCredits =
      latestPayment?.emailSendCredits ??
      user.emailLimit ??
      50;

    const emailVerificationCredits =
      latestPayment?.emailVerificationCredits ??
      user.contactLimit ??
      50;

    res.json({
      plan: user.plan,
      emailSendCredits,
      emailVerificationCredits,
    });
  } catch (error) {
    console.error("Error fetching credits:", error);
    res.status(500).json({ error: "Failed to fetch credits" });
  }
});

/**
 * PUT /api/users/update-credits
 * Deduct credits after campaign send
 */
// ✅ PUT /api/users/update-credits
router.put("/update-credits", protect, async (req, res) => {
  try {
    const { emailLimit } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { emailLimit: Number(emailLimit) },
    });

    // Also update latest payment record for consistency
    await prisma.payment.updateMany({
      where: { userId: req.user.id },
      data: { emailSendCredits: Number(emailLimit) },
    });

    res.json({ success: true, remaining: emailLimit });
  } catch (error) {
    console.error("Update credits error:", error);
    res.status(500).json({ error: "Failed to update credits" });
  }
});



export default router;
