import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.e2e' });

/**
 * Playwright E2E Test Configuration
 * Tests the data tool integration end-to-end on production Azure
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  
  // Global timeout for each test
  timeout: 60 * 1000,
  
  // Global timeout for the entire test file
  fullyParallel: false,
  
  // Fail on console errors (optional)
  use: {
    // Base URL for navigation
    baseURL: process.env.PROD_APP_URL || 'http://localhost:3000',
    
    // Network and timing
    navigationTimeout: 30 * 1000,
    actionTimeout: 10 * 1000,
    
    // Screenshots and video
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'], // console output
  ],

  // Projects (browsers)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Add Firefox and WebKit if needed
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Web Server configuration (optional - use if testing local dev server)
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },

  // Retry configuration for production flakiness
  retries: process.env.CI ? 2 : 1,

  // Workers configuration
  workers: process.env.CI ? 1 : 1, // Single worker for production safety
});
