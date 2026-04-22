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

# Fetch Admin-specific Key Vault secrets
data "azurerm_key_vault_secret" "admin_secrets" {
  for_each = var.admin_key_vault_secrets

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
    Environment       = var.environment
    Application       = "fitness-ai-app"
    DeploymentVersion = var.deployment_version
  }

  depends_on = [azurerm_role_assignment.container_app_kv_access]
}

# AI Service Container App
resource "azurerm_container_app" "ai" {
  name                         = var.ai_container_name
  container_app_environment_id = azurerm_container_app_environment.app.id
  resource_group_name          = data.azurerm_resource_group.app.name
  revision_mode                = "Single"

  # Define secrets from Key Vault (only needed secrets for AI service)
  dynamic "secret" {
    for_each = { for key, _ in var.ai_key_vault_secrets : key => data.azurerm_key_vault_secret.secrets[key].value }
    content {
      name  = lower(secret.key)
      value = secret.value
    }
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.container_app.id]
  }

  template {
    container {
      name   = "fitness-ai-app-ai"
      image  = var.ai_container_image
      cpu    = var.ai_cpu_cores
      memory = var.ai_memory_gb

      env {
        name  = "ENVIRONMENT"
        value = "production"
      }

      env {
        name  = "DEPLOYMENT_VERSION"
        value = var.ai_deployment_version
      }

      # Secret environment variables from Key Vault
      dynamic "env" {
        for_each = var.ai_key_vault_secrets
        content {
          name        = env.value
          secret_name = lower(env.key)
        }
      }
    }

    min_replicas = 1
    max_replicas = 1
  }

  # Ingress enabled for internal service discovery
  ingress {
    allow_insecure_connections = true
    external_enabled           = true
    target_port                = var.ai_container_port
    transport                  = "auto"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  tags = {
    Environment       = var.environment
    Application       = "fitness-ai-app"
    Service           = "AI"
    DeploymentVersion = var.ai_deployment_version
  }

  depends_on = [azurerm_role_assignment.container_app_kv_access]
}

# Admin Dashboard Container App
resource "azurerm_container_app" "admin" {
  name                         = var.admin_container_name
  container_app_environment_id = azurerm_container_app_environment.app.id
  resource_group_name          = data.azurerm_resource_group.app.name
  revision_mode                = "Single"

  # Define secrets from Key Vault (admin-specific)
  dynamic "secret" {
    for_each = data.azurerm_key_vault_secret.admin_secrets
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
      name   = var.admin_container_name
      image  = var.admin_container_image
      cpu    = var.admin_cpu_cores
      memory = var.admin_memory_gb

      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }

      env {
        name  = "DEPLOYMENT_VERSION"
        value = var.admin_deployment_version
      }

      env {
        name  = "POSTGRES_HOST"
        value = "ep-proud-surf-a8ief0p1.eastus2.azure.neon.tech"
      }

      env {
        name  = "POSTGRES_PORT"
        value = "5432"
      }

      env {
        name  = "POSTGRES_USER"
        value = "neondb_owner"
      }

      env {
        name  = "POSTGRES_DB"
        value = "neondb"
      }

      env {
        name  = "ASPNETCORE_URLS"
        value = "http://+:5103"
      }

      # Secret environment variables from Key Vault
      dynamic "env" {
        for_each = var.admin_key_vault_secrets
        content {
          name        = env.value
          secret_name = lower(env.key)
        }
      }
    }

    min_replicas = 1
    max_replicas = 1
  }

  ingress {
    allow_insecure_connections = true
    external_enabled           = true
    target_port                = var.admin_container_port
    transport                  = "auto"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  tags = {
    Environment       = var.environment
    Application       = "fitness-ai-app"
    Service           = "AdminDashboard"
    DeploymentVersion = var.admin_deployment_version
  }

  depends_on = [azurerm_role_assignment.container_app_kv_access]
}

# Data Tool Service Container App
resource "azurerm_container_app" "data_tool" {
  name                         = var.data_tool_container_name
  container_app_environment_id = azurerm_container_app_environment.app.id
  resource_group_name          = data.azurerm_resource_group.app.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.container_app.id]
  }

  template {
    container {
      name   = var.data_tool_container_name
      image  = var.data_tool_container_image
      cpu    = var.data_tool_cpu_cores
      memory = var.data_tool_memory_gb

      env {
        name  = "DEPLOYMENT_VERSION"
        value = var.data_tool_deployment_version
      }

      env {
        name  = "POSTGRES_HOST"
        value = "ep-proud-surf-a8ief0p1.eastus2.azure.neon.tech"
      }

      env {
        name  = "POSTGRES_PORT"
        value = "5432"
      }

      env {
        name  = "POSTGRES_DB"
        value = "neondb"
      }

      env {
        name  = "POSTGRES_USER"
        value = "neondb_owner"
      }

      env {
        name  = "SERVER_PORT"
        value = "8080"
      }

      env {
        name  = "DB_PORT"
        value = "5432"
      }

      env {
        name  = "DB_HOST"
        value = "ep-proud-surf-a8ief0p1.eastus2.azure.neon.tech"
      }

      env {
        name  = "DB_NAME"
        value = "neondb"
      }

      env {
        name  = "DB_USER"
        value = "neondb_owner"
      }

      env {
        name  = "DB_PASSWORD"
        value = "npg_jlOyptWIk73x"
      }

      env {
        name  = "DATABASE_URL"
        value = "postgresql://neondb_owner:npg_jlOyptWIk73x@ep-proud-surf-a8ief0p1.eastus2.azure.neon.tech:5432/neondb?sslmode=require&channel_binding=require"
      }
    }

    min_replicas = 1
    max_replicas = 1
  }

  # Ingress enabled for internal service discovery
  ingress {
    allow_insecure_connections = true
    external_enabled           = true
    target_port                = var.data_tool_container_port
    transport                  = "auto"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  tags = {
    Environment       = var.environment
    Application       = "fitness-ai-app"
    Service           = "DataTool"
    DeploymentVersion = var.data_tool_deployment_version
  }

  depends_on = [azurerm_role_assignment.container_app_kv_access]
}
