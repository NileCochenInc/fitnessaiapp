# Fix Plan: Azure Container Apps Inter-Service Networking

**Status:** Ready to implement  
**Date Created:** April 22, 2026  
**Problem:** Chat and data endpoints returning 500/timeout errors due to DNS resolution failure

---

## Executive Summary

The server cannot reach the AI service or Data Tool service because it's using Docker Compose hostnames (`fitness-ai-app-ai:5000`, `fitness-ai-app-data-tool:8080`) instead of Azure Container Apps FQDNs. These Docker hostnames only work with Docker's internal DNS, not in Azure.

**Solution:** Update environment variables and source code to use internal FQDNs, rebuild the server container, and redeploy via Terraform.

---

## Root Cause Analysis

### What's Happening
1. Server tries to reach `http://fitness-ai-app-ai:5000/chat`
2. Azure DNS doesn't recognize this hostname (it's a Docker Compose internal name)
3. Connection times out after 10 seconds
4. User sees HTTP 500 error

### Why It Happens
- Local development uses `docker-compose.prod.yml` with service names (`ai`, `data-tool`)
- Docker Compose has built-in DNS that resolves service names to container IPs
- Azure Container Apps has NO automatic DNS for container names
- Must use fully qualified domain names (FQDNs) for inter-service communication

### Current Configuration
```
Environment Variable: AI_SERVICE_URL = "http://fitness-ai-app-ai:5000"
Hardcoded URLs:
  - chat endpoint: "http://ai:5000" (fallback)
  - user-stats: "http://data-tool:8080/api/user-stats/{id}"
  - exercise-stats: "http://data-tool:8080/api/exercise-stats/{id}/{exerciseId}"
```

### Correct Configuration for Azure
```
Internal FQDNs (requires same managed environment - we have this):
  - AI_SERVICE_URL: "http://fitness-ai-app-ai.internal.ashycliff-d78872a9.canadacentral.azurecontainerapps.io:5000"
  - DATA_TOOL_URL: "http://fitness-ai-app-data-tool.internal.ashycliff-d78872a9.canadacentral.azurecontainerapps.io:8080"

OR External FQDNs (if internal doesn't work - fallback option):
  - AI_SERVICE_URL: "http://fitness-ai-app-ai.ashycliff-d78872a9.canadacentral.azurecontainerapps.io:5000"
  - DATA_TOOL_URL: "http://fitness-ai-app-data-tool.ashycliff-d78872a9.canadacentral.azurecontainerapps.io:8080"
```

---

## Implementation Steps

### Phase 1: Update Infrastructure Configuration

#### Step 1.1: Update Terraform Variables
**File:** `infrastructure/terraform/terraform.tfvars`

Find lines 82-83 (the `static_env_vars` block). Replace:
```hcl
"AI_SERVICE_URL" = "http://fitness-ai-app-ai:5000"
"DATA_TOOL_URL"  = "http://fitness-ai-app-data-tool:8080"
```

With:
```hcl
"AI_SERVICE_URL" = "http://fitness-ai-app-ai.internal.ashycliff-d78872a9.canadacentral.azurecontainerapps.io:5000"
"DATA_TOOL_URL"  = "http://fitness-ai-app-data-tool.internal.ashycliff-d78872a9.canadacentral.azurecontainerapps.io:8080"
```

#### Step 1.2: Validate Terraform Configuration
```bash
cd infrastructure/terraform
terraform validate
```

Expected output: `Success! The configuration is valid.`

---

### Phase 2: Update Source Code

These files have hardcoded fallback URLs that need updating.

#### Step 2.1: Update Chat Endpoint
**File:** `front-and-back-end/src/app/api/chat/route.ts` (around line 30-35)

Find:
```typescript
const aiServiceUrl = process.env.AI_SERVICE_URL || "http://ai:5000";
```

Replace with:
```typescript
const aiServiceUrl = process.env.AI_SERVICE_URL || "http://fitness-ai-app-ai.internal.ashycliff-d78872a9.canadacentral.azurecontainerapps.io:5000";
```

#### Step 2.2: Update User Stats Endpoint
**File:** `front-and-back-end/src/app/api/data/user-stats/route.ts` (around line 23)

Find:
```typescript
const dataToolRes = await fetch(`http://data-tool:8080/api/user-stats/${userId}`);
```

Replace with:
```typescript
const dataToolRes = await fetch(`http://fitness-ai-app-data-tool.internal.ashycliff-d78872a9.canadacentral.azurecontainerapps.io:8080/api/user-stats/${userId}`);
```

#### Step 2.3: Update Exercise Stats Endpoint
**File:** `front-and-back-end/src/app/api/data/exercise-stats/[exerciseId]/route.ts` (around line 33-36)

Find:
```typescript
const dataToolRes = await fetch(
  `http://data-tool:8080/api/exercise-stats/${userId}/${exerciseId}`
);
```

Replace with:
```typescript
const dataToolRes = await fetch(
  `http://fitness-ai-app-data-tool.internal.ashycliff-d78872a9.canadacentral.azurecontainerapps.io:8080/api/exercise-stats/${userId}/${exerciseId}`
);
```

---

### Phase 3: Build and Push Updated Container

#### Step 3.1: Build Server Container
```bash
cd front-and-back-end
docker build -t nilecochen/fitnessaiapp:v1-prod-networking-fix .
```

#### Step 3.2: Push to Docker Hub
```bash
docker push nilecochen/fitnessaiapp:v1-prod-networking-fix
```

---

### Phase 4: Update Terraform and Deploy

#### Step 4.1: Update Container Image in Terraform
**File:** `infrastructure/terraform/terraform.tfvars` (line 23)

Find:
```hcl
container_image = "fitnessaiapp:latest"
```

Replace with:
```hcl
container_image = "nilecochen/fitnessaiapp:v1-prod-networking-fix"
```

#### Step 4.2: Plan Terraform Changes
```bash
cd infrastructure/terraform
terraform plan -out=tfplan
```

Review output carefully. You should see changes to:
- `azurerm_container_app.app` with updated environment variables
- Container image updated to the new tag

#### Step 4.3: Apply Terraform
```bash
terraform apply tfplan
```

Wait 2-5 minutes for Azure to deploy the changes.

---

### Phase 5: Verification

#### Step 5.1: Verify Environment Variables
```bash
az containerapp show \
  --name fitness-ai-app \
  --resource-group Fitness-AI-App \
  -o json | jq '.properties.template.containers[0].env[] | select(.name == "AI_SERVICE_URL")'
```

Expected output:
```json
{
  "name": "AI_SERVICE_URL",
  "value": "http://fitness-ai-app-ai.internal.ashycliff-d78872a9.canadacentral.azurecontainerapps.io:5000"
}
```

#### Step 5.2: Check Container Logs
```bash
az containerapp logs show \
  --name fitness-ai-app \
  --resource-group Fitness-AI-App \
  --tail 30
```

Look for messages like:
- `Calling AI service: POST http://fitness-ai-app-ai.internal...` (success, new URL)
- NO `Connect Timeout Error` messages

#### Step 5.3: Test Chat Functionality
1. Open the application in a browser
2. Authenticate/log in
3. Send a chat message (e.g., "hello")
4. Verify:
   - No 500 error in browser console
   - Response appears in chat UI
   - Server logs show successful request

#### Step 5.4: Test Data Endpoints (Optional)
```bash
# Get your app URL
APP_URL=$(az containerapp show \
  --name fitness-ai-app \
  --resource-group Fitness-AI-App \
  --query properties.configuration.ingress.fqdn \
  -o tsv)

# Test user stats (requires authentication token from browser)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://$APP_URL/api/data/user-stats
```

---

## Troubleshooting

### Issue: Internal FQDN not resolving
If you see timeouts even after deployment with internal FQDNs:

**Fallback to external FQDNs:**

1. Update `infrastructure/terraform/terraform.tfvars`:
```hcl
"AI_SERVICE_URL" = "http://fitness-ai-app-ai.ashycliff-d78872a9.canadacentral.azurecontainerapps.io:5000"
"DATA_TOOL_URL"  = "http://fitness-ai-app-data-tool.ashycliff-d78872a9.canadacentral.azurecontainerapps.io:8080"
```

2. Update source code with same FQDNs (remove `.internal.`)

3. Rebuild, push, and redeploy:
```bash
docker build -t nilecochen/fitnessaiapp:v1-prod-external-fqdn ./front-and-back-end
docker push nilecochen/fitnessaiapp:v1-prod-external-fqdn
# Update terraform.tfvars container_image
cd infrastructure/terraform && terraform apply
```

### Issue: Data Tool service not found
If you see errors about `fitness-ai-app-data-tool` not existing:

Check if the service is deployed:
```bash
az containerapp show --name fitness-ai-app-data-tool --resource-group Fitness-AI-App
```

If it doesn't exist, you may need to deploy it via Terraform or skip the data-tool fixes for now.

### Issue: Still seeing timeouts
1. Verify both services are in the same managed environment:
```bash
az containerapp show --name fitness-ai-app --resource-group Fitness-AI-App -o json | jq '.properties.environmentId'
az containerapp show --name fitness-ai-app-ai --resource-group Fitness-AI-App -o json | jq '.properties.environmentId'
```

Should return the same environment ID.

2. Check AI service is actually running:
```bash
az containerapp logs show --name fitness-ai-app-ai --resource-group Fitness-AI-App --tail 10
```

Should show `Uvicorn running on http://0.0.0.0:5000`

---

## Files Modified Summary

| File | Changes | Priority |
|------|---------|----------|
| `infrastructure/terraform/terraform.tfvars` | Update `static_env_vars` with new FQDNs + update `container_image` tag | **HIGH** |
| `front-and-back-end/src/app/api/chat/route.ts` | Update AI service URL fallback | **HIGH** |
| `front-and-back-end/src/app/api/data/user-stats/route.ts` | Update data-tool URL | **HIGH** |
| `front-and-back-end/src/app/api/data/exercise-stats/[exerciseId]/route.ts` | Update data-tool URL | **HIGH** |

---

## Key Decisions

✅ **Using internal FQDNs** (`*.internal.*`)
- Both services in same managed environment (confirmed)
- More secure than public endpoints
- Sufficient for inter-service communication

✅ **Rebuilding server container**
- Ensures code and configuration versions match
- Best practice for immutable infrastructure
- Fallback plan available if internal FQDNs don't work

✅ **Using Terraform for deployment**
- Infrastructure-as-code approach
- Reproducible, documented, version-controlled
- Consistent with existing deployment pipeline

---

## Time Estimate

| Phase | Time |
|-------|------|
| Phase 1: Config updates | 5 min |
| Phase 2: Code updates | 10 min |
| Phase 3: Build & push | 10-15 min |
| Phase 4: Terraform deploy | 5 min (+ 2-5 min for Azure) |
| Phase 5: Verification | 5 min |
| **Total** | **40-50 min** |

---

## Next Steps

1. ✅ Review this plan
2. ⬜ Execute Phase 1-2 (config and code updates)
3. ⬜ Execute Phase 3 (build and push)
4. ⬜ Execute Phase 4 (terraform deploy)
5. ⬜ Execute Phase 5 (verify)
6. ⬜ Test chat functionality in the application

---

**Created:** April 22, 2026  
**Status:** Ready for implementation  
**Save location:** `/FIX_PLAN_AZURE_NETWORKING.md`
