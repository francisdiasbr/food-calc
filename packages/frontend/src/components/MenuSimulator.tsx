import { useState } from 'react';
import { NutritionResult, UserProfile, ACTIVITY_LABELS, NutrientDeficiency, NutrientSuggestion } from '../types';
import { suggestionsAPI } from '../services/api';

interface FoodItem {
  id: number;
  food: string;
  quantity: string;
}

interface Props {
  profile: UserProfile;
}

function MenuSimulator({ profile }: Props) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([
    { id: Date.now(), food: '', quantity: '' }
  ]);
  const [results, setResults] = useState<NutritionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<NutrientSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const calcPercent = (value: number, target: number) => {
    return target > 0 ? Math.round((value / target) * 100) : 0;
  };

  const sumNutrient = (getter: (r: NutritionResult) => string | number) => {
    return results.reduce((sum, r) => sum + parseFloat(String(getter(r))), 0);
  };

  const sumNutrientFromData = (data: NutritionResult[], getter: (r: NutritionResult) => string | number) => {
    return data.reduce((sum, r) => sum + parseFloat(String(getter(r))), 0);
  };

  const detectDeficiencies = (nutritionData: NutritionResult[]): NutrientDeficiency[] => {
    const nutrientMap = [
      { name: 'Proteína', unit: 'g', getValue: () => sumNutrientFromData(nutritionData, r => r.macros.protein.value), target: profile.dailyTargets.protein },
      { name: 'Carboidratos', unit: 'g', getValue: () => sumNutrientFromData(nutritionData, r => r.macros.carbs.value), target: profile.dailyTargets.carbs },
      { name: 'Gordura', unit: 'g', getValue: () => sumNutrientFromData(nutritionData, r => r.macros.fat.value), target: profile.dailyTargets.fat },
      { name: 'Fibra', unit: 'g', getValue: () => sumNutrientFromData(nutritionData, r => r.macros.fiber.value), target: profile.dailyTargets.fiber },
      { name: 'Cálcio', unit: 'mg', getValue: () => sumNutrientFromData(nutritionData, r => r.micros.calcium.value), target: profile.dailyTargets.calcium },
      { name: 'Ferro', unit: 'mg', getValue: () => sumNutrientFromData(nutritionData, r => r.micros.iron.value), target: profile.dailyTargets.iron },
      { name: 'Magnésio', unit: 'mg', getValue: () => sumNutrientFromData(nutritionData, r => r.micros.magnesium.value), target: profile.dailyTargets.magnesium },
      { name: 'Potássio', unit: 'mg', getValue: () => sumNutrientFromData(nutritionData, r => r.micros.potassium.value), target: profile.dailyTargets.potassium },
      { name: 'Zinco', unit: 'mg', getValue: () => sumNutrientFromData(nutritionData, r => r.micros.zinc.value), target: profile.dailyTargets.zinc },
      { name: 'Vitamina A', unit: 'mcg', getValue: () => sumNutrientFromData(nutritionData, r => r.micros.vitaminA.value), target: profile.dailyTargets.vitaminA },
      { name: 'Vitamina C', unit: 'mg', getValue: () => sumNutrientFromData(nutritionData, r => r.micros.vitaminC.value), target: profile.dailyTargets.vitaminC },
      { name: 'Vitamina D', unit: 'mcg', getValue: () => sumNutrientFromData(nutritionData, r => r.micros.vitaminD.value), target: profile.dailyTargets.vitaminD },
      { name: 'Vitamina E', unit: 'mg', getValue: () => sumNutrientFromData(nutritionData, r => r.micros.vitaminE.value), target: profile.dailyTargets.vitaminE },
      { name: 'Vitamina K', unit: 'mcg', getValue: () => sumNutrientFromData(nutritionData, r => r.micros.vitaminK.value), target: profile.dailyTargets.vitaminK },
      { name: 'Vitamina B12', unit: 'mcg', getValue: () => sumNutrientFromData(nutritionData, r => r.micros.vitaminB12.value), target: profile.dailyTargets.vitaminB12 },
      { name: 'Folato', unit: 'mcg', getValue: () => sumNutrientFromData(nutritionData, r => r.micros.folate.value), target: profile.dailyTargets.folate },
    ];

    const deficiencies: NutrientDeficiency[] = [];

    for (const nutrient of nutrientMap) {
      if (nutrient.target === 0) continue;

      const current = nutrient.getValue();
      const percentage = calcPercent(current, nutrient.target);

      if (percentage < 80) {
        deficiencies.push({
          nutrient: nutrient.name,
          current: Math.round(current * 10) / 10,
          target: nutrient.target,
          percentage,
          unit: nutrient.unit,
        });
      }
    }

    return deficiencies
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 5);
  };

  const fetchSuggestions = async (nutritionData: NutritionResult[]) => {
    const deficiencies = detectDeficiencies(nutritionData);

    if (deficiencies.length === 0) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);

    try {
      const result = await suggestionsAPI.getSuggestions(deficiencies);
      setSuggestions(result);
    } catch (err) {
      console.error('Erro ao buscar sugestões:', err);
    } finally {
      setLoadingSuggestions(false);
    }
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

  const handleCalculate = async () => {
    setLoading(true);
    setError('');
    setResults([]);
    setSuggestions([]);

    try {
      const validItems = foodItems.filter(item => item.food && item.quantity);

      if (validItems.length === 0) {
        setError('Adicione pelo menos um alimento com quantidade.');
        setLoading(false);
        return;
      }

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
      fetchSuggestions(responses);
    } catch {
      setError('Erro ao calcular nutrientes. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFoodItems([{ id: Date.now(), food: '', quantity: '' }]);
    setResults([]);
    setError('');
    setSuggestions([]);
  };

  const totalCalories = sumNutrient(r => r.calories.value);
  const totalProtein = sumNutrient(r => r.macros.protein.value);
  const totalCarbs = sumNutrient(r => r.macros.carbs.value);
  const totalFat = sumNutrient(r => r.macros.fat.value);
  const totalFiber = sumNutrient(r => r.macros.fiber.value);

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

      <h4 className="section-title">Simulação de Cardápio</h4>
      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
        Adicione os alimentos e quantidades para simular um cardápio completo e ver os totais diários estimados.
      </p>

      <div className="form-group">
        <label>Alimentos</label>
        {foodItems.map((item, index) => (
          <div key={item.id} className="food-item-row">
            <input
              type="text"
              value={item.food}
              onChange={(e) => updateFoodItem(item.id, 'food', e.target.value)}
              placeholder="Ex: banana, arroz, frango"
              required
            />
            <input
              type="text"
              value={item.quantity}
              onChange={(e) => updateFoodItem(item.id, 'quantity', e.target.value)}
              placeholder="Ex: 100g, 1 unidade"
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

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button
          type="button"
          className="search-button"
          onClick={handleCalculate}
          disabled={loading}
        >
          {loading ? 'Calculando...' : 'Calcular Totais'}
        </button>
        {results.length > 0 && (
          <button
            type="button"
            className="secondary-btn"
            onClick={resetForm}
          >
            Limpar
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {results.length > 0 && (
        <div className="result">
          <div className="calories">
            {totalCalories.toFixed(0)} <span>kcal total</span>
            <div className="calories-percent">
              {calcPercent(totalCalories, profile.dailyTargets.calories)}% da meta
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
              <span className="nutrient-value">{totalCarbs.toFixed(1)}g</span>
              <span className="nutrient-dv">{profile.dailyTargets.carbs}g</span>
              <span className="nutrient-percent">{calcPercent(totalCarbs, profile.dailyTargets.carbs)}%</span>
            </div>
            <div className="nutrient-row">
              <span className="nutrient-name">Fibra</span>
              <span className="nutrient-value">{totalFiber.toFixed(1)}g</span>
              <span className="nutrient-dv">{profile.dailyTargets.fiber}g</span>
              <span className="nutrient-percent">{calcPercent(totalFiber, profile.dailyTargets.fiber)}%</span>
            </div>
            <div className="nutrient-row">
              <span className="nutrient-name">Gordura</span>
              <span className="nutrient-value">{totalFat.toFixed(1)}g</span>
              <span className="nutrient-dv">{profile.dailyTargets.fat}g</span>
              <span className="nutrient-percent">{calcPercent(totalFat, profile.dailyTargets.fat)}%</span>
            </div>
            <div className="nutrient-row">
              <span className="nutrient-name">Proteína</span>
              <span className="nutrient-value">{totalProtein.toFixed(1)}g</span>
              <span className="nutrient-dv">{profile.dailyTargets.protein}g</span>
              <span className="nutrient-percent">{calcPercent(totalProtein, profile.dailyTargets.protein)}%</span>
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
              <span className="nutrient-name">Zinco</span>
              <span className="nutrient-value">{sumNutrient(r => r.micros.zinc.value).toFixed(1)} mg</span>
              <span className="nutrient-dv">{profile.dailyTargets.zinc} mg</span>
              <span className="nutrient-percent">{calcPercent(sumNutrient(r => r.micros.zinc.value), profile.dailyTargets.zinc)}%</span>
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
          </div>

          <div className="foods-list" style={{ marginTop: '20px' }}>
            <h4 className="section-title">Alimentos Adicionados</h4>
            {results.map((r, i) => (
              <div key={i} className="food-summary">
                <span>{r.food} ({r.quantity})</span>
                <span>{r.calories.value} kcal</span>
              </div>
            ))}
          </div>

          {loadingSuggestions && (
            <div style={{ marginTop: '24px', textAlign: 'center', color: '#6b46c1' }}>
              Buscando sugestões de alimentos...
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="suggestions-section" style={{ marginTop: '24px' }}>
              <h4 className="section-title">💡 Sugestões para Completar seu Cardápio</h4>
              <div className="suggestions-list" style={{
                backgroundColor: '#f8f5ff',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #e9d8fd'
              }}>
                {suggestions.map((suggestion, idx) => (
                  <div key={idx} className="suggestion-item" style={{ marginBottom: idx < suggestions.length - 1 ? '16px' : 0 }}>
                    <div style={{
                      fontWeight: 600,
                      color: '#553c9a',
                      marginBottom: '8px',
                      fontSize: '0.95rem'
                    }}>
                      {suggestion.nutrient} (atual: {suggestion.currentPercentage}%)
                    </div>
                    <div style={{ paddingLeft: '12px' }}>
                      {suggestion.foods.map((food, foodIdx) => (
                        <div key={foodIdx} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          marginBottom: '4px',
                          fontSize: '0.9rem',
                          color: '#4a5568'
                        }}>
                          <span style={{ marginRight: '8px', color: '#805ad5' }}>├─</span>
                          <span>
                            <strong>{food.name}</strong> ({food.portion}) - {food.contribution}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MenuSimulator;

