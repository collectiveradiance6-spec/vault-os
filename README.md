# VAULT OS v2.0

Secure admin runtime. Discord OAuth. Cloudflare Pages + Render.

---

## REPO STRUCTURE

```
vault-os/
├── frontend/   → Cloudflare Pages
└── backend/    → Render (Node/Express)
```

---

## STEP 1 — DISCORD APP SETUP

1. Go to https://discord.com/developers/applications
2. Create a new application → **OAuth2** tab
3. Add redirect URI:
   ```
   https://vault-os-api.onrender.com/auth/discord/callback
   ```
4. Copy **Client ID** and **Client Secret**
5. Find your Discord User ID:
   - Discord → Settings → Advanced → Developer Mode ON
   - Right-click your username → Copy User ID

---

## STEP 2 — BACKEND (Render)

1. Push this repo to GitHub
2. Go to https://render.com → New Web Service
3. Connect repo → set **Root Directory** to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:

| Key | Value |
|-----|-------|
| `DISCORD_CLIENT_ID` | from Discord app |
| `DISCORD_CLIENT_SECRET` | from Discord app |
| `DISCORD_REDIRECT_URI` | `https://vault-os-api.onrender.com/auth/discord/callback` |
| `FRONTEND_URL` | `https://vault-os.pages.dev` (update after CF deploy) |
| `JWT_SECRET` | generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `ADMIN_DISCORD_IDS` | your Discord user ID |

7. Deploy → note your Render URL (e.g. `https://vault-os-api.onrender.com`)

---

## STEP 3 — FRONTEND (Cloudflare Pages)

1. Go to https://pages.cloudflare.com → Create application → Connect to Git
2. Select your repo
3. Set **Root Directory** to `frontend`
4. Build settings:
   - Build command: `npm install && npm run build`
   - Output directory: `dist`
5. Add environment variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | your Render URL (e.g. `https://vault-os-api.onrender.com`) |

6. Deploy
7. Copy your Pages URL (e.g. `https://vault-os.pages.dev`)
8. Go back to Render → update `FRONTEND_URL` env var to your Pages URL
9. Go back to Discord Developer Portal → update redirect URI if needed

---

## STEP 4 — CUSTOM DOMAIN (optional)

Cloudflare Pages → Custom Domains → add your domain.
DNS is already on Cloudflare — it auto-configures.

---

## DEFAULT ACCESS

- Navigate to your Pages URL
- Click **AUTHENTICATE WITH DISCORD**
- Your Discord ID in `ADMIN_DISCORD_IDS` → role = `admin`
- Any other authenticated Discord user → role = `user`

---

## LOCAL DEV

```bash
# Backend
cd backend
cp .env.example .env   # fill in values
npm install
npm run dev            # http://localhost:3000

# Frontend
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:3000
npm install
npm run dev            # http://localhost:5173
```

Add `http://localhost:3000/auth/discord/callback` to Discord OAuth2 redirects for local dev.
