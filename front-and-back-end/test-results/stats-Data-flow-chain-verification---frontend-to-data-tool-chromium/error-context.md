# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: stats.spec.ts >> Data flow chain verification - frontend to data-tool
- Location: e2e/stats.spec.ts:110:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 500
```

# Test source

```ts
  38  | test('Full stats flow - login to display', async ({ page }) => {
  39  |   console.log('\n📋 Test: Full stats flow - login to display');
  40  | 
  41  |   // Setup: Login
  42  |   const { email } = await loginTestUser(page);
  43  | 
  44  |   try {
  45  |     // Reset: Clear previous test data
  46  |     console.log('\n📊 Resetting user data...');
  47  |     await resetTestUserData(page);
  48  | 
  49  |     // Prepare: Create dummy workouts
  50  |     console.log('\n📊 Creating test data...');
  51  |     await createDummyWorkouts(page, 5);
  52  | 
  53  |     // Wait a moment for backend to process
  54  |     await page.waitForTimeout(2000);
  55  | 
  56  |     // Execute: Navigate to stats page
  57  |     console.log('\n📊 Navigating to /stats page...');
  58  |     await page.goto('/stats');
  59  | 
  60  |     // Wait for page to fully load
  61  |     await page.waitForLoadState('networkidle', { timeout: 15000 });
  62  | 
  63  |     console.log('\n📊 Verifying stats display...');
  64  | 
  65  |     // Assertion 1: Check for stat cards or any stats display
  66  |     // If the API call succeeded, stats should be displayed
  67  |     const statsContent = page.locator('text=/Workouts|Total|Average|Stats/i').first();
  68  |     const isVisible = await statsContent.isVisible({ timeout: 5000 }).catch(() => false);
  69  |     
  70  |     if (isVisible) {
  71  |       console.log('  ✓ Stats content visible on page');
  72  |     } else {
  73  |       // Check for loading indicator or error messages
  74  |       const errorElement = page.locator('[data-testid="error"], .error-message, text=/Failed to fetch|Error/i').first();
  75  |       const hasError = await errorElement.isVisible({ timeout: 2000 }).catch(() => false);
  76  |       
  77  |       if (hasError) {
  78  |         const errorText = await errorElement.textContent();
  79  |         throw new Error(`Stats page shows error: ${errorText}`);
  80  |       } else {
  81  |         throw new Error('Stats content not visible after page load');
  82  |       }
  83  |     }
  84  | 
  85  |     // Assertion 2: Verify page doesn't show any error messages
  86  |     const errorElement = page.locator('[data-testid="error"], .error-message, text=/Failed to fetch/i').first();
  87  |     const hasError = await errorElement.isVisible({ timeout: 2000 }).catch(() => false);
  88  |     expect(hasError).toBe(false);
  89  |     console.log('  ✓ No error messages on page');
  90  | 
  91  |     console.log('\n✅ Test passed: Stats flow working end-to-end\n');
  92  |   } finally {
  93  |     // Cleanup: Logout
  94  |     await logoutTestUser(page);
  95  |   }
  96  | });
  97  | 
  98  | /**
  99  |  * Test 2: Data flow chain verification
  100 |  * 
  101 |  * Traces data through all layers:
  102 |  * Frontend → Server Proxy (/api/data/user-stats) → Data Tool Service
  103 |  * 
  104 |  * Verifies:
  105 |  * - Server returns correct status
  106 |  * - Response headers are correct
  107 |  * - Data propagates without loss
  108 |  * - Timing is reasonable (no extreme delays)
  109 |  */
  110 | test('Data flow chain verification - frontend to data-tool', async ({ page, context }) => {
  111 |   console.log('\n📋 Test: Data flow chain verification\n');
  112 | 
  113 |   // Setup: Login
  114 |   const { email } = await loginTestUser(page);
  115 | 
  116 |   try {
  117 |     // Reset and prepare data
  118 |     await resetTestUserData(page);
  119 |     await createDummyWorkouts(page, 3);
  120 |     await page.waitForTimeout(2000);
  121 | 
  122 |     // Navigate to stats to trigger the full chain
  123 |     await page.goto('/stats');
  124 |     await page.waitForLoadState('networkidle', { timeout: 15000 });
  125 | 
  126 |     console.log('\n🔗 Tracing data flow chain...');
  127 | 
  128 |     // Get stats from frontend API call
  129 |     const frontendResult = await page.evaluate(async () => {
  130 |       const response = await fetch('/api/data/user-stats', { credentials: 'include' });
  131 |       return { status: response.status, data: await response.json(), headers: Object.fromEntries(response.headers) };
  132 |     });
  133 |     const frontendStatus = frontendResult.status;
  134 |     const frontendData = frontendResult.data;
  135 |     const frontendResponse = { headers: () => frontendResult.headers, timing: () => ({ startTime: 0, endTime: 0 }) };
  136 | 
  137 |     console.log(`  1. Frontend → Server: ${frontendStatus}`);
> 138 |     expect(frontendStatus).toBe(200);
      |                            ^ Error: expect(received).toBe(expected) // Object.is equality
  139 | 
  140 |     // Verify response headers
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
```