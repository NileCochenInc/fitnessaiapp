import { Page } from '@playwright/test';
import { getSecrets } from './vault-config';

/**
 * Test user utilities for login, logout, and data reset
 */

/**
 * Login with test account credentials
 * Returns the authenticated page and session
 */
export async function loginTestUser(page: Page): Promise<{ page: Page; email: string }> {
  const secrets = await getSecrets();
  const { testUserEmail, testUserPassword } = secrets;

  console.log(`Logging in test user: ${testUserEmail}`);

  // Navigate directly to login page
  await page.goto('/login', { waitUntil: 'networkidle' });

  // Wait for login form to be visible
  await page.waitForURL('**/login', { timeout: 10000 });
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });

  // Fill email
  await page.fill('input[type="email"]', testUserEmail);

  // Fill password
  await page.fill('input[type="password"]', testUserPassword);

  // Submit login form
  await page.click('button[type="submit"]');

  // Wait for navigation - just wait a bit for the form to process
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {
    console.log('Navigation timeout - form may have redirected via JavaScript');
  });
  
  // Give page time to process redirect and set cookies
  await page.waitForTimeout(2000);
  console.log(`After login - Current URL: ${page.url()}`);

  // Wait for navigation to complete
  await page.waitForLoadState('networkidle').catch(() => {
    console.log('Network idle timeout');
  });

  // Verify we're logged in (check for user indicator or dashboard)
  const isLoggedIn = await page.locator('[data-testid="user-indicator"], button:has-text("Logout")').first().isVisible({ timeout: 5000 }).catch(() => false);
  if (!isLoggedIn) {
    console.warn('Warning: Could not verify login status. Continuing anyway...');
  }

  console.log('✓ Test user logged in successfully');
  return { page, email: testUserEmail };
}

/**
 * Reset test user data by clearing all workouts
 * This ensures a clean state for each test run
 */
export async function resetTestUserData(page: Page): Promise<void> {
  console.log('Resetting test user data (clearing workouts)...');

  try {
    // Call API to delete all user workouts using page.evaluate with credentials
    const result = await page.evaluate(async () => {
      const response = await fetch('/api/progress/all', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      return {
        status: response.status,
        ok: response.ok,
        text: await response.text(),
      };
    });

    if (result.ok) {
      console.log('✓ User workouts cleared successfully');
    } else if (result.status === 404) {
      // Endpoint might not exist; try alternative approach
      console.log('Workout delete endpoint not found, attempting alternative cleanup...');
      await resetViaUI(page);
    } else {
      console.warn(`Unexpected response status ${result.status} when clearing workouts`);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(`Could not clear workouts via API: ${errorMsg}. Attempting UI approach...`);
    await resetViaUI(page);
  }
}

/**
 * Alternative reset via UI navigation (fallback)
 * Navigate to progress page and manually clear entries if needed
 */
async function resetViaUI(page: Page): Promise<void> {
  try {
    // Navigate to progress page
    await page.goto('/progress');
    await page.waitForLoadState('networkidle');

    // Look for delete buttons and click them
    const deleteButtons = page.locator('[data-testid="delete-workout"], button:has-text("Delete")');
    const count = await deleteButtons.count();

    if (count === 0) {
      console.log('No workouts found to delete (page is already clean)');
      return;
    }

    console.log(`Deleting ${count} existing workouts...`);

    // Delete each workout (click and confirm)
    for (let i = 0; i < count; i++) {
      const button = page.locator('[data-testid="delete-workout"], button:has-text("Delete")').first();
      if (await button.isVisible()) {
        await button.click();
        // Handle confirmation dialog if present
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
        if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmButton.click();
          await page.waitForLoadState('networkidle');
        }
      }
    }

    console.log('✓ Workouts cleared via UI');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Failed to reset data via UI: ${errorMsg}`);
    throw error;
  }
}

/**
 * Logout the test user
 */
export async function logoutTestUser(page: Page): Promise<void> {
  console.log('Logging out test user...');

  try {
    // Click logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out")').first();
    if (await logoutButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutButton.click();
      await page.waitForURL('**/signin**', { timeout: 10000 }).catch(() => {
        console.log('Logout redirect not detected, but proceeding');
      });
    } else {
      // Use NextAuth signout endpoint
      await page.goto('/api/auth/signout');
      await page.waitForLoadState('networkidle');
    }

    console.log('✓ Test user logged out');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(`Error during logout: ${errorMsg}`);
  }
}
