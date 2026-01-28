import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import caloriesRouter from './routes/calories.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/calories', caloriesRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
