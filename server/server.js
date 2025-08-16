// server.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
// import { initEmail } from "./utils/emailService.js";
import supportRoutes from "./routes/supportRoutes.js";

dotenv.config();

// Load environment variables
dotenv.config();

const app = express();


// initEmail();
// Middleware
// app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));

app.use(cors({
  origin: process.env.BASE_URL, // frontend URL
  credentials: true               // allow cookies & auth headers
}));
app.use(express.json());

// Use routes
app.use('/verification', verificationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/support', supportRoutes);
app.use("/api/users", authRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running...');
});


// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
