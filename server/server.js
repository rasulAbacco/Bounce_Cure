// server.js
import express from 'express';
import cors from 'cors';
import verificationRoutes from './routes/verificationRoutes.js'; // Use .js extension in ES modules

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Use routes
app.use('/verification', verificationRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running...');
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
