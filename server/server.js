// server/server.js

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import http from "http";
import { Server as IOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";

// Routes
import authRoutes from './routes/authRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import pushRoutes from "./routes/pushRoutes.js";
import settingsRoutes from './routes/settingsRoutes.js';
import verifySettingsAuth from './middleware/settingsMiddleware.js';
import dashboardCRM from './routes/dashboardCRM.js';
import notificationsRoutes from "./routes/notificationsRoutes.js";
import forgotPasswordRoutes from "./routes/forgotPasswordRoute.js";
import advancedVerificationRoute from "./routes/advancedVerification.js";
import passwordRoutes from "./routes/passwordRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import sendContactsRoutes from "./routes/SendCampaignContact.js";
import sendCampaignsRoutes from "./routes/CampaignRoutes.js";
import taskRoutes from "./routes/tasks.js";
import dealsRoutes from "./routes/deals.js";
import contactCRMRoutes from "./routes/contactCRM.js";
import { router as campaignContactsRoutes } from './routes/contacts.js';
import { router as campaignsRoutes } from './routes/campaigns.js';
import leadsRouter from "./routes/leads.js";
import listRoutes from "./routes/listRoutes.js";
import orderRoutes from "./routes/ordersRoutes.js";
import crmDashRoutes from "./routes/crmDashRoutes.js";
import emailsRouter from "./routes/emails.js";
import accountsRouter from "./routes/accounts.js";
import convRouter from "./routes/conversations.js";
import savedRepliesRouter from "./routes/savedReplies.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import multimediaRoutes from './routes/multimedia.js';
import invoiceRoutes from "./routes/invoiceRoutes.js";
import campaignsAutoRouter from './routes/campaignsAuto.js';
import { router as verifiedEmailsRouter } from './routes/verifiedEmails.js';

// Services
import { startEmailScheduler } from "./services/imapScheduler.js";
import { initSocket } from "./services/socketService.js";

// Middleware
import { protect } from "./middleware/auth.js";

import dashboardRoutes from "./routes/dashboardRoutes.js";

import multimediaRoutes from './routes/multimedia.js';
// Server and Socket
import http from "http";
import { Server as IOServer } from "socket.io";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import campaignsAutoRouter from './routes/campaignsAuto.js'; // adjust path as needed
import { router as verifiedEmailsRouter } from './routes/verifiedEmails.js'; // Add this import
// example: in src/index.js or server.js
import verifiedEmailsRouters from "./routes/userMailVerify.js"; // adjust path as needed

import sendgridSendersRouter from "./routes/sendgridSenders.js";


// ENV setup
dotenv.config();

// Init
startEmailScheduler();
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://bouncecure.onrender.com'
];

// HTTP server and socket
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
});

// CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------- Routes -----------------------

// Test protected route
app.get("/api/dashboard-data", protect, (req, res) => {
  res.json({ message: "Secret data for logged-in users", user: req.user });
});

// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", passwordRoutes); // Optional, combine with authRoutes if desired

// Dashboard & verification
app.use("/dashboard", dashboardCRM);
app.use("/verification", verificationRoutes);
app.use("/api", dashboardRoutes);

// Other API routes
app.use("/api", invoiceRoutes);
app.use("/api/verification", advancedVerificationRoute);
app.use("/auth", forgotPasswordRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/settings", verifySettingsAuth, settingsRoutes);
app.use("/api/push", pushRoutes);
app.use("/notifications", notificationsRoutes);

// Campaign and multimedia routes
app.use("/api/automation", protect, campaignsAutoRouter);
app.use('/api/sendContacts', protect, sendContactsRoutes);
app.use('/api/sendCampaigns', protect, sendCampaignsRoutes);
app.use('/api/multimedia', protect, multimediaRoutes);
app.use("/tasks", protect, taskRoutes);
app.use("/deals", protect, dealsRoutes);
app.use("/api/leads", protect, leadsRouter);
app.use("/lists", protect, listRoutes);
app.use("/contact", protect, contactCRMRoutes);
app.use("/orders", protect, orderRoutes);
app.use("/stats", protect, crmDashRoutes);
app.use("/api/emails", protect, emailsRouter);
app.use("/api/accounts", protect, accountsRouter);
app.use("/api/conversations", protect, convRouter);
app.use("/api/saved-replies", protect, savedRepliesRouter);
app.use("/api/campaigncontacts", protect, campaignContactsRoutes);
app.use("/api/campaigns", protect, campaignsRoutes);
app.use("/api/verified-emails", protect, verifiedEmailsRouter);



// Socket service
initSocket(io);

app.use("/api/senders", sendgridSendersRouter);

// Root route
app.get('/', (req, res) => {
  res.send('Backend is running...');
});



// Socket service
initSocket(io);

// Start server
server.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});

// Email verification route
app.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) return res.status(400).send('Verification token is required');

    const record = await prisma.campaignVerifiedEmail.findFirst({
      where: { verificationToken: token }
    });

    if (!record) return res.status(404).send('Invalid verification token');

    if (record.expiresAt && new Date() > record.expiresAt) {
      return res.status(400).send('Verification token has expired');
    }

    await prisma.campaignVerifiedEmail.update({
      where: { id: record.id },
      data: { 
        isVerified: true, 
        verifiedAt: new Date(),
        verificationToken: null
      }
    });

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email Verified</title>
          <style>
            body { font-family: Arial; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f5f5f5; }
            .container { background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
            h1 { color: #4CAF50; margin-bottom: 20px; }
            p { color: #333; margin-bottom: 30px; }
            .btn { background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Email Verified Successfully!</h1>
            <p>Thank you for verifying your email address. You can now close this window.</p>
            <button class="btn" onclick="window.close()">Close Window</button>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).send('An error occurred during email verification');
  }
});