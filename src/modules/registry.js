import { emit } from '@core/eventBus.js';

const modules = new Map();

export function registerModule(id, hooks = {}) {
  modules.set(id, hooks);
}

export function bootModules() {
  modules.forEach((hooks, id) => {
    hooks.boot?.();
    emit('module:boot', id);
  });
}

export function activateModule(id) {
  const hooks = modules.get(id);
  hooks?.activate?.();
  emit('module:activate', id);
}
