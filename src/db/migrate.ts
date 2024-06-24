import { migrate } from 'drizzle-orm/bun-sqlite/migrator';

import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { env } from '~/env';

console.log('Migrating database');

const sqlite = new Database(env.DATABASE_URL);
const db = drizzle(sqlite);
migrate(db, { migrationsFolder: './drizzle' });

console.log('Migrating database');
