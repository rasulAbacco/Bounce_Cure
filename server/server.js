
// server.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));




app.use(cors());

app.use(express.json());

app.use('/', verificationRoutes);

app.get('/', (req, res) => {
  res.send('Backend is running...');
});

app.use('/api/auth', authRoutes);
const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});