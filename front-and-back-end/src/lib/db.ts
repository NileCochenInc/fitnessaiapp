//single pool that all lib files use

export const runtime = 'nodejs';

import { Pool, PoolClient, QueryResult } from 'pg';

let pool: Pool | null = null;
let poolError: Error | null = null;

function initializePool() {
  if (pool || poolError) {
    // Already attempted initialization
    return;
  }

  console.log("Initializing database pool...");
  
  if (!process.env.DATABASE_URL) {
    const error = new Error('DATABASE_URL environment variable is not set');
    poolError = error;
    console.error('ERROR:', error.message);
    return;
  }
  
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: 20,
    });

    pool.on('error', (err) => {
      console.error('Pool connection error:', err.message);
    });

    console.log("Database pool initialized successfully");
  } catch (err) {
    poolError = err instanceof Error ? err : new Error(String(err));
    console.error('Failed to create pool:', poolError.message);
  }
}

// Pool wrapper class that handles null gracefully
class DatabasePool {
  query(
    text: string,
    values?: any[]
  ): Promise<QueryResult<any>> {
    // Initialize on first use
    if (!pool && !poolError) {
      initializePool();
    }

    // If pool initialization failed, provide meaningful error
    if (!pool) {
      const errorMsg = poolError?.message || 'Database pool not initialized';
      console.error('Query attempted but pool unavailable:', errorMsg);
      return Promise.reject(
        new Error(`Database connection failed: ${errorMsg}`)
      );
    }

    // Execute query with error context
    return pool.query(text, values).catch((err) => {
      console.error('Query execution error:', err.message, 'SQL:', text);
      throw err;
    });
  }

  connect(): Promise<PoolClient> {
    // Initialize on first use
    if (!pool && !poolError) {
      initializePool();
    }

    if (!pool) {
      const errorMsg = poolError?.message || 'Database pool not initialized';
      return Promise.reject(
        new Error(`Database connection failed: ${errorMsg}`)
      );
    }

    return pool.connect().catch((err) => {
      console.error('Connection error:', err.message);
      throw err;
    });
  }

  end(): Promise<void> {
    if (!pool) {
      return Promise.resolve();
    }
    return pool.end();
  }

  getPoolStatus() {
    return {
      initialized: pool !== null,
      hasError: poolError !== null,
      error: poolError?.message || null,
    };
  }
}

const poolWrapper = new DatabasePool();

export default poolWrapper;
export { DatabasePool };
