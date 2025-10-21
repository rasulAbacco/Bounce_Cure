// server/routes/userRoutes.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/authMiddleware.js";
import { ensureFreePlan } from "../utils/autoFreePlan.js";

const router = express.Router();
const prisma = new PrismaClient();

// Helper: generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" } // 1 day validity
  );
};

/**
 * -------------------------
 *  POST /api/users/signup
 * -------------------------
 */
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save to DB with default plan info
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        plan: "Free",
        hasPurchasedBefore: false,
        contactLimit: 50,
        emailLimit: 50,
      },
    });

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        plan: newUser.plan,
        hasPurchasedBefore: newUser.hasPurchasedBefore,
        contactLimit: newUser.contactLimit,
        emailLimit: newUser.emailLimit,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * -------------------------
 *  POST /api/users/login
 * -------------------------
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
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
    // 3️⃣ Generate token
    const token = generateToken(user);

    // 4️⃣ Ensure user has free plan record if none exists
    console.log("🔍 Running ensureFreePlan for:", user.email);
    await ensureFreePlan(user);


    // 5️⃣ Send response
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        plan: user.plan,
        hasPurchasedBefore: user.hasPurchasedBefore,
        contactLimit: user.contactLimit,
        emailLimit: user.emailLimit,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      message: "Internal server error",
      details: error.message,
    });
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
