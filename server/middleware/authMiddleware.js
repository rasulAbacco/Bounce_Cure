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
        console.log("Decoded token:", decoded);

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
        console.log("Decoded user (authMiddleware):", decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Token verification failed (authMiddleware):", error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

