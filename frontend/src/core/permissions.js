import { getState } from './state.js';

const ROLE_RANK = { admin: 3, mod: 2, user: 1 };

const MODULE_ACCESS = {
  admin:      'admin',
  settings:   'user',
  dashboard:  'user',
  lockscreen: null, // always accessible
};

export function hasRole(required) {
  const user = getState('user');
  if (!user) return false;
  return (ROLE_RANK[user.role] ?? 0) >= (ROLE_RANK[required] ?? 99);
}

export function canAccess(module) {
  const required = MODULE_ACCESS[module];
  if (required === null || required === undefined) return true;
  return hasRole(required);
}
