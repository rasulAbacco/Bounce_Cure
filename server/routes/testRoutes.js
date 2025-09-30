// server/routes/testRoutes.js
import express from "express";
import { protect, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Test route without authentication
router.get("/public", (req, res) => {
    res.json({ 
        message: "Public endpoint working", 
        timestamp: new Date().toISOString() 
    });
});

// Test route with lightweight token verification
router.get("/verify-token", verifyToken, (req, res) => {
    res.json({ 
        message: "Token verification successful", 
        user: req.user,
        timestamp: new Date().toISOString() 
    });
});

// Test route with full user protection (database query)
router.get("/protected", protect, (req, res) => {
    res.json({ 
        message: "Protected endpoint accessed successfully", 
        user: req.user,
        timestamp: new Date().toISOString() 
    });
});

// Debug route to check headers
router.get("/debug-headers", (req, res) => {
    res.json({
        message: "Debug headers endpoint",
        headers: req.headers,
        authHeader: req.headers.authorization,
        userAgent: req.headers['user-agent'],
        contentType: req.headers['content-type'],
        timestamp: new Date().toISOString()
    });
});

// Test route for user info
router.get("/me", protect, (req, res) => {
    res.json({
        message: "User info retrieved successfully",
        user: req.user,
        timestamp: new Date().toISOString()
    });
});

export default router;