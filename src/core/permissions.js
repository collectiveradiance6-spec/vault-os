import { getState } from './state.js';

export const ROLES = {
  ADMIN: 'admin',
  MOD: 'mod',
  USER: 'user',
};

const ROLE_RANK = {
  admin: 3,
  mod: 2,
  user: 1,
};

export function hasRole(required) {
  const user = getState('user');
  if (!user) return false;
  return (ROLE_RANK[user.role] ?? 0) >= (ROLE_RANK[required] ?? 99);
}

export function canAccess(module) {
  const MODULE_PERMISSIONS = {
    admin: ROLES.ADMIN,
    settings: ROLES.MOD,
    dashboard: ROLES.USER,
    lockscreen: null, // always accessible
  };

  const required = MODULE_PERMISSIONS[module];
  if (required === null) return true;
  return hasRole(required);
}
