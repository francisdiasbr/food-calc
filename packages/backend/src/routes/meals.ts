import { Router, Request, Response } from 'express';
import Meal from '../models/Meal.js';

const router = Router();

// GET /api/meals - Listar todas as refeições
router.get('/', async (req: Request, res: Response) => {
  try {
    const meals = await Meal.find().sort({ date: -1, createdAt: -1 });
    res.json(meals);
  } catch (error) {
    console.error('Erro ao buscar refeições:', error);
    res.status(500).json({ error: 'Erro ao buscar refeições' });
  }
});

// GET /api/meals/:id - Buscar uma refeição específica
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ error: 'Refeição não encontrada' });
    }
    res.json(meal);
  } catch (error) {
    console.error('Erro ao buscar refeição:', error);
    res.status(500).json({ error: 'Erro ao buscar refeição' });
  }
});

// POST /api/meals - Criar nova refeição
router.post('/', async (req: Request, res: Response) => {
  try {
    const { date, mealType, foods } = req.body;

    if (!date || !mealType || !foods || !Array.isArray(foods)) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const newMeal = new Meal({
      date,
      mealType,
      foods,
      createdAt: new Date(),
    });

    const savedMeal = await newMeal.save();
    res.status(201).json(savedMeal);
  } catch (error) {
    console.error('Erro ao salvar refeição:', error);
    res.status(500).json({ error: 'Erro ao salvar refeição' });
  }
});

// PUT /api/meals/:id - Atualizar refeição
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { date, mealType, foods } = req.body;

    const meal = await Meal.findByIdAndUpdate(
      req.params.id,
      { date, mealType, foods },
      { new: true, runValidators: true }
    );

    if (!meal) {
      return res.status(404).json({ error: 'Refeição não encontrada' });
    }

    res.json(meal);
  } catch (error) {
    console.error('Erro ao atualizar refeição:', error);
    res.status(500).json({ error: 'Erro ao atualizar refeição' });
  }
});

// DELETE /api/meals/:id - Deletar refeição
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const meal = await Meal.findByIdAndDelete(req.params.id);

    if (!meal) {
      return res.status(404).json({ error: 'Refeição não encontrada' });
    }

    res.json({ message: 'Refeição deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar refeição:', error);
    res.status(500).json({ error: 'Erro ao deletar refeição' });
  }
});

export default router;




