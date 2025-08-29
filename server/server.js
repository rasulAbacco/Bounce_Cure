import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import supportMiddleware from "./middleware/supportMiddleware.js";
import pushRoutes from "./routes/pushRoutes.js";
import bodyParser from 'body-parser';
import settingsRoutes from './routes/settingsRoutes.js';
import verifySettingsAuth from './middleware/settingsMiddleware.js';
import dashboardCRM from './routes/dashboardCRM.js';
import notificationsRoutes from "./routes/notificationsRoutes.js"; // ✅ if file is inside server/routes
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// app.use(cors({
//   origin: process.env.BASE_URL,
//   credentials: true,
// }));

const allowedOrigins = [
  'http://localhost:5173',
  'https://bouncecure.onrender.com'
];

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


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Mount routes
app.use("/api/contacts", contactRoutes);

// Mount routes
app.use("/api/auth", passwordRoutes);

// ✅ Routes
app.use('/dashboard', dashboardCRM);

app.use('/api/auth', authRoutes);
app.use('/verification', verificationRoutes);

app.use("/api/verification", advancedVerificationRoute);

app.use("/auth", forgotPasswordRoutes);


// ✅ Support routes with middleware
app.use('/api/support', supportRoutes);

// ✅ Protected settings route
app.use('/api/settings', verifySettingsAuth, settingsRoutes);

// Push notifications
app.use("/api/push", pushRoutes);
app.use("/notifications", notificationsRoutes);

//campaign
// Routes
app.use('/api/sendContacts', sendContactsRoutes);
app.use('/api/sendCampaigns', sendCampaignsRoutes);

app.use("/tasks", taskRoutes);
app.use("/deals", dealsRoutes);
app.use("/contact", contactCRMRoutes);
//
app.use('/api/campaigncontacts', campaignContactsRoutes);
app.use('/api/campaigns', campaignsRoutes);


app.get('/', (req, res) => {
  res.send('Backend is running...');
});



// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

