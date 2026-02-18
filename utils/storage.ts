
import { DaySchedule } from '../types';

const DATA_KEY = 'gym_tracker_data_v1';
const SETTINGS_KEY = 'gym_tracker_settings_v1';

export const saveToLocal = (days: DaySchedule[]) => {
  localStorage.setItem(DATA_KEY, JSON.stringify(days));
};

export const loadFromLocal = (): DaySchedule[] | null => {
  const data = localStorage.getItem(DATA_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveSettings = (settings: { darkMode: boolean }) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const loadSettings = (): { darkMode: boolean } | null => {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearAllData = () => {
  localStorage.removeItem(DATA_KEY);
  window.location.reload();
};
