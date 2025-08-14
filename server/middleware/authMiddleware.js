// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
        console.warn("No token provided");
        return res.status(401).json({ message: "Not authorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded user (protect):", decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("Token verification failed (protect):", err.message);
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