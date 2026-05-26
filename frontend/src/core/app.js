import { checkAuth, getPermissions } from './auth.js';
import { navigate, registerRoute }   from './router.js';
import { initUI }                    from '../ui/ui.js';
import { runDeferred }               from './performance.js';
import { isMobile }                  from './mobile.js';
import { initParticles }             from '../ui/particles.js';
import { mountFluidBg }              from '../ui/fluid-bg.js';

export async function initApp() {
  registerRoute('lockscreen', () => import('../modules/lockscreen/index.js'));
  registerRoute('dashboard',  () => import('../modules/dashboard/index.js'));
  registerRoute('admin',      () => import('../modules/admin/index.js'));
  registerRoute('settings',   () => import('../modules/settings/index.js'));

  initUI();
  mountFluidBg();
  if (!isMobile()) requestAnimationFrame(initParticles);

  const authenticated = await checkAuth();
  if (authenticated) await getPermissions();

  runDeferred(() => navigate(authenticated ? 'dashboard' : 'lockscreen'));
}
