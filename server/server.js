<<<<<<< HEAD
import express from 'express';
import cors from 'cors';
import verificationRoutes from './routes/verificationRoutes.js';

const app = express();

app.use(cors());
=======
// server.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
>>>>>>> de9464cdbd3f1c9eab3d077282a3ed9d97051597
app.use(express.json());

app.use('/', verificationRoutes);

app.get('/', (req, res) => {
  res.send('Backend is running...');
});

<<<<<<< HEAD
const PORT = 5000;
=======
// Routes
app.use('/api/auth', authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
>>>>>>> de9464cdbd3f1c9eab3d077282a3ed9d97051597
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
