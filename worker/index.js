// Cloudflare Worker — Vault OS API
// Deploy: npx wrangler deploy
// Secrets: wrangler secret put DISCORD_CLIENT_ID  (etc — see wrangler.toml comments)

const TOKEN_TTL = 8 * 3600; // seconds

// ─── JWT (Web Crypto — works in Cloudflare Workers) ───────────────────────────
function b64url(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function b64urlDec(s) {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - s.length % 4) % 4);
  const bin = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}

async function jwtSign(payload, secret) {
  const h = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const full = { ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + TOKEN_TTL };
  const b = b64url(JSON.stringify(full));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${h}.${b}`));
  const s = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${h}.${b}.${s}`;
}

async function jwtVerify(token, secret) {
  try {
    const [h, b, s] = token.split('.');
    if (!h || !b || !s) return null;
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const sigBytes = Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const ok = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(`${h}.${b}`));
    if (!ok) return null;
    const p = JSON.parse(b64urlDec(b));
    if (p.exp && Date.now() / 1000 > p.exp) return null;
    return p;
  } catch { return null; }
}

// ─── RBAC ─────────────────────────────────────────────────────────────────────
const PERMISSIONS = {
  owner_hidden:  ['audit.read', 'audit.export', 'session.force_terminate', 'rbac.write', 'vault.read', 'vault.write'],
  owner_visible: ['audit.read', 'audit.export', 'session.force_terminate', 'rbac.write', 'vault.read', 'vault.write'],
  admin:         ['session.read', 'vault.read', 'vault.write', 'audit.read'],
  user:          ['vault.read', 'vault.write'],
};

const isAdmin = u => ['admin', 'owner_hidden', 'owner_visible'].includes(u?.role);

// ─── DB HELPERS ───────────────────────────────────────────────────────────────
async function addAudit(db, userId, username, action, meta = {}) {
  if (!db) return;
  try {
    await db.prepare('INSERT INTO audit_log (ts,user_id,username,action,meta) VALUES (?,?,?,?,?)')
      .bind(Date.now(), userId, username, action, JSON.stringify(meta)).run();
  } catch {}
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url    = new URL(request.url);
    const path   = url.pathname;
    const method = request.method;

    const frontendUrl = (env.FRONTEND_URL || '').replace(/\/$/, '');
    const origin      = request.headers.get('Origin') || '';

    const cors = {
      'Access-Control-Allow-Origin':  origin === frontendUrl ? frontendUrl : '',
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    };

    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const json     = (data, s = 200) => new Response(JSON.stringify(data), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });
    const redirect = (to)            => Response.redirect(to, 302);

    const adminIds = new Set((env.ADMIN_DISCORD_IDS || '').split(',').map(s => s.trim()).filter(Boolean));

    const getUser = async () => {
      const h = request.headers.get('Authorization');
      if (!h?.startsWith('Bearer ')) return null;
      const p = await jwtVerify(h.slice(7), env.JWT_SECRET || '');
      if (!p) return null;
      if (env.DB) {
        const rev = await env.DB.prepare('SELECT revoked_until FROM revoked_users WHERE user_id=?').bind(p.id).first();
        if (rev && rev.revoked_until > Date.now()) return null;
      }
      return p;
    };

    try {
      // ── HEALTH ──────────────────────────────────────────────────────────────
      if (path === '/health' && method === 'GET')
        return json({ status: 'ok', ts: Date.now() });

      // ── DISCORD OAUTH ────────────────────────────────────────────────────────
      if (path === '/auth/discord' && method === 'GET') {
        const params = new URLSearchParams({
          client_id:     env.DISCORD_CLIENT_ID,
          redirect_uri:  env.DISCORD_REDIRECT_URI,
          response_type: 'code',
          scope:         'identify email',
          state:         crypto.randomUUID(),
        });
        return redirect(`https://discord.com/api/oauth2/authorize?${params}`);
      }

      if (path === '/auth/discord/callback' && method === 'GET') {
        const code = url.searchParams.get('code');
        if (!code) return redirect(`${frontendUrl}?error=no_code`);

        const tokRes = await fetch('https://discord.com/api/oauth2/token', {
          method:  'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body:    new URLSearchParams({
            client_id:     env.DISCORD_CLIENT_ID,
            client_secret: env.DISCORD_CLIENT_SECRET,
            grant_type:    'authorization_code',
            code,
            redirect_uri:  env.DISCORD_REDIRECT_URI,
          }),
        });
        if (!tokRes.ok) return redirect(`${frontendUrl}?error=token_exchange`);
        const { access_token } = await tokRes.json();

        const userRes = await fetch('https://discord.com/api/users/@me', {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        if (!userRes.ok) return redirect(`${frontendUrl}?error=user_fetch`);
        const d = await userRes.json();

        const role = adminIds.has(d.id) ? 'admin' : 'user';
        const payload = {
          id:            d.id,
          username:      d.username,
          discriminator: d.discriminator ?? '0',
          avatar:        d.avatar
            ? `https://cdn.discordapp.com/avatars/${d.id}/${d.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(d.discriminator ?? '0') % 5}.png`,
          email: d.email ?? null,
          role,
        };

        const token = await jwtSign(payload, env.JWT_SECRET || '');
        await addAudit(env.DB, d.id, d.username, 'login', { role });
        return redirect(`${frontendUrl}/auth#token=${token}`);
      }

      // ── AUTH ─────────────────────────────────────────────────────────────────
      if (path === '/me' && method === 'GET') {
        const user = await getUser();
        if (!user) return json({ error: 'Unauthorized' }, 401);
        return json(user);
      }

      if (path === '/logout' && method === 'POST') {
        const user = await getUser();
        if (!user) return json({ error: 'Unauthorized' }, 401);
        await addAudit(env.DB, user.id, user.username, 'logout');
        return json({ ok: true });
      }

      // ── VAULT ────────────────────────────────────────────────────────────────
      if (path === '/vault' && method === 'GET') {
        const user = await getUser();
        if (!user) return json({ error: 'Unauthorized' }, 401);
        if (!env.DB) return json([]);
        const row = await env.DB.prepare('SELECT entries FROM vault_entries WHERE user_id=?').bind(user.id).first();
        const entries = row ? JSON.parse(row.entries) : [];
        await addAudit(env.DB, user.id, user.username, 'vault.read', { count: entries.length });
        return json(entries);
      }

      if (path === '/vault' && method === 'POST') {
        const user = await getUser();
        if (!user) return json({ error: 'Unauthorized' }, 401);
        const body = await request.json().catch(() => ({}));
        if (!Array.isArray(body.entries)) return json({ error: 'entries must be array' }, 400);
        if (body.entries.length > 500)    return json({ error: 'Max 500 entries' }, 400);
        if (env.DB) {
          await env.DB.prepare('INSERT OR REPLACE INTO vault_entries (user_id,entries,updated_at) VALUES (?,?,?)')
            .bind(user.id, JSON.stringify(body.entries), Date.now()).run();
        }
        await addAudit(env.DB, user.id, user.username, 'vault.sync', { count: body.entries.length });
        return json({ ok: true, count: body.entries.length });
      }

      // ── RBAC ─────────────────────────────────────────────────────────────────
      if (path === '/rbac/permissions' && method === 'GET') {
        const user = await getUser();
        if (!user) return json({ error: 'Unauthorized' }, 401);
        return json({ role: user.role, permissions: PERMISSIONS[user.role] || [] });
      }

      if (path === '/rbac/matrix' && method === 'GET') {
        const user = await getUser();
        if (!user)         return json({ error: 'Unauthorized' }, 401);
        if (!isAdmin(user)) return json({ error: 'Admin required' }, 403);
        return json(PERMISSIONS);
      }

      // ── ADMIN ─────────────────────────────────────────────────────────────────
      if (path === '/admin/stats' && method === 'GET') {
        const user = await getUser();
        if (!user)         return json({ error: 'Unauthorized' }, 401);
        if (!isAdmin(user)) return json({ error: 'Admin required' }, 403);
        let totalUsers = 0, totalEntries = 0, recentAuditEvents = [];
        if (env.DB) {
          const uc   = await env.DB.prepare('SELECT COUNT(*) as c FROM vault_entries').first();
          totalUsers = uc?.c || 0;
          const rows = await env.DB.prepare('SELECT entries FROM vault_entries').all();
          for (const row of rows.results) {
            try { totalEntries += JSON.parse(row.entries).length; } catch {}
          }
          const ar = await env.DB.prepare('SELECT * FROM audit_log ORDER BY ts DESC LIMIT 10').all();
          recentAuditEvents = ar.results.map(r => ({ ...r, meta: JSON.parse(r.meta || '{}') }));
        }
        await addAudit(env.DB, user.id, user.username, 'admin.stats');
        return json({ totalUsers, totalEntries, activeSessions: 0, recentAuditEvents, ts: Date.now(), requestedBy: user.username });
      }

      if (path === '/admin/sessions' && method === 'GET') {
        const user = await getUser();
        if (!user)         return json({ error: 'Unauthorized' }, 401);
        if (!isAdmin(user)) return json({ error: 'Admin required' }, 403);
        return json([]);
      }

      const killMatch = path.match(/^\/admin\/sessions\/(.+)$/);
      if (killMatch && method === 'DELETE') {
        const user = await getUser();
        if (!user)         return json({ error: 'Unauthorized' }, 401);
        if (!isAdmin(user)) return json({ error: 'Admin required' }, 403);
        const targetId = killMatch[1];
        if (env.DB) {
          await env.DB.prepare('INSERT OR REPLACE INTO revoked_users (user_id,revoked_until) VALUES (?,?)')
            .bind(targetId, Date.now() + TOKEN_TTL * 1000).run();
        }
        await addAudit(env.DB, user.id, user.username, 'session.force_terminate', { targetUserId: targetId });
        return json({ ok: true, removed: 1 });
      }

      // ── AUDIT ─────────────────────────────────────────────────────────────────
      if (path === '/audit/events' && method === 'GET') {
        const user = await getUser();
        if (!user)         return json({ error: 'Unauthorized' }, 401);
        if (!isAdmin(user)) return json({ error: 'Admin required' }, 403);
        const limit  = Math.min(parseInt(url.searchParams.get('limit')  || '50'), 200);
        const offset = parseInt(url.searchParams.get('offset') || '0');
        if (!env.DB) return json({ events: [], total: 0, limit, offset });
        const rows = await env.DB.prepare('SELECT * FROM audit_log ORDER BY ts DESC LIMIT ? OFFSET ?').bind(limit, offset).all();
        const ct   = await env.DB.prepare('SELECT COUNT(*) as c FROM audit_log').first();
        return json({
          events: rows.results.map(r => ({ ...r, meta: JSON.parse(r.meta || '{}') })),
          total: ct?.c || 0, limit, offset,
        });
      }

      if (path === '/audit/export' && method === 'GET') {
        const user = await getUser();
        if (!user)         return json({ error: 'Unauthorized' }, 401);
        if (!isAdmin(user)) return json({ error: 'Admin required' }, 403);
        await addAudit(env.DB, user.id, user.username, 'audit.export');
        if (!env.DB) return json({ exportedAt: new Date().toISOString(), exportedBy: user.username, events: [] });
        const rows = await env.DB.prepare('SELECT * FROM audit_log ORDER BY ts DESC').all();
        return new Response(JSON.stringify({
          exportedAt: new Date().toISOString(),
          exportedBy: user.username,
          events: rows.results.map(r => ({ ...r, meta: JSON.parse(r.meta || '{}') })),
        }, null, 2), {
          headers: {
            ...cors,
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="audit_${Date.now()}.json"`,
          },
        });
      }

      return json({ error: `${method} ${path} not found` }, 404);
    } catch (err) {
      console.error('[Worker]', err);
      return json({ error: 'Internal server error' }, 500);
    }
  },
};
