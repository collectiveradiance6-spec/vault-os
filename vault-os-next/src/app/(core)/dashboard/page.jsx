'use client';
import { useState, useEffect } from 'react';
import { GlassPanel } from '../../../components/ui/glass-panel';
import { useAuth } from '../../../hooks/use-auth';
import { useVault } from '../../../hooks/use-vault';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { entries, search, filter, activeFilter, setFilter, searchQ, setSearchQ, categories, addEntry, deleteEntry, stats } = useVault();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <nav className="topbar">
        <span className="topbar-brand">⬡ VAULT OS</span>
        <span className="topbar-pill">SECURE</span>
        <div className="topbar-right">
          <span className="topbar-user">{user?.username} · {user?.role?.toUpperCase()}</span>
          <button className="topbar-btn" onClick={logout}>LOGOUT</button>
        </div>
      </nav>
      <main className="screen" style={{ paddingTop:'1.5rem' }}>
        <div className="ambient" />
        <div style={{ position:'relative', zIndex:2 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:'1rem', marginBottom:'1.25rem' }}>
            <h2 style={{ fontSize:'.7rem', fontWeight:700, letterSpacing:'.25em', color:'#c7b1ff' }}>VAULT DASHBOARD</h2>
            <span style={{ fontSize:'.7rem', color:'var(--muted)' }}>{new Date().toLocaleDateString()}</span>
            <div style={{ marginLeft:'auto', display:'flex', gap:'.75rem' }}>
              <span style={{ fontSize:'.7rem', color:'var(--success)' }}>{stats.active} active</span>
              <span style={{ fontSize:'.7rem', color:'var(--muted)' }}>{stats.total} total</span>
            </div>
          </div>

          <div style={{ display:'flex', gap:'.75rem', marginBottom:'1rem', alignItems:'center' }}>
            <div style={{ flex:1, display:'flex', alignItems:'center', gap:'.5rem', background:'rgba(255,255,255,.05)', border:'1px solid var(--line)', borderRadius:14, padding:'.5rem .875rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search credentials…" style={{ flex:1, background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:'.85rem' }}/>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>＋ NEW</button>
          </div>

          <div style={{ display:'flex', gap:'.4rem', marginBottom:'.875rem', flexWrap:'wrap' }}>
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)}
                style={{ padding:'4px 12px', borderRadius:100, fontSize:'.68rem', fontWeight:600, cursor:'pointer', border:'1px solid', borderColor: c===activeFilter ? 'rgba(124,55,237,.5)' : 'var(--line)', background: c===activeFilter ? 'rgba(124,55,237,.18)' : 'rgba(255,255,255,.04)', color: c===activeFilter ? '#c4b4ff' : 'var(--muted)' }}>
                {c === 'All' ? `All (${stats.total})` : c}
              </button>
            ))}
          </div>

          <div className="dash-grid">
            {entries.length === 0 && (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'3rem', color:'var(--muted)', fontSize:'.85rem' }}>
                No credentials — add one to begin
              </div>
            )}
            {entries.map((e, i) => (
              <div key={e.id} className="glass-card vault-entry" style={{ animationDelay: `${i * 0.04}s` }}
                onPointerMove={ev => { const r = ev.currentTarget.getBoundingClientRect(); ev.currentTarget.style.setProperty('--cx', ((ev.clientX-r.left)/r.width*100)+'%'); ev.currentTarget.style.setProperty('--cy', ((ev.clientY-r.top)/r.height*100)+'%'); }}>
                <div className="entry-icon">{e.icon}</div>
                <div className="entry-name">{e.name}</div>
                <div className="entry-cat">{e.category}</div>
                <div className="entry-footer">
                  <span className={`badge badge-${e.status}`}><span className="badge-dot" />{e.status}</span>
                  <span className="entry-time">{e.lastUsed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
