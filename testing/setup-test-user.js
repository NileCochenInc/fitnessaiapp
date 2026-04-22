#!/usr/bin/env node
/**
 * Setup Test User - Generates bcrypt hash and SQL to create test user
 * This script creates a test user in the database for automated API testing
 * 
 * Usage:
 *   node setup-test-user.js
 * 
 * Output: SQL statement to copy into Neon console
 */

const bcrypt = require('bcrypt');

const TEST_USER = {
  username: 'stats_test_user',
  email: 'statstest@example.com',
  password: 'testpass123'
};

async function generateTestUser() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         GENERATING TEST USER CREDENTIALS                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    // Generate bcrypt hash
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(TEST_USER.password, salt);

    console.log('✅ Test User Details:');
    console.log(`   Username: ${TEST_USER.username}`);
    console.log(`   Email: ${TEST_USER.email}`);
    console.log(`   Password: ${TEST_USER.password}`);
    console.log('');

    console.log('✅ Generated Password Hash:');
    console.log(`   ${passwordHash}`);
    console.log('');

    // Generate SQL statement
    const sql = `INSERT INTO users (username, email, password_hash, created_at, updated_at)
VALUES ('${TEST_USER.username}', '${TEST_USER.email}', '${passwordHash}', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  password_hash = '${passwordHash}',
  updated_at = NOW()
RETURNING id, username, email;`;

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          SQL TO EXECUTE IN NEON CONSOLE                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(sql);
    console.log('');

    console.log('NEXT STEPS:');
    console.log('1. Go to https://console.neon.tech');
    console.log('2. Navigate to your fitness database');
    console.log('3. Open the SQL Editor');
    console.log('4. Copy the SQL above and execute it');
    console.log('5. Verify: SELECT id, username, email FROM users WHERE email = \'statstest@example.com\';');
    console.log('6. Run: node test-stats-authenticated.js');
    console.log('');

  } catch (error) {
    console.error('❌ Error generating hash:', error.message);
    process.exit(1);
  }
}

generateTestUser();
