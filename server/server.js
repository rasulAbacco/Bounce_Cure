import express from 'express';
import cors from 'cors';
import verificationRoutes from './routes/verificationRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', verificationRoutes);

app.get('/', (req, res) => {
  res.send('Backend is running...');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
