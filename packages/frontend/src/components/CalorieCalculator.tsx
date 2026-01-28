import { useState } from 'react';
import { NutritionResult, MealType, SavedMeal, MEAL_LABELS, UserProfile, ACTIVITY_LABELS } from '../types';

interface FoodItem {
  id: number;
  food: string;
  quantity: string;
}

interface Props {
  profile: UserProfile;
}

function CalorieCalculator({ profile }: Props) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([
    { id: Date.now(), food: '', quantity: '' }
  ]);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [meal, setMeal] = useState<MealType>('breakfast');
  const [results, setResults] = useState<NutritionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const saveMeal = () => {
    const savedMeals: SavedMeal[] = JSON.parse(localStorage.getItem('meals') || '[]');
    const newMeal: SavedMeal = {
      id: crypto.randomUUID(),
      date,
      mealType: meal,
      foods: results,
      createdAt: new Date().toISOString(),
    };
    savedMeals.push(newMeal);
    localStorage.setItem('meals', JSON.stringify(savedMeals));
    setSaved(true);
  };

  const resetForm = () => {
    setFoodItems([{ id: Date.now(), food: '', quantity: '' }]);
    setResults([]);
    setSaved(false);
  };

  const calcPercent = (value: number, target: number) => {
    return target > 0 ? Math.round((value / target) * 100) : 0;
  };

  const sumNutrient = (getter: (r: NutritionResult) => string | number) => {
    return results.reduce((sum, r) => sum + parseFloat(String(getter(r))), 0);
  };

  const addFoodItem = () => {
    setFoodItems([...foodItems, { id: Date.now(), food: '', quantity: '' }]);
  };

  const removeFoodItem = (id: number) => {
    if (foodItems.length > 1) {
      setFoodItems(foodItems.filter(item => item.id !== id));
    }
  };

  const updateFoodItem = (id: number, field: 'food' | 'quantity', value: string) => {
    setFoodItems(foodItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const validItems = foodItems.filter(item => item.food && item.quantity);
      const responses = await Promise.all(
        validItems.map(item =>
          fetch('http://localhost:3001/api/calories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ food: item.food, quantity: item.quantity }),
          }).then(res => {
            if (!res.ok) throw new Error('Failed to fetch');
            return res.json();
          })
        )
      );
      setResults(responses);
    } catch {
      setError('Erro ao calcular calorias. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

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

      {results.length > 0 && (
        <div className="result">
          <div className="meal-summary">
            <span className="meal-label">{MEAL_LABELS[meal]}</span>
            <span className="meal-date">{new Date(date).toLocaleDateString('pt-BR')}</span>
          </div>

          <div className="foods-list">
            {results.map((r, i) => (
              <div key={i} className="food-summary">
                <span>{r.food} ({r.quantity})</span>
                <span>{r.calories.value} kcal</span>
              </div>
            ))}
          </div>

          <div className="calories">
            {sumNutrient(r => r.calories.value).toFixed(0)} <span>kcal total</span>
            <div className="calories-percent">
              {calcPercent(sumNutrient(r => r.calories.value), profile.dailyTargets.calories)}% da meta
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
            <div className="nutrient-row">
              <span className="nutrient-name">Carboidratos</span>
              <span className="nutrient-value">{sumNutrient(r => r.macros.carbs.value).toFixed(1)}g</span>
              <span className="nutrient-dv">{profile.dailyTargets.carbs}g</span>
              <span className="nutrient-percent">{calcPercent(sumNutrient(r => r.macros.carbs.value), profile.dailyTargets.carbs)}%</span>
            </div>
            <div className="nutrient-row">
              <span className="nutrient-name">Fibra</span>
              <span className="nutrient-value">{sumNutrient(r => r.macros.fiber.value).toFixed(1)}g</span>
              <span className="nutrient-dv">{profile.dailyTargets.fiber}g</span>
              <span className="nutrient-percent">{calcPercent(sumNutrient(r => r.macros.fiber.value), profile.dailyTargets.fiber)}%</span>
            </div>
            <div className="nutrient-row">
              <span className="nutrient-name">Gordura</span>
              <span className="nutrient-value">{sumNutrient(r => r.macros.fat.value).toFixed(1)}g</span>
              <span className="nutrient-dv">{profile.dailyTargets.fat}g</span>
              <span className="nutrient-percent">{calcPercent(sumNutrient(r => r.macros.fat.value), profile.dailyTargets.fat)}%</span>
            </div>
            <div className="nutrient-row">
              <span className="nutrient-name">Proteína</span>
              <span className="nutrient-value">{sumNutrient(r => r.macros.protein.value).toFixed(1)}g</span>
              <span className="nutrient-dv">{profile.dailyTargets.protein}g</span>
              <span className="nutrient-percent">{calcPercent(sumNutrient(r => r.macros.protein.value), profile.dailyTargets.protein)}%</span>
            </div>
          </div>

          <h4 className="section-title">Micronutrientes</h4>
          <div className="nutrient-list">
            <div className="nutrient-row header">
              <span className="nutrient-name">Nutriente</span>
              <span className="nutrient-value">Quantidade</span>
              <span className="nutrient-dv">Meta</span>
              <span className="nutrient-percent">%</span>
            </div>
            <div className="nutrient-row">
              <span className="nutrient-name">Cálcio</span>
              <span className="nutrient-value">{sumNutrient(r => r.micros.calcium.value).toFixed(0)} mg</span>
              <span className="nutrient-dv">{profile.dailyTargets.calcium} mg</span>
              <span className="nutrient-percent">{calcPercent(sumNutrient(r => r.micros.calcium.value), profile.dailyTargets.calcium)}%</span>
            </div>
            <div className="nutrient-row">
              <span className="nutrient-name">Ferro</span>
              <span className="nutrient-value">{sumNutrient(r => r.micros.iron.value).toFixed(1)} mg</span>
              <span className="nutrient-dv">{profile.dailyTargets.iron} mg</span>
              <span className="nutrient-percent">{calcPercent(sumNutrient(r => r.micros.iron.value), profile.dailyTargets.iron)}%</span>
            </div>
            <div className="nutrient-row">
              <span className="nutrient-name">Magnésio</span>
              <span className="nutrient-value">{sumNutrient(r => r.micros.magnesium.value).toFixed(0)} mg</span>
              <span className="nutrient-dv">{profile.dailyTargets.magnesium} mg</span>
              <span className="nutrient-percent">{calcPercent(sumNutrient(r => r.micros.magnesium.value), profile.dailyTargets.magnesium)}%</span>
            </div>
            <div className="nutrient-row">
              <span className="nutrient-name">Potássio</span>
              <span className="nutrient-value">{sumNutrient(r => r.micros.potassium.value).toFixed(0)} mg</span>
              <span className="nutrient-dv">{profile.dailyTargets.potassium} mg</span>
              <span className="nutrient-percent">{calcPercent(sumNutrient(r => r.micros.potassium.value), profile.dailyTargets.potassium)}%</span>
            </div>
            <div className="nutrient-row">
              <span className="nutrient-name">Sódio</span>
              <span className="nutrient-value">{sumNutrient(r => r.micros.sodium.value).toFixed(0)} mg</span>
              <span className="nutrient-dv">{profile.dailyTargets.sodium} mg</span>
              <span className="nutrient-percent">{calcPercent(sumNutrient(r => r.micros.sodium.value), profile.dailyTargets.sodium)}%</span>
            </div>
            <div className="nutrient-row">
              <span className="nutrient-name">Vitamina A</span>
              <span className="nutrient-value">{sumNutrient(r => r.micros.vitaminA.value).toFixed(0)} mcg</span>
              <span className="nutrient-dv">{profile.dailyTargets.vitaminA} mcg</span>
              <span className="nutrient-percent">{calcPercent(sumNutrient(r => r.micros.vitaminA.value), profile.dailyTargets.vitaminA)}%</span>
            </div>
            <div className="nutrient-row">
              <span className="nutrient-name">Vitamina B12</span>
              <span className="nutrient-value">{sumNutrient(r => r.micros.vitaminB12.value).toFixed(1)} mcg</span>
              <span className="nutrient-dv">{profile.dailyTargets.vitaminB12} mcg</span>
              <span className="nutrient-percent">{calcPercent(sumNutrient(r => r.micros.vitaminB12.value), profile.dailyTargets.vitaminB12)}%</span>
            </div>
            <div className="nutrient-row">
              <span className="nutrient-name">Vitamina C</span>
              <span className="nutrient-value">{sumNutrient(r => r.micros.vitaminC.value).toFixed(0)} mg</span>
              <span className="nutrient-dv">{profile.dailyTargets.vitaminC} mg</span>
              <span className="nutrient-percent">{calcPercent(sumNutrient(r => r.micros.vitaminC.value), profile.dailyTargets.vitaminC)}%</span>
            </div>
            <div className="nutrient-row">
              <span className="nutrient-name">Vitamina D</span>
              <span className="nutrient-value">{sumNutrient(r => r.micros.vitaminD.value).toFixed(1)} mcg</span>
              <span className="nutrient-dv">{profile.dailyTargets.vitaminD} mcg</span>
              <span className="nutrient-percent">{calcPercent(sumNutrient(r => r.micros.vitaminD.value), profile.dailyTargets.vitaminD)}%</span>
            </div>
            <div className="nutrient-row">
              <span className="nutrient-name">Vitamina E</span>
              <span className="nutrient-value">{sumNutrient(r => r.micros.vitaminE.value).toFixed(1)} mg</span>
              <span className="nutrient-dv">{profile.dailyTargets.vitaminE} mg</span>
              <span className="nutrient-percent">{calcPercent(sumNutrient(r => r.micros.vitaminE.value), profile.dailyTargets.vitaminE)}%</span>
            </div>
            <div className="nutrient-row">
              <span className="nutrient-name">Vitamina K</span>
              <span className="nutrient-value">{sumNutrient(r => r.micros.vitaminK.value).toFixed(0)} mcg</span>
              <span className="nutrient-dv">{profile.dailyTargets.vitaminK} mcg</span>
              <span className="nutrient-percent">{calcPercent(sumNutrient(r => r.micros.vitaminK.value), profile.dailyTargets.vitaminK)}%</span>
            </div>
            <div className="nutrient-row">
              <span className="nutrient-name">Zinco</span>
              <span className="nutrient-value">{sumNutrient(r => r.micros.zinc.value).toFixed(1)} mg</span>
              <span className="nutrient-dv">{profile.dailyTargets.zinc} mg</span>
              <span className="nutrient-percent">{calcPercent(sumNutrient(r => r.micros.zinc.value), profile.dailyTargets.zinc)}%</span>
            </div>
          </div>

          <div className="action-buttons">
            {saved ? (
              <>
                <div className="saved-message">Refeição salva com sucesso!</div>
                <button type="button" className="secondary-btn" onClick={resetForm}>
                  Nova Refeição
                </button>
              </>
            ) : (
              <button type="button" className="save-btn" onClick={saveMeal}>
                Salvar Refeição
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CalorieCalculator;
