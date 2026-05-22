import { checkAuth } from './auth.js';
import { navigate, registerRoute } from './router.js';
import { initUI } from '../ui/ui.js';
import { runDeferred } from './performance.js';

export async function initApp() {
  registerRoute('lockscreen', () => import('../modules/lockscreen/index.js'));
  registerRoute('dashboard',  () => import('../modules/dashboard/index.js'));
  registerRoute('admin',      () => import('../modules/admin/index.js'));
  registerRoute('settings',   () => import('../modules/settings/index.js'));

  initUI();

  const authenticated = await checkAuth();

  runDeferred(() => navigate(authenticated ? 'dashboard' : 'lockscreen'));
}
