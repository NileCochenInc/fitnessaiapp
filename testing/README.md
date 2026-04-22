# Automated Stats API Testing

This directory contains automated test infrastructure for validating the stats API endpoints with proper authentication.

## Overview

The stats API issue required automated testing to verify that:
- Authenticated requests return status 200 (not 401 or 500)
- Response contains valid data with required fields
- Integration between main app and data-tool microservice works correctly

## Files

### `setup-test-user.js`
Generates bcrypt password hash and SQL statement to create test user in database.

**Usage:**
```bash
cd /Users/nilecochen/Documents/FullStack/pairProgram/fitness-ai-app/front-and-back-end
node ../testing/setup-test-user.js
```

**Output:**
- Test user credentials (email, password)
- Bcrypt password hash
- SQL statement ready to copy into Neon console

### `test-stats-authenticated.js`
Automated test that authenticates with test user and validates stats endpoints.

**Usage:**
```bash
# Test production
node testing/test-stats-authenticated.js

# Test local development (optional)
node testing/test-stats-authenticated.js http://localhost:3000
```

**Tests:**
- `GET /api/data/user-stats` - User stats endpoint
  - Validates: totalWorkoutsThisMonth, averageWorkoutsPerWeek, exerciseFrequencyThisMonth
- `GET /api/data/exercise-stats/1` - Exercise stats endpoint
  - Validates: exerciseFrequency, maxMetrics

**Output:**
```
✅ TEST PASSED 🎉
   ✅ API is working correctly with authentication
   ✅ Endpoints return 200 with valid data
```

## Setup Instructions

### Phase 1: Create Testing Directory
```bash
mkdir -p /Users/nilecochen/Documents/FullStack/pairProgram/fitness-ai-app/testing
```

### Phase 2: Generate Test User Password Hash
```bash
cd /Users/nilecochen/Documents/FullStack/pairProgram/fitness-ai-app/front-and-back-end
node ../testing/setup-test-user.js
```

**Output will show:**
- Test user email: `statstest@example.com`
- Test user password: `testpass123`
- Bcrypt password hash (looks like: `$2b$10$...`)
- SQL statement to copy

### Phase 3: Create Test User in Database

1. Go to https://console.neon.tech
2. Select your fitness database project
3. Open the SQL Editor tab
4. Copy the SQL statement from Phase 2 output
5. Execute the SQL
6. Verify user was created:
```sql
SELECT id, username, email FROM users WHERE email = 'statstest@example.com';
```

**Expected result:**
```
 id  | username         | email                 
-----+------------------+-----------------------
 xxx | stats_test_user  | statstest@example.com
```

### Phase 4: Run Automated Test
```bash
cd /Users/nilecochen/Documents/FullStack/pairProgram/fitness-ai-app
node testing/test-stats-authenticated.js
```

**Expected output:**
```
🧪 Testing: /api/data/user-stats
   Status Code: 200 ✅
   Response Type: Object ✅
   Field 'totalWorkoutsThisMonth': ✅
   Field 'averageWorkoutsPerWeek': ✅
   Field 'exerciseFrequencyThisMonth': ✅
   📊 Data sample: {"totalWorkoutsThisMonth":12,"averageWorkoutsPerWeek":3.0...

🧪 Testing: /api/data/exercise-stats/1
   Status Code: 200 ✅
   Response Type: Object ✅
   Field 'exerciseFrequency': ✅
   Field 'maxMetrics': ✅
   📊 Data sample: {"exerciseFrequency":5,"maxMetrics":{"weight":225...

🎉 TEST PASSED 🎉
   ✅ API is working correctly with authentication
   ✅ Endpoints return 200 with valid data
```

### Phase 5: Manual Browser Testing
After automated tests pass:

1. Open the app at https://fitness-ai-app.ashycliff-d78872a9.canadacentral.azurecontainerapps.io
2. Log in with test user:
   - Email: `statstest@example.com`
   - Password: `testpass123`
3. Navigate to Dashboard
4. Click "View Stats"
5. Verify stats display without errors

## Troubleshooting

### Test fails with 401 (Unauthorized)
- **Cause:** Session not being sent with request
- **Fix:** Ensure `credentials: 'include'` is set in fetch requests

### Test fails with 500 (Internal Server Error)
- **Cause:** Data-tool microservice not responding
- **Fix:** Check Azure console that data-tool container is healthy and running

### Test fails with network error
- **Cause:** Cannot reach main app at provided URL
- **Fix:** Verify app is deployed and accessible:
```bash
curl -I https://fitness-ai-app.ashycliff-d78872a9.canadacentral.azurecontainerapps.io
```

### Test fails with 404 (Not Found)
- **Cause:** Endpoint path incorrect or stats route not implemented
- **Fix:** Verify stats API endpoints exist in `/front-and-back-end/src/app/api/data/`

### Test passes but stats don't show in browser
- **Cause:** Frontend not properly handling authenticated session
- **Fix:** Check browser DevTools console for errors, verify NextAuth configuration

## Environment Details

- **Node.js:** Required for running test scripts
- **Dependencies:** Uses `bcrypt` from front-end's package.json
- **Database:** Connects to Neon PostgreSQL (ep-proud-surf-a8ief0p1.eastus2.azure.neon.tech)
- **Main App:** https://fitness-ai-app.ashycliff-d78872a9.canadacentral.azurecontainerapps.io
- **Data-Tool:** Internal DNS: fitness-ai-app-data-tool:8080

## Architecture

```
┌─────────────────────────────────────────────┐
│   Main App (Next.js)                        │
│   - /api/data/user-stats                    │
│   - /api/data/exercise-stats/[id]           │
│   - Auth validation (NextAuth session)      │
└──────────────────┬──────────────────────────┘
                   │ DATA_TOOL_URL env var
                   │ (http://fitness-ai-app-data-tool:8080)
                   ▼
┌─────────────────────────────────────────────┐
│   Data-Tool (Spring Boot)                   │
│   - /api/user-stats/{userId}                │
│   - /api/exercise-stats/{userId}/{id}       │
│   - Business logic & calculations           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│   PostgreSQL (Neon)                         │
│   - users table                             │
│   - workouts, exercises, metrics            │
└─────────────────────────────────────────────┘

Test Flow:
┌────────────────────────────────────┐
│ test-stats-authenticated.js         │
└────────────┬───────────────────────┘
             │ 1. Auth request
             ▼
┌────────────────────────────────────┐
│ Main App Auth Endpoint             │
│ /api/auth/callback/credentials     │
└────────────┬───────────────────────┘
             │ 2. Authenticated request
             ▼
┌────────────────────────────────────┐
│ Stats API with Session             │
│ /api/data/user-stats               │
│ /api/data/exercise-stats/[id]      │
└────────────┬───────────────────────┘
             │ 3. Validate session
             │ 4. Call data-tool
             ▼
┌────────────────────────────────────┐
│ Data-Tool Microservice             │
│ /api/user-stats/{userId}           │
└────────────┬───────────────────────┘
             │ 5. Query database
             ▼
┌────────────────────────────────────┐
│ Database Results → Response         │
│ Status 200 + Valid Data            │
└────────────────────────────────────┘
```

## Key Files Reference

- **Stats Endpoint:** [src/app/api/data/user-stats/route.ts](../front-and-back-end/src/app/api/data/user-stats/route.ts)
- **Auth Config:** [src/app/api/auth/[...nextauth]/route.ts](../front-and-back-end/src/app/api/auth/[...nextauth]/route.ts)
- **Data-Tool Service:** [data-tool/src/main/java/.../GeneralStatsController.java](../data-tool/src/main/java/com/nilecochen/fitnessapp/datatool/controller/GeneralStatsController.java)
- **Terraform Config:** [infrastructure/terraform/terraform.tfvars](../infrastructure/terraform/terraform.tfvars)

## Related Documentation

- [Stats API Fix - Root Cause Analysis](../docs/STATS_API_FIX.md) (if exists)
- [Database Schema](../database/)
- [Deployment Guide](../README.md)
