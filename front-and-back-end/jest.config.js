/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // Use ts-jest to run TypeScript files
  preset: 'ts-jest',

  // Node environment for API/backend tests
  testEnvironment: 'node',

  // Map @/ imports to the front-and-back-end folder
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },

  // Where Jest looks for test files
  testMatch: ['**/tests/**/*.test.ts'],

  // Optional: ignore node_modules
  modulePathIgnorePatterns: ['<rootDir>/node_modules/'],

  // Optional: clear mocks between tests
  clearMocks: true,
};
