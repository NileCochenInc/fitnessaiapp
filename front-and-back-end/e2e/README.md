# E2E Test Suite Documentation

This directory contains the Playwright end-to-end tests for the Data Tool stats integration on production Azure.

## Overview

The tests validate the complete data flow:
```
Frontend (/stats page)
    ↓
Server API (/api/data/user-stats)
    ↓
Data Tool Service (/api/user-stats/{userId})
    ↓
Database
    ↓
Stats Display
```

## Test Cases

### 1. Full Stats Flow - Login to Display
**File**: `stats.spec.ts` - Test 1

Tests the complete happy path:
- User login with test credentials
- Reset test user data (clear workouts)
- Create 5 dummy workouts
- Navigate to `/stats`
- Verify stats load without 500 errors
- Verify UI renders (stat cards, charts)
- Verify no error messages

**Purpose**: Confirm the data tool is working end-to-end and stats display correctly.

### 2. Data Flow Chain Verification
**File**: `stats.spec.ts` - Test 2

Traces data through all layers:
- Verifies server API returns 200
- Checks response headers (Content-Type)
- Validates data structure (GeneralStatsDTO)
- Measures response timing
- Verifies data consistency across multiple calls

**Purpose**: Ensure data propagates correctly from frontend → server → data-tool.

### 3. Error Handling - 500 Error Diagnosis
**File**: `stats.spec.ts` - Test 3

Specifically designed to capture and diagnose the reported error:
```
Failed to fetch stats: Error: Failed to fetch stats
stats:1 Unchecked runtime.lastError: The message port closed before a response was received
api/data/user-stats:1 Failed to load resource: the server responded with a status of 500
```

- Attempts to fetch stats
- Captures exact 500 response
- Logs server headers and timing
- Takes screenshot on failure
- Provides detailed console output for debugging

**Purpose**: Help diagnose why `/api/data/user-stats` returns 500 and data-tool integration fails.

### 4. Network Error Recovery
**File**: `stats.spec.ts` - Test 4

Tests frontend resilience:
- Verifies page renders even with potential network issues
- Ensures no crashes or hung states

## Setup

### 1. Configure Secrets

Choose one of two approaches:

#### Option A: Environment Variables (Local Testing)
```bash
cp .env.e2e .env.e2e.local
```

Edit `.env.e2e.local` and fill in:
```env
PROD_APP_URL=https://your-production-url.azurewebsites.net
TEST_USER_EMAIL=e2e-test@fitness.local
TEST_USER_PASSWORD=your-password
```

Then run tests:
```bash
npm run e2e:prod
```

#### Option B: Azure Key Vault (Production/CI)

1. Create a test user account on production:
   - Email: `e2e-test@fitness.local`
   - Password: secure password of your choice

2. Store secrets in Azure Key Vault:
   ```bash
   az keyvault secret set --vault-name your-vault \
     --name PROD-APP-URL --value "https://your-app.azurewebsites.net"
   
   az keyvault secret set --vault-name your-vault \
     --name TEST-USER-EMAIL --value "e2e-test@fitness.local"
   
   az keyvault secret set --vault-name your-vault \
     --name TEST-USER-PASSWORD --value "your-password"
   ```

3. Set environment variable:
   ```bash
   export AZURE_KEYVAULT_URL=https://your-vault.vault.azure.net/
   export AZURE_SUBSCRIPTION_ID=your-subscription-id
   ```

4. Authenticate with Azure:
   ```bash
   az login
   az account set --subscription "subscription-name"
   ```

5. Run tests - they will automatically fetch from Key Vault

### 2. Create Test User (if not already created)

The test user must exist on the production server with credentials specified in secrets.

If your production doesn't allow signup API access, you may need to:
1. Manually create the test account via admin panel
2. Or grant your CI/CD service principal permissions to create users

### 3. Install Dependencies

```bash
npm install
```

This installs Playwright, Azure SDK packages, and other dependencies.

## Running Tests

### Run All Tests
```bash
npm run e2e:prod
```

### Run Specific Test
```bash
npx playwright test --grep "Full stats flow"
```

### Run in Debug Mode
```bash
npm run e2e:debug
```

Opens Playwright Inspector for step-by-step debugging.

### Run Headed (Browser Visible)
```bash
npm run e2e:headed
```

Shows the browser during test execution (useful for visual debugging).

### View Test Report
```bash
npm run e2e:report
```

Opens HTML report with:
- Test results
- Screenshots on failure
- Video recordings on failure
- Network logs

## Project Structure

```
e2e/
├── stats.spec.ts          # Main test file (4 test cases)
├── utils/
│   ├── vault-config.ts    # Azure Key Vault integration
│   ├── test-user.ts       # Login, logout, reset utilities
│   └── test-data.ts       # Dummy data creation utilities
└── README.md              # This file

.env.e2e                   # Configuration template (edit and fill in)
playwright.config.ts       # Playwright configuration
```

## Troubleshooting

### Test Fails with "Failed to login"
- Verify test user account exists on production
- Check credentials in `.env.e2e` or Azure Key Vault
- Verify production URL is correct
- Check network connectivity to production

### Test Fails with "Failed to fetch stats"
- Check if server API `/api/data/user-stats` is responding
- Verify data-tool service is running and accessible
- Check Azure logs for backend errors
- Run error diagnosis test for detailed logs

### Test Fails with "500 Error"
This is the main error we're trying to diagnose:
1. Check server logs in Azure Container Apps
2. Check data-tool logs (Java service)
3. Check database connectivity
4. Test output includes screenshot and detailed logs

### Secrets Not Loading
- Verify `.env.e2e` file has correct values
- Or verify Azure Key Vault is set up and accessible
- Try `az keyvault secret list --vault-name your-vault`
- Ensure logged in to Azure: `az login`

### Tests Run But Stats Don't Load
1. Verify dummy workouts are created successfully
2. Check data-tool logs for errors
3. Run "Error Handling" test to capture 500 details
4. Check network requests in Playwright report

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests (Production)

on:
  workflow_dispatch:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
        working-directory: front-and-back-end
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        working-directory: front-and-back-end
      
      - name: Run E2E tests
        env:
          PROD_APP_URL: ${{ secrets.PROD_APP_URL }}
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
        run: npm run e2e:prod
        working-directory: front-and-back-end
      
      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: front-and-back-end/playwright-report/
          retention-days: 30
```

## Debugging Guide

### View Network Requests
The test output includes detailed logs of all API calls. Example:
```
📊 API Response:
  Status: 200
  Headers: {"content-type": "application/json"}
1. Frontend → Server: 200
2. Data Structure: totalWorkouts = 5
3. Response Time: 234ms
```

### Check Server Logs
If tests fail with 500 errors:

```bash
# View server container logs
az containerapp logs show --name fitness-app-server \
  --resource-group your-rg \
  --tail 50

# View data-tool logs
az containerapp logs show --name fitness-app-data-tool \
  --resource-group your-rg \
  --tail 50
```

### Take Manual Screenshots
Tests automatically capture screenshots on failure in `playwright-report/`.

To manually inspect during test:
```bash
npm run e2e:headed
```

### Check Database Connectivity
```bash
# Connect to production database
psql -h your-db-host -U neondb_owner -d neondb

# Check if user has data
SELECT COUNT(*) FROM workouts WHERE user_id = (
  SELECT id FROM users WHERE email = 'e2e-test@fitness.local'
);
```

## Key Files to Review

When troubleshooting, review these related files:

- **Frontend stats page**: `src/app/stats/page.tsx`
- **API proxy route**: `src/app/api/data/user-stats/route.ts`
- **Data tool controller**: `data-tool/src/main/java/com/nilecochen/fitnessapp/datatool/controller/GeneralStatsController.java`
- **Types**: `src/types/stats.ts`
- **Docker config**: `docker-compose.prod.yml`
- **Terraform**: `infrastructure/terraform/main.tf`

## Next Steps

1. **Set up test user**: Create `e2e-test@fitness.local` on production
2. **Configure secrets**: Fill in `.env.e2e` or set up Azure Key Vault
3. **Run tests locally**: `npm run e2e:prod`
4. **Check results**: `npm run e2e:report`
5. **Diagnose 500 error**: Review server/data-tool logs if test fails
6. **Set up CI/CD**: Add GitHub Actions workflow for automated testing

## Support

For issues or questions:
1. Check test output and screenshots in `playwright-report/`
2. Review server logs in Azure
3. Enable debug mode: `npm run e2e:debug`
4. Check this README's Troubleshooting section
