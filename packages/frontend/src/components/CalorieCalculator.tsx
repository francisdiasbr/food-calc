import { useState, useMemo, useCallback } from 'react';
import { NutritionResult, MealType, MEAL_LABELS, UserProfile, ACTIVITY_LABELS } from '../types';
import { mealsAPI, caloriesAPI } from '../services/api';

interface FoodItem {
  id: number;
  food: string;
  quantity: string;
}

interface Props {
  profile: UserProfile;
}

interface NutrientConfig {
  key: string;
  label: string;
  getValue: (r: NutritionResult) => number;
  targetKey: keyof UserProfile['dailyTargets'];
  unit: string;
  decimals: number;
}

// Helper para converter valor de nutriente para número
const toNumber = (value: string | number): number =>
  typeof value === 'number' ? value : parseFloat(value) || 0;

// Função para formatar data YYYY-MM-DD para pt-BR sem problemas de timezone
const formatDateString = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('pt-BR');
};

// Função para obter data local no formato YYYY-MM-DD sem problemas de timezone
const getLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Configuração dos macronutrientes
const MACROS_CONFIG: NutrientConfig[] = [
  { key: 'carbs', label: 'Carboidratos', getValue: (r) => toNumber(r.macros.carbs.value), targetKey: 'carbs', unit: 'g', decimals: 1 },
  { key: 'fiber', label: 'Fibra', getValue: (r) => toNumber(r.macros.fiber.value), targetKey: 'fiber', unit: 'g', decimals: 1 },
  { key: 'fat', label: 'Gordura', getValue: (r) => toNumber(r.macros.fat.value), targetKey: 'fat', unit: 'g', decimals: 1 },
  { key: 'protein', label: 'Proteína', getValue: (r) => toNumber(r.macros.protein.value), targetKey: 'protein', unit: 'g', decimals: 1 },
];

// Configuração dos micronutrientes
const MICROS_CONFIG: NutrientConfig[] = [
  { key: 'calcium', label: 'Cálcio', getValue: (r) => toNumber(r.micros.calcium.value), targetKey: 'calcium', unit: 'mg', decimals: 0 },
  { key: 'iron', label: 'Ferro', getValue: (r) => toNumber(r.micros.iron.value), targetKey: 'iron', unit: 'mg', decimals: 1 },
  { key: 'magnesium', label: 'Magnésio', getValue: (r) => toNumber(r.micros.magnesium.value), targetKey: 'magnesium', unit: 'mg', decimals: 0 },
  { key: 'potassium', label: 'Potássio', getValue: (r) => toNumber(r.micros.potassium.value), targetKey: 'potassium', unit: 'mg', decimals: 0 },
  { key: 'sodium', label: 'Sódio', getValue: (r) => toNumber(r.micros.sodium.value), targetKey: 'sodium', unit: 'mg', decimals: 0 },
  { key: 'vitaminA', label: 'Vitamina A', getValue: (r) => toNumber(r.micros.vitaminA.value), targetKey: 'vitaminA', unit: 'mcg', decimals: 0 },
  { key: 'vitaminB12', label: 'Vitamina B12', getValue: (r) => toNumber(r.micros.vitaminB12.value), targetKey: 'vitaminB12', unit: 'mcg', decimals: 1 },
  { key: 'vitaminC', label: 'Vitamina C', getValue: (r) => toNumber(r.micros.vitaminC.value), targetKey: 'vitaminC', unit: 'mg', decimals: 0 },
  { key: 'vitaminD', label: 'Vitamina D', getValue: (r) => toNumber(r.micros.vitaminD.value), targetKey: 'vitaminD', unit: 'mcg', decimals: 1 },
  { key: 'vitaminE', label: 'Vitamina E', getValue: (r) => toNumber(r.micros.vitaminE.value), targetKey: 'vitaminE', unit: 'mg', decimals: 1 },
  { key: 'vitaminK', label: 'Vitamina K', getValue: (r) => toNumber(r.micros.vitaminK.value), targetKey: 'vitaminK', unit: 'mcg', decimals: 0 },
  { key: 'zinc', label: 'Zinco', getValue: (r) => toNumber(r.micros.zinc.value), targetKey: 'zinc', unit: 'mg', decimals: 1 },
];

// Componente para linha de nutriente
function NutrientRow({
  label,
  value,
  target,
  unit,
  decimals
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  decimals: number;
}) {
  const percent = target > 0 ? Math.round((value / target) * 100) : 0;

  return (
    <div className="nutrient-row">
      <span className="nutrient-name">{label}</span>
      <span className="nutrient-value">{value.toFixed(decimals)}{unit}</span>
      <span className="nutrient-dv">{target}{unit}</span>
      <span className="nutrient-percent">{percent}%</span>
    </div>
  );
}

function CalorieCalculator({ profile }: Props) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([
    { id: Date.now(), food: '', quantity: '' }
  ]);
  const [date, setDate] = useState(() => getLocalDateString());
  const [meal, setMeal] = useState<MealType>('breakfast');
  const [results, setResults] = useState<NutritionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Calcula todos os totais uma única vez quando results muda
  const totals = useMemo(() => {
    if (results.length === 0) return null;

    const sum = (getter: (r: NutritionResult) => number) =>
      results.reduce((acc, r) => acc + getter(r), 0);

    return {
      calories: sum(r => toNumber(r.calories.value)),
      // Macros
      carbs: sum(r => toNumber(r.macros.carbs.value)),
      fiber: sum(r => toNumber(r.macros.fiber.value)),
      fat: sum(r => toNumber(r.macros.fat.value)),
      protein: sum(r => toNumber(r.macros.protein.value)),
      // Micros
      calcium: sum(r => toNumber(r.micros.calcium.value)),
      iron: sum(r => toNumber(r.micros.iron.value)),
      magnesium: sum(r => toNumber(r.micros.magnesium.value)),
      potassium: sum(r => toNumber(r.micros.potassium.value)),
      sodium: sum(r => toNumber(r.micros.sodium.value)),
      vitaminA: sum(r => toNumber(r.micros.vitaminA.value)),
      vitaminB12: sum(r => toNumber(r.micros.vitaminB12.value)),
      vitaminC: sum(r => toNumber(r.micros.vitaminC.value)),
      vitaminD: sum(r => toNumber(r.micros.vitaminD.value)),
      vitaminE: sum(r => toNumber(r.micros.vitaminE.value)),
      vitaminK: sum(r => toNumber(r.micros.vitaminK.value)),
      zinc: sum(r => toNumber(r.micros.zinc.value)),
    };
  }, [results]);

  const caloriesPercent = useMemo(() => {
    if (!totals) return 0;
    return profile.dailyTargets.calories > 0
      ? Math.round((totals.calories / profile.dailyTargets.calories) * 100)
      : 0;
  }, [totals, profile.dailyTargets.calories]);

  const resetForm = useCallback(() => {
    setFoodItems([{ id: Date.now(), food: '', quantity: '' }]);
    setResults([]);
    setSaved(false);
  }, []);

  const addFoodItem = useCallback(() => {
    setFoodItems(prev => [...prev, { id: Date.now(), food: '', quantity: '' }]);
  }, []);

  const removeFoodItem = useCallback((id: number) => {
    setFoodItems(prev => prev.length > 1 ? prev.filter(item => item.id !== id) : prev);
  }, []);

  const updateFoodItem = useCallback((id: number, field: 'food' | 'quantity', value: string) => {
    setFoodItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);
    setSaved(false);

    try {
      const validItems = foodItems.filter(item => item.food && item.quantity);
      const responses = await Promise.all(
        validItems.map(item => caloriesAPI.calculate(item.food, item.quantity))
      );
      setResults(responses);

      // Salvar automaticamente após calcular
      try {
        await mealsAPI.create({
          date,
          mealType: meal,
          foods: responses,
        });
        setSaved(true);
      } catch (saveError) {
        console.error('Erro ao salvar refeição:', saveError);
      }
    } catch {
      setError('Erro ao calcular calorias. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  }, [foodItems, date, meal]);

  return (
    <div className="calculator">
      <div className="user-info">
        <h4 className="section-title">Informações do Usuário</h4>
        <div className="user-info-grid five-cols">
          <div className="user-info-item">
            <label>Idade</label>
            <input type="text" value={`${profile.age} anos`} disabled />
          </div>
          <div className="user-info-item">
            <label>Sexo</label>
            <input type="text" value={profile.sex} disabled />
          </div>
          <div className="user-info-item">
            <label>Peso</label>
            <input type="text" value={`${profile.weight} kg`} disabled />
          </div>
          <div className="user-info-item">
            <label>Altura</label>
            <input type="text" value={`${profile.height.toFixed(2)} m`} disabled />
          </div>
          <div className="user-info-item">
            <label>Atividade</label>
            <input type="text" value={ACTIVITY_LABELS[profile.activityLevel]} disabled />
          </div>
        </div>
        <div className="user-info-targets">
          Meta diária: {profile.dailyTargets.calories} kcal | P: {profile.dailyTargets.protein}g | C: {profile.dailyTargets.carbs}g | G: {profile.dailyTargets.fat}g
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date">Data</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Refeição</label>
          <div className="meal-options">
            {(Object.keys(MEAL_LABELS) as MealType[]).map((mealType) => (
              <label key={mealType} className="meal-option">
                <input
                  type="radio"
                  name="meal"
                  value={mealType}
                  checked={meal === mealType}
                  onChange={(e) => setMeal(e.target.value as MealType)}
                />
                <span>{MEAL_LABELS[mealType]}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Alimentos</label>
          {foodItems.map((item, index) => (
            <div key={item.id} className="food-item-row">
              <input
                type="text"
                value={item.food}
                onChange={(e) => updateFoodItem(item.id, 'food', e.target.value)}
                placeholder="Ex: banana, arroz"
                required
              />
              <input
                type="text"
                value={item.quantity}
                onChange={(e) => updateFoodItem(item.id, 'quantity', e.target.value)}
                placeholder="Ex: 100g"
                required
              />
              {foodItems.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeFoodItem(item.id)}
                >
                  -
                </button>
              )}
              {index === foodItems.length - 1 && (
                <button
                  type="button"
                  className="add-btn"
                  onClick={addFoodItem}
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? 'Calculando...' : 'Calcular Calorias'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {totals && (
        <div className="result">
          <div className="meal-summary">
            <span className="meal-label">{MEAL_LABELS[meal]}</span>
            <span className="meal-date">{formatDateString(date)}</span>
          </div>

          <div className="foods-list">
            {results.map((r, i) => (
              <div key={`${r.food}-${i}`} className="food-summary">
                <span>{r.food} ({r.quantity})</span>
                <span>{r.calories.value} kcal</span>
              </div>
            ))}
          </div>

          <div className="calories">
            {totals.calories.toFixed(0)} <span>kcal total</span>
            <div className="calories-percent">
              {caloriesPercent}% da meta
            </div>
          </div>

          <h4 className="section-title">Macronutrientes</h4>
          <div className="nutrient-list">
            <div className="nutrient-row header">
              <span className="nutrient-name">Nutriente</span>
              <span className="nutrient-value">Quantidade</span>
              <span className="nutrient-dv">Meta</span>
              <span className="nutrient-percent">%</span>
            </div>
            {MACROS_CONFIG.map(({ key, label, targetKey, unit, decimals }) => (
              <NutrientRow
                key={key}
                label={label}
                value={totals[key as keyof typeof totals]}
                target={profile.dailyTargets[targetKey]}
                unit={unit}
                decimals={decimals}
              />
            ))}
          </div>

          <h4 className="section-title">Micronutrientes</h4>
          <div className="nutrient-list">
            <div className="nutrient-row header">
              <span className="nutrient-name">Nutriente</span>
              <span className="nutrient-value">Quantidade</span>
              <span className="nutrient-dv">Meta</span>
              <span className="nutrient-percent">%</span>
            </div>
            {MICROS_CONFIG.map(({ key, label, targetKey, unit, decimals }) => (
              <NutrientRow
                key={key}
                label={label}
                value={totals[key as keyof typeof totals]}
                target={profile.dailyTargets[targetKey]}
                unit={unit}
                decimals={decimals}
              />
            ))}
          </div>

          <div className="action-buttons">
            {saved && (
              <div className="saved-message">Refeição salva automaticamente no banco de dados!</div>
            )}
            <button type="button" className="secondary-btn" onClick={resetForm}>
              Nova Refeição
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalorieCalculator;
