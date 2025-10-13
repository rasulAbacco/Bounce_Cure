// server/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

import { prisma } from "../prisma/prismaClient.js";
import sendEmail from '../utils/emailService.js';
import { generateOTP } from "../utils/generateOTP.js";
import { generateQRCode } from "../utils/generateQRCode.js";
import speakeasy from 'speakeasy'; // for TOTP 2FA
 

// Signup
export const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: { firstName, lastName, email, password: hashedPassword }
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser.id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                name: `${newUser.firstName} ${newUser.lastName}`.trim(),
                email: newUser.email,
                profileImage: newUser.profileImage || null

            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Create login log
        await prisma.loginLog.create({
            data: {
                userId: user.id,
                ipAddress: req.ip,
                device: req.headers['user-agent'],
                location: 'Unknown'
            }
        });

        // Create session
        await prisma.session.create({
            data: {
                userId: user.id,
                ipAddress: req.ip,
                device: req.headers['user-agent']
            }
        });

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`.trim(),
                email: user.email,
                profileImage: user.profileImage || null

            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get login logs
export const getLoginLogs = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const isAdmin = (req.user.role || "").toUpperCase() === "ADMIN";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const logs = await prisma.loginLog.findMany({
            where: isAdmin ? {} : { userId: req.user.id },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                }
            }
        });

        const totalLogs = await prisma.loginLog.count({
            where: isAdmin ? {} : { userId: req.user.id }
        });

        res.status(200).json({
            success: true,
            message: "Login logs fetched successfully",
            pagination: {
                total: totalLogs,
                page,
                limit,
                totalPages: Math.ceil(totalLogs / limit)
            },
            data: logs
        });
    } catch (error) {
        console.error("Error fetching login logs:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Send verification email
export const sendVerificationEmail = async (req, res) => {
  const { email } = req.user;  // user email from JWT
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const link = `${process.env.BASE_URL}/verify-email?token=${token}`;

  try {
    await sendEmail({
      to: email,
      subject: "Verify your account",
      html: `<p>Click to verify:</p><a href="${link}">${link}</a>`
    });

    res.json({ success: true, message: "Verification email sent!" });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};




// Verify email
export const verifyEmail = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).send("Missing verification token.");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded?.email;

        if (!email) {
            return res.status(400).send("Invalid token payload.");
        }

        await prisma.user.update({
            where: { email },
            data: { isVerified: true },
        });

        // ✅ Redirect to frontend success page
        res.redirect(`${process.env.FRONTEND_URL}/email-verified`);

    } catch (error) {
        console.error("Email verification error:", error.message || error);

        // ❌ Redirect to error page
        res.redirect(`${process.env.FRONTEND_URL}/email-verification-failed`);
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both old and new passwords are required" });
        }

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        if (!user || !user.password) {
            return res.status(404).json({ message: "User not found or password missing" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password incorrect" });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashed }
        });

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Enable 2FA
// authController.js

// Add these functions to your authController.js

// Enable 2FA - sends OTP to user's email
export const enable2FA = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate and send OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Delete any existing OTPs for this user
        await prisma.oTPCode.deleteMany({ where: { userId: user.id } });

        // Store new OTP with expiry
        await prisma.oTPCode.create({
            data: {
                code: otp,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
                userId: user.id,
            },
        });

        // Send OTP email
        await sendEmail({
            to: user.email,
            from: "info@abaccotech.com",
            subject: "Your 2FA Verification Code",
            text: `Your OTP code is: ${otp}. This code will expire in 10 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-bottom: 20px;">Two-Factor Authentication</h2>
                        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
                            You requested to enable Two-Factor Authentication for your account.
                        </p>
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                            <p style="color: #666; margin-bottom: 10px; font-size: 14px;">Your verification code is:</p>
                            <h1 style="color: #007bff; font-size: 36px; letter-spacing: 8px; margin: 10px 0;">${otp}</h1>
                        </div>
                        <p style="color: #999; font-size: 14px; margin-top: 20px;">
                            This code will expire in 10 minutes. If you didn't request this, please ignore this email.
                        </p>
                    </div>
                </div>
            `,
        });

        console.log(`✅ 2FA OTP sent to: ${user.email}`);
        res.status(200).json({ 
            success: true, 
            message: 'OTP sent to your email successfully' 
        });

    } catch (error) {
        console.error('Enable 2FA error:', error);
        res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
    }
};

// Verify 2FA OTP and enable 2FA for user
export const verify2FA = async (req, res) => {
    try {
        const { otp } = req.body;
        const userId = req.user.id;

        if (!otp) {
            return res.status(400).json({ message: 'OTP is required' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the latest valid OTP for the user
        const otpRecord = await prisma.oTPCode.findFirst({
            where: {
                userId,
                code: otp,
                expiresAt: { gt: new Date() },  // not expired
            },
            orderBy: { expiresAt: 'desc' }
        });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Enable 2FA on user
        await prisma.user.update({
            where: { id: userId },
            data: { is2FAEnabled: true },
        });

        // Delete all OTP codes for this user after successful verification
        await prisma.oTPCode.deleteMany({ where: { userId } });

        console.log(`✅ 2FA enabled for user: ${user.email}`);
        res.json({ 
            success: true, 
            message: '2FA enabled successfully' 
        });

    } catch (err) {
        console.error('Verify 2FA error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Disable 2FA
export const disable2FA = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.is2FAEnabled) {
            return res.status(400).json({ message: '2FA is not enabled for this account' });
        }

        // Disable 2FA
        await prisma.user.update({
            where: { id: userId },
            data: { is2FAEnabled: false },
        });

        // Delete any pending OTP codes
        await prisma.oTPCode.deleteMany({ where: { userId } });

        console.log(`✅ 2FA disabled for user: ${user.email}`);
        res.json({ 
            success: true, 
            message: '2FA disabled successfully' 
        });

    } catch (error) {
        console.error('Disable 2FA error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get user profile with 2FA status
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({ 
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
                isVerified: true,
                is2FAEnabled: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                ...user,
                name: `${user.firstName} ${user.lastName}`.trim()
            }
        });

    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Send OTP
export const sendOTP = async (user) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with expiry (preferable with a separate OTP model)
    await prisma.oTPCode.create({
        data: {
            code: otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            userId: user.id,
        },
    });

    await sendEmail({
        to: user.email,
        subject: "Your OTP Code",
        text: `Your OTP is: ${otp}`,
        html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    });

    return otp;
};



// Fixed backend version of getSecurityLogs
export const getSecurityLogs = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const logs = await prisma.loginLog.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" },
            take: 5,  // <-- limits to 4 rows
        });

        res.status(200).json({ success: true, data: logs });
    } catch (err) {
        console.error("Error fetching security logs:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get active sessions
export const getActiveSessions = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });

        const sessions = await prisma.session.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" },
        });

        res.status(200).json({ success: true, data: sessions });
    } catch (err) {
        console.error("Error fetching sessions:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const createSession = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });

        const { device, ipAddress } = req.body;

        // fetch all sessions of this user
        const existingSessions = await prisma.session.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "asc" }, // oldest first
        });

        if (existingSessions.length >= 3) {
            // delete the oldest one
            await prisma.session.delete({
                where: { id: existingSessions[0].id },
            });
        }

        // create new session
        const newSession = await prisma.session.create({
            data: {
                userId: req.user.id,
                device: device || "Unknown Device",
                ipAddress: ipAddress || "N/A",
            },
        });

        res.status(201).json({ success: true, data: newSession });
    } catch (err) {
        console.error("Error creating session:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};







export const verifyAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

export const testEmail = async (req, res) => {
    try {
        await sendEmail({
            to: "user@example.com",
            subject: "Test Email",
            html: "<h1>Hello from Ethereal!</h1>",
        });

        res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
};




