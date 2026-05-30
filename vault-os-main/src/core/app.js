import { setState } from './state.js';
import { checkAuth } from './auth.js';
import { navigate, registerRoute } from './router.js';
import { initServices } from '../services/index.js';
import { initUI } from '../ui/ui.js';
import { runDeferred } from './performance.js';

export async function initApp() {
  console.log('[Vault OS] boot sequence start');

  // 1. Services first (no UI yet)
  await initServices();

  // 2. Auth check
  const authenticated = await checkAuth();

  // 3. Register all module routes
  registerRoute('lockscreen', () => import('../modules/lockscreen/index.js'));
  registerRoute('dashboard', () => import('../modules/dashboard/index.js'));
  registerRoute('admin', () => import('../modules/admin/index.js'));
  registerRoute('settings', () => import('../modules/settings/index.js'));

  // 4. Mount base UI shell
  initUI();

  // 5. Route to correct starting module
  runDeferred(() => {
    setState('activeModule', authenticated ? 'dashboard' : 'lockscreen');
    navigate(authenticated ? 'dashboard' : 'lockscreen');
  });

  console.log('[Vault OS] boot complete');
}
