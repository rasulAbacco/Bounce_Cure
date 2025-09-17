import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

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
// import fetchReplies from "./routes/FetchReplies.js";
import leadsRouter from "./routes/leads.js";
import listRoutes from "./routes/listRoutes.js";
import orderRoutes from "./routes/ordersRoutes.js";
import crmDashRoutes from "./routes/crmDashRoutes.js";
import emailsRouter from "./routes/emails.js";
import accountsRouter from "./routes/accounts.js";
import convRouter from "./routes/conversations.js";
import savedRepliesRouter from "./routes/savedReplies.js";
// Services
import { startEmailScheduler } from "./services/imapScheduler.js";
import { initSocket } from "./services/socketService.js";
// import  startSyncLoop  from "./services/syncService.js";
import { PrismaClient } from "@prisma/client";
import cron from 'node-cron';
import dashboardRoutes from "./routes/dashboardRoutes.js";

import multimediaRoutes from './routes/multimedia.js';
// Server and Socket
import http from "http";
import { Server as IOServer } from "socket.io";

// ENV setup
dotenv.config();
console.log("Loaded SG API key:", process.env.SG_EMAIL_VAL_API_KEY?.substring(0, 10));

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

// ✅ Use only express body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/contacts", contactRoutes);

app.use("/api/auth", authRoutes);         // <- Keep this before passwordRoutes
app.use("/api/auth", passwordRoutes);     // <- Combine later if needed
app.use("/dashboard", dashboardCRM);
app.use("/verification", verificationRoutes);

// ✅ Mount Routes
app.use("/api", dashboardRoutes);

app.use("/api/verification", advancedVerificationRoute);
app.use("/auth", forgotPasswordRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/settings", verifySettingsAuth, settingsRoutes);
app.use("/api/push", pushRoutes);
app.use("/notifications", notificationsRoutes);

//campaign
app.use('/api/sendContacts', sendContactsRoutes);
app.use('/api/sendCampaigns', sendCampaignsRoutes);
// Multimedia campaigns
app.use('/api/multimedia', multimediaRoutes);
app.use("/tasks", taskRoutes);
app.use("/deals", dealsRoutes);
app.use("/api/leads", leadsRouter);
app.use("/lists", listRoutes);
app.use("/contact", contactCRMRoutes);
app.use("/orders", orderRoutes);
app.use("/stats", crmDashRoutes);
app.use("/api/emails", emailsRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/conversations", convRouter);
app.use("/api/saved-replies", savedRepliesRouter);
app.use("/api/campaigncontacts", campaignContactsRoutes);
app.use("/api/campaigns", campaignsRoutes);

// Socket service
initSocket(io);


// IMAP sync loop
// startSyncLoop(prisma);


app.use('/api/campaigncontacts', campaignContactsRoutes);
app.use('/api/campaigns', campaignsRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Backend is running...');
});

// Start server
server.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});
