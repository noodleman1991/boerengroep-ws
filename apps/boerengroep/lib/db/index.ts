import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema';

/**
 * The newsletter sign-ups of this site: who asked for it, who confirmed, who left, and the
 * record of their consent. This is a small database of its own, one per site. It is not the
 * content database (PAYLOAD_DATABASE_URL). DATABASE_URL is its older name and still works.
 */
const address = process.env.NEWSLETTER_DATABASE_URL || process.env.DATABASE_URL;
if (!address) {
    throw new Error('NEWSLETTER_DATABASE_URL environment variable is required');
}

// Create connection pool for serverless environments
const pool = new Pool({
    connectionString: address,
    ssl: { rejectUnauthorized: false }
});

// Create Drizzle instance
export const db = drizzle(pool, { schema });

// Connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
    try {
        await pool.end();
    } catch (error) {
        console.error('Error closing database connection:', error);
    }
}
