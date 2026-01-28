import { useState, useEffect } from 'react';
import { UserProfile, DEFAULT_PROFILE, ACTIVITY_LABELS } from '../types';

interface Props {
  onSave: (profile: UserProfile) => void;
}

function UserProfileEditor({ onSave }: Props) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('userProfile');
    if (stored) {
      setProfile(JSON.parse(stored));
    }
  }, []);

  const updateField = <K extends keyof UserProfile>(
    field: K,
    value: UserProfile[K]
  ) => {
    setProfile({ ...profile, [field]: value });
    setSaved(false);
  };

  const updateTarget = (
    field: keyof UserProfile['dailyTargets'],
    value: number
  ) => {
    setProfile({
      ...profile,
      dailyTargets: { ...profile.dailyTargets, [field]: value },
    });
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    onSave(profile);
    setSaved(true);
  };

  const resetToDefaults = () => {
    setProfile(DEFAULT_PROFILE);
    setSaved(false);
  };

  return (
    <div className="calculator">
      <h4 className="section-title">Dados Pessoais</h4>
      <div className="profile-grid">
        <div className="profile-field">
          <label>Idade</label>
          <input
            type="number"
            value={profile.age}
            onChange={(e) => updateField('age', Number(e.target.value))}
          />
          <span className="unit">anos</span>
        </div>
        <div className="profile-field">
          <label>Sexo</label>
          <select
            value={profile.sex}
            onChange={(e) => updateField('sex', e.target.value as UserProfile['sex'])}
          >
            <option value="Feminino">Feminino</option>
            <option value="Masculino">Masculino</option>
          </select>
        </div>
        <div className="profile-field">
          <label>Peso</label>
          <input
            type="number"
            step="0.1"
            value={profile.weight}
            onChange={(e) => updateField('weight', Number(e.target.value))}
          />
          <span className="unit">kg</span>
        </div>
        <div className="profile-field">
          <label>Altura</label>
          <input
            type="number"
            step="0.01"
            value={profile.height}
            onChange={(e) => updateField('height', Number(e.target.value))}
          />
          <span className="unit">m</span>
        </div>
      </div>

      <div className="profile-field full-width">
        <label>Nível de Atividade</label>
        <select
          value={profile.activityLevel}
          onChange={(e) => updateField('activityLevel', e.target.value as UserProfile['activityLevel'])}
        >
          {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <h4 className="section-title">Metas Diárias - Macronutrientes</h4>
      <div className="profile-grid">
        <div className="profile-field">
          <label>Calorias</label>
          <input
            type="number"
            value={profile.dailyTargets.calories}
            onChange={(e) => updateTarget('calories', Number(e.target.value))}
          />
          <span className="unit">kcal</span>
        </div>
        <div className="profile-field">
          <label>Proteína</label>
          <input
            type="number"
            value={profile.dailyTargets.protein}
            onChange={(e) => updateTarget('protein', Number(e.target.value))}
          />
          <span className="unit">g</span>
        </div>
        <div className="profile-field">
          <label>Carboidratos</label>
          <input
            type="number"
            value={profile.dailyTargets.carbs}
            onChange={(e) => updateTarget('carbs', Number(e.target.value))}
          />
          <span className="unit">g</span>
        </div>
        <div className="profile-field">
          <label>Gordura</label>
          <input
            type="number"
            value={profile.dailyTargets.fat}
            onChange={(e) => updateTarget('fat', Number(e.target.value))}
          />
          <span className="unit">g</span>
        </div>
        <div className="profile-field">
          <label>Fibra</label>
          <input
            type="number"
            value={profile.dailyTargets.fiber}
            onChange={(e) => updateTarget('fiber', Number(e.target.value))}
          />
          <span className="unit">g</span>
        </div>
      </div>

      <h4 className="section-title">Metas Diárias - Micronutrientes</h4>
      <div className="profile-grid three-cols">
        <div className="profile-field">
          <label>Cálcio</label>
          <input
            type="number"
            value={profile.dailyTargets.calcium}
            onChange={(e) => updateTarget('calcium', Number(e.target.value))}
          />
          <span className="unit">mg</span>
        </div>
        <div className="profile-field">
          <label>Ferro</label>
          <input
            type="number"
            value={profile.dailyTargets.iron}
            onChange={(e) => updateTarget('iron', Number(e.target.value))}
          />
          <span className="unit">mg</span>
        </div>
        <div className="profile-field">
          <label>Magnésio</label>
          <input
            type="number"
            value={profile.dailyTargets.magnesium}
            onChange={(e) => updateTarget('magnesium', Number(e.target.value))}
          />
          <span className="unit">mg</span>
        </div>
        <div className="profile-field">
          <label>Potássio</label>
          <input
            type="number"
            value={profile.dailyTargets.potassium}
            onChange={(e) => updateTarget('potassium', Number(e.target.value))}
          />
          <span className="unit">mg</span>
        </div>
        <div className="profile-field">
          <label>Sódio</label>
          <input
            type="number"
            value={profile.dailyTargets.sodium}
            onChange={(e) => updateTarget('sodium', Number(e.target.value))}
          />
          <span className="unit">mg</span>
        </div>
        <div className="profile-field">
          <label>Zinco</label>
          <input
            type="number"
            step="0.1"
            value={profile.dailyTargets.zinc}
            onChange={(e) => updateTarget('zinc', Number(e.target.value))}
          />
          <span className="unit">mg</span>
        </div>
        <div className="profile-field">
          <label>Vitamina A</label>
          <input
            type="number"
            value={profile.dailyTargets.vitaminA}
            onChange={(e) => updateTarget('vitaminA', Number(e.target.value))}
          />
          <span className="unit">mcg</span>
        </div>
        <div className="profile-field">
          <label>Vitamina B12</label>
          <input
            type="number"
            step="0.1"
            value={profile.dailyTargets.vitaminB12}
            onChange={(e) => updateTarget('vitaminB12', Number(e.target.value))}
          />
          <span className="unit">mcg</span>
        </div>
        <div className="profile-field">
          <label>Vitamina C</label>
          <input
            type="number"
            value={profile.dailyTargets.vitaminC}
            onChange={(e) => updateTarget('vitaminC', Number(e.target.value))}
          />
          <span className="unit">mg</span>
        </div>
        <div className="profile-field">
          <label>Vitamina D</label>
          <input
            type="number"
            value={profile.dailyTargets.vitaminD}
            onChange={(e) => updateTarget('vitaminD', Number(e.target.value))}
          />
          <span className="unit">mcg</span>
        </div>
        <div className="profile-field">
          <label>Vitamina E</label>
          <input
            type="number"
            value={profile.dailyTargets.vitaminE}
            onChange={(e) => updateTarget('vitaminE', Number(e.target.value))}
          />
          <span className="unit">mg</span>
        </div>
        <div className="profile-field">
          <label>Vitamina K</label>
          <input
            type="number"
            value={profile.dailyTargets.vitaminK}
            onChange={(e) => updateTarget('vitaminK', Number(e.target.value))}
          />
          <span className="unit">mcg</span>
        </div>
      </div>

      <div className="action-buttons">
        {saved && <div className="saved-message">Perfil salvo com sucesso!</div>}
        <button type="button" className="save-btn" onClick={handleSave}>
          Salvar Perfil
        </button>
        <button type="button" className="reset-btn" onClick={resetToDefaults}>
          Restaurar Padrões
        </button>
      </div>
    </div>
  );
}

export default UserProfileEditor;
