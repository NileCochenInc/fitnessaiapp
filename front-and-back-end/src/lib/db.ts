//single pool that all lib files use

export const runtime = 'nodejs';

import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    console.log("Initializing database pool...");
    if (!process.env.DATABASE_URL) {
      console.error('ERROR: DATABASE_URL environment variable is not set');
      // Don't throw - just log the error and return null
      // This allows the app to start even if database isn't available
      return null;
    }
    
    try {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        max: 20,
      });

      pool.on('error', (err) => {
        console.error('Pool error:', err);
      });
    } catch (err) {
      console.error('Failed to create pool:', err);
      // Return null instead of throwing
      return null;
    }
  }
  
  return pool;
}

// Create a proxy that initializes on first use
const proxyPool = new Proxy({} as any, {
  get(target, prop) {
    return (getPool() as any)[prop];
  },
});

export default proxyPool;
