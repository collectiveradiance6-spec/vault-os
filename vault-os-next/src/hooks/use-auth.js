'use client';
import { useState, useEffect } from 'react';

const API  = process.env.NEXT_PUBLIC_API_URL;
const SKEY = 'vault_os_session';

export function useAuth() {
  const [user, setUser]   = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(SKEY);
    if (!raw) { setReady(true); return; }
    const { token } = JSON.parse(raw);
    fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(u => { if (u) setUser(u); })
      .finally(() => setReady(true));
  }, []);

  function logout() {
    sessionStorage.removeItem(SKEY);
    setUser(null);
    window.location.href = '/login';
  }

  return { user, ready, logout };
}
