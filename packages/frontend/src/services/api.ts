import { NutrientDeficiency, NutrientSuggestion, UserProfile, MealType, NutritionResult } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

// API de Calorias
export const caloriesAPI = {
  calculate: async (food: string, quantity: string): Promise<NutritionResult> => {
    const response = await fetch(`${API_BASE_URL}/calories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ food, quantity }),
    });
    if (!response.ok) throw new Error('Erro ao calcular calorias');
    return response.json();
  },
};

// Tipos para API (estende os tipos base com campos do MongoDB)
export interface SavedMeal {
  _id?: string;
  id?: string;
  date: string;
  mealType: MealType;
  foods: NutritionResult[];
  createdAt: string | Date;
}

// Re-exporta UserProfile para manter compatibilidade
export type { UserProfile };

// Tipo para resposta da API de perfil (com campos do MongoDB)
interface UserProfileResponse extends UserProfile {
  _id?: string;
  updatedAt?: string | Date;
}

// API de Refeições
export const mealsAPI = {
  getAll: async (): Promise<SavedMeal[]> => {
    const response = await fetch(`${API_BASE_URL}/meals`);
    if (!response.ok) throw new Error('Erro ao buscar refeições');
    const data = await response.json();
    // Normalizar formato: MongoDB retorna _id, mas frontend espera id
    return data.map((meal: any) => ({
      ...meal,
      id: meal._id || meal.id,
    }));
  },

  getById: async (id: string): Promise<SavedMeal> => {
    const response = await fetch(`${API_BASE_URL}/meals/${id}`);
    if (!response.ok) throw new Error('Erro ao buscar refeição');
    const data = await response.json();
    return { ...data, id: data._id || data.id };
  },

  create: async (meal: Omit<SavedMeal, '_id' | 'id' | 'createdAt'>): Promise<SavedMeal> => {
    const response = await fetch(`${API_BASE_URL}/meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meal),
    });
    if (!response.ok) throw new Error('Erro ao salvar refeição');
    const data = await response.json();
    return { ...data, id: data._id || data.id };
  },

  update: async (id: string, meal: Partial<SavedMeal>): Promise<SavedMeal> => {
    const response = await fetch(`${API_BASE_URL}/meals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meal),
    });
    if (!response.ok) throw new Error('Erro ao atualizar refeição');
    const data = await response.json();
    return { ...data, id: data._id || data.id };
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/meals/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Erro ao deletar refeição');
  },
};

// API de Perfil
export const profileAPI = {
  get: async (): Promise<UserProfile | null> => {
    const response = await fetch(`${API_BASE_URL}/profile`);
    if (!response.ok) throw new Error('Erro ao buscar perfil');
    const data: UserProfileResponse | null = await response.json();
    if (!data) return null;
    // Remove campos do MongoDB e retorna UserProfile
    const { _id, updatedAt, ...profile } = data;
    return profile as UserProfile;
  },

  save: async (profile: UserProfile): Promise<UserProfile> => {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!response.ok) throw new Error('Erro ao salvar perfil');
    const data: UserProfileResponse = await response.json();
    const { _id, updatedAt, ...savedProfile } = data;
    return savedProfile as UserProfile;
  },
};

// API de Sugestões
export const suggestionsAPI = {
  getSuggestions: async (deficiencies: NutrientDeficiency[]): Promise<NutrientSuggestion[]> => {
    const apiCallStartTime = performance.now();
    console.log('🌐 [API] Iniciando chamada para /api/suggestions');
    console.log('📤 [API] Payload sendo enviado:', JSON.stringify({ deficiencies }, null, 2));
    console.log(`📊 [API] Total de deficiências: ${deficiencies.length}`);
    
    const fetchStartTime = performance.now();
    const response = await fetch(`${API_BASE_URL}/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deficiencies }),
    });
    const fetchTime = performance.now() - fetchStartTime;
    console.log(`⏱️ [API] Fetch concluído em ${fetchTime.toFixed(2)}ms`);
    console.log(`📡 [API] Status da resposta: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorTime = performance.now() - apiCallStartTime;
      console.error(`❌ [API] Erro na resposta após ${errorTime.toFixed(2)}ms`);
      throw new Error('Erro ao buscar sugestões');
    }
    
    const parseStartTime = performance.now();
    const data = await response.json();
    const parseTime = performance.now() - parseStartTime;
    console.log(`⏱️ [API] Parse JSON concluído em ${parseTime.toFixed(2)}ms`);
    console.log('📥 [API] Dados recebidos:', JSON.stringify(data, null, 2));
    
    const totalTime = performance.now() - apiCallStartTime;
    console.log(`✅ [API] Chamada completa finalizada em ${totalTime.toFixed(2)}ms`);
    console.log('📊 [API] Breakdown de tempos:', {
      fetch: `${fetchTime.toFixed(2)}ms`,
      parse: `${parseTime.toFixed(2)}ms`,
      total: `${totalTime.toFixed(2)}ms`
    });
    
    return data.suggestions;
  },
};




