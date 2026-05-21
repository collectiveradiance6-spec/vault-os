import { setState, getState } from './state.js';
import { canAccess } from './permissions.js';

const _routes = new Map();

export function registerRoute(name, loaderFn) {
  _routes.set(name, loaderFn);
}

export async function navigate(module) {
  if (!canAccess(module)) {
    console.warn(`[Router] Access denied: ${module}`);
    await navigate('lockscreen');
    return;
  }

  const loader = _routes.get(module);
  if (!loader) {
    console.error(`[Router] Unknown module: ${module}`);
    return;
  }

  setState('activeModule', module);
  const mod = await loader();
  mod.mount?.();
}

export function currentRoute() {
  return getState('activeModule');
}
