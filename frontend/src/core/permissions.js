import { getState } from './state.js';

const RANK = { admin: 3, mod: 2, user: 1 };
const MODULE_ROLES = {
  admin: 'admin',
  settings: 'mod',
  dashboard: 'user',
  lockscreen: null,
};

export function hasRole(required) {
  const user = getState('user');
  if (!user) return false;
  return (RANK[user.role] ?? 0) >= (RANK[required] ?? 99);
}

export function canAccess(module) {
  const required = MODULE_ROLES[module];
  if (required === null) return true;
  return hasRole(required);
}
