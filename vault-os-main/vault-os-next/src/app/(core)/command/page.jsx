'use client';
import { useAuth } from '../../../hooks/use-auth';
import { GlassPanel } from '../../../components/ui/glass-panel';

const COMMANDS = [
  { label:'Dashboard', desc:'View and manage vault credentials', href:'/dashboard', icon:'🔑' },
  { label:'Admin',     desc:'Server stats, sessions, audit log', href:'/admin',     icon:'⚙️' },
  { label:'Settings',  desc:'Theme, particles, security prefs',  href:'/settings',  icon:'◈'  },
];

export default function CommandPage() {
  const { user } = useAuth();
  return (
    <main className="screen">
      <div className="ambient" />
      <div style={{ position:'relative', zIndex:2 }}>
        <p className="eyebrow">Command Centre</p>
        <h1 style={{ fontSize:'1.75rem', fontWeight:700, letterSpacing:'-.02em' }}>Welcome, {user?.username ?? '—'}</h1>
        <div className="command-grid">
          {COMMANDS.map(c => (
            <a key={c.label} href={c.href} className="glass-card" style={{ display:'block', padding:'1.5rem' }}>
              <div style={{ fontSize:'2rem', marginBottom:'.75rem' }}>{c.icon}</div>
              <div style={{ fontWeight:700, marginBottom:'.35rem' }}>{c.label}</div>
              <div style={{ fontSize:'.8rem', color:'var(--muted)' }}>{c.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
