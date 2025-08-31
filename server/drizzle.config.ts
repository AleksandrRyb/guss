import type { Config } from 'drizzle-kit';

export default {
  schema: ['./src/modules/users/users.schema.ts', './src/modules/rounds/rounds.schema.ts'],
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;


