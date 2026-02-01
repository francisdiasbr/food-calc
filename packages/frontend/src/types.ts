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
    // Vitamins
    vitaminA: NutrientValue;
    vitaminC: NutrientValue;
    vitaminD: NutrientValue;
    vitaminE: NutrientValue;
    vitaminK: NutrientValue;
    vitaminB1: NutrientValue;
    vitaminB2: NutrientValue;
    vitaminB3: NutrientValue;
    vitaminB5: NutrientValue;
    vitaminB6: NutrientValue;
    biotin: NutrientValue;
    folate: NutrientValue;
    vitaminB12: NutrientValue;
    // Minerals
    calcium: NutrientValue;
    iron: NutrientValue;
    magnesium: NutrientValue;
    potassium: NutrientValue;
    sodium: NutrientValue;
    zinc: NutrientValue;
    copper: NutrientValue;
    manganese: NutrientValue;
    selenium: NutrientValue;
    iodine: NutrientValue;
    phosphorus: NutrientValue;
  };
}

export type MealType = 'breakfast' | 'snack1' | 'lunch' | 'snack2' | 'dinner' | 'supper';

export interface SavedMeal {
  id: string;
  date: string;
  mealType: MealType;
  foods: NutritionResult[];
  createdAt: string;
}

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Café da manhã',
  snack1: 'Lanche 1',
  lunch: 'Almoço',
  snack2: 'Lanche 2',
  dinner: 'Jantar',
  supper: 'Ceia',
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
    // Minerals (mg unless noted)
    calcium: number;
    iron: number;
    magnesium: number;
    potassium: number;
    sodium: number;
    phosphorus: number;
    vitaminA: number;
    vitaminC: number;
    vitaminD: number;
    vitaminE: number;
    vitaminK: number;
    vitaminB1: number;
    vitaminB2: number;
    vitaminB3: number;
    vitaminB5: number;
    vitaminB6: number;
    biotin: number;
    folate: number;
    vitaminB12: number;
    zinc: number;
    copper: number;
    manganese: number;
    selenium: number;
    iodine: number;
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
    potassium: 2600,
    sodium: 2000,
    phosphorus: 700,
    vitaminA: 700,
    vitaminC: 75,
    vitaminD: 15,
    vitaminE: 15,
    vitaminK: 90,
    vitaminB1: 1.1,
    vitaminB2: 1.1,
    vitaminB3: 14,
    vitaminB5: 5,
    vitaminB6: 1.3,
    biotin: 30,
    folate: 400,
    vitaminB12: 2.4,
    zinc: 8,
    copper: 900,
    manganese: 1.8,
    selenium: 55,
    iodine: 150,
  },
};

export const ACTIVITY_LABELS: Record<UserProfile['activityLevel'], string> = {
  sedentary: 'Sedentário',
  light: 'Levemente ativo',
  moderate: 'Moderadamente ativo',
  active: 'Ativo',
  very_active: 'Muito ativo',
};

export interface NutrientDeficiency {
  nutrient: string;
  current: number;
  target: number;
  percentage: number;
  unit: string;
}

export interface FoodSuggestion {
  name: string;
  portion: string;
  contribution: string;
}

export interface NutrientSuggestion {
  nutrient: string;
  currentPercentage: number;
  foods: FoodSuggestion[];
}
