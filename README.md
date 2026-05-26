# VAULT OS v3.0

Secure admin credential vault with Discord OAuth, modular JS frontend,
Express API backend, and a Next.js 15 app layer.

## Stack
- **Frontend** — Vite + vanilla ESM, glassmorphism UI, particle canvas
- **Backend**  — Express, Discord OAuth2, JWT, RBAC, audit log
- **Next.js**  — vault-os-next/ for React app layer (optional)
- **Deploy**   — Cloudflare Pages (frontend) + Render (backend)

## Quick Start

### Backend (Render / local)
```bash
cd backend
cp .env.example .env   # fill in values
npm install
npm run dev            # http://localhost:3000
```

### Frontend (Cloudflare Pages / local)
```bash
cd frontend
cp .env.example .env.local   # set VITE_API_URL
npm install
npm run dev                  # http://localhost:5173
```

### Next.js layer
```bash
cd vault-os-next
npm install
npm run dev    # http://localhost:3001
```

## Environment Variables

### Backend (.env)
| Key | Description |
|-----|-------------|
| `DISCORD_CLIENT_ID` | Discord app client ID |
| `DISCORD_CLIENT_SECRET` | Discord app client secret |
| `DISCORD_REDIRECT_URI` | `https://your-api.onrender.com/auth/discord/callback` |
| `JWT_SECRET` | Long random string |
| `FRONTEND_URL` | `https://your-site.pages.dev` |
| `ADMIN_DISCORD_IDS` | Comma-separated Discord user IDs |

### Frontend (.env.local)
| Key | Description |
|-----|-------------|
| `VITE_API_URL` | Your Render backend URL |

## Discord App Setup
1. Go to https://discord.com/developers/applications
2. Create app → OAuth2 → add redirect: `https://your-api.onrender.com/auth/discord/callback`
3. Copy Client ID + Secret into backend .env

## Deploy
- **Frontend** → push to GitHub → Cloudflare Pages auto-deploys
- **Backend**  → connect GitHub to Render → uses `backend/render.yaml`

## API Routes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Health check |
| GET | `/auth/discord` | — | Start OAuth flow |
| GET | `/auth/discord/callback` | — | OAuth callback |
| GET | `/me` | user | Current user |
| POST | `/logout` | user | End session |
| GET | `/vault` | user | Get server vault |
| POST | `/vault` | user | Sync local vault |
| GET | `/rbac/permissions` | user | Own permissions |
| GET | `/rbac/matrix` | admin | Full RBAC matrix |
| GET | `/admin/stats` | admin | Server stats |
| GET | `/admin/sessions` | admin | Active sessions |
| DELETE | `/admin/sessions/:id` | admin | Terminate session |
| GET | `/audit/events` | admin | Audit log |
| GET | `/audit/export` | admin | Export audit JSON |

## RBAC Roles
| Role | Permissions |
|------|-------------|
| `user` | vault.read, vault.write |
| `admin` | + audit.read, session.read |
| `owner_visible` | + audit.export, session.force_terminate, rbac.write |
| `owner_hidden` | same as owner_visible |
