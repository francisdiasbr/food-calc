import { Router, Request, Response } from 'express';
import OpenAI from 'openai';

const router = Router();

let openai: OpenAI;
function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

interface CalorieRequest {
  food: string;
  quantity: string;
}

router.post('/', async (req: Request<{}, {}, CalorieRequest>, res: Response) => {
  const { food, quantity } = req.body;

  if (!food || !quantity) {
    res.status(400).json({ error: 'Food and quantity are required' });
    return;
  }

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a nutritionist assistant. When given a food and quantity, provide accurate nutritional information in JSON format. For each nutrient, include the amount, daily recommended value (DV based on a 2000 calorie diet for adults), and percentage of DV. Always respond with this exact JSON structure:
{
  "calories": { "value": number, "dv": 2000, "percent": number },
  "macros": {
    "protein": { "value": "Xg", "dv": "50g", "percent": number },
    "carbs": { "value": "Xg", "dv": "300g", "percent": number },
    "fat": { "value": "Xg", "dv": "65g", "percent": number },
    "fiber": { "value": "Xg", "dv": "25g", "percent": number }
  },
  "micros": {
    "vitaminA": { "value": "X mcg", "dv": "900 mcg", "percent": number },
    "vitaminC": { "value": "X mg", "dv": "90 mg", "percent": number },
    "vitaminD": { "value": "X mcg", "dv": "20 mcg", "percent": number },
    "vitaminE": { "value": "X mg", "dv": "15 mg", "percent": number },
    "vitaminK": { "value": "X mcg", "dv": "120 mcg", "percent": number },
    "vitaminB1": { "value": "X mg", "dv": "1.1 mg", "percent": number },
    "vitaminB2": { "value": "X mg", "dv": "1.1 mg", "percent": number },
    "vitaminB3": { "value": "X mg", "dv": "14 mg", "percent": number },
    "vitaminB5": { "value": "X mg", "dv": "5 mg", "percent": number },
    "vitaminB6": { "value": "X mg", "dv": "1.3 mg", "percent": number },
    "biotin": { "value": "X mcg", "dv": "30 mcg", "percent": number },
    "folate": { "value": "X mcg", "dv": "400 mcg", "percent": number },
    "vitaminB12": { "value": "X mcg", "dv": "2.4 mcg", "percent": number },
    "calcium": { "value": "X mg", "dv": "1000 mg", "percent": number },
    "iron": { "value": "X mg", "dv": "18 mg", "percent": number },
    "magnesium": { "value": "X mg", "dv": "400 mg", "percent": number },
    "potassium": { "value": "X mg", "dv": "3500 mg", "percent": number },
    "sodium": { "value": "X mg", "dv": "2300 mg", "percent": number },
    "zinc": { "value": "X mg", "dv": "11 mg", "percent": number },
    "copper": { "value": "X mcg", "dv": "900 mcg", "percent": number },
    "manganese": { "value": "X mg", "dv": "1.8 mg", "percent": number },
    "selenium": { "value": "X mcg", "dv": "55 mcg", "percent": number },
    "iodine": { "value": "X mcg", "dv": "150 mcg", "percent": number },
    "phosphorus": { "value": "X mg", "dv": "700 mg", "percent": number }
  }
}
Use 0 for nutrients not present. Only respond with valid JSON, no additional text.`,
        },
        {
          role: 'user',
          content: `Food: ${food}, Quantity: ${quantity}`,
        },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      res.status(500).json({ error: 'No response from AI' });
      return;
    }

    const nutritionData = JSON.parse(content);

    res.json({
      food,
      quantity,
      calories: nutritionData.calories,
      macros: nutritionData.macros,
      micros: nutritionData.micros,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to calculate calories' });
  }
});

export default router;
