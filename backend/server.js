import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import crypto from 'crypto';

const app  = express();
const PORT = process.env.PORT || 3000;
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const JWT_SECRET = process.env.JWT_SECRET;

// ─── ENV GUARD ────────────────────────────────────────────────────────────────
const REQUIRED = ['DISCORD_CLIENT_ID','DISCORD_CLIENT_SECRET','DISCORD_REDIRECT_URI','JWT_SECRET','FRONTEND_URL'];
for (const k of REQUIRED) {
  if (!process.env[k]) { console.error(`[Boot] Missing: ${k}`); process.exit(1); }
}

const {
  DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI, JWT_SECRET, FRONTEND_URL,
  ADMIN_DISCORD_IDS = '',
} = process.env;

const ADMIN_IDS  = new Set(ADMIN_DISCORD_IDS.split(',').map(s => s.trim()).filter(Boolean));
const TOKEN_TTL  = '8h';

// ─── IN-MEMORY STORES (replace with DB later) ────────────────────────────────
const auditLog   = [];          // [{ ts, userId, username, action, meta }]
const sessions   = new Map();   // token → { userId, role, issuedAt }
const rateLimits = new Map();   // ip → [timestamps]

function addAudit(userId, username, action, meta = {}) {
  auditLog.unshift({ ts: Date.now(), userId, username, action, meta });
  if (auditLog.length > 500) auditLog.length = 500;
}

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '512kb' }));

// Rate limiter — 60 req/min per IP
app.use((req, res, next) => {
  const ip  = req.ip;
  const now = Date.now();
  const hits = (rateLimits.get(ip) || []).filter(t => now - t < 60_000);
  hits.push(now);
  rateLimits.set(ip, hits);
  if (hits.length > 60) return res.status(429).json({ error: 'Rate limit exceeded' });
  next();
});

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const sign   = p => jwt.sign(p, JWT_SECRET, { expiresIn: TOKEN_TTL });
const verify = t => { try { return jwt.verify(t, JWT_SECRET); } catch { return null; } };

function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  const p = verify(h.slice(7));
  if (!p) return res.status(401).json({ error: 'Invalid or expired token' });
  req.user = p;
  next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin required' });
  next();
}

function requireOwner(req, res, next) {
  if (!['owner_hidden','owner_visible'].includes(req.user?.role))
    return res.status(403).json({ error: 'Owner required' });
  next();
}

function resolveRole(discordId) {
  if (ADMIN_IDS.has(discordId)) return 'admin';
  return 'user';
}

// ─── DISCORD OAUTH ────────────────────────────────────────────────────────────
app.get('/auth/discord', (_req, res) => {
  const state  = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    client_id:     DISCORD_CLIENT_ID,
    redirect_uri:  DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope:         'identify email guilds',
    state,
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

app.get('/auth/discord/callback', async (req, res) => {
  try {
    // 1. get discord user from your OAuth logic
    const discordUser = req.user || req.discordUser;

    if (!discordUser) {
      return res.status(401).json({ error: "No Discord user found" });
    }

    // 2. build minimal user object
    const user = {
      id: discordUser.id,
      username: discordUser.username
    };

    // 3. sign JWT
    const token = signToken(user);

    // 4. set cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("vault_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7
      })
    );

    // 5. redirect to frontend
    return res.redirect(process.env.FRONTEND_URL);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "OAuth callback failed" });
  }
});
    if (!tokenRes.ok) throw new Error(`Token exchange: ${tokenRes.status}`);
    const tokenData = await tokenRes.json();

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!userRes.ok) throw new Error('User fetch failed');
    const d = await userRes.json();

    const role    = resolveRole(d.id);
    const payload = {
      id:            d.id,
      username:      d.username,
      discriminator: d.discriminator ?? '0',
      avatar:        d.avatar
        ? `https://cdn.discordapp.com/avatars/${d.id}/${d.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/${parseInt(d.discriminator ?? 0) % 5}.png`,
      email:         d.email ?? null,
      role,
    };

    const token = sign(payload);
    sessions.set(token, { userId: d.id, role, issuedAt: Date.now() });
    addAudit(d.id, d.username, 'login', { role, ip: req.ip });

    res.redirect(`${FRONTEND_URL}/auth#token=${token}`);
  } catch (err) {
    console.error('[OAuth]', err.message);
    res.redirect(`${FRONTEND_URL}?error=auth_failed`);
  }
});


// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────
app.get('/me', requireAuth, (req, res) => {
  addAudit(req.user.id, req.user.username, 'session.check');
  res.json(req.user);
});

app.post('/logout', requireAuth, (req, res) => {
  addAudit(req.user.id, req.user.username, 'logout');
  // Invalidate all sessions for this user
  for (const [k, v] of sessions.entries()) {
    if (v.userId === req.user.id) sessions.delete(k);
  }
  res.json({ ok: true });
});

// ─── VAULT API (server-side mirror, optional — frontend also stores locally) ──
const vaultStore = new Map(); // userId → entries[]

app.get('/vault', requireAuth, (req, res) => {
  const entries = vaultStore.get(req.user.id) || [];
  addAudit(req.user.id, req.user.username, 'vault.read', { count: entries.length });
  res.json(entries);
});

app.post('/vault', requireAuth, (req, res) => {
  const { entries } = req.body;
  if (!Array.isArray(entries)) return res.status(400).json({ error: 'entries must be array' });
  if (entries.length > 500) return res.status(400).json({ error: 'Max 500 entries' });
  vaultStore.set(req.user.id, entries);
  addAudit(req.user.id, req.user.username, 'vault.sync', { count: entries.length });
  res.json({ ok: true, count: entries.length });
});

// ─── RBAC ─────────────────────────────────────────────────────────────────────
const PERMISSIONS = {
  owner_hidden:  ['audit.read','audit.export','session.force_terminate','rbac.write','vault.read','vault.write'],
  owner_visible: ['audit.read','audit.export','session.force_terminate','rbac.write','vault.read','vault.write'],
  admin:         ['session.read','vault.read','vault.write','audit.read'],
  user:          ['vault.read','vault.write'],
};

app.get('/rbac/permissions', requireAuth, (req, res) => {
  res.json({ role: req.user.role, permissions: PERMISSIONS[req.user.role] || [] });
});

app.get('/rbac/matrix', requireAuth, requireAdmin, (req, res) => {
  res.json(PERMISSIONS);
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────
app.get('/admin/stats', requireAuth, requireAdmin, (req, res) => {
  const allEntries = [...vaultStore.values()].flat();
  addAudit(req.user.id, req.user.username, 'admin.stats');
  res.json({
    totalUsers:    vaultStore.size,
    totalEntries:  allEntries.length,
    activeSessions: sessions.size,
    recentAuditEvents: auditLog.slice(0, 10),
    ts: Date.now(),
    requestedBy: req.user.username,
  });
});

app.get('/admin/sessions', requireAuth, requireAdmin, (req, res) => {
  const list = [...sessions.entries()].map(([token, s]) => ({
    userId:   s.userId,
    role:     s.role,
    issuedAt: s.issuedAt,
    age:      Math.round((Date.now() - s.issuedAt) / 60000) + 'm',
    tokenHint: token.slice(-8),
  }));
  res.json(list);
});

app.delete('/admin/sessions/:userId', requireAuth, requireAdmin, (req, res) => {
  let removed = 0;
  for (const [k, v] of sessions.entries()) {
    if (v.userId === req.params.userId) { sessions.delete(k); removed++; }
  }
  addAudit(req.user.id, req.user.username, 'session.force_terminate', { targetUserId: req.params.userId });
  res.json({ ok: true, removed });
});

// ─── AUDIT ────────────────────────────────────────────────────────────────────
app.get('/audit/events', requireAuth, requireAdmin, (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit) || 50, 200);
  const offset = parseInt(req.query.offset) || 0;
  res.json({
    events: auditLog.slice(offset, offset + limit),
    total:  auditLog.length,
    limit,
    offset,
  });
});

app.get('/audit/export', requireAuth, requireAdmin, (req, res) => {
  addAudit(req.user.id, req.user.username, 'audit.export');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="audit_${Date.now()}.json"`);
  res.json({ exportedAt: new Date().toISOString(), exportedBy: req.user.username, events: auditLog });
});

// ─── HEALTH ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: Date.now(), sessions: sessions.size });
});

// ─── 404 + ERROR ─────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `${req.method} ${req.path} not found` }));
app.use((err, _req, res, _next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[Vault OS API] port ${PORT} · CORS: ${FRONTEND_URL}`);
  console.log(`[Vault OS API] Admin IDs: ${[...ADMIN_IDS].join(', ') || 'none'}`);
});
