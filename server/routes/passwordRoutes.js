import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/auth/forgot-password
 * Sends password reset link to user email
 */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with that email." });
    }

    // Generate reset token (expires in 1 hour)
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Reset link (frontend route, not backend)
    const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;

    // Send email via Resend
    await resend.emails.send({
      from: "onboarding@resend.dev", // ✅ Sandbox sender for dev
      to: "abacco83@gmail.com",
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>We received a request to reset your password.</p>
        <p>Click below to set a new password (link valid for 1 hour):</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
      `,
    });

    res.json({ message: "Password reset email sent." });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
});

/**
 * GET /api/auth/reset-password/:token
 * Verifies if reset token is valid (used by frontend before showing form)
 */
router.get("/reset-password/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link." });
    }

    res.json({ message: "Valid token." });
  } catch (err) {
    console.error("❌ Token validation error:", err);
    res.status(400).json({ message: "Invalid or expired reset link." });
  }
});

/**
 * POST /api/auth/reset-password/:token
 * Resets the password using token
 */
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password in database
    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password reset successful! You can now log in." });
  } catch (err) {
    console.error("❌ Reset password error:", err);

    if (err.name === "TokenExpiredError") {
      return res
        .status(400)
        .json({ message: "Reset link expired. Please request again." });
    }

    res.status(400).json({ message: "Invalid or expired reset link." });
  }
});

export default router;
