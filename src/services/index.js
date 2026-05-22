import { loadPersistedState, loadSettings, saveSettings } from './storage.js';
import { getState, setState } from '../core/state.js';
import { DEFAULT_ENTRIES, DEFAULT_SETTINGS } from '../data/defaults.js';

export async function initServices() {
  // Load persisted vault, log, settings
  await loadPersistedState();

  // If no entries, use defaults
  if (!getState('entries') || getState('entries').length === 0) {
    setState({ entries: DEFAULT_ENTRIES });
  }

  // Merge settings
  const savedSettings = loadSettings();
  if (savedSettings) {
    setState({ settings: { ...getState('settings'), ...savedSettings } });
  }
}
