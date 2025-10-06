// server/routes/forgotPasswordRoute.js
import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import sgMail from "@sendgrid/mail";
import { prisma } from "../prisma/prismaClient.js";

const router = express.Router();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ------------------ REQUEST RESET LINK ------------------
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return same response (security)
    if (!user) {
      return res.json({ message: "If the email exists, a link was sent" });
    }

    // Delete any existing tokens for this user (prevent multiple valid tokens)
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    // Generate token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { token: hashedToken, userId: user.id, expiresAt },
    });

    const resetLink = `${process.env.BASE_URL}/reset-password/${rawToken}`;

    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_VERIFIED_SENDER, // Must be verified sender
      subject: "BounceCure Password Reset",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    res.json({ message: "If the email exists, a link was sent" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ RESET PASSWORD ------------------
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Password is required" });

    // Hash the token again to compare
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const tokenEntry = await prisma.passwordResetToken.findFirst({
      where: { token: hashedToken, expiresAt: { gte: new Date() } },
      include: { user: true },
    });

    if (!tokenEntry) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: tokenEntry.user.id },
      data: { password: hash },
    });

    // Remove used token
    await prisma.passwordResetToken.delete({ where: { id: tokenEntry.id } });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Could not reset password" });
  }
});

export default router;

// //server/routes/forgotPasswordRoute.js
// import express from "express";
// import crypto from "crypto";
// import bcrypt from "bcryptjs";
// import sgMail from "@sendgrid/mail";
// import { prisma } from "../prisma/prismaClient.js";

// const router = express.Router();
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// // Request reset link
// router.post("/forgot-password", async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) return res.status(400).json({ message: "Email is required" });

//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) return res.json({ message: "If the email exists, a link was sent" });

//     const token = crypto.randomBytes(32).toString("hex");
//     const expiresAt = new Date(Date.now() + 3600000); // 1 hour

//     await prisma.passwordResetToken.create({
//       data: { token, userId: user.id, expiresAt },
//     });

//     const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;

//     await sgMail.send({
//       to: email,
//       from: process.env.SENDGRID_VERIFIED_SENDER,
//       subject: "BounceCure Password Reset",
//       html: `
//         <h2>Password Reset</h2>
//         <p>Click the link below to reset your password:</p>
//         <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
//         <p>This link will expire in 1 hour.</p>
//       `,
//     });

//     res.json({ message: "If the email exists, a link was sent" });
//   } catch (err) {
//     console.error("Forgot password error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Reset password
// router.post("/reset-password/:token", async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;
//     if (!password) return res.status(400).json({ message: "Password is required" });

//     const tokenEntry = await prisma.passwordResetToken.findFirst({
//       where: { token, expiresAt: { gte: new Date() } },
//       include: { user: true },
//     });

//     if (!tokenEntry) return res.status(400).json({ message: "Invalid or expired token" });

//     const hash = await bcrypt.hash(password, 10);

//     await prisma.user.update({
//       where: { id: tokenEntry.user.id },
//       data: { password: hash },
//     });

//     await prisma.passwordResetToken.delete({ where: { id: tokenEntry.id } });

//     res.json({ message: "Password reset successful" });
//   } catch (err) {
//     console.error("Reset password error:", err);
//     res.status(500).json({ message: "Could not reset password" });
//   }
// });

// export default router;
