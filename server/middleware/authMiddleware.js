// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

// middleware/authMiddleware.js
import { prisma } from "../prisma/prismaClient.js";

export const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
        console.warn("No token provided");
        return res.status(401).json({ message: "Not authorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: Number(decoded.id) }, // ensure number type
            select: { id: true, firstName: true, lastName: true, email: true }
        });

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user; // store full user object
        next();
    } catch (err) {
        console.error("Token verification failed:", err.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};



export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.warn("Authorization header missing or malformed");
        return res.status(401).json({ message: "Authorization token missing or invalid" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Token verification failed (authMiddleware):", error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export const logoutSession = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });

        const { sessionId } = req.params;

        await prisma.session.delete({
            where: { id: parseInt(sessionId, 10) }, // convert string -> Int
        });

        res.status(200).json({ success: true, message: "Session logged out" });
    } catch (err) {
        console.error("Error logging out session:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
