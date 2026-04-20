# Terraform: Azure Container Apps Migration

This Terraform configuration deploys the Fitness AI App (Next.js frontend/backend) to Azure Container Apps, leveraging your existing Key Vault for secrets management.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Azure Container Apps                                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Container App (fitness-ai-app)                  │  │
│  │  - Node.js runtime (fitnessaiapp:latest)         │  │
│  │  - Port 3000                                     │  │
│  │  - System-assigned Managed Identity              │  │
│  │  - Health checks (liveness + readiness probes)   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  Container App Environment                              │
│  - Log Analytics workspace for monitoring               │
│  - Resources: 0.5 vCPU, 1 GB memory (configurable)     │
└─────────────────────────────────────────────────────────┘
         │
         ├──> Key Vault (Fitness-AI-App-Secrets)
         │    - DATABASE-URL
         │    - GOOGLE-CLIENT-ID
         │    - GOOGLE-CLIENT-SECRET
         │    - NEXTAUTH-SECRET
         │    - KAFKA-BROKER
         │    - MISTRAL-API-KEY
         │
         └──> Docker Hub (fitnessaiapp:latest)
```

## Prerequisites

### 1. Azure Setup
- Azure subscription with active credentials
- Azure resource group: `Fitness-AI-App` (must already exist)
- Azure Key Vault: `Fitness-AI-App-Secrets` (must already exist with secrets populated)
- Secrets in Key Vault (all required):
  - `DATABASE-URL`: Your Neon PostgreSQL connection string
  - `GOOGLE-CLIENT-ID`: Google OAuth client ID
  - `GOOGLE-CLIENT-SECRET`: Google OAuth client secret
  - `NEXTAUTH-SECRET`: NextAuth session secret
  - `KAFKA-BROKER`: Kafka broker address (optional, defaults to container env var)
  - `MISTRAL-API-KEY`: Mistral API key

**Verify Key Vault secrets exist:**
```bash
az keyvault secret list --vault-name Fitness-AI-App-Secrets --query "[].name" --output table
```

### 2. Service Principal (for Terraform)
Create a service principal with permissions to the resource group:

```bash
# Create service principal with Owner role on resource group
az ad sp create-for-rbac --name "terraform-fitness-ai" \
  --role Owner \
  --scopes /subscriptions/31108107-df9f-4132-8f63-ea0426a83910/resourceGroups/Fitness-AI-App

# Output will contain:
# - appId (use as client_id)
# - password (use as client_secret)
# - tenant (use as tenant_id)
```

### 3. Terraform Installed
```bash
# macOS with Homebrew
brew install terraform

# Or download from: https://www.terraform.io/downloads.html

# Verify installation
terraform version
```

### 4. Azure CLI Installed (optional, for verification)
```bash
brew install azure-cli
az --version
```

## Deployment Steps

### Step 1: Configure Variables

Copy the example tfvars file and update it with your values:

```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` and update these required fields:
- `subscription_id`: Your Azure subscription ID
- `tenant_id`: From service principal output
- `client_id`: From service principal output (appId)
- `client_secret`: From service principal output (password)

**⚠️ IMPORTANT**: Never commit `terraform.tfvars` to version control (it contains secrets).

### Step 2: Initialize Terraform

```bash
terraform init
```

This downloads required providers and sets up the local state file.

### Step 3: Validate Configuration

```bash
terraform validate
```

Ensures syntax is correct and all references are valid.

### Step 4: Plan Deployment

```bash
terraform plan -out=tfplan
```

Review the output to see what resources will be created:
- Container App Environment
- Container App
- Managed Identity
- Log Analytics Workspace
- Role assignments

### Step 5: Apply Configuration

```bash
terraform apply tfplan
```

This creates all resources in Azure. Wait for completion (usually 2-5 minutes).

### Step 6: Verify Deployment

Once Terraform completes:

```bash
# Get outputs (includes the public FQDN)
terraform output

# Access the application
curl https://<container-app-fqdn>

# Check deployment status
az containerapp show --name fitness-ai-app --resource-group Fitness-AI-App --query "{Status: properties.provisioningState, LatestRevision: properties.latestRevisionName}"
```

## Post-Deployment Verification

### 1. Container App is Running
```bash
az containerapp show --name fitness-ai-app \
  --resource-group Fitness-AI-App \
  --query "properties.provisioningState"
```

Expected output: `Succeeded`

### 2. Secrets Injected Correctly
Check that environment variables from Key Vault are accessible:
```bash
# View container app details
az containerapp show --name fitness-ai-app \
  --resource-group Fitness-AI-App \
  --query "properties.configuration.secrets"
```

### 3. Health Checks Passing
```bash
# View container logs
az containerapp logs show --name fitness-ai-app \
  --resource-group Fitness-AI-App \
  --follow
```

Look for successful startup messages. If you see connection errors, verify:
- DATABASE_URL is correct for Neon
- Key Vault secrets match the names in Terraform
- Managed identity has Key Vault read permissions

### 4. Application Accessibility
```bash
# Get the FQDN
FQDN=$(terraform output -raw container_app_fqdn)
echo "Access at: https://$FQDN"

# Test the endpoint
curl -I https://$FQDN
```

Expected: HTTP 200 or 3xx redirect

## Updating the Application

### Option A: Update Container Image (Recommended)

When you push a new image tag to Docker Hub:

```bash
# Update the terraform.tfvars file with new image tag
# (or use -var flag)
terraform apply -var="container_image=fitnessaiapp:v1.2.3"
```

### Option B: Update via Azure CLI (Direct)

To update the image without re-running Terraform:

```bash
az containerapp update-it \
  --name fitness-ai-app \
  --resource-group Fitness-AI-App \
  --image fitnessaiapp:latest
```

### Option C: GitHub Actions Integration (Future)

Update `.github/workflows/deploy.yml` to trigger Container App redeploy on new Docker Hub image push:

```yaml
- name: Update Container App Image
  run: |
    az containerapp update \
      --name fitness-ai-app \
      --resource-group Fitness-AI-App \
      --image fitnessaiapp:${{ github.sha }}
```

## Scaling and Performance

### Adjust Resource Allocation

Edit `terraform.tfvars` and update:

```hcl
cpu_cores = "1.0"    # Increase CPU
memory_gb = "2"      # Increase memory (must be compatible with CPU)
```

Valid CPU/Memory combinations:
- 0.25 CPU: 0.5 Gi memory
- 0.5 CPU: 1 Gi memory
- 0.75 CPU: 1.5 Gi memory
- 1.0 CPU: 1.5 or 2 Gi memory
- 1.5 CPU: 2, 3, or 4 Gi memory
- 2.0 CPU: 3, 4, or 5 Gi memory

Apply changes:
```bash
terraform apply
```

### Enable Autoscaling

Edit `terraform.tfvars`:

```hcl
min_replicas = 1
max_replicas = 3
```

Re-apply:
```bash
terraform apply
```

Autoscaling rules can be added to `main.tf` for CPU/memory thresholds.

## Troubleshooting

### Issue: "Key Vault secrets not found"

**Problem**: Environment variables are empty or undefined in the running container.

**Solution**:
1. Verify secrets exist in Key Vault:
   ```bash
   az keyvault secret show --vault-name Fitness-AI-App-Secrets --name DATABASE-URL
   ```

2. Verify Managed Identity has permissions:
   ```bash
   az role assignment list --assignee $(terraform output -raw managed_identity_principal_id) \
     --scope /subscriptions/31108107-df9f-4132-8f63-ea0426a83910/resourceGroups/Fitness-AI-App
   ```

3. Check secret names match exactly (case-sensitive). Terraform expects hyphenated names in Key Vault (e.g., `DATABASE-URL`, not `DATABASE_URL`)

### Issue: Container App won't start (502 Bad Gateway)

**Problem**: Application fails to start or crashes immediately.

**Solution**:
1. Check container logs:
   ```bash
   az containerapp logs show --name fitness-ai-app \
     --resource-group Fitness-AI-App
   ```

2. Verify DATABASE_URL is correct and Neon is accessible

3. Check Node.js dependencies are installed (verify Dockerfile uses `pnpm install --frozen-lockfile`)

### Issue: "Insufficient permissions" when running terraform apply

**Problem**: Service principal doesn't have required permissions.

**Solution**:
```bash
# Grant service principal Contributor role on the resource group
az role assignment create \
  --assignee <client_id> \
  --role Contributor \
  --scope /subscriptions/31108107-df9f-4132-8f63-ea0426a83910/resourceGroups/Fitness-AI-App
```

### Issue: "Failed to authenticate with Key Vault"

**Problem**: Managed Identity can't read secrets even though role is assigned.

**Solution**:
1. Wait 2-3 minutes for role assignment to propagate
2. Verify role is "Key Vault Secrets User" (not just "Key Vault Contributor"):
   ```bash
   az role assignment list --assignee $(terraform output -raw managed_identity_principal_id)
   ```
3. Double-check Key Vault firewall isn't blocking the managed identity

## State Management

Terraform stores deployment state in `terraform.tfstate` (local by default).

### To Backup State Locally
```bash
cp terraform.tfstate terraform.tfstate.backup
```

### To Use Remote State (Recommended for Teams)

Uncomment and configure the backend in `providers.tf`:

```hcl
backend "azurerm" {
  resource_group_name  = "Fitness-AI-App"
  storage_account_name = "yourstorageaccount"
  container_name       = "tfstate"
  key                  = "container-apps.tfstate"
}
```

Then reinitialize:
```bash
terraform init
```

## Cleanup

To destroy all resources created by Terraform:

```bash
# Preview what will be deleted
terraform plan -destroy

# Delete all resources
terraform destroy
```

⚠️ This will delete:
- Container App
- Container App Environment
- Managed Identity
- Log Analytics Workspace

**Note**: This will NOT delete the Key Vault (not managed by this Terraform config).

## Next Steps

1. **GitHub Actions Integration**: Update workflow to auto-redeploy on Docker Hub push
2. **Azure Front Door**: Add CDN/WAF in front of Container App
3. **Custom Domain**: Configure DNS to point to Container App FQDN
4. **Other Containers**: Create similar Terraform modules for `admin-dash`, `ai`, and `data-tool` services
5. **Monitoring**: Add Application Insights for deeper observability
6. **Networking**: If services need to communicate, add Virtual Network and service-to-service auth

## Resources

- [Azure Container Apps Documentation](https://learn.microsoft.com/en-us/azure/container-apps/)
- [Terraform Azure Provider Docs](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Azure Key Vault + Managed Identity](https://learn.microsoft.com/en-us/azure/key-vault/general/managed-identity)
- [Container App Networking](https://learn.microsoft.com/en-us/azure/container-apps/networking)

## Support

For issues:
1. Check the Troubleshooting section above
2. Review Azure Portal → Container App → Logs
3. Run `terraform validate` to check configuration syntax
4. Run `terraform plan` to see what resources Terraform will create
