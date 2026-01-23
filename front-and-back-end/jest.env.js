const path = require("path");
const dotenv = require("dotenv");

// Load from root .env file
dotenv.config({
  path: path.resolve(__dirname, "../", ".env"),
});

console.log(`[dotenv] loaded env from root .env`);