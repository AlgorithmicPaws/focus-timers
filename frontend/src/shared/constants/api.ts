export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    ME: '/users/me',
  },
  SESSIONS: {
    BASE: '/sessions/',
    STATS: '/sessions/stats',
  },
  SETTINGS: {
    BASE: '/settings/',
    PRESETS: '/settings/presets',
  },
} as const;
