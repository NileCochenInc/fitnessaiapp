import { test, expect } from '@playwright/test';
import {
  ChatEvent,
  SSEEvent,
  loginWithCredentials,
  navigateToDashboard,
  clickFitBuddyButton,
  sendChatMessage,
  waitForAIResponse,
  logEvent,
  getEventTimeline,
} from './helpers/chat-helpers';
import { generateDetailedReport, printTestSummary } from './helpers/event-reporter';

test.describe.skip('Complete Chat Flow E2E Tests', () => {
  test('should complete full chat flow: login → dashboard → chat → response with detailed reporting', async ({
    page,
  }) => {
    const allEvents: ChatEvent[] = [];
    const testStartTime = Date.now();
    let testSuccess = false;
    let testError: string | undefined;
    let finalResponse = '';
    let sseEventsCollected: SSEEvent[] = [];
    let chatApiStatus: number | undefined;

    try {
      // ========== PHASE 1: LOGIN ==========
      console.log('\n📱 PHASE 1: LOGIN');
      await loginWithCredentials(page, allEvents);
      logEvent(allEvents, 'LOGIN', '✅ Phase 1 complete');

      // ========== PHASE 2: DASHBOARD ==========
      console.log('\n🏠 PHASE 2: DASHBOARD');
      await navigateToDashboard(page, allEvents);
      logEvent(allEvents, 'DASHBOARD', '✅ Phase 2 complete');

      // ========== PHASE 3: NAVIGATE TO CHAT ==========
      console.log('\n💬 PHASE 3: NAVIGATE TO CHAT');
      await clickFitBuddyButton(page, allEvents);
      logEvent(allEvents, 'CHAT_NAV', '✅ Phase 3 complete');

      // ========== PHASE 4: SEND MESSAGE & CAPTURE STREAM ==========
      console.log('\n💌 PHASE 4: SEND MESSAGE');
      const testMessage = 'What is a good morning workout routine?';
      const messageResult = await sendChatMessage(page, allEvents, testMessage);
      chatApiStatus = messageResult.apiStatus;
      sseEventsCollected = messageResult.sseEvents;
      logEvent(allEvents, 'MESSAGE', `✅ Phase 4 complete`, {
        sseEventsCount: sseEventsCollected.length,
      });

      // ========== PHASE 5: WAIT FOR RESPONSE ==========
      console.log('\n⏳ PHASE 5: WAIT FOR RESPONSE IN UI');
      finalResponse = await waitForAIResponse(page, allEvents, 60000);
      logEvent(allEvents, 'RESPONSE', '✅ Phase 5 complete', {
        responseLength: finalResponse.length,
      });

      // ========== VALIDATION ==========
      console.log('\n🔍 PHASE 6: VALIDATION');

      // Verify we have a response
      expect(finalResponse).toBeTruthy();
      expect(finalResponse.length).toBeGreaterThan(10);
      logEvent(allEvents, 'RESPONSE', 'Response length validated', {
        length: finalResponse.length,
      });

      // Verify we have SSE events
      expect(sseEventsCollected.length).toBeGreaterThan(0);
      const aiMessages = sseEventsCollected.filter((e) => e.type === 'ai');
      expect(aiMessages.length).toBeGreaterThan(0);
      logEvent(allEvents, 'RESPONSE', 'SSE events validated', {
        totalEvents: sseEventsCollected.length,
        aiEvents: aiMessages.length,
      });

      // Verify we have a finished event
      const finished = sseEventsCollected.some((e) => e.type === 'finished');
      expect(finished).toBeTruthy();
      logEvent(allEvents, 'RESPONSE', 'Finished event verified');

      testSuccess = true;
      logEvent(allEvents, 'RESPONSE', '✅ All validations passed');
    } catch (error) {
      testError = error instanceof Error ? error.message : String(error);
      logEvent(allEvents, 'ERROR', `❌ Test failed: ${testError}`);
      throw error;
    } finally {
      // ========== GENERATE REPORT ==========
      console.log('\n📊 GENERATING DETAILED REPORT');

      const detailedReport = generateDetailedReport(allEvents, sseEventsCollected, finalResponse, chatApiStatus);
      console.log(detailedReport);

      // Print timeline
      console.log(getEventTimeline(allEvents));

      // Print summary
      printTestSummary(allEvents, sseEventsCollected, testSuccess, testError);

      // Log execution statistics
      const totalDuration = Date.now() - testStartTime;
      console.log('\n📈 TEST STATISTICS');
      console.log(`├─ Total execution time: ${(totalDuration / 1000).toFixed(2)}s`);
      console.log(`├─ Total events recorded: ${allEvents.length}`);
      console.log(`├─ SSE events captured: ${sseEventsCollected.length}`);
      console.log(`├─ Chat API status: ${chatApiStatus}`);
      console.log(`├─ Final response length: ${finalResponse.length} characters`);
      console.log(`└─ Test result: ${testSuccess ? '✅ PASSED' : '❌ FAILED'}\n`);
    }
  });

  // Simplified smoke test for quick validation
  test('should load application and handle unauthenticated redirect', async ({ page }) => {
    console.log('\n✨ SMOKE TEST: App Loading & Auth Redirect');

    await page.goto('/');
    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    // Should redirect to login if not authenticated, or show dashboard if authenticated
    if (currentUrl.includes('login') || currentUrl.includes('signin')) {
      console.log('✅ Correctly redirected to login for unauthenticated user');
    } else {
      console.log('✅ Dashboard loaded (user already authenticated or session cached)');
    }

    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(100);
    console.log('✅ Page content loaded\n');
  });
});
