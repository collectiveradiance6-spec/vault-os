# Vault-OS Architecture

Vault-OS is a Vite-powered single-page vault UI with a layered module graph, centralized state, and one localStorage persistence key.

## Layer diagram

```mermaid
flowchart TB
  subgraph entry [Entry]
    HTML[index.html]
    MAIN[src/main.js]
    CSS[css/*.css]
  end

  subgraph core [Core]
    BOOT[boot.js]
    APP[app.js]
    STATE[state.js]
    AUTH[auth.js]
    ROUTER[router.js]
    BUS[eventBus.js]
    PERF[performance.js]
    MOB[mobile.js]
  end

  subgraph services [Services]
    STORAGE[storage.js]
    SESSION[session.js]
    VAULT[vault.js]
    API[api.js]
  end

  subgraph ui [UI]
    UI[ui.js]
    SEARCH[search.js]
    PANEL[panel.js]
    MODAL[modal.js]
    PARTICLES[particles.js]
  end

  subgraph modules [Modules]
    REG[registry.js]
    LOCK[lockscreen.js]
    DASH[dashboard.js]
    SET[settings.js]
    ADM[admin.js]
  end

  HTML --> MAIN
  MAIN --> CSS
  MAIN --> BOOT
  BOOT --> APP
  APP --> STORAGE
  APP --> SESSION
  APP --> AUTH
  APP --> VAULT
  APP --> REG
  APP --> UI
  APP --> PERF
  STORAGE --> STATE
  SESSION --> STATE
  VAULT --> STATE
  VAULT --> STORAGE
  AUTH --> SESSION
  UI --> LOCK
  UI --> DASH
  UI --> SET
  UI --> ADM
  UI --> SEARCH
  REG --> LOCK
  REG --> DASH
  REG --> SET
  REG --> ADM
  ROUTER --> STATE
  PERF --> PARTICLES
  PERF --> MOB
  STATE --> BUS
  APP --> API
  API -.->|optional VITE_API_BASE_URL| STORAGE
```

`api.js` exposes `tryRemoteSync()` on boot; it no-ops unless `VITE_API_BASE_URL` is set.

## Boot sequence

```mermaid
sequenceDiagram
  participant DOM
  participant Boot as core/boot
  participant App as core/app
  participant Storage as services/storage
  participant Session as services/session
  participant Auth as core/auth
  participant Vault as services/vault
  participant Registry as modules/registry
  participant UI as ui/ui

  DOM->>Boot: DOMContentLoaded
  Boot->>App: initApp()
  App->>Storage: loadPersistedState()
  Storage->>Storage: migrate legacy vault key
  App->>Session: initSession()
  App->>Auth: ensureAuth()
  App->>Registry: registerModule + bootModules()
  App->>UI: initUI()
  App->>App: safeParticles(initParticles)
  App->>API: tryRemoteSync() (no-op if unconfigured)
```

## State & persistence

```mermaid
erDiagram
  STATE {
    object user
    object session
    string theme
    string activeModule
    boolean locked
    array entries
  }
  LOCALSTORAGE {
    string vault_os_data
  }
  STATE ||--|| LOCALSTORAGE : snapshotFromState / loadPersistedState
```

| Field | Purpose |
|-------|---------|
| `user` | Local user stub after session start |
| `session` | `{ token, startedAt }` — auth gate |
| `theme` | CSS class `theme-*` on `body` |
| `activeModule` | `dashboard` \| `settings` \| `admin` |
| `locked` | Lockscreen visibility |
| `entries` | Vault credential cards |

## Path aliases (Vite)

| Alias | Path |
|-------|------|
| `@core` | `src/core` |
| `@services` | `src/services` |
| `@ui` | `src/ui` |
| `@modules` | `src/modules` |
| `@data` | `src/data` |
| `@utils` | `src/utils` |

## Events (eventBus)

| Event | Emitter |
|-------|---------|
| `state:change` | `setState` / `replaceState` |
| `session:start` / `session:end` | `session.js` |
| `module:boot` / `module:activate` | `registry.js` / `router.js` |
| `router:navigate` | `router.js` |
| `lock:locked` / `lock:unlocked` / `lock:denied` | `lockscreen.js` |

## Security (stabilization phase)

| Topic | Status |
|-------|--------|
| Lockscreen | Stub PIN `000000` in `lockscreen.js` |
| Encryption | Not implemented — entries stored as JSON in `localStorage` |
| Remote API | Optional; `VITE_API_BASE_URL` enables `fetchVault` / `pushVault` stubs |

## Visual assets

Styles live under `css/` (imported from `src/main.js`): `styles.css`, `themes.css`, `mobile.css`, `animations.css`, `vault-shell.css`. Lockscreen, glass cards, particles canvas (`#bgCanvas`), and dark theme are preserved. Vite scaffold `src/style.css` is not loaded.
