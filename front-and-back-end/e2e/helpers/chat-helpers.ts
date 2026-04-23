import { Page, expect } from '@playwright/test';

export interface SSEEvent {
  timestamp: number; // ms since test start
  type: 'system' | 'ai' | 'finished';
  content: string;
  duration?: number; // time since previous event
}

export interface ChatEvent {
  timestamp: number;
  phase: string;
  action: string;
  details?: Record<string, any>;
  error?: string;
}

const TEST_USER = {
  email: 'playwright-test@fitnessai.local',
  password: 'TestPassword123!',
};

/**
 * Log a chat event with timestamp
 */
export function logEvent(
  events: ChatEvent[],
  phase: string,
  action: string,
  details?: Record<string, any>
): void {
  events.push({
    timestamp: Date.now(),
    phase,
    action,
    details,
  });
  console.log(`[${phase}] ${action}${details ? ` - ${JSON.stringify(details)}` : ''}`);
}

/**
 * Login with email/password credentials
 */
export async function loginWithCredentials(
  page: Page,
  events: ChatEvent[],
  email: string = TEST_USER.email,
  password: string = TEST_USER.password
): Promise<void> {
  logEvent(events, 'LOGIN', 'Starting login flow');

  await page.goto('/login');
  await page.waitForTimeout(500);
  logEvent(events, 'LOGIN', 'Navigated to /login');

  // Find email input
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
  await expect(emailInput).toBeVisible({ timeout: 10000 });
  await emailInput.fill(email);
  logEvent(events, 'LOGIN', 'Filled email', { email });

  // Find password input
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  await expect(passwordInput).toBeVisible({ timeout: 5000 });
  await passwordInput.fill(password);
  logEvent(events, 'LOGIN', 'Filled password');

  // Find and click submit button
  const submitButton = page
    .locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login"), button:has-text("sign")')
    .first();
  await expect(submitButton).toBeVisible({ timeout: 5000 });
  await submitButton.click();
  logEvent(events, 'LOGIN', 'Clicked submit button');

  // Wait for redirect to dashboard
  await page.waitForURL('/', { timeout: 15000 });
  logEvent(events, 'LOGIN', 'Redirected to dashboard (/)');

  // Verify dashboard loaded
  await page.waitForTimeout(1000);
  const currentUrl = page.url();
  if (!currentUrl.includes('/login')) {
    logEvent(events, 'LOGIN', 'Login successful', { finalUrl: currentUrl });
  } else {
    throw new Error(`Login failed - still on login page: ${currentUrl}`);
  }
}

/**
 * Navigate to dashboard and verify it loaded
 */
export async function navigateToDashboard(page: Page, events: ChatEvent[]): Promise<void> {
  logEvent(events, 'DASHBOARD', 'Navigating to dashboard');

  await page.goto('/');
  await page.waitForTimeout(500);
  logEvent(events, 'DASHBOARD', 'Navigated to /');

  // Wait for page to stabilize
  await page.waitForTimeout(1500);

  // Verify we're on the dashboard
  const pageContent = await page.content();
  const isSigininPage = pageContent.includes('Sign In') || pageContent.includes('sign in');

  if (isSigininPage) {
    throw new Error('Dashboard navigation failed - redirected back to signin');
  }

  logEvent(events, 'DASHBOARD', 'Dashboard loaded successfully');
}

/**
 * Click the "Fit Buddy AI" button to navigate to chat
 */
export async function clickFitBuddyButton(page: Page, events: ChatEvent[]): Promise<void> {
  logEvent(events, 'CHAT_NAV', 'Looking for Fit Buddy AI button');

  // Look for the button with various selectors
  const fitBuddyButton = page
    .locator('button:has-text("Fit Buddy"), button:has-text("fit buddy"), a:has-text("Fit Buddy")')
    .first();

  await expect(fitBuddyButton).toBeVisible({ timeout: 10000 });
  logEvent(events, 'CHAT_NAV', 'Found Fit Buddy AI button');

  await fitBuddyButton.click();
  logEvent(events, 'CHAT_NAV', 'Clicked Fit Buddy AI button');

  // Wait for navigation to chat page
  await page.waitForURL(/\/chat/, { timeout: 15000 });
  logEvent(events, 'CHAT_NAV', 'Navigated to chat page', { url: page.url() });

  // Wait for chat UI to load
  await page.waitForTimeout(1000);
}

/**
 * Capture Server-Sent Events from the /api/progress endpoint
 */
export async function captureSSEStream(page: Page, events: ChatEvent[], timeoutMs: number = 60000): Promise<SSEEvent[]> {
  const sseEvents: SSEEvent[] = [];
  const startTime = Date.now();
  let eventStartTime = startTime;
  let lastEventTime = startTime;

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      logEvent(events, 'SSE', 'SSE stream timeout - no finish event received', {
        eventsReceived: sseEvents.length,
        timeoutMs,
      });
      resolve(sseEvents); // Resolve with partial events instead of rejecting
    }, timeoutMs);

    // Intercept the SSE stream
    page.on('response', async (response) => {
      const url = response.url();

      if (url.includes('/api/progress')) {
        eventStartTime = Date.now();

        try {
          const text = await response.text();
          const lines = text.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6); // Remove "data: "
              const now = Date.now();
              const elapsed = now - startTime;
              const duration = now - lastEventTime;
              lastEventTime = now;

              if (data.includes('System_message:')) {
                const content = data.replace('System_message:', '').trim();
                sseEvents.push({
                  timestamp: elapsed,
                  type: 'system',
                  content,
                  duration,
                });
                logEvent(events, 'SSE', `System message received`, { content: content.substring(0, 50), elapsed });
              } else if (data.includes('AI_message:')) {
                const content = data.replace('AI_message:', '').trim();
                sseEvents.push({
                  timestamp: elapsed,
                  type: 'ai',
                  content,
                  duration,
                });
                logEvent(events, 'SSE', `AI message received`, { content: content.substring(0, 50), elapsed });
              } else if (data === 'Finished!') {
                sseEvents.push({
                  timestamp: elapsed,
                  type: 'finished',
                  content: 'Stream finished',
                  duration,
                });
                logEvent(events, 'SSE', 'Finished event received', { elapsed });
                clearTimeout(timeout);
                resolve(sseEvents);
              }
            }
          }
        } catch (error) {
          logEvent(events, 'SSE', 'Error parsing SSE response', { error: String(error) });
        }
      }
    });
  });
}

/**
 * Send a chat message and return the response
 */
export async function sendChatMessage(
  page: Page,
  events: ChatEvent[],
  message: string
): Promise<{ apiStatus?: number; sseEvents: SSEEvent[] }> {
  logEvent(events, 'MESSAGE', 'Starting message send', { message });

  // Find the chat input field
  const chatInput = page.locator('input[placeholder="Type your message..."], textarea[placeholder*="message" i]').first();
  await expect(chatInput).toBeVisible({ timeout: 10000 });
  logEvent(events, 'MESSAGE', 'Found chat input field');

  // Fill the message
  await chatInput.fill(message);
  logEvent(events, 'MESSAGE', 'Filled input field with message');

  // Find and click send button (looks for button with 💬 or "send" text)
  const sendButton = page.locator('button:has-text("💬"), button:has-text("Send"), button[aria-label*="send" i]').first();

  let apiStatus: number | undefined;

  // Intercept the POST /api/chat request
  const chatRequestPromise = page.waitForResponse((response) => {
    if (response.url().includes('/api/chat') && response.request().method() === 'POST') {
      apiStatus = response.status();
      logEvent(events, 'MESSAGE', 'Chat API response', { status: apiStatus });
      return true;
    }
    return false;
  });

  // Start capturing SSE events in parallel
  const ssePromise = captureSSEStream(page, events, 60000);

  // Click send button or press Enter
  if (await sendButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await sendButton.click();
    logEvent(events, 'MESSAGE', 'Clicked send button');
  } else {
    await chatInput.press('Enter');
    logEvent(events, 'MESSAGE', 'Sent message via Enter key');
  }

  // Wait for both the API response and SSE stream
  try {
    await chatRequestPromise;
  } catch (error) {
    logEvent(events, 'MESSAGE', 'Failed to intercept chat API', { error: String(error) });
  }

  const sseEvents = await ssePromise;
  logEvent(events, 'MESSAGE', 'SSE stream completed', { eventsCount: sseEvents.length });

  return { apiStatus, sseEvents };
}

/**
 * Wait for the AI response to appear in the UI
 */
export async function waitForAIResponse(page: Page, events: ChatEvent[], timeoutMs: number = 60000): Promise<string> {
  logEvent(events, 'RESPONSE', 'Waiting for AI response in UI', { timeoutMs });

  const startTime = Date.now();
  let responseText = '';

  // Look for AI message bubble (dark background, left-aligned)
  const aiMessageLocator = page.locator('div.bg-\\[\\#2f3136\\].text-\\[\\#dcddde\\], [data-testid="ai-message"]').last();

  try {
    // Wait for the AI message to appear
    await expect(aiMessageLocator).toBeVisible({ timeout: timeoutMs });
    responseText = await aiMessageLocator.textContent();
    const elapsed = Date.now() - startTime;
    logEvent(events, 'RESPONSE', 'AI response found in UI', {
      responseLength: responseText?.length || 0,
      elapsed,
    });
  } catch (error) {
    // Fallback: look for any visible text that looks like a response
    const allMessages = await page.locator('div.bg-\\[\\#2f3136\\]').all();
    for (const msg of allMessages) {
      const text = await msg.textContent();
      if (text && text.length > 50 && !text.includes('AI is thinking')) {
        responseText = text;
        break;
      }
    }

    if (!responseText) {
      throw new Error(`AI response not found after ${timeoutMs}ms`);
    }
  }

  return responseText || '';
}

/**
 * Get full report of all events in chronological order
 */
export function getEventTimeline(allEvents: ChatEvent[]): string {
  if (allEvents.length === 0) {
    return 'No events recorded';
  }

  const startTime = allEvents[0].timestamp;
  let timeline = '\n📊 EVENT TIMELINE\n';
  timeline += '═'.repeat(60) + '\n';

  for (const event of allEvents) {
    const elapsed = event.timestamp - startTime;
    const seconds = (elapsed / 1000).toFixed(2);
    const detailsStr = event.details ? ` | ${JSON.stringify(event.details)}` : '';
    timeline += `[T+${seconds}s] [${event.phase}] ${event.action}${detailsStr}\n`;
  }

  timeline += '═'.repeat(60) + '\n';
  return timeline;
}
