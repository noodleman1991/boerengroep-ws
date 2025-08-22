// drizzle.config.ts
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load environment variables
config({ path: '.env.local' });
config({ path: '.env' });

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
