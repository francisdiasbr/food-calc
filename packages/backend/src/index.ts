import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database.js';
import caloriesRouter from './routes/calories.js';
import mealsRouter from './routes/meals.js';
import profileRouter from './routes/profile.js';
import suggestionsRouter from './routes/suggestions.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Conectar ao MongoDB
connectDatabase();

// Rotas
app.use('/api/calories', caloriesRouter);
app.use('/api/meals', mealsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/suggestions', suggestionsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
