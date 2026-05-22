import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// ─── ENV GUARD ────────────────────────────────────────────────────────────────
const REQUIRED = ['DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET', 'DISCORD_REDIRECT_URI', 'JWT_SECRET', 'FRONTEND_URL'];
for (const key of REQUIRED) {
  if (!process.env[key]) {
    console.error(`[Boot] Missing required env var: ${key}`);
    process.exit(1);
  }
}

const {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI,
  JWT_SECRET,
  FRONTEND_URL,
  ADMIN_DISCORD_IDS = '',
} = process.env;

const ADMIN_IDS = new Set(ADMIN_DISCORD_IDS.split(',').map(s => s.trim()).filter(Boolean));
const TOKEN_TTL = '8h';

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token' });
  }
  const payload = verifyToken(header.slice(7));
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });
  req.user = payload;
  next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin required' });
  }
  next();
}

// ─── DISCORD OAUTH ────────────────────────────────────────────────────────────

// Step 1 — redirect user to Discord
app.get('/auth/discord', (req, res) => {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify email guilds',
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

// Step 2 — Discord redirects back with ?code=
app.get('/auth/discord/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect(`${FRONTEND_URL}?error=no_code`);

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) throw new Error(`Discord token exchange failed: ${tokenRes.status}`);
    const tokenData = await tokenRes.json();

    // Fetch Discord user
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!userRes.ok) throw new Error('Discord user fetch failed');
    const discordUser = await userRes.json();

    const role = ADMIN_IDS.has(discordUser.id) ? 'admin' : 'user';

    const jwtPayload = {
      id: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : null,
      email: discordUser.email ?? null,
      role,
    };

    const token = signToken(jwtPayload);

    // Redirect to frontend with token in URL fragment (never in query string)
    res.redirect(`${FRONTEND_URL}/auth#token=${token}`);
  } catch (err) {
    console.error('[OAuth] Callback error:', err.message);
    res.redirect(`${FRONTEND_URL}?error=auth_failed`);
  }
});

// ─── API ROUTES ───────────────────────────────────────────────────────────────

app.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', ts: Date.now() });
});

// Admin-only: list all vault stats (extend with DB later)
app.get('/admin/stats', requireAuth, requireAdmin, (req, res) => {
  res.json({
    message: 'Admin endpoint live',
    requestedBy: req.user.username,
    ts: Date.now(),
  });
});

// ─── 404 + ERROR ─────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, _next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Vault OS API] Running on port ${PORT}`);
  console.log(`[Vault OS API] CORS origin: ${FRONTEND_URL}`);
  console.log(`[Vault OS API] Admin IDs: ${[...ADMIN_IDS].join(', ') || 'none set'}`);
});
