//single pool that all lib files use

export const runtime = 'nodejs';

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
