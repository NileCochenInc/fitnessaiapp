variable "resource_group_name" {
  description = "Name of the Azure resource group"
  type        = string
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "eastus"
}

variable "environment" {
  description = "Environment name (e.g., prod, staging, dev)"
  type        = string
  default     = "production"
}

variable "key_vault_name" {
  description = "Name of existing Key Vault containing secrets"
  type        = string
}

variable "key_vault_resource_group" {
  description = "Resource group name of existing Key Vault"
  type        = string
}

variable "container_app_name" {
  description = "Name of the Container App"
  type        = string
  default     = "fitness-ai-app"
}

variable "container_environment_name" {
  description = "Name of the Container App Environment"
  type        = string
  default     = "fitness-ai-app-env"
}

variable "container_image" {
  description = "Container image URI (e.g., fitnessaiapp:latest from Docker Hub)"
  type        = string
  default     = "fitnessaiapp:latest"
}

variable "container_port" {
  description = "Port exposed by the container"
  type        = number
  default     = 3000
}

variable "cpu_cores" {
  description = "CPU cores allocated to container (0.25, 0.5, 0.75, 1.0, etc.)"
  type        = string
  default     = "0.5"
}

variable "memory_gb" {
  description = "Memory in GB allocated to container (0.5, 1, 1.5, 2, etc.)"
  type        = string
  default     = "1"
}

variable "min_replicas" {
  description = "Minimum number of replicas"
  type        = number
  default     = 1
}

variable "max_replicas" {
  description = "Maximum number of replicas for autoscaling"
  type        = number
  default     = 1
}

variable "ingress_enabled" {
  description = "Enable ingress (external traffic)"
  type        = bool
  default     = true
}

variable "key_vault_secrets" {
  description = "Map of Key Vault secret names to container environment variable names"
  type        = map(string)
  default = {
    "DatabaseUrl"        = "DATABASE_URL"
    "GoogleClientID"     = "GOOGLE_CLIENT_ID"
    "GoogleClientSecret" = "GOOGLE_CLIENT_SECRET"
    "NextAuthSecret"     = "NEXTAUTH_SECRET"
    "MistralAPIKey"      = "MISTRAL_API_KEY"
    "AiServiceURL"       = "AI_SERVICE_URL"
  }
}

variable "static_env_vars" {
  description = "Static environment variables (non-secret)"
  type        = map(string)
  default = {
    "NODE_ENV" = "production"
  }
}

# Google OAuth Configuration
variable "google_project_id" {
  description = "Google Cloud Project ID for OAuth management"
  type        = string
  default     = "fitnessaiapp"
}

variable "google_oauth_client_id" {
  description = "Google OAuth 2.0 Client ID"
  type        = string
  sensitive   = true
}

variable "oauth_authorized_javascript_origins" {
  description = "Authorized JavaScript origins for Google OAuth app"
  type        = list(string)
  default = [
    "http://localhost:3000",
    "https://fitnessaiapp.duckdns.org"
  ]
}

variable "oauth_authorized_redirect_uris" {
  description = "Authorized redirect URIs for Google OAuth app"
  type        = list(string)
  default = [
    "http://localhost:3000/api/auth/callback/google",
    "https://fitnessaiapp.duckdns.org/api/auth/callback/google"
  ]
}
