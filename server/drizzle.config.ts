import type { Config } from 'drizzle-kit';

export default {
  schema: './src/modules/users/users.schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://login:password@localhost:5432/guss',
  },
} satisfies Config;


