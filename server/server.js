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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.BASE_URL,
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use('/dashboard', dashboardCRM);
 
app.use('/api/auth', authRoutes);
app.use('/verification', verificationRoutes);

// ✅ Support routes with middleware
app.use('/api/support', supportMiddleware, supportRoutes);

// ✅ Protected settings route
app.use('/api/settings', verifySettingsAuth, settingsRoutes);

//push notifications
app.use("/api/push", pushRoutes);
app.use("/notifications", notificationsRoutes);

app.get('/', (req, res) => {
  res.send('Backend is running...');
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

