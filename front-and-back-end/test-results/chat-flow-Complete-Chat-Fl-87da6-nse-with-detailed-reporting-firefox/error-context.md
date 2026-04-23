# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chat-flow.test.ts >> Complete Chat Flow E2E Tests >> should complete full chat flow: login → dashboard → chat → response with detailed reporting
- Location: e2e/chat-flow.test.ts:16:7

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.all: Target page, context or browser has been closed
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e4]:
    - generic [ref=e5]:
      - button "🏠" [ref=e7]
      - heading "Fit Buddy AI Chat" [level=1] [ref=e8]
    - generic [ref=e9]: "Chat failed: HTTP 500"
    - paragraph [ref=e14]: What is a good morning workout routine?
    - generic [ref=e15]:
      - textbox "Type your message..." [ref=e16]
      - button "💬" [disabled] [ref=e17]
```

# Test source

```ts
  197 |                   type: 'finished',
  198 |                   content: 'Stream finished',
  199 |                   duration,
  200 |                 });
  201 |                 logEvent(events, 'SSE', 'Finished event received', { elapsed });
  202 |                 clearTimeout(timeout);
  203 |                 resolve(sseEvents);
  204 |               }
  205 |             }
  206 |           }
  207 |         } catch (error) {
  208 |           logEvent(events, 'SSE', 'Error parsing SSE response', { error: String(error) });
  209 |         }
  210 |       }
  211 |     });
  212 |   });
  213 | }
  214 | 
  215 | /**
  216 |  * Send a chat message and return the response
  217 |  */
  218 | export async function sendChatMessage(
  219 |   page: Page,
  220 |   events: ChatEvent[],
  221 |   message: string
  222 | ): Promise<{ apiStatus?: number; sseEvents: SSEEvent[] }> {
  223 |   logEvent(events, 'MESSAGE', 'Starting message send', { message });
  224 | 
  225 |   // Find the chat input field
  226 |   const chatInput = page.locator('input[placeholder="Type your message..."], textarea[placeholder*="message" i]').first();
  227 |   await expect(chatInput).toBeVisible({ timeout: 10000 });
  228 |   logEvent(events, 'MESSAGE', 'Found chat input field');
  229 | 
  230 |   // Fill the message
  231 |   await chatInput.fill(message);
  232 |   logEvent(events, 'MESSAGE', 'Filled input field with message');
  233 | 
  234 |   // Find and click send button (looks for button with 💬 or "send" text)
  235 |   const sendButton = page.locator('button:has-text("💬"), button:has-text("Send"), button[aria-label*="send" i]').first();
  236 | 
  237 |   let apiStatus: number | undefined;
  238 | 
  239 |   // Intercept the POST /api/chat request
  240 |   const chatRequestPromise = page.waitForResponse((response) => {
  241 |     if (response.url().includes('/api/chat') && response.request().method() === 'POST') {
  242 |       apiStatus = response.status();
  243 |       logEvent(events, 'MESSAGE', 'Chat API response', { status: apiStatus });
  244 |       return true;
  245 |     }
  246 |     return false;
  247 |   });
  248 | 
  249 |   // Start capturing SSE events in parallel
  250 |   const ssePromise = captureSSEStream(page, events, 60000);
  251 | 
  252 |   // Click send button or press Enter
  253 |   if (await sendButton.isVisible({ timeout: 2000 }).catch(() => false)) {
  254 |     await sendButton.click();
  255 |     logEvent(events, 'MESSAGE', 'Clicked send button');
  256 |   } else {
  257 |     await chatInput.press('Enter');
  258 |     logEvent(events, 'MESSAGE', 'Sent message via Enter key');
  259 |   }
  260 | 
  261 |   // Wait for both the API response and SSE stream
  262 |   try {
  263 |     await chatRequestPromise;
  264 |   } catch (error) {
  265 |     logEvent(events, 'MESSAGE', 'Failed to intercept chat API', { error: String(error) });
  266 |   }
  267 | 
  268 |   const sseEvents = await ssePromise;
  269 |   logEvent(events, 'MESSAGE', 'SSE stream completed', { eventsCount: sseEvents.length });
  270 | 
  271 |   return { apiStatus, sseEvents };
  272 | }
  273 | 
  274 | /**
  275 |  * Wait for the AI response to appear in the UI
  276 |  */
  277 | export async function waitForAIResponse(page: Page, events: ChatEvent[], timeoutMs: number = 60000): Promise<string> {
  278 |   logEvent(events, 'RESPONSE', 'Waiting for AI response in UI', { timeoutMs });
  279 | 
  280 |   const startTime = Date.now();
  281 |   let responseText = '';
  282 | 
  283 |   // Look for AI message bubble (dark background, left-aligned)
  284 |   const aiMessageLocator = page.locator('div.bg-\\[\\#2f3136\\].text-\\[\\#dcddde\\], [data-testid="ai-message"]').last();
  285 | 
  286 |   try {
  287 |     // Wait for the AI message to appear
  288 |     await expect(aiMessageLocator).toBeVisible({ timeout: timeoutMs });
  289 |     responseText = await aiMessageLocator.textContent();
  290 |     const elapsed = Date.now() - startTime;
  291 |     logEvent(events, 'RESPONSE', 'AI response found in UI', {
  292 |       responseLength: responseText?.length || 0,
  293 |       elapsed,
  294 |     });
  295 |   } catch (error) {
  296 |     // Fallback: look for any visible text that looks like a response
> 297 |     const allMessages = await page.locator('div.bg-\\[\\#2f3136\\]').all();
      |                                                                      ^ Error: locator.all: Target page, context or browser has been closed
  298 |     for (const msg of allMessages) {
  299 |       const text = await msg.textContent();
  300 |       if (text && text.length > 50 && !text.includes('AI is thinking')) {
  301 |         responseText = text;
  302 |         break;
  303 |       }
  304 |     }
  305 | 
  306 |     if (!responseText) {
  307 |       throw new Error(`AI response not found after ${timeoutMs}ms`);
  308 |     }
  309 |   }
  310 | 
  311 |   return responseText || '';
  312 | }
  313 | 
  314 | /**
  315 |  * Get full report of all events in chronological order
  316 |  */
  317 | export function getEventTimeline(allEvents: ChatEvent[]): string {
  318 |   if (allEvents.length === 0) {
  319 |     return 'No events recorded';
  320 |   }
  321 | 
  322 |   const startTime = allEvents[0].timestamp;
  323 |   let timeline = '\n📊 EVENT TIMELINE\n';
  324 |   timeline += '═'.repeat(60) + '\n';
  325 | 
  326 |   for (const event of allEvents) {
  327 |     const elapsed = event.timestamp - startTime;
  328 |     const seconds = (elapsed / 1000).toFixed(2);
  329 |     const detailsStr = event.details ? ` | ${JSON.stringify(event.details)}` : '';
  330 |     timeline += `[T+${seconds}s] [${event.phase}] ${event.action}${detailsStr}\n`;
  331 |   }
  332 | 
  333 |   timeline += '═'.repeat(60) + '\n';
  334 |   return timeline;
  335 | }
  336 | 
```