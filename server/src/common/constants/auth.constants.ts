export const JWT = {
  STRATEGY: 'jwt',
  REFRESH_STRATEGY: 'jwt-refresh',
  ENV: {
    SECRET: 'JWT_SECRET',
    REFRESH_SECRET: 'JWT_REFRESH_SECRET',
    ACCESS_EXPIRES: 'JWT_ACCESS_EXPIRATION_TIME',
    REFRESH_EXPIRES: 'JWT_REFRESH_EXPIRATION_TIME',
  },
} as const;

export const ENV_DATABASE_URL = 'DATABASE_URL';

export const ROLES = {
  admin: 'admin',
  nikita: 'nikita',
  user: 'user',
} as const;


