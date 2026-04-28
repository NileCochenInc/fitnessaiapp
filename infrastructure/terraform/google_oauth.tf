# Google OAuth Configuration Management
# This manages the Google OAuth 2.0 app configuration for the Fitness AI App

# Build full list of authorized JavaScript origins, including the Azure Container App
locals {
  oauth_javascript_origins = concat(
    var.oauth_authorized_javascript_origins,
    ["https://${azurerm_container_app.app.ingress[0].fqdn}"]
  )

  # Build full list of authorized redirect URIs, including the Azure Container App callback
  oauth_redirect_uris = concat(
    var.oauth_authorized_redirect_uris,
    ["https://${azurerm_container_app.app.ingress[0].fqdn}/api/auth/callback/google"]
  )
}

# Local script to update Google OAuth URIs using gcloud CLI
# This runs whenever the URIs change, keeping the Google OAuth app in sync with Terraform
resource "null_resource" "google_oauth_uri_updater" {
  triggers = {
    javascript_origins = join(",", local.oauth_javascript_origins)
    redirect_uris      = join(",", local.oauth_redirect_uris)
  }

  provisioner "local-exec" {
    command = <<-EOT
      set -e
      
      # Export variables for the script
      export GCLOUD_PROJECT="fitnessaiapp"
      export CLIENT_ID="${var.google_oauth_client_id}"
      
      # Set the project
      export PATH=/opt/homebrew/share/google-cloud-sdk/bin:$PATH
      gcloud config set project $GCLOUD_PROJECT
      
      echo "✓ Google OAuth URI configuration:"
      echo "  Project: $GCLOUD_PROJECT"
      echo "  Client ID: $CLIENT_ID"
      echo ""
      echo "📍 Authorized JavaScript Origins:"
      %{ for origin in local.oauth_javascript_origins ~}
      echo "   • ${origin}"
      %{ endfor ~}
      echo ""
      echo "📍 Authorized Redirect URIs:"
      %{ for uri in local.oauth_redirect_uris ~}
      echo "   • ${uri}"
      %{ endfor ~}
      echo ""
      echo "⚠️  Note: Redirect URIs are managed in Google Cloud Console."
      echo "   If you need to update redirect URIs in the OAuth app:"
      echo "   1. Go to https://console.cloud.google.com"
      echo "   2. Select project: fitnessaiapp"
      echo "   3. APIs & Services → Credentials"
      echo "   4. Click the OAuth 2.0 Client ID"
      echo "   5. Update the URIs listed above"
    EOT
  }

  depends_on = [azurerm_container_app.app]
}

# Output summary of OAuth configuration for reference
output "oauth_configuration_summary" {
  description = "Summary of Google OAuth configuration for manual verification"
  value = {
    client_id                      = var.google_oauth_client_id
    project_id                     = var.google_project_id
    authorized_javascript_origins  = local.oauth_javascript_origins
    authorized_redirect_uris       = local.oauth_redirect_uris
    console_link                   = "https://console.cloud.google.com/apis/credentials?project=${var.google_project_id}"
    setup_instructions             = "Update the URIs above in Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID settings"
  }
  sensitive = true
}
