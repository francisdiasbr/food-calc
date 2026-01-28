export interface NutrientValue {
  value: string | number;
  dv: string | number;
  percent: number;
}

export interface NutritionResult {
  food: string;
  quantity: string;
  calories: NutrientValue;
  macros: {
    protein: NutrientValue;
    carbs: NutrientValue;
    fat: NutrientValue;
    fiber: NutrientValue;
  };
  micros: {
    vitaminA: NutrientValue;
    vitaminC: NutrientValue;
    vitaminD: NutrientValue;
    vitaminE: NutrientValue;
    vitaminK: NutrientValue;
    vitaminB12: NutrientValue;
    calcium: NutrientValue;
    iron: NutrientValue;
    magnesium: NutrientValue;
    potassium: NutrientValue;
    sodium: NutrientValue;
    zinc: NutrientValue;
  };
}

export type MealType = 'breakfast' | 'snack' | 'lunch' | 'dinner';

export interface SavedMeal {
  id: string;
  date: string;
  mealType: MealType;
  foods: NutritionResult[];
  createdAt: string;
}

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Café da manhã',
  snack: 'Lanche',
  lunch: 'Almoço',
  dinner: 'Jantar',
};

export interface UserProfile {
  age: number;
  sex: 'Feminino' | 'Masculino';
  weight: number;
  height: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dailyTargets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    calcium: number;
    iron: number;
    magnesium: number;
    potassium: number;
    sodium: number;
    vitaminA: number;
    vitaminC: number;
    vitaminD: number;
    vitaminE: number;
    vitaminK: number;
    vitaminB12: number;
    zinc: number;
  };
}

export const DEFAULT_PROFILE: UserProfile = {
  age: 35,
  sex: 'Feminino',
  weight: 56,
  height: 1.56,
  activityLevel: 'active',
  dailyTargets: {
    calories: 1925,
    protein: 100,
    carbs: 205,
    fat: 58,
    fiber: 25,
    calcium: 1000,
    iron: 18,
    magnesium: 320,
    potassium: 3500,
    sodium: 2300,
    vitaminA: 700,
    vitaminC: 75,
    vitaminD: 20,
    vitaminE: 15,
    vitaminK: 90,
    vitaminB12: 2.4,
    zinc: 8,
  },
};

export const ACTIVITY_LABELS: Record<UserProfile['activityLevel'], string> = {
  sedentary: 'Sedentário',
  light: 'Levemente ativo',
  moderate: 'Moderadamente ativo',
  active: 'Ativo',
  very_active: 'Muito ativo',
};
