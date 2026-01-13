/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // Define separate projects for frontend and backend
  projects: [
    {
      displayName: "frontend",
      preset: "ts-jest", 

      testEnvironment: "jsdom", // needed for React component tests
      testMatch: ["<rootDir>/src/tests/frontend/**/*.test.{ts,tsx}"], // frontend tests folder
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"], // jest-dom for matchers
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1" // supports @/ imports
      },
      clearMocks: true,
    },
    {
      displayName: "backend",
      preset: "ts-jest", // ← THIS was missing

      testEnvironment: "node", // for pure Node backend tests
      testMatch: ["<rootDir>/src/tests/unit/**/*.test.ts",
                  "<rootDir>/src/tests/integration/**/*.test.ts"], // backend tests folder
      setupFiles: ["<rootDir>/jest.env.js"], // env vars
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
      },
      clearMocks: true,
    }
  ]
};
