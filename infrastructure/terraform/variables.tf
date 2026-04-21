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

variable "deployment_version" {
  description = "Version number for triggering container redeploy (increment to force new deployment)"
  type        = string
  default     = "1"
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

# AI Service Container Variables
variable "ai_container_image" {
  description = "AI service Docker image URI"
  type        = string
  default     = "nilecochen/fitnessaiapp-ai:v1-prod"
}

variable "ai_container_port" {
  description = "AI service container port"
  type        = number
  default     = 5000
}

variable "ai_container_name" {
  description = "AI service container app name"
  type        = string
  default     = "fitness-ai-app-ai"
}

variable "ai_deployment_version" {
  description = "AI service deployment version for force redeploy"
  type        = string
  default     = "1"
}

variable "ai_cpu_cores" {
  description = "AI service CPU cores"
  type        = string
  default     = "1.0"
}

variable "ai_memory_gb" {
  description = "AI service memory in GB"
  type        = string
  default     = "2Gi"
}

variable "ai_key_vault_secrets" {
  description = "Map of Key Vault secrets for AI service"
  type        = map(string)
  default = {
    "DatabaseUrl"   = "DATABASE_URL"
    "MistralAPIKey" = "MISTRAL_API_KEY"
  }
}

# Admin Dashboard Container Variables
variable "admin_container_image" {
  description = "Admin Dashboard Docker image URI"
  type        = string
  default     = "nilecochen/fitnessaiapp-admin-dash:v1-prod"
}

variable "admin_container_port" {
  description = "Admin Dashboard container port"
  type        = number
  default     = 5103
}

variable "admin_container_name" {
  description = "Admin Dashboard container app name"
  type        = string
  default     = "fitness-ai-app-admin"
}

variable "admin_deployment_version" {
  description = "Admin Dashboard deployment version for force redeploy"
  type        = string
  default     = "1"
}

variable "admin_cpu_cores" {
  description = "Admin Dashboard CPU cores"
  type        = string
  default     = "1.0"
}

variable "admin_memory_gb" {
  description = "Admin Dashboard memory in GB"
  type        = string
  default     = "1Gi"
}

variable "admin_key_vault_secrets" {
  description = "Map of Key Vault secrets for Admin Dashboard"
  type        = map(string)
  default = {
    "PostgresPassword"         = "POSTGRES_PASSWORD"
    "GrafanaSettings-ApiToken" = "GrafanaSettings__ApiToken"
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
