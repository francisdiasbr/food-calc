import { useState, useEffect } from 'react';
import CalorieCalculator from './components/CalorieCalculator';
import MealHistory from './components/MealHistory';
import UserProfileEditor from './components/UserProfileEditor';
import MenuSimulator from './components/MenuSimulator';
import { DEFAULT_PROFILE, UserProfile } from './types';
import { profileAPI } from './services/api';

type Tab = 'calculator' | 'history' | 'profile' | 'simulator';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('calculator');
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const stored = await profileAPI.get();
        if (stored) {
          setProfile(stored);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        // Fallback para localStorage se API falhar
    const stored = localStorage.getItem('userProfile');
    if (stored) {
      setProfile(JSON.parse(stored));
    }
      }
    };
    loadProfile();
  }, []);

  const handleProfileSave = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  return (
    <div className="app">
      <h1>Calculadora de Calorias</h1>
      <nav className="tabs">
        <button
          className={`tab ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          Nova Refeição
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Histórico
        </button>
        <button
          className={`tab ${activeTab === 'simulator' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulator')}
        >
          Simulação
        </button>
        <button
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Perfil
        </button>
      </nav>
      {activeTab === 'calculator' && <CalorieCalculator profile={profile} />}
      {activeTab === 'history' && <MealHistory />}
      {activeTab === 'simulator' && <MenuSimulator profile={profile} />}
      {activeTab === 'profile' && <UserProfileEditor onSave={handleProfileSave} />}
    </div>
  );
}

export default App;
