# Vault-OS Stabilization

Stabilization-first migration: one Vite entry graph, centralized state, single localStorage key, preserved vault visual identity (dark theme, particles, lockscreen).

## Run

```bash
cd c:\vault-os
npm run dev      # http://localhost:5173
npm run build    # dist/
npm run preview  # preview production build
```

**Lockscreen stub PIN:** `000000` (six zeros).

## Entry graph

```
index.html → /src/main.js
  ├─ css/styles.css, themes.css, animations.css, mobile.css, vault-shell.css
  └─ src/core/boot.js
       └─ src/core/app.js
            ├─ @services/storage.js   loadPersistedState()  [key: vault_os_data]
            ├─ @core/auth.js          ensureAuth()
            ├─ @services/session.js   initSession()
            ├─ @modules/registry.js   register + bootModules()
            ├─ @ui/ui.js              initUI() + #bgCanvas shell
            └─ @core/performance.js   safeParticles → @ui/particles.js
```

## State (`src/core/state.js`)

Authoritative shape:

```js
{ user, session, theme, activeModule, locked, entries }
```

- UI and modules read via `getState()` / `subscribe()` / `state:change` on event bus
- Vault CRUD via `@services/vault.js` only (commits through `persistState()`)
- No direct `localStorage` in UI layer

## Storage

| Key | Status |
|-----|--------|
| `vault_os_data` | **Canonical** — full state snapshot |
| `vault` | Migrated once on load, then removed |

## Vite aliases (`vite.config.js`)

| Alias | Path |
|-------|------|
| `@core` | `src/core` |
| `@services` | `src/services` |
| `@ui` | `src/ui` |
| `@modules` | `src/modules` |
| `@data` | `src/data` |
| `@utils` | `src/utils` |

## Quarantined / legacy

| Item | Location | Reason |
|------|----------|--------|
| `legacy/js-original/filters.js` | `legacy/js-original/` | Broken `renderCards`; use `src/ui/search.js` |
| `legacy/js-original/tabs.js` | `legacy/js-original/` | Unused by boot graph |
| `js/filters.js` | root `js/` | Re-exports `filterCards` from `src/ui/search.js` (compat only) |
| `js/tabs.js` | root `js/` | Empty deprecation stub |
| `js/app.js` (original) | `legacy/js-original/app.js` | Broken imports |
| `src/counter.js`, `src/style.css` | `legacy/scaffold/` | Vite demo scaffold |
| `src/js/services/*`, `src/js/ui/ui.js` | `legacy/scaffold/src-js/` | Orphan dual-storage |
| `exports/exports.js` | unchanged | Global `vaultEntries`; use `exportVaultBackup()` |

Root `js/` retains **thin re-exports** to `src/` for backward-compatible paths.

## Fixed (audit → resolution)

| Finding | Resolution |
|---------|------------|
| `src/main.js` → missing `./js/core/boot.js` | `src/main.js` → `./core/boot.js` |
| `js/app.js` missing `./ui/ui.js`, `initParticles` | `src/core/app.js` + `@ui/*` |
| `js/storage.js` not exported | `src/services/storage.js` |
| Dual `vault` / `vault_os_data` keys | Single key + migration |
| `js/core/state.js` unused | `src/core/state.js` authoritative |
| `filters.js` + `renderCards` | Quarantined; `src/ui/search.js` |
| CSS not linked | Imported from `src/main.js` |
| Duplicate `filterCards`, `safeParticles` | One implementation each in `src/` |
| Orphan `src/js/services` | Moved to `legacy/scaffold/` |

## API stub (`src/services/api.js`)

- `tryRemoteSync()` runs on boot from `src/core/app.js`
- Without `VITE_API_BASE_URL`, sync is a debug no-op (`api-stub`)
- Set `VITE_API_BASE_URL` in `.env` (see `.env.example`) for future backend wiring

## Tests

```bash
npm test
```

Vitest covers `defaults`, `state`, and `api` stub behavior (`tests/*.test.js`).

## Remaining tech debt (Next.js / production)

- Lockscreen PIN is a stub, not cryptographic auth
- No encryption at rest (plaintext `localStorage`)
- `router.js` is module-id only (no URL routes)
- Root `data/defaults.js` deprecated shim for old global scripts

See `docs/ARCHITECTURE.md` for Mermaid diagrams of the post-fix layout.
