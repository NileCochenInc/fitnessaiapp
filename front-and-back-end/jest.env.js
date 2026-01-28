const path = require("path");
const dotenv = require("dotenv");

// Load from root .env file
dotenv.config({
  path: path.resolve(__dirname, "../", ".env"),
});

console.log(`[dotenv] loaded env from root .env`);

// Set NODE_ENV to test for integration tests
process.env.NODE_ENV = "test";

// Use test database URL for integration tests
if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
  console.log(`[jest] Using test database`);
}