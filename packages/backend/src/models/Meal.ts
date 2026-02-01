import mongoose, { Schema, Document } from 'mongoose';

export interface IMeal extends Document {
  date: string; // formato YYYY-MM-DD
  mealType: 'breakfast' | 'snack1' | 'lunch' | 'snack2' | 'dinner' | 'supper';
  foods: Array<{
    food: string;
    quantity: string;
    calories: {
      value: number;
      dv: number;
      percent: number;
    };
    macros: {
      protein: { value: string | number; dv: string | number; percent: number };
      carbs: { value: string | number; dv: string | number; percent: number };
      fat: { value: string | number; dv: string | number; percent: number };
      fiber: { value: string | number; dv: string | number; percent: number };
    };
    micros: {
      vitaminA: { value: string | number; dv: string | number; percent: number };
      vitaminC: { value: string | number; dv: string | number; percent: number };
      vitaminD: { value: string | number; dv: string | number; percent: number };
      vitaminE: { value: string | number; dv: string | number; percent: number };
      vitaminK: { value: string | number; dv: string | number; percent: number };
      vitaminB12: { value: string | number; dv: string | number; percent: number };
      calcium: { value: string | number; dv: string | number; percent: number };
      iron: { value: string | number; dv: string | number; percent: number };
      magnesium: { value: string | number; dv: string | number; percent: number };
      potassium: { value: string | number; dv: string | number; percent: number };
      sodium: { value: string | number; dv: string | number; percent: number };
      zinc: { value: string | number; dv: string | number; percent: number };
      [key: string]: any; // Para permitir outros micronutrientes
    };
  }>;
  createdAt: Date;
}

const MealSchema = new Schema<IMeal>({
  date: { type: String, required: true },
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'snack1', 'lunch', 'snack2', 'dinner', 'supper'],
  },
  foods: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Índice para busca por data
MealSchema.index({ date: 1 });

export default mongoose.model<IMeal>('Meal', MealSchema);




