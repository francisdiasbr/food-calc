import { useState, useEffect } from 'react';
import { MEAL_LABELS } from '../types';
import { mealsAPI, SavedMeal } from '../services/api';

// Função para formatar data completa (com dia da semana) sem problemas de timezone
const formatDateFull = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Função para ordenar datas no formato YYYY-MM-DD sem problemas de timezone
const sortDates = (a: string, b: string): number => {
  return b.localeCompare(a);
};

function MealHistory() {
  const [meals, setMeals] = useState<SavedMeal[]>([]);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  useEffect(() => {
    const loadMeals = async () => {
      try {
        const loadedMeals = await mealsAPI.getAll();
        // Compatibilidade com dados antigos: antes existia apenas "snack"
        const normalized = loadedMeals.map((m) => {
          if ((m.mealType as string) === 'snack') {
            return { ...m, mealType: 'snack1' as const };
          }
          return m;
        });
        setMeals(normalized);
      } catch (error) {
        console.error('Erro ao carregar refeições:', error);
        // Fallback para localStorage se API falhar
    const saved = localStorage.getItem('meals');
    if (saved) {
          const parsed = JSON.parse(saved) as unknown;
          const normalized = (Array.isArray(parsed) ? parsed : []).map((m: any) => {
            if (m?.mealType === 'snack') {
              return { ...m, mealType: 'snack1' };
            }
            return m;
          }) as SavedMeal[];
          setMeals(normalized);
    }
      }
    };
    loadMeals();
  }, []);

  const deleteMeal = async (id: string) => {
    try {
      await mealsAPI.delete(id);
      const updated = meals.filter(m => {
        const mealId = m.id || m._id;
        return mealId !== id;
      });
    setMeals(updated);
    } catch (error) {
      console.error('Erro ao deletar refeição:', error);
      alert('Erro ao deletar refeição. Tente novamente.');
    }
  };

  const groupedByDate = meals.reduce((acc, meal) => {
    if (!acc[meal.date]) {
      acc[meal.date] = [];
    }
    acc[meal.date].push(meal);
    return acc;
  }, {} as Record<string, SavedMeal[]>);

  const sortedDates = Object.keys(groupedByDate).sort(sortDates);

  if (meals.length === 0) {
    return (
      <div className="calculator">
        <div className="empty-state">
          <p>Nenhuma refeição salva ainda.</p>
          <p className="empty-hint">Adicione uma refeição na aba "Nova Refeição"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calculator">
      {sortedDates.map(date => {
        // Calcular total de calorias do dia
        const dayMeals = groupedByDate[date];
        const totalDayCalories = dayMeals.reduce((sum, meal) => {
          const mealCalories = meal.foods.reduce(
            (mealSum, food) => mealSum + Number(food.calories.value),
            0
          );
          return sum + mealCalories;
        }, 0);

        return (
          <div key={date} className="date-group">
            <div className="date-header">
              <h3 className="date-header-text">
                {formatDateFull(date)}
              </h3>
              <span className="date-header-calories">
                {totalDayCalories.toFixed(0)} kcal
              </span>
            </div>

            {dayMeals
            .sort((a, b) => {
              const order = ['breakfast', 'snack1', 'lunch', 'snack2', 'dinner', 'supper'];
              return order.indexOf(a.mealType) - order.indexOf(b.mealType);
            })
            .map(meal => {
              const mealId = meal.id || meal._id || '';
              const totalCalories = meal.foods.reduce(
                (sum, f) => sum + Number(f.calories.value), 0
              );
              const isExpanded = expandedMeal === mealId;

              return (
                <div key={mealId} className="meal-card">
                  <div
                    className="meal-card-header"
                    onClick={() => setExpandedMeal(isExpanded ? null : mealId)}
                  >
                    <div className="meal-card-info">
                      <span className="meal-type-badge">{MEAL_LABELS[meal.mealType]}</span>
                      <span className="meal-foods-count">
                        {meal.foods.length} {meal.foods.length === 1 ? 'item' : 'itens'}
                      </span>
                    </div>
                    <div className="meal-card-calories">
                      {totalCalories} kcal
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="meal-card-details">
                      <div className="foods-list">
                        {meal.foods.map((food, i) => (
                          <div key={i} className="food-summary">
                            <span>{food.food} ({food.quantity})</span>
                            <span>{food.calories.value} kcal</span>
                          </div>
                        ))}
                      </div>

                      <h4 className="section-title">Macronutrientes</h4>
                      <div className="nutrient-list">
                        <div className="nutrient-row header">
                          <span className="nutrient-name">Nutriente</span>
                          <span className="nutrient-value">Qtd</span>
                          <span className="nutrient-dv">VD</span>
                          <span className="nutrient-percent">%VD</span>
                        </div>
                        <div className="nutrient-row">
                          <span className="nutrient-name">Carboidratos</span>
                          <span className="nutrient-value">{meal.foods.reduce((s, f) => s + parseFloat(String(f.macros.carbs.value)), 0).toFixed(1)}g</span>
                          <span className="nutrient-dv">{meal.foods[0]?.macros.carbs.dv}</span>
                          <span className="nutrient-percent">{meal.foods.reduce((s, f) => s + f.macros.carbs.percent, 0).toFixed(0)}%</span>
                        </div>
                        <div className="nutrient-row">
                          <span className="nutrient-name">Proteína</span>
                          <span className="nutrient-value">{meal.foods.reduce((s, f) => s + parseFloat(String(f.macros.protein.value)), 0).toFixed(1)}g</span>
                          <span className="nutrient-dv">{meal.foods[0]?.macros.protein.dv}</span>
                          <span className="nutrient-percent">{meal.foods.reduce((s, f) => s + f.macros.protein.percent, 0).toFixed(0)}%</span>
                        </div>
                        <div className="nutrient-row">
                          <span className="nutrient-name">Gordura</span>
                          <span className="nutrient-value">{meal.foods.reduce((s, f) => s + parseFloat(String(f.macros.fat.value)), 0).toFixed(1)}g</span>
                          <span className="nutrient-dv">{meal.foods[0]?.macros.fat.dv}</span>
                          <span className="nutrient-percent">{meal.foods.reduce((s, f) => s + f.macros.fat.percent, 0).toFixed(0)}%</span>
                        </div>
                        <div className="nutrient-row">
                          <span className="nutrient-name">Fibra</span>
                          <span className="nutrient-value">{meal.foods.reduce((s, f) => s + parseFloat(String(f.macros.fiber.value)), 0).toFixed(1)}g</span>
                          <span className="nutrient-dv">{meal.foods[0]?.macros.fiber.dv}</span>
                          <span className="nutrient-percent">{meal.foods.reduce((s, f) => s + f.macros.fiber.percent, 0).toFixed(0)}%</span>
                        </div>
                      </div>

                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMeal(mealId);
                        }}
                      >
                        Excluir Refeição
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default MealHistory;
