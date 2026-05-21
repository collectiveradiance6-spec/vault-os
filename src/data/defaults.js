export const DEFAULT_ENTRIES = [
  {
    id: '1',
    name: 'GitHub',
    category: 'Development',
    username: '',
    password: '',
    url: '',
    notes: '',
    tags: ['dev'],
    icon: '⚡',
    status: 'active',
  },
];

export const DEFAULT_STATE = {
  user: null,
  session: null,
  theme: 'default',
  activeModule: 'dashboard',
  locked: true,
  entries: DEFAULT_ENTRIES,
};

export const DEFAULT_SETTINGS = {
  mask: true,
  particles: true,
  scanlines: true,
};
