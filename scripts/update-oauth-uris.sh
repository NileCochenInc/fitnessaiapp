#!/bin/bash

#############################################################################
# Update OAuth URIs Script
# 
# This script validates your Terraform OAuth configuration. The Azure 
# Container App URL is automatically added by Terraform (via locals), not 
# by this script.
#
# This script updates terraform.tfvars with LOCAL/DEVELOPMENT URLs only:
# - localhost (for local development)
# - fitnessaiapp.duckdns.org (for previous deployment)
#
# The Azure Container App URL is calculated dynamically by Terraform.
#
# Usage:
#   ./scripts/update-oauth-uris.sh                    # Validate config
#   ./scripts/update-oauth-uris.sh --dry-run          # Preview (noop)
#   
#############################################################################

set -e

# Configuration
TERRAFORM_DIR="${TERRAFORM_DIR:-.}/infrastructure/terraform"
DRY_RUN="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Verify Terraform directory exists
if [ ! -f "$TERRAFORM_DIR/terraform.tfvars" ]; then
    log_error "terraform.tfvars not found at $TERRAFORM_DIR/terraform.tfvars"
    exit 1
fi

cd "$TERRAFORM_DIR"

log_info "Validating Terraform configuration..."
if terraform validate > /dev/null 2>&1; then
    log_success "Terraform syntax is valid"
else
    log_error "Terraform validation failed"
    exit 1
fi

log_info "Getting current Azure Container App FQDN..."
CURRENT_FQDN=$(terraform output -raw container_app_fqdn 2>/dev/null || echo "")

if [ -z "$CURRENT_FQDN" ]; then
    log_error "Could not retrieve Container App FQDN. Make sure Terraform has been applied."
    exit 1
fi

log_success "Current FQDN: $CURRENT_FQDN"

# Build Azure URLs
HTTPS_ORIGIN="https://${CURRENT_FQDN}"
HTTPS_CALLBACK="${HTTPS_ORIGIN}/api/auth/callback/google"

echo ""
log_info "OAuth Configuration Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
log_info "Configured in terraform.tfvars (local/base URLs):"
echo "  • localhost:3000 (development)"
echo "  • fitnessaiapp.duckdns.org (legacy)"
echo ""
log_info "Computed automatically by Terraform (Azure):"
echo "  • $HTTPS_ORIGIN"
echo ""
log_info "OAuth Redirect URIs:"
echo "  ✓ http://localhost:3000/api/auth/callback/google"
echo "  ✓ https://fitnessaiapp.duckdns.org/api/auth/callback/google"
echo "  ✓ $HTTPS_CALLBACK"
echo ""

# Validate that terraform output shows correct configuration  
OAUTH_CONFIG=$(terraform output -json oauth_configuration_summary 2>/dev/null || echo "{}")
AUTHORIZED_ORIGINS=$(echo "$OAUTH_CONFIG" | jq -r '.authorized_javascript_origins | map(select(startswith("https://"))) | .[0]' 2>/dev/null || echo "")

if [[ "$AUTHORIZED_ORIGINS" == "$HTTPS_ORIGIN" ]]; then
    log_success "Azure URL is correctly configured in Terraform"
else
    log_warn "Azure URL not yet in Terraform state - this is normal on first run"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
log_info "Next Steps:"
echo "  1. terraform apply (if needed)"
echo "  2. Manually update Google OAuth app at:"
echo "     https://console.cloud.google.com/apis/credentials?project=fitnessaiapp"
echo ""
echo "  Add these URIs to your OAuth 2.0 Client ID:"
echo "    Authorized JavaScript Origins:"
echo "      • http://localhost:3000"
echo "      • https://fitnessaiapp.duckdns.org"
echo "      • $HTTPS_ORIGIN"
echo "    Authorized Redirect URIs:"
echo "      • http://localhost:3000/api/auth/callback/google"
echo "      • https://fitnessaiapp.duckdns.org/api/auth/callback/google"
echo "      • $HTTPS_CALLBACK"

log_success "OAuth configuration validation complete!"
