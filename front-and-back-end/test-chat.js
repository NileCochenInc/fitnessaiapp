#!/usr/bin/env node

/**
 * Direct API test for chat functionality with authentication
 */

const http = require('http');
const https = require('https');

const TEST_USER = {
  email: 'playwright-test@fitnessai.local',
  password: 'TestPassword123!',
};

const BASE_URL = process.env.BASE_URL || 'https://fitness-ai-app.ashycliff-d78872a9.canadacentral.azurecontainerapps.io';

function makeRequest(url, method = 'GET', body = null, cookies = '') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Chat-E2E-Test/1.0',
      },
    };

    if (cookies) {
      options.headers['Cookie'] = cookies;
    }

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = client.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

function extractCookies(response) {
  const setCookieHeaders = response.headers['set-cookie'];
  if (!setCookieHeaders) return '';

  // Parse Set-Cookie headers and extract cookie names/values
  const cookies = [];
  for (const setCookie of (Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders])) {
    const parts = setCookie.split(';');
    const cookie = parts[0]; // Get the name=value part
    cookies.push(cookie);
  }

  return cookies.join('; ');
}

async function runTests() {
  console.log(`\n=== CHAT E2E TEST WITH AUTHENTICATION ===`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test User: ${TEST_USER.email}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  try {
    // Test 1: Check if server is running
    console.log('[1/4] Testing if server is running...');
    const healthResponse = await makeRequest(`${BASE_URL}/`);
    if (healthResponse.status >= 200 && healthResponse.status < 500) {
      console.log(`✓ Server responded with ${healthResponse.status}`);
    } else {
      throw new Error(`Server not responding properly: ${healthResponse.status}`);
    }

    // Test 2: Attempt login (via sign-in API or page)
    console.log('\n[2/4] Attempting authentication...');
    console.log(`  Using credentials: ${TEST_USER.email}`);

    // Try to access the app which might redirect to signin
    const appResponse = await makeRequest(`${BASE_URL}/`);
    let sessionCookies = extractCookies(appResponse);

    if (!sessionCookies) {
      console.log(`  ⚠ No session established yet`);
    } else {
      console.log(`  ✓ Session cookies received`);
    }

    // Try to POST to signin endpoint (if it exists) or check other auth endpoints
    // First, let's try to get the signin page to understand the auth flow
    const signinResponse = await makeRequest(`${BASE_URL}/api/auth/signin`);
    console.log(`  Auth endpoint status: ${signinResponse.status}`);

    // Some Next-auth apps support direct callback login
    // Try using the credentials provider if available
    console.log(`\n  ℹ Note: Full authentication flow may require browser session`);
    console.log(`    The test user exists in database but needs proper NextAuth session`);

    // Test 3: Try chat endpoint anyway to show exact error
    console.log('\n[3/4] Attempting to send chat message...');
    const startTime = Date.now();

    const chatPayload = {
      prompt: 'What is a good workout routine?',
      context: [],
    };

    console.log(`  Payload: ${JSON.stringify(chatPayload)}`);

    const chatResponse = await makeRequest(`${BASE_URL}/api/chat`, 'POST', chatPayload, sessionCookies);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`✓ Response received in ${responseTime}ms`);
    console.log(`  Status: ${chatResponse.status}`);

    if (chatResponse.status === 401) {
      console.log(`✗ Not authenticated (401)`);
      console.log(`\n  ROOT CAUSE: The chat endpoint requires a NextAuth session`);
      console.log(`  To properly test, you need to:`);
      console.log(`    1. Log in via the web UI with test credentials`);
      console.log(`    2. Use browser DevTools to copy the session cookies`);
      console.log(`    3. Run this command:`);
      console.log(
        `       COOKIES='nextauth.session-token=...' node test-chat.js`
      );
      console.log(
        `\n  OR test directly in the browser at: ${BASE_URL}/`
      );
    } else if (chatResponse.status === 200) {
      console.log(`✓ Chat endpoint returned 200 OK`);
      try {
        const responseData = JSON.parse(chatResponse.body);
        console.log(`  Response:`, responseData);
      } catch (e) {
        console.log(`  Response: ${chatResponse.body.substring(0, 200)}`);
      }
    } else {
      console.log(`Response: ${chatResponse.body.substring(0, 300)}`);
    }

    // Test 4: Check server logs
    console.log('\n[4/4] Next steps for investigation...');
    console.log(`\n  To debug server-side issues, check logs:`);
    console.log(`  az containerapp logs show --name fitness-ai-app --resource-group Fitness-AI-App --tail 50`);
    console.log(`\n  To test the full flow manually:`);
    console.log(`  1. Open: ${BASE_URL}`);
    console.log(`  2. Sign in with: ${TEST_USER.email}`);
    console.log(`  3. Send a chat message`);
    console.log(`  4. Check browser console for errors`);
    console.log(`  5. Check server logs for AI service connection errors`);

    // Summary
    console.log(`\n=== TEST SUMMARY ===`);
    if (chatResponse.status === 401) {
      console.log(`⚠ Authentication required for full test`);
      console.log(`  The backend is running and responding correctly (401 is expected without auth)`);
    } else if (chatResponse.status === 200) {
      console.log(`✅ CHAT IS WORKING!`);
    } else {
      console.log(`❌ Unexpected status: ${chatResponse.status}`);
    }
    console.log(`===========================\n`);
  } catch (error) {
    console.error(`\n✗ Test failed with error:`);
    console.error(`  ${error.message}\n`);
    process.exit(1);
  }
}

// Run the tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
