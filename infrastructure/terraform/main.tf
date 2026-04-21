## Data Sources: Reference Existing Resources

# Reference existing Key Vault
data "azurerm_key_vault" "app_secrets" {
  name                = var.key_vault_name
  resource_group_name = var.key_vault_resource_group
}

# Reference existing resource group
data "azurerm_resource_group" "app" {
  name = var.resource_group_name
}

# Fetch Key Vault secrets
data "azurerm_key_vault_secret" "secrets" {
  for_each = var.key_vault_secrets

  name         = each.key
  key_vault_id = data.azurerm_key_vault.app_secrets.id
}

## Resources

# Container App Environment
resource "azurerm_container_app_environment" "app" {
  name                = var.container_environment_name
  location            = data.azurerm_resource_group.app.location
  resource_group_name = data.azurerm_resource_group.app.name

  tags = {
    Environment = var.environment
    Application = "fitness-ai-app"
  }
}

# System-assigned Managed Identity for Container App
resource "azurerm_user_assigned_identity" "container_app" {
  name                = "${var.container_app_name}-identity"
  location            = data.azurerm_resource_group.app.location
  resource_group_name = data.azurerm_resource_group.app.name

  tags = {
    Environment = var.environment
    Application = "fitness-ai-app"
  }
}

# Grant Managed Identity permission to read secrets from Key Vault
resource "azurerm_role_assignment" "container_app_kv_access" {
  scope                = data.azurerm_key_vault.app_secrets.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.container_app.principal_id
}

# Container App
resource "azurerm_container_app" "app" {
  name                         = var.container_app_name
  container_app_environment_id = azurerm_container_app_environment.app.id
  resource_group_name          = data.azurerm_resource_group.app.name
  revision_mode                = "Single"

  # Define secrets from Key Vault
  dynamic "secret" {
    for_each = data.azurerm_key_vault_secret.secrets
    content {
      name  = lower(secret.key)
      value = secret.value.value
    }
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.container_app.id]
  }

  template {
    container {
      name   = "fitness-ai-app"
      image  = var.container_image
      cpu    = var.cpu_cores
      memory = var.memory_gb

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "DEPLOYMENT_VERSION"
        value = var.deployment_version
      }

      # Static environment variables (non-secret)
      dynamic "env" {
        for_each = var.static_env_vars
        content {
          name  = env.key
          value = env.value
        }
      }

      # Secret environment variables from Key Vault
      dynamic "env" {
        for_each = var.key_vault_secrets
        content {
          name        = env.value
          secret_name = lower(env.key)
        }
      }
    }

    min_replicas = var.min_replicas
    max_replicas = var.max_replicas
  }

  ingress {
    allow_insecure_connections = false
    external_enabled           = var.ingress_enabled
    target_port                = var.container_port
    transport                  = "auto"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  tags = {
    Environment = var.environment
    Application = "fitness-ai-app"
    DeploymentVersion = var.deployment_version
  }

  depends_on = [azurerm_role_assignment.container_app_kv_access]
}
