import { setState } from './state.js';
import { canAccess } from './permissions.js';

const _routes = new Map();

export function registerRoute(name, loader) {
  _routes.set(name, loader);
}

export async function navigate(module) {
  if (!canAccess(module)) {
    await navigate('lockscreen');
    return;
  }
  const loader = _routes.get(module);
  if (!loader) { console.error(`[Router] Unknown: ${module}`); return; }
  setState('activeModule', module);
  const mod = await loader();
  mod.mount?.();
}
