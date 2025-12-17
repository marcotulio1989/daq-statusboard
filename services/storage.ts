import { AppData, INITIAL_DATA } from '../types';

const BASE_KEY = 'daqData';

// Helper to generate user-specific key
const getKey = (username?: string) => {
    if (!username) return BASE_KEY; // Fallback (or legacy)
    return `${BASE_KEY}_${username}`;
};

export const getStoredData = (username?: string): AppData => {
  try {
    const key = getKey(username);
    const stored = localStorage.getItem(key);
    
    // If user specific data doesn't exist, try loading legacy data once (migration)
    if (!stored && username) {
        const legacy = localStorage.getItem(BASE_KEY);
        if (legacy) {
             // Return legacy but don't save yet, wait for explicit save
             return { ...INITIAL_DATA, ...JSON.parse(legacy) };
        }
    }

    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with initial data to ensure all fields exist if schema changes
      return { ...INITIAL_DATA, ...parsed };
    }
  } catch (e) {
    console.error('Error loading data', e);
  }
  return INITIAL_DATA;
};

export const saveData = (username: string, data: AppData) => {
  if (!username) {
      console.error("Cannot save data without a username context");
      return;
  }
  try {
    const payload = { ...data, timestamp: Date.now() };
    const key = getKey(username);
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (e) {
    console.error('Error saving data', e);
    alert('Erro ao salvar! A imagem pode ser muito grande para o localStorage.');
  }
};