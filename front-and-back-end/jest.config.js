/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Load environment variables before tests
  setupFiles: ['<rootDir>/jest.env.ts'],

  // Map @/ imports to the front-and-back-end/src folder
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  // Where Jest looks for test files
  testMatch: ['<rootDir>/src/tests/**/*.test.ts'],

  // Ignore node_modules
  modulePathIgnorePatterns: ['<rootDir>/node_modules/'],

  // Clear mocks automatically
  clearMocks: true,
};
