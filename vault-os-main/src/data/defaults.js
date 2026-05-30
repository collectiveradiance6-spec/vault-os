export const DEFAULT_ENTRIES = [
  { id: 's1', t: 'Beacon', cat: 'Admin', icon: '🔑', status: 'active', user: 'admin@beacon.io', pass: 'Bcon_Adm!n2024', url: 'https://beacon.io/admin', notes: 'Primary admin portal. 2FA via Authy.', tags: ['admin','primary'], pinned: true, created: '2024-01-15', lastUsed: 'Today' },
  { id: 's2', t: 'Conclave', cat: 'Discord', icon: '💬', status: 'active', user: 'vault_bot#4821', pass: 'Cncl4v3_B0t!', url: 'https://discord.com/developers', notes: 'Bot token for CONbot5. Reset monthly.', tags: ['bot','discord'], pinned: false, created: '2024-02-03', lastUsed: '2h ago' },
  { id: 's3', t: 'Nitrado', cat: 'Server', icon: '🖥', status: 'active', user: 'admin@nitrado.net', pass: 'N1tr4d0_Srv!2024', url: 'https://server.nitrado.net', notes: 'Game server panel.', tags: ['server','hosting'], pinned: false, created: '2024-03-10', lastUsed: 'Yesterday' },
  { id: 's4', t: 'Everflow', cat: 'Client', icon: '🌊', status: 'pending', user: 'op@everflow.gg', pass: 'EvrFl0w#Cl13nt', url: 'https://dashboard.everflow.gg', notes: 'Awaiting client approval.', tags: ['client','pending'], pinned: false, created: '2024-04-01', lastUsed: '3d ago' },
  { id: 's5', t: 'Cloudflare', cat: 'Infrastructure', icon: '☁️', status: 'active', user: 'admin@cf.workers.dev', pass: 'CF_W0rk3rs!2024', url: 'https://dash.cloudflare.com', notes: 'conbot5.pages.dev managed here.', tags: ['infra','cdn'], pinned: true, created: '2024-01-20', lastUsed: '1h ago' },
  { id: 's6', t: 'GitHub', cat: 'Development', icon: '🐙', status: 'active', user: 'collectiveradiance6', pass: 'ghp_T0k3nH3r3!', url: 'https://github.com/collectiveradiance6-spec/CONbot5', notes: 'Monorepo. PAT expires in 30d.', tags: ['dev','git'], pinned: false, created: '2024-01-10', lastUsed: '4h ago' },
];

export const DEFAULT_STATE = {
  user: null,
  session: null,
  locked: true,
  activeTab: 'creds',
  activeFilter: 'All',
  searchQuery: '',
  editingId: null,
  entries: DEFAULT_ENTRIES,
  activityLog: [],
  theme: 'default',
};

export const DEFAULT_SETTINGS = {
  mask: true,
  particles: true,
  scanlines: true,
  autoLock: true,
  clipboardClear: false,
};
