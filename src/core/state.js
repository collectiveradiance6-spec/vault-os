const _state = {
  user: null,
  session: null,
  locked: true,
  activeTab: 'creds',
  activeFilter: 'All',
  searchQuery: '',
  editingId: null,
  entries: [],
  activityLog: [],
  settings: {
    mask: true, particles: true, scanlines: true,
    autoLock: true, clipboardClear: false,
  },
};

const _listeners = new Map();

export function getState(key) {
  return key ? _state[key] : { ..._state };
}

export function setState(patch) {
  Object.assign(_state, patch);
  _listeners.get('*')?.forEach(fn => fn(_state));
}

export function setKey(key, value) {
  _state[key] = value;
  _listeners.get(key)?.forEach(fn => fn(value));
  _listeners.get('*')?.forEach(fn => fn(_state));
}

export function subscribe(key, fn) {
  if (!_listeners.has(key)) _listeners.set(key, new Set());
  _listeners.get(key).add(fn);
  return () => _listeners.get(key).delete(fn);
}
