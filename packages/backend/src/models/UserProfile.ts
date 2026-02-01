import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
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
    // Minerais
    calcium: number;
    iron: number;
    magnesium: number;
    potassium: number;
    sodium: number;
    zinc: number;
    copper: number;
    manganese: number;
    selenium: number;
    iodine: number;
    phosphorus: number;
    // Vitaminas
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
    vitaminB12: number;
    biotin: number;
    folate: number;
  };
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    age: { type: Number, required: true },
    sex: { type: String, required: true, enum: ['Feminino', 'Masculino'] },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    activityLevel: {
      type: String,
      required: true,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    },
    dailyTargets: { type: Schema.Types.Mixed, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    // Garantir apenas um perfil (singleton)
    collection: 'userprofile',
  }
);

export default mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);

