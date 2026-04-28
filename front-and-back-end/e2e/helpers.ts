import { Page } from '@playwright/test';

export const TEST_USER = {
  email: 'playwright-test@fitnessai.local',
  password: 'TestPassword123!',
};

/**
 * Login to the application using email and password
 */
export async function loginUser(page: Page, email: string, password: string) {
  // Navigate to login page (assuming there's a login endpoint)
  await page.goto('/auth/signin');
  
  // Fill in email field
  await page.fill('input[type="email"]', email);
  
  // Fill in password field
  await page.fill('input[type="password"]', password);
  
  // Submit form (look for login button)
  await page.click('button[type="submit"]');
  
  // Wait for navigation to complete (should redirect to dashboard or home)
  await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {
    // If dashboard redirect fails, might redirect to home
    return page.waitForURL('/', { timeout: 10000 });
  });
}

/**
 * Check if user is authenticated
 */
export async function isUserAuthenticated(page: Page): Promise<boolean> {
  try {
    // Check for session data or authenticated indicator
    const sessionData = await page.evaluate(() => {
      return sessionStorage.getItem('auth') || localStorage.getItem('auth');
    });
    return !!sessionData;
  } catch (error) {
    return false;
  }
}

/**
 * Query Azure logs for errors related to AI service communication
 * This is a helper to understand what happened in the backend
 */
export async function getAzureLogsForContext(): Promise<string> {
  // This would require Azure CLI or SDK
  // For now, just document that this should be run manually
  console.log(`
    To check Azure logs for failures, run:
    az containerapp logs show --name fitness-ai-app --resource-group Fitness-AI-App --tail 100
    az containerapp logs show --name fitness-ai-app-ai --resource-group Fitness-AI-App --tail 100
  `);
  return '';
}

/**
 * Send chat message and wait for response
 */
export async function sendChatMessage(
  page: Page,
  message: string,
  timeout: number = 30000
): Promise<string> {
  // Find chat input field (adjust selector based on actual UI)
  const chatInput = page.locator('input[placeholder*="message"], textarea[placeholder*="message"], input[placeholder*="Ask"], textarea[placeholder*="Ask"]').first();
  
  // Type the message
  await chatInput.fill(message);
  
  // Submit (look for send button)
  const sendButton = page.locator('button:has-text("Send"), button:has-text("Ask"), button:has-text("Submit")').first();
  await sendButton.click();
  
  // Wait for response
  // Look for loading indicator to disappear or response to appear
  const responseTimeout = Date.now() + timeout;
  let lastError = '';
  
  while (Date.now() < responseTimeout) {
    try {
      // Check if there's an error message
      const errorMsg = await page.locator('[role="alert"], .error, .text-red-500').first().textContent();
      if (errorMsg) {
        throw new Error(`Chat error: ${errorMsg}`);
      }
      
      // Check if response appeared
      const messages = await page.locator('[role="article"], .message, .response').all();
      if (messages.length > 0) {
        const lastMessage = await messages[messages.length - 1].textContent();
        if (lastMessage && !lastMessage.includes('Loading') && !lastMessage.includes('...')) {
          return lastMessage || '';
        }
      }
    } catch (error) {
      lastError = String(error);
    }
    
    // Wait a bit before retrying
    await page.waitForTimeout(500);
  }
  
  throw new Error(
    `Chat message timed out after ${timeout}ms. Last error: ${lastError}`
  );
}

/**
 * Get network error details from page console
 */
export async function captureNetworkErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  
  page.on('response', (response) => {
    if (!response.ok()) {
      errors.push(
        `[HTTP ${response.status()}] ${response.url()}`
      );
    }
  });
  
  return errors;
}
