'use client';
import { useState, useEffect, useMemo } from 'react';

const LKEY = 'vault_os_data';

function load() { try { return JSON.parse(localStorage.getItem(LKEY)) || []; } catch { return []; } }
function save(d) { localStorage.setItem(LKEY, JSON.stringify(d)); }

export function useVault() {
  const [all, setAll]           = useState([]);
  const [searchQ, setSearchQ]   = useState('');
  const [activeFilter, setFilter] = useState('All');

  useEffect(() => { setAll(load()); }, []);

  const categories = useMemo(() => ['All', ...new Set(all.map(e => e.category).filter(Boolean))], [all]);

  const entries = useMemo(() => {
    let list = all;
    if (activeFilter !== 'All') list = list.filter(e => e.category === activeFilter);
    if (searchQ) {
      const q = searchQ.toLowerCase();
      list = list.filter(e =>
        e.name?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        (e.notes || '').toLowerCase().includes(q) ||
        (e.tags || []).join(' ').toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [all, searchQ, activeFilter]);

  const stats = useMemo(() => ({
    total:   all.length,
    active:  all.filter(e => e.status === 'active').length,
    pinned:  all.filter(e => e.pinned).length,
    pending: all.filter(e => e.status === 'pending').length,
  }), [all]);

  function addEntry(data) {
    const entry = { ...data, id: crypto.randomUUID(), createdAt: Date.now(), lastUsed: 'Just now' };
    const next = [...all, entry];
    setAll(next); save(next);
    return entry;
  }

  function updateEntry(id, patch) {
    const next = all.map(e => e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e);
    setAll(next); save(next);
  }

  function deleteEntry(id) {
    const next = all.filter(e => e.id !== id);
    setAll(next); save(next);
  }

  function togglePin(id) {
    const e = all.find(x => x.id === id);
    if (e) updateEntry(id, { pinned: !e.pinned });
  }

  return { entries, all, searchQ, setSearchQ, activeFilter, setFilter, categories, stats, addEntry, updateEntry, deleteEntry, togglePin };
}
