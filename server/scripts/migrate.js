import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL

async function runMigrations() {
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);
  try {
    await migrate(db, { migrationsFolder: 'migrations' });
    console.log('Migrations applied successfully');
  } finally {
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error(err);
  process.exit(1);
});


