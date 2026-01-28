import { useState, useEffect } from 'react';
import { SavedMeal, MEAL_LABELS } from '../types';

function MealHistory() {
  const [meals, setMeals] = useState<SavedMeal[]>([]);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('meals');
    if (saved) {
      setMeals(JSON.parse(saved));
    }
  }, []);

  const deleteMeal = (id: string) => {
    const updated = meals.filter(m => m.id !== id);
    setMeals(updated);
    localStorage.setItem('meals', JSON.stringify(updated));
  };

  const groupedByDate = meals.reduce((acc, meal) => {
    if (!acc[meal.date]) {
      acc[meal.date] = [];
    }
    acc[meal.date].push(meal);
    return acc;
  }, {} as Record<string, SavedMeal[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

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
      {sortedDates.map(date => (
        <div key={date} className="date-group">
          <h3 className="date-header">
            {new Date(date).toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </h3>

          {groupedByDate[date]
            .sort((a, b) => {
              const order = ['breakfast', 'snack', 'lunch', 'dinner'];
              return order.indexOf(a.mealType) - order.indexOf(b.mealType);
            })
            .map(meal => {
              const totalCalories = meal.foods.reduce(
                (sum, f) => sum + Number(f.calories.value), 0
              );
              const isExpanded = expandedMeal === meal.id;

              return (
                <div key={meal.id} className="meal-card">
                  <div
                    className="meal-card-header"
                    onClick={() => setExpandedMeal(isExpanded ? null : meal.id)}
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
                          deleteMeal(meal.id);
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
      ))}
    </div>
  );
}

export default MealHistory;
