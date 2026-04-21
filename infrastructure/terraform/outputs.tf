output "container_app_id" {
  description = "ID of the Container App"
  value       = azurerm_container_app.app.id
}

output "container_app_name" {
  description = "Name of the Container App"
  value       = azurerm_container_app.app.name
}

output "container_app_fqdn" {
  description = "Fully Qualified Domain Name of the Container App"
  value       = azurerm_container_app.app.ingress[0].fqdn
}

output "container_app_latest_revision_name" {
  description = "Latest revision name"
  value       = azurerm_container_app.app.latest_revision_name
}

output "container_app_env_id" {
  description = "ID of the Container App Environment"
  value       = azurerm_container_app_environment.app.id
}

output "container_app_env_name" {
  description = "Name of the Container App Environment"
  value       = azurerm_container_app_environment.app.name
}

output "managed_identity_id" {
  description = "ID of the User-Assigned Managed Identity"
  value       = azurerm_user_assigned_identity.container_app.id
}

output "managed_identity_principal_id" {
  description = "Principal ID of the User-Assigned Managed Identity (used for role assignments)"
  value       = azurerm_user_assigned_identity.container_app.principal_id
}

output "resource_group_name" {
  description = "Name of the resource group"
  value       = data.azurerm_resource_group.app.name
}

output "location" {
  description = "Azure region where resources are deployed"
  value       = data.azurerm_resource_group.app.location
}

output "ai_container_app_fqdn" {
  description = "Fully Qualified Domain Name of the AI Container App"
  value       = azurerm_container_app.ai.ingress[0].fqdn
}

output "ai_container_app_name" {
  description = "Name of the AI Container App"
  value       = azurerm_container_app.ai.name
}

output "access_url" {
  description = "Public URL to access the Container App"
  value       = "https://${azurerm_container_app.app.ingress[0].fqdn}"
}
