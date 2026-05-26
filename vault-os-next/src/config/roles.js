export const ROLES = {
  owner_hidden:  { label:'Owner (Hidden)',  rank:4 },
  owner_visible: { label:'Owner (Visible)', rank:3 },
  admin:         { label:'Admin',           rank:2 },
  user:          { label:'User',            rank:1 },
};

export const PERMISSIONS = {
  owner_hidden:  ['audit.read','audit.export','session.force_terminate','rbac.write','vault.read','vault.write'],
  owner_visible: ['audit.read','audit.export','session.force_terminate','rbac.write','vault.read','vault.write'],
  admin:         ['audit.read','session.read','vault.read','vault.write'],
  user:          ['vault.read','vault.write'],
};

export function hasPermission(role, perm) {
  return (PERMISSIONS[role] || []).includes(perm);
}
