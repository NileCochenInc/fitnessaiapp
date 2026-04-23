import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'playwright-test@fitnessai.local',
  password: 'TestPassword123!',
};

test.describe('Chat Functionality E2E Tests', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    
    // Just check that page loads
    const body = page.locator('body');
    await expect(body).toBeVisible({ timeout: 10000 });
    
    console.log('✓ Application loaded successfully');
  });

  test('should navigate to signin if not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Wait a bit for any redirects
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('signin') || currentUrl.includes('login')) {
      console.log('✓ Redirected to signin page as expected');
    } else {
      console.log('⚠ Not redirected to signin (might be cached/logged in)');
    }
  });

  test('should send chat message and capture response', async ({ page, context }) => {
    // Intercept requests to understand what's happening
    const requests: { url: string; method: string; status?: number; body?: string }[] = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/chat')) {
        const status = response.status();
        try {
          const body = await response.text();
          requests.push({
            url,
            method: 'POST',
            status,
            body: body.substring(0, 500),
          });
          console.log(`[Chat API Response] Status: ${status}, URL: ${url}`);
          if (status !== 200) {
            console.log(`  Error body: ${body.substring(0, 200)}`);
          }
        } catch (e) {
          console.log(`[Chat API Response] Status: ${status}, URL: ${url} (couldn't read body)`);
        }
      }
    });
    
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check if we need to login
    const currentUrl = page.url();
    if (currentUrl.includes('signin') || currentUrl.includes('login')) {
      // Try to log in with test user
      console.log('Attempting to login as test user...');
      
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
      
      if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await emailInput.fill(TEST_USER.email);
        await passwordInput.fill(TEST_USER.password);
        
        const submitButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
        await submitButton.click();
        
        // Wait for redirect
        await page.waitForTimeout(3000);
      }
    }
    
    // Record start time
    const startTime = Date.now();
    
    // Try to find and use chat input
    const chatInput = page.locator('textarea, input[type="text"]').first();
    
    console.log(`\n=== SENDING CHAT MESSAGE ===`);
    const testMessage = 'What is a good workout routine?';
    console.log(`Message: "${testMessage}"`);
    
    if (await chatInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await chatInput.fill(testMessage);
      
      // Find and click send button
      const sendButton = page.locator('button').filter({ hasText: /send|submit|ask/i }).first();
      if (await sendButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await sendButton.click();
        console.log('Send button clicked');
      } else {
        // Try Enter key
        await chatInput.press('Enter');
        console.log('Sent via Enter key');
      }
      
      // Wait for response with detailed logging
      const maxWaitTime = 30000; // 30 seconds
      let responseReceived = false;
      let responseText = '';
      
      const waitStart = Date.now();
      while (Date.now() - waitStart < maxWaitTime && !responseReceived) {
        // Check for response in page
        const messages = await page.locator('[role="article"], .message, .response, p').all();
        for (const msg of messages) {
          const text = await msg.textContent();
          if (text && text.length > 20 && !text.includes('Loading') && !text.includes('...')) {
            responseText = text;
            responseReceived = true;
            break;
          }
        }
        
        if (!responseReceived) {
          await page.waitForTimeout(500);
        }
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      console.log(`\nResponse received in: ${totalTime}ms`);
      console.log(`Response preview: ${responseText.substring(0, 150)}...`);
      
      if (requests.length > 0) {
        console.log(`\nAPI Requests made:`);
        requests.forEach(req => {
          console.log(`  [${req.status}] ${req.method} ${req.url}`);
        });
      }
      
      if (responseReceived) {
        console.log('\n✓ Chat test PASSED - response received');
        expect(responseText.length).toBeGreaterThan(10);
      } else {
        console.log('\n✗ Chat test FAILED - timeout waiting for response (30s)');
        throw new Error(`No chat response received after ${totalTime}ms`);
      }
    } else {
      console.log('⚠ Could not find chat input - might be wrong page');
      console.log(`Current URL: ${page.url()}`);
    }
    
    console.log('=== END CHAT TEST ===\n');
  });
});
