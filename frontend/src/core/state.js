const _state = {
  user: null,
  session: null,
  theme: 'dark',
  activeModule: null,
  locked: true,
};

const _listeners = new Map();

export function getState(key) {
  return key ? _state[key] : { ..._state };
}

export function setState(key, value) {
  if (!(key in _state)) return;
  _state[key] = value;
  _listeners.get(key)?.forEach(fn => fn(value));
}

export function subscribe(key, fn) {
  if (!_listeners.has(key)) _listeners.set(key, new Set());
  _listeners.get(key).add(fn);
  return () => _listeners.get(key).delete(fn);
}
