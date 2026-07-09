terraform {
  required_version = ">= 1.5"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "Fitness-AI-App"
    storage_account_name = "fitnessaiapptfstate"
    container_name       = "tfstate"
    key                  = "container-apps.tfstate"
    use_azuread_auth     = true
  }
}

provider "azurerm" {
  features {}

  # Automatically uses Azure CLI authentication (az login)
  # No hardcoded credentials needed
}

provider "google" {
  project = var.google_project_id

  # Automatically uses gcloud CLI authentication (gcloud auth login)
  # No hardcoded credentials needed
}

provider "null" {
  # Used for local-exec provisioners
}
