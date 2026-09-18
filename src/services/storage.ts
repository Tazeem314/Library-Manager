import { AppState } from '../types';
import { getCleanInitialData, getSampleDemoData } from './demoData';
import { safeLocalStorage } from '../utils/safeStorage';

const STORAGE_KEY = 'studyspace_manager_clean_v2';

let cachedState: AppState | null = null;

export function loadAppState(): AppState {
  if (cachedState) {
    return cachedState;
  }

  try {
    // Purge any old demo data storage keys so the app begins completely clean
    safeLocalStorage.removeItem('studyspace_manager_data_v1');
    safeLocalStorage.removeItem('studyspace_manager_clean_v1');

    const raw = safeLocalStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.seats) && parsed.seats.length > 0) {
        cachedState = {
          business: { ...getCleanInitialData().business, ...(parsed.business || {}) },
          shifts: Array.isArray(parsed.shifts) && parsed.shifts.length > 0 ? parsed.shifts : getCleanInitialData().shifts,
          plans: Array.isArray(parsed.plans) && parsed.plans.length > 0 ? parsed.plans : getCleanInitialData().plans,
          seats: parsed.seats,
          students: Array.isArray(parsed.students) ? parsed.students : [],
          memberships: Array.isArray(parsed.memberships) ? parsed.memberships : [],
          payments: Array.isArray(parsed.payments) ? parsed.payments : [],
          expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
        };
        return cachedState;
      }
    }
  } catch (err) {
    console.error('Failed to parse stored state, falling back to clean data', err);
  }

  // Clean fresh start with zero demo data
  const initial = getCleanInitialData();
  cachedState = initial;
  saveAppState(initial);
  return initial;
}

export function saveAppState(state: AppState): void {
  cachedState = state;
  try {
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage', err);
  }
}

export function resetAppState(): AppState {
  try {
    safeLocalStorage.removeItem(STORAGE_KEY);
    safeLocalStorage.removeItem('studyspace_manager_data_v1');
    safeLocalStorage.removeItem('studyspace_manager_clean_v1');
  } catch (err) {
    console.error('Failed to remove state from localStorage', err);
  }
  const initial = getCleanInitialData();
  cachedState = initial;
  saveAppState(initial);
  return initial;
}

export function loadSampleDemoState(): AppState {
  const sample = getSampleDemoData();
  cachedState = sample;
  saveAppState(sample);
  return sample;
}

/**
 * Export current app state to a downloadable JSON file
 */
export function exportAppStateToJson(state: AppState): void {
  try {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    const sanitizedName = (state.business.name || 'studyspace').replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${sanitizedName}_backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  } catch (err) {
    console.error('Failed to export state to JSON:', err);
    throw new Error('Could not generate backup file.');
  }
}

/**
 * Validate and restore state from parsed JSON
 */
export function validateAndRestoreState(parsed: unknown): AppState {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid backup file format.');
  }
  const candidate = parsed as Partial<AppState>;
  if (!Array.isArray(candidate.seats) || candidate.seats.length === 0) {
    throw new Error('Backup file is missing seat configuration.');
  }

  const clean = getCleanInitialData();
  const restoredState: AppState = {
    business: { ...clean.business, ...(candidate.business || {}) },
    shifts: Array.isArray(candidate.shifts) && candidate.shifts.length > 0 ? candidate.shifts : clean.shifts,
    plans: Array.isArray(candidate.plans) && candidate.plans.length > 0 ? candidate.plans : clean.plans,
    seats: candidate.seats,
    students: Array.isArray(candidate.students) ? candidate.students : [],
    memberships: Array.isArray(candidate.memberships) ? candidate.memberships : [],
    payments: Array.isArray(candidate.payments) ? candidate.payments : [],
    expenses: Array.isArray(candidate.expenses) ? candidate.expenses : [],
  };

  cachedState = restoredState;
  saveAppState(restoredState);
  return restoredState;
}

// Emergency window recovery utility
if (typeof window !== 'undefined') {
  (window as unknown as { __resetStudySpaceData?: () => void }).__resetStudySpaceData = () => {
    resetAppState();
    window.location.reload();
  };
}

