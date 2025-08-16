

// server.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import { initEmail } from "./utils/emailService.js";
import supportRoutes from "./routes/supportRoutes.js";
import bodyParser from "body-parser";
// Load environment variables
dotenv.config();


/* Middlewares */
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/* Routes */
app.use("/verification", verificationRoutes);

initEmail();

app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true               // allow cookies & auth headers
}));
app.use(express.json());

// Use routes
app.use('/verification', verificationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/support', supportRoutes); 

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running...');
});

app.use("/api/users", authRoutes);

/* Start */
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
