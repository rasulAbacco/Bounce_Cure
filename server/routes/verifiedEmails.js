// verifiedEmails.js - Updated for Vite frontend on port 5173
import express from "express";
import crypto from "crypto";
import sgMail from "@sendgrid/mail";
import { prisma } from "../prisma/prismaClient.js";
import cors from "cors";

const router = express.Router();

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_CMP_API_KEY);

// Enable CORS for frontend
router.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Send verification email
router.post("/send-verification", async (req, res) => {
  try {
    const { email, fromName } = req.body;

    if (!email || !fromName) {
      return res.status(400).json({ error: "Email and sender name are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Generate shorter verification token (32 characters)
    const verificationToken = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Check if email already exists
    let verifiedEmail = await prisma.campaignVerifiedEmail.findUnique({
      where: { email }
    });

    if (verifiedEmail) {
      if (verifiedEmail.isVerified) {
        return res.status(200).json({ 
          message: "Email is already verified",
          isVerified: true 
        });
      }
      // Update existing record
      verifiedEmail = await prisma.campaignVerifiedEmail.update({
        where: { email },
        data: {
          verificationToken,
          expiresAt,
          fromName
        }
      });
    } else {
      // Create new verification record
      verifiedEmail = await prisma.campaignVerifiedEmail.create({
        data: {
          email,
          fromName,
          verificationToken,
          expiresAt,
          isVerified: false
        }
      });
    }

    // Verify token was stored correctly
    const storedRecord = await prisma.campaignVerifiedEmail.findUnique({
      where: { email }
    });

    console.log(`Generated token for ${email}:`, verificationToken);
    console.log(`Token stored in database:`, storedRecord.verificationToken);
    console.log(`Token expires at:`, expiresAt);
    
    // Check if token was stored correctly
    if (storedRecord.verificationToken !== verificationToken) {
      throw new Error('Token was not stored correctly in the database');
    }

    // Send verification email - Updated to use Vite frontend URL
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    
    // Validate sender email
    const senderEmail = process.env.VERIFIED_SENDER_EMAIL;
    if (!senderEmail) {
      throw new Error('VERIFIED_SENDER_EMAIL environment variable is not set');
    }

    // Validate sender email format
    if (!emailRegex.test(senderEmail)) {
      throw new Error(`Invalid sender email format: ${senderEmail}`);
    }

    const msg = {
      to: email,
      from: {
        email: senderEmail,
        name: 'Email Marketing Platform'
      },
      subject: 'Verify your sender email address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Email Address</title>
        </head>
        <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td align="center" style="padding:40px 20px;">
                        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:8px;">
                            <tr>
                                <td style="padding:40px;">
                                    <h1 style="margin:0 0 20px 0;font-size:24px;color:#333333;text-align:center;">
                                        Verify Your Email Address
                                    </h1>
                                    <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:#333333;">
                                        Hi ${fromName},
                                    </p>
                                    <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:#333333;">
                                        To start sending email campaigns from <strong>${email}</strong>, please verify your email address by clicking the button below.
                                    </p>
                                    <table cellpadding="0" cellspacing="0" border="0" style="margin:30px auto;">
                                        <tr>
                                            <td style="background-color:#c2831f;padding:15px 30px;border-radius:6px;">
                                                <a href="${verificationUrl}" style="color:#ffffff;text-decoration:none;font-weight:bold;font-size:16px;">
                                                    Verify Email Address
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="margin:30px 0 10px 0;font-size:14px;color:#666666;">
                                        Or copy and paste this link in your browser:
                                    </p>
                                    <p style="margin:0 0 20px 0;font-size:14px;color:#007bff;word-break:break-all;">
                                        ${verificationUrl}
                                    </p>
                                    <p style="margin:20px 0 0 0;font-size:12px;color:#999999;">
                                        This verification link will expire in 24 hours. If you didn't request this verification, you can safely ignore this email.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
      `
    };

    await sgMail.send(msg);

    res.status(200).json({
      message: "Verification email sent successfully",
      email: email
    });

  } catch (error) {
    console.error("Error sending verification email:", error);
    
    // Enhanced error handling for SendGrid errors
    if (error.response) {
      console.error("SendGrid API Error:", {
        status: error.response.statusCode,
        body: error.response.body,
        headers: error.response.headers
      });
      
      return res.status(500).json({ 
        error: "Failed to send verification email",
        details: error.response.body.errors.map(e => e.message).join(", ")
      });
    }
    
    res.status(500).json({ 
      error: "Failed to send verification email",
      details: error.message 
    });
  }
});

// Verify email token
// verifiedEmails.js - Updated with comprehensive debugging
router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    
    console.log("=== VERIFICATION ATTEMPT ===");
    console.log("Raw token from URL:", token);
    console.log("Token length:", token.length);
    
    // Check token length (should be 32 characters)
    if (token.length !== 32) {
      console.error(`Invalid token length: ${token.length}, expected 32`);
      return res.status(400).json({ 
        error: "Invalid verification token",
        details: "The token is not the expected length."
      });
    }
    
    // Log database query attempt
    console.log("Attempting to find token in database...");
    const verifiedEmail = await prisma.campaignVerifiedEmail.findUnique({
      where: { verificationToken: token }
    });
    
    console.log("Database query result:", verifiedEmail ? "Found" : "Not found");
    
    if (!verifiedEmail) {
      // Get recent records for debugging
      const recentRecords = await prisma.campaignVerifiedEmail.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      });
      
      console.log("Recent records in database:");
      recentRecords.forEach((record, index) => {
        console.log(`Record ${index + 1}:`, {
          id: record.id,
          email: record.email,
          token: record.verificationToken,
          isVerified: record.isVerified,
          expiresAt: record.expiresAt
        });
      });
      
      return res.status(400).json({ 
        error: "Invalid verification token",
        details: "The verification token is invalid or has already been used.",
        debug: {
          tokenSearched: token,
          recentRecords: recentRecords.map(r => ({
            email: r.email,
            token: r.verificationToken,
            isVerified: r.isVerified
          }))
        }
      });
    }
    
    // Log expiration check
    const now = new Date();
    const expiresAt = new Date(verifiedEmail.expiresAt);
    console.log("Expiration check:");
    console.log("  Current time:", now.toISOString());
    console.log("  Expires at:", expiresAt.toISOString());
    console.log("  Is expired:", now > expiresAt);
    
    if (now > expiresAt) {
      return res.status(400).json({ 
        error: "Verification token has expired",
        details: "Please request a new verification email.",
        debug: {
          currentTime: now.toISOString(),
          expiresAt: expiresAt.toISOString()
        }
      });
    }
    
    // Log verification status check
    console.log("Verification status:", verifiedEmail.isVerified);
    
    if (verifiedEmail.isVerified) {
      return res.status(200).json({ 
        message: "Email is already verified",
        email: verifiedEmail.email 
      });
    }
    
    // Log update attempt
    console.log("Attempting to mark email as verified...");
    const updatedRecord = await prisma.campaignVerifiedEmail.update({
      where: { id: verifiedEmail.id },
      data: {
        isVerified: true,
        verifiedAt: now,
        verificationToken: null // Clear the token to prevent reuse
      }
    });
    
    console.log("Update successful. New record state:", {
      isVerified: updatedRecord.isVerified,
      verifiedAt: updatedRecord.verifiedAt,
      verificationToken: updatedRecord.verificationToken
    });
    
    console.log(`Email ${verifiedEmail.email} verified successfully`);

    res.status(200).json({
      message: "Email verified successfully",
      email: verifiedEmail.email,
      fromName: verifiedEmail.fromName
    });

  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ 
      error: "Failed to verify email",
      details: error.message 
    });
  }
});

// Debug endpoint for troubleshooting
router.get("/debug-verification/:token", async (req, res) => {
  try {
    const { token } = req.params;
    
    console.log("=== DEBUG VERIFICATION ===");
    console.log("Token received:", token);
    console.log("Token length:", token.length);
    
    // Step 1: Check token format
    if (token.length !== 32) {
      return res.json({
        status: "error",
        step: "token_format",
        message: `Invalid token length: ${token.length}, expected 32`
      });
    }
    
    // Step 2: Database query
    console.log("Querying database for token...");
    const verifiedEmail = await prisma.campaignVerifiedEmail.findUnique({
      where: { verificationToken: token }
    });
    
    if (!verifiedEmail) {
      // Try to find all records to see if any exist
      const allRecords = await prisma.campaignVerifiedEmail.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      });
      
      return res.json({
        status: "error",
        step: "database_query",
        message: "Token not found in database",
        tokenSearched: token,
        recentRecords: allRecords.map(r => ({
          email: r.email,
          token: r.verificationToken,
          isVerified: r.isVerified
        }))
      });
    }
    
    // Step 3: Check expiration
    const now = new Date();
    const expiresAt = new Date(verifiedEmail.expiresAt);
    const isExpired = now > expiresAt;
    
    // Step 4: Check verification status
    const isVerified = verifiedEmail.isVerified;
    
    return res.json({
      status: "success",
      step: "verification_check",
      tokenFound: true,
      email: verifiedEmail.email,
      isVerified,
      isExpired,
      expiresAt: expiresAt.toISOString(),
      currentTime: now.toISOString(),
      timeRemaining: Math.max(0, expiresAt - now)
    });
    
  } catch (error) {
    console.error("Debug verification error:", error);
    res.status(500).json({
      status: "error",
      step: "unexpected_error",
      message: error.message
    });
  }
});

// Check if email is verified
router.get("/check/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const verifiedEmail = await prisma.campaignVerifiedEmail.findUnique({
      where: { email: decodeURIComponent(email) }
    });

    if (!verifiedEmail) {
      return res.status(404).json({ 
        isVerified: false,
        message: "Email not found" 
      });
    }

    res.status(200).json({
      isVerified: verifiedEmail.isVerified,
      email: verifiedEmail.email,
      fromName: verifiedEmail.fromName,
      verifiedAt: verifiedEmail.verifiedAt
    });

  } catch (error) {
    console.error("Error checking email verification:", error);
    res.status(500).json({ 
      error: "Failed to check email verification",
      details: error.message 
    });
  }
});

// Get all verified emails for a user
router.get("/", async (req, res) => {
  try {
    const verifiedEmails = await prisma.campaignVerifiedEmail.findMany({
      where: { isVerified: true },
      select: {
        id: true,
        email: true,
        fromName: true,
        verifiedAt: true
      },
      orderBy: { verifiedAt: 'desc' }
    });

    res.status(200).json(verifiedEmails);
  } catch (error) {
    console.error("Error fetching verified emails:", error);
    res.status(500).json({ 
      error: "Failed to fetch verified emails",
      details: error.message 
    });
  }
});

// Delete verified email
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.campaignVerifiedEmail.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ message: "Verified email deleted successfully" });
  } catch (error) {
    console.error("Error deleting verified email:", error);
    res.status(500).json({ 
      error: "Failed to delete verified email",
      details: error.message 
    });
  }
});

// Resend verification email
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find the email record
    const verifiedEmail = await prisma.campaignVerifiedEmail.findUnique({
      where: { email }
    });

    if (!verifiedEmail) {
      return res.status(404).json({ error: "Email not found in our system" });
    }

    if (verifiedEmail.isVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update the record with new token
    await prisma.campaignVerifiedEmail.update({
      where: { email },
      data: {
        verificationToken,
        expiresAt
      }
    });

    // Send verification email - Updated to use Vite frontend URL
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    
    const senderEmail = process.env.VERIFIED_SENDER_EMAIL;
    if (!senderEmail) {
      throw new Error('VERIFIED_SENDER_EMAIL environment variable is not set');
    }

    const msg = {
      to: email,
      from: {
        email: senderEmail,
        name: 'Email Marketing Platform'
      },
      subject: 'Verify your sender email address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Email Address</title>
        </head>
        <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td align="center" style="padding:40px 20px;">
                        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:8px;">
                            <tr>
                                <td style="padding:40px;">
                                    <h1 style="margin:0 0 20px 0;font-size:24px;color:#333333;text-align:center;">
                                        Verify Your Email Address
                                    </h1>
                                    <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:#333333;">
                                        Hi ${verifiedEmail.fromName},
                                    </p>
                                    <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:#333333;">
                                        To start sending email campaigns from <strong>${email}</strong>, please verify your email address by clicking the button below.
                                    </p>
                                    <table cellpadding="0" cellspacing="0" border="0" style="margin:30px auto;">
                                        <tr>
                                            <td style="background-color:#c2831f;padding:15px 30px;border-radius:6px;">
                                                <a href="${verificationUrl}" style="color:#ffffff;text-decoration:none;font-weight:bold;font-size:16px;">
                                                    Verify Email Address
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="margin:30px 0 10px 0;font-size:14px;color:#666666;">
                                        Or copy and paste this link in your browser:
                                    </p>
                                    <p style="margin:0 0 20px 0;font-size:14px;color:#007bff;word-break:break-all;">
                                        ${verificationUrl}
                                    </p>
                                    <p style="margin:20px 0 0 0;font-size:12px;color:#999999;">
                                        This verification link will expire in 24 hours. If you didn't request this verification, you can safely ignore this email.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
      `
    };

    await sgMail.send(msg);

    res.status(200).json({
      message: "Verification email resent successfully",
      email: email
    });

  } catch (error) {
    console.error("Error resending verification email:", error);
    
    if (error.response) {
      console.error("SendGrid API Error:", {
        status: error.response.statusCode,
        body: error.response.body,
        headers: error.response.headers
      });
      
      return res.status(500).json({ 
        error: "Failed to resend verification email",
        details: error.response.body.errors.map(e => e.message).join(", ")
      });
    }
    
    res.status(500).json({ 
      error: "Failed to resend verification email",
      details: error.message 
    });
  }
});

export { router };