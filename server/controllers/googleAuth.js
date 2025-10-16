import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/prismaClient.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @route POST /api/auth/google
 * @desc Google OAuth login / signup
 * @access Public
 */
export const googleAuth = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ message: "Missing Google ID token" });
        }

        // ✅ Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        if (!payload) {
            return res.status(401).json({ message: "Invalid Google token" });
        }

        const {
            email,
            email_verified,
            given_name,
            family_name,
            name,
            picture,
            sub: googleId,
        } = payload;

        if (!email_verified) {
            return res.status(400).json({ message: "Google email not verified" });
        }

        // ✅ Find user by email
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // ✅ Create new user from Google data
            user = await prisma.user.create({
                data: {
                    firstName: given_name || "",
                    lastName: family_name || "",
                    email,
                    password: null, // because OAuth user
                    googleId: String(googleId || ""),
                    profileImgUrl: picture || null, // ✅ use URL field, not Bytes
                },
            });
        } else {
            // ✅ Update only if Google data missing
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId: user.googleId || String(googleId || ""),
                    profileImgUrl: user.profileImgUrl || picture || null, // ✅ updated
                },
            });

            // ✅ Re-fetch updated user
            user = await prisma.user.findUnique({ where: { id: user.id } });
        }

        // ✅ Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // ✅ Log session
        try {
            await prisma.loginLog.create({
                data: {
                    userId: user.id,
                    ipAddress: req.ip || "unknown",
                    device: req.headers["user-agent"] || "unknown",
                    location: "Unknown",
                },
            });

            await prisma.session.create({
                data: {
                    userId: user.id,
                    ipAddress: req.ip || "unknown",
                    device: req.headers["user-agent"] || "unknown",
                },
            });
        } catch (logErr) {
            console.warn("⚠️ Could not log session:", logErr.message);
        }

        // ✅ Success response
        return res.status(200).json({
            message: "Google authentication successful",
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profileImgUrl: user.profileImgUrl, // ✅ always use URL
                name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || name,
            },
        });
    } catch (error) {
        console.error("❌ Google Auth Error:", error);
        return res.status(500).json({
            message: "Google authentication failed",
            error: error.message || "Internal Server Error",
        });
    }
};
