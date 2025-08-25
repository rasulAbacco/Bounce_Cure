// backend/routes/forgotpasswordRoute.js
import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// 📌 Request reset link
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.json({ message: "If the email exists, a link was sent" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        expiresAt: resetTokenExpiry,
        user: { connect: { id: user.id } },
      },
    });

    // 👉 Send link to FRONTEND, not backend
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "abacco83@gmail.com",
      subject: "Reset your password",
      html: `
        <h3>Password Reset</h3>
        <p>Click the link below to reset your password (valid 60 minutes):</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
      `,
    });

    res.json({ message: "If the email exists, a link was sent" });
  } catch (e) {
    console.error("❌ Forgot password error:", e);
    res.status(500).json({ message: "Could not send reset link" });
  }
});

// 📌 Reset password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password)
      return res.status(400).json({ message: "Password is required" });

    const tokenEntry = await prisma.passwordResetToken.findFirst({
      where: { token, expiresAt: { gte: new Date() } },
      include: { user: true },
    });

    if (!tokenEntry)
      return res.status(400).json({ message: "Invalid or expired token" });

    const hash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: tokenEntry.userId },
      data: { password: hash },
    });

    await prisma.passwordResetToken.delete({ where: { id: tokenEntry.id } });

    res.json({ message: "Password reset successful" });
  } catch (e) {
    console.error("❌ Reset password error:", e);
    res.status(500).json({ message: "Could not reset password" });
  }
});

// 📌 Optional: Handle direct backend link by redirecting to frontend
router.get("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  res.redirect(`${process.env.FRONTEND_URL}/reset-password/${token}`);
});

export default router;
