import { ChatEvent, SSEEvent } from './chat-helpers';

export interface CompleteChatReport {
  totalDuration: number;
  phases: {
    login: PhaseReport;
    dashboard: PhaseReport;
    navigation: PhaseReport;
    message: PhaseReport;
    streaming: PhaseReport;
    response: PhaseReport;
  };
  sseEventCount: number;
  systemMessagesCount: number;
  aiMessagesCount: number;
  responseLength: number;
  success: boolean;
  errors: string[];
}

export interface PhaseReport {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  events: ChatEvent[];
  success: boolean;
}

/**
 * Parse events into phases
 */
export function parseEventPhases(allEvents: ChatEvent[]): Record<string, ChatEvent[]> {
  const phases: Record<string, ChatEvent[]> = {
    LOGIN: [],
    DASHBOARD: [],
    CHAT_NAV: [],
    MESSAGE: [],
    SSE: [],
    RESPONSE: [],
  };

  for (const event of allEvents) {
    if (phases[event.phase]) {
      phases[event.phase].push(event);
    }
  }

  return phases;
}

/**
 * Generate a detailed report of the entire chat flow
 */
export function generateDetailedReport(
  allEvents: ChatEvent[],
  sseEvents: SSEEvent[],
  finalResponse: string,
  apiStatus?: number
): string {
  const startTime = allEvents.length > 0 ? allEvents[0].timestamp : Date.now();
  const endTime = allEvents.length > 0 ? allEvents[allEvents.length - 1].timestamp : Date.now();
  const totalDuration = endTime - startTime;

  const phases = parseEventPhases(allEvents);

  let report = '\n';
  report += '╔' + '═'.repeat(70) + '╗\n';
  report += '║' + ' '.padEnd(20) + 'COMPLETE CHAT FLOW - DETAILED REPORT' + ' '.padEnd(15) + '║\n';
  report += '╚' + '═'.repeat(70) + '╝\n\n';

  // LOGIN PHASE
  report += '📱 LOGIN PHASE\n';
  report += '─'.repeat(70) + '\n';
  if (phases.LOGIN.length > 0) {
    report += formatPhaseEvents(phases.LOGIN, startTime);
    report += '✅ Login successful\n';
  } else {
    report += '⚠️  No login events recorded\n';
  }
  report += '\n';

  // DASHBOARD PHASE
  report += '🏠 DASHBOARD PHASE\n';
  report += '─'.repeat(70) + '\n';
  if (phases.DASHBOARD.length > 0) {
    report += formatPhaseEvents(phases.DASHBOARD, startTime);
    report += '✅ Dashboard loaded\n';
  } else {
    report += '⚠️  No dashboard events recorded\n';
  }
  report += '\n';

  // NAVIGATION PHASE
  report += '💬 NAVIGATE TO CHAT\n';
  report += '─'.repeat(70) + '\n';
  if (phases.CHAT_NAV.length > 0) {
    report += formatPhaseEvents(phases.CHAT_NAV, startTime);
    report += '✅ Chat page loaded\n';
  } else {
    report += '⚠️  No navigation events recorded\n';
  }
  report += '\n';

  // MESSAGE PHASE
  report += '💌 SEND MESSAGE\n';
  report += '─'.repeat(70) + '\n';
  if (phases.MESSAGE.length > 0) {
    report += formatPhaseEvents(phases.MESSAGE, startTime);
    if (apiStatus) {
      report += `✅ Chat API Status: ${apiStatus}\n`;
    }
  } else {
    report += '⚠️  No message events recorded\n';
  }
  report += '\n';

  // SSE STREAMING PHASE
  report += '📡 STREAMING EVENTS\n';
  report += '─'.repeat(70) + '\n';
  if (sseEvents.length > 0) {
    const systemMessages = sseEvents.filter((e) => e.type === 'system');
    const aiMessages = sseEvents.filter((e) => e.type === 'ai');
    const finished = sseEvents.some((e) => e.type === 'finished');

    report += formatSSEEvents(sseEvents, startTime);
    report += `\n├─ System messages: ${systemMessages.length}\n`;
    report += `├─ AI message chunks: ${aiMessages.length}\n`;
    report += `└─ Stream finished: ${finished ? '✅ Yes' : '⚠️  No'}\n`;
  } else {
    report += '⚠️  No SSE events recorded\n';
  }
  report += '\n';

  // RESPONSE PHASE
  report += '✅ RESPONSE RECEIVED\n';
  report += '─'.repeat(70) + '\n';
  if (finalResponse && finalResponse.length > 0) {
    report += `✅ Response length: ${finalResponse.length} characters\n`;
    report += `Preview: "${finalResponse.substring(0, 100)}${finalResponse.length > 100 ? '...' : ''}"\n`;
    if (phases.RESPONSE.length > 0) {
      report += formatPhaseEvents(phases.RESPONSE, startTime);
    }
  } else {
    report += '⚠️  No response received\n';
  }
  report += '\n';

  // SUMMARY
  report += '═'.repeat(70) + '\n';
  report += `📊 SUMMARY\n`;
  report += `├─ Total flow time: ${(totalDuration / 1000).toFixed(2)}s\n`;
  report += `├─ Total events: ${allEvents.length}\n`;
  report += `├─ SSE events: ${sseEvents.length}\n`;
  report += `├─ Response length: ${finalResponse?.length || 0} characters\n`;
  report += `└─ Status: ${finalResponse && finalResponse.length > 0 ? '✅ PASSED' : '❌ FAILED'}\n`;
  report += '═'.repeat(70) + '\n';

  return report;
}

/**
 * Format phase events for display
 */
function formatPhaseEvents(events: ChatEvent[], startTime: number): string {
  let output = '';
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const elapsed = (event.timestamp - startTime) / 1000;
    const isLast = i === events.length - 1;
    const prefix = isLast ? '└─' : '├─';
    const connector = isLast ? '  ' : '│ ';

    let line = `${prefix} [T+${elapsed.toFixed(2)}s] ${event.action}`;
    if (event.details) {
      line += ` (${JSON.stringify(event.details).substring(0, 50)})`;
    }
    output += line + '\n';
  }
  return output;
}

/**
 * Format SSE events for display
 */
function formatSSEEvents(events: SSEEvent[], startTime: number): string {
  let output = '';
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const isLast = i === events.length - 1;
    const prefix = isLast ? '└─' : '├─';

    let icon = '';
    if (event.type === 'system') icon = '📦';
    else if (event.type === 'ai') icon = '💬';
    else if (event.type === 'finished') icon = '✅';

    const timeStr = (event.timestamp / 1000).toFixed(2);
    const durationStr = event.duration ? ` (+${(event.duration / 1000).toFixed(3)}s)` : '';
    const preview = event.content.substring(0, 40).replace(/\n/g, ' ');

    output += `${prefix} [T+${timeStr}s${durationStr}] ${icon} ${event.type.toUpperCase()}: "${preview}${event.content.length > 40 ? '...' : ''}"\n`;
  }
  return output;
}

/**
 * Print a simple one-line summary
 */
export function printTestSummary(allEvents: ChatEvent[], sseEvents: SSEEvent[], success: boolean, error?: string): void {
  const startTime = allEvents.length > 0 ? allEvents[0].timestamp : Date.now();
  const endTime = allEvents.length > 0 ? allEvents[allEvents.length - 1].timestamp : Date.now();
  const totalDuration = (endTime - startTime) / 1000;

  console.log('\n' + '═'.repeat(70));
  if (success) {
    console.log(`✅ TEST PASSED in ${totalDuration.toFixed(2)}s`);
    console.log(`   Events: ${allEvents.length} | SSE: ${sseEvents.length} | Status: Complete`);
  } else {
    console.log(`❌ TEST FAILED`);
    console.log(`   Error: ${error || 'Unknown error'}`);
    console.log(`   Events recorded: ${allEvents.length}`);
  }
  console.log('═'.repeat(70) + '\n');
}
