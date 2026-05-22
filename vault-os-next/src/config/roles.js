export const BASE_ROLES = ['owner_hidden', 'owner_visible', 'admin', 'staff'];

export const PERMISSIONS = {
  owners: ['audit.read', 'audit.export', 'session.force_terminate', 'rbac.write'],
  admins: ['session.read', 'vault.read', 'vault.write'],
  staff: ['vault.read']
};
