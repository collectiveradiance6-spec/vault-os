// SINGLE SOURCE OF TRUTH — never duplicate state elsewhere

const _state = {
  user: null,          // { id, username, role }
  session: null,       // { token, expires }
  theme: 'dark',
  activeModule: null,
  locked: true,
};

const _listeners = new Map();

export function getState(key) {
  return key ? _state[key] : { ..._state };
}

export function setState(key, value) {
  if (!(key in _state)) {
    console.warn(`[State] Unknown key: ${key}`);
    return;
  }
  _state[key] = value;
  _emit(key, value);
}

export function subscribe(key, fn) {
  if (!_listeners.has(key)) _listeners.set(key, new Set());
  _listeners.get(key).add(fn);
  return () => _listeners.get(key).delete(fn); // returns unsubscribe fn
}

function _emit(key, value) {
  if (_listeners.has(key)) {
    _listeners.get(key).forEach(fn => fn(value));
  }
}
