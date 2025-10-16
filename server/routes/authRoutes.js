// server/routes/authRoutes.js
import express from 'express';
import multer from 'multer';
import { googleAuth } from "../controllers/googleAuth.js"; // 👈 import h

import {
    signup,
    login,
    sendVerificationEmail,
    verifyEmail,
    sendOTP,
    changePassword,
    enable2FA,
    getSecurityLogs,
    getActiveSessions,
    verify2FA,
    verifyAuth,
    testEmail,
    createSession,
    logoutSession,
    logoutAllSessions
} from '../controllers/authController.js';

import {
    updateEmail,
    updateName,
    uploadProfileImage,
    getMe,
    getProfileImage,
    getPlanLimit,
} from '../controllers/userController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer setup: store file in memory (no disk storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.get('/profile-image/:userId', getProfileImage);

// Protected routes (require authentication)
router.post('/send-verification-email', protect, sendVerificationEmail);
router.post('/send-otp', protect, sendOTP);
router.post('/change-password', protect, changePassword);
router.post('/2fa/enable', protect, enable2FA);
router.post('/verify-2fa', protect, verify2FA);
router.get('/security-logs', protect, getSecurityLogs);
router.get('/active-sessions', protect, getActiveSessions);
router.get('/users/me', protect, getMe);
router.put('/update-email', protect, updateEmail);
router.put('/update-name', protect, updateName);
router.put('/upload-profile-image', protect, upload.single('profileImage'), uploadProfileImage);

// Route that uses verifyAuth middleware instead of protect
router.post('/auth/send-verification-email', verifyAuth, sendVerificationEmail);

// Test route (optionally protect if desired)
router.get('/test-email', testEmail);
router.post("/google", googleAuth); // 👈 new route
// authRoutes.js
router.get("/plan-limit", protect, getPlanLimit);

// ✅ Active sessions
router.get("/active-sessions", protect, getActiveSessions);

// ✅ Create session (usually called after login)
router.post("/sessions", protect, createSession);

// ✅ Logout a specific session
router.delete("/sessions/:id", protect, logoutSession);

// ✅ Logout all sessions
router.delete("/sessions", protect, logoutAllSessions);


// Uncomment if you want to enable login logs endpoint
// router.get('/login-logs', protect, getLoginLogs);

export default router;
