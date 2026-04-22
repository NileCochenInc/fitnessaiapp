# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: stats.spec.ts >> Error handling - capture 500 errors for diagnosis
- Location: e2e/stats.spec.ts:188:5

# Error details

```
Error: Data Tool API returned 500: {"error":"fetch failed"}
```

# Test source

```ts
  141 |     const contentType = frontendResponse.headers()['content-type'];
  142 |     expect(contentType).toContain('application/json');
  143 |     console.log(`     Headers: ${contentType}`);
  144 | 
  145 |     // Assertion: Data contains stats info
  146 |     expect(frontendData).toHaveProperty('totalWorkouts');
  147 |     expect(typeof frontendData.totalWorkouts).toBe('number');
  148 |     console.log(`  2. Data Structure: totalWorkouts = ${frontendData.totalWorkouts}`);
  149 | 
  150 |     // Check response timing
  151 |     const timing = frontendResponse.timing();
  152 |     const totalTime = timing?.endTime ? timing.endTime - (timing?.startTime || 0) : 0;
  153 |     console.log(`  3. Response Time: ${totalTime}ms`);
  154 | 
  155 |     // Assertion: Timing should be reasonable (not timeout)
  156 |     expect(totalTime).toBeLessThan(30000);
  157 |     console.log('     ✓ Response time acceptable');
  158 | 
  159 |     // Verify data consistency - refetch and compare
  160 |     console.log('\n🔁 Verifying data consistency...');
  161 |     const refetchResult = await page.evaluate(async () => {
  162 |       const response = await fetch('/api/data/user-stats', { credentials: 'include' });
  163 |       return await response.json();
  164 |     });
  165 |     const refetchData = refetchResult;
  166 | 
  167 |     expect(refetchData.totalWorkouts).toBe(frontendData.totalWorkouts);
  168 |     console.log('  ✓ Data consistent between calls');
  169 | 
  170 |     console.log('\n✅ Test passed: Data chain verified\n');
  171 |   } finally {
  172 |     await logoutTestUser(page);
  173 |   }
  174 | });
  175 | 
  176 | /**
  177 |  * Test 3: Error handling - 500 error diagnosis
  178 |  * 
  179 |  * Specifically designed to catch and diagnose the reported 500 error:
  180 |  * "Failed to fetch stats: Error: Failed to fetch stats"
  181 |  * 
  182 |  * This test will:
  183 |  * - Capture the exact error response
  184 |  * - Log server headers and timing
  185 |  * - Take screenshot for visual inspection
  186 |  * - Provide detailed console output for debugging
  187 |  */
  188 | test('Error handling - capture 500 errors for diagnosis', async ({ page }) => {
  189 |   console.log('\n📋 Test: Error handling - capture 500 errors\n');
  190 | 
  191 |   // Setup: Login
  192 |   const { email } = await loginTestUser(page);
  193 | 
  194 |   try {
  195 |     // Reset and prepare
  196 |     await resetTestUserData(page);
  197 |     await createDummyWorkouts(page, 2);
  198 |     await page.waitForTimeout(2000);
  199 | 
  200 |     console.log('\n🔍 Attempting to fetch stats and capture any errors...');
  201 | 
  202 |     // Navigate to stats
  203 |     await page.goto('/stats');
  204 | 
  205 |     // Wait but allow potential failure
  206 |     await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {
  207 |       console.log('  ⚠ Page did not reach networkidle (possible error)');
  208 |     });
  209 | 
  210 |     // Attempt to get stats via API
  211 |     let statsResponse;
  212 |     try {
  213 |       const result = await page.evaluate(async () => {
  214 |         const response = await fetch('/api/data/user-stats', { credentials: 'include' });
  215 |         return { status: response.status, headers: Object.fromEntries(response.headers), text: await response.text() };
  216 |       });
  217 |       statsResponse = { status: () => result.status, headers: () => result.headers, text: async () => result.text };
  218 |     } catch (error) {
  219 |       const errorMsg = error instanceof Error ? error.message : String(error);
  220 |       console.error(`  ✗ Request failed: ${errorMsg}`);
  221 |       throw error;
  222 |     }
  223 | 
  224 |     // Capture response details
  225 |     console.log(`\n📊 API Response:
  226 |       Status: ${statsResponse.status()}
  227 |       Headers: ${JSON.stringify(statsResponse.headers(), null, 2)}
  228 |     `);
  229 | 
  230 |     // If 500 error, capture the error details
  231 |     if (statsResponse.status() === 500) {
  232 |       console.error('\n🚨 500 ERROR DETECTED!\n');
  233 |       const errorBody = await statsResponse.text();
  234 |       console.error('Error Body:', errorBody);
  235 | 
  236 |       // Take screenshot for visual debugging
  237 |       await page.screenshot({ path: 'error-500-screenshot.png' });
  238 |       console.error('Screenshot saved: error-500-screenshot.png');
  239 | 
  240 |       // This is the error being reported - document it
> 241 |       throw new Error(`Data Tool API returned 500: ${errorBody}`);
      |             ^ Error: Data Tool API returned 500: {"error":"fetch failed"}
  242 |     }
  243 | 
  244 |     // If we reach here, there's no 500 error
  245 |     expect(statsResponse.status()).toBe(200);
  246 |     console.log('✓ No 500 error detected\n');
  247 |   } finally {
  248 |     await logoutTestUser(page);
  249 |   }
  250 | });
  251 | 
  252 | /**
  253 |  * Test 4: Network error recovery
  254 |  * 
  255 |  * Verifies that the frontend handles network errors gracefully
  256 |  * when the data tool is unavailable
  257 |  */
  258 | test('Network error recovery', async ({ page }) => {
  259 |   console.log('\n📋 Test: Network error recovery\n');
  260 | 
  261 |   // Setup: Login
  262 |   const { email } = await loginTestUser(page);
  263 | 
  264 |   try {
  265 |     // Reset data
  266 |     await resetTestUserData(page);
  267 |     await createDummyWorkouts(page, 1);
  268 | 
  269 |     // Navigate to stats
  270 |     await page.goto('/stats');
  271 |     await page.waitForLoadState('networkidle');
  272 | 
  273 |     console.log('\n🌐 Normal load successful');
  274 | 
  275 |     // Simulate network condition (abort requests to data-tool)
  276 |     // This tests frontend resilience
  277 |     console.log('Testing page handles data load gracefully...');
  278 | 
  279 |     // The page should display either data or an error message (not crash)
  280 |     const hasContent = await page.locator('body').isVisible();
  281 |     expect(hasContent).toBe(true);
  282 |     console.log('✓ Page renders even with potential network issues\n');
  283 |   } finally {
  284 |     await logoutTestUser(page);
  285 |   }
  286 | });
  287 | 
  288 | test.afterAll(async () => {
  289 |   console.log('\n🏁 All E2E tests completed\n');
  290 | });
  291 | 
```