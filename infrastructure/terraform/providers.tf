terraform {
  required_version = ">= 1.5"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }

  # Uncomment and configure for remote state management (optional)
  # backend "azurerm" {
  #   resource_group_name  = "your-rg"
  #   storage_account_name = "yourstorageaccount"
  #   container_name       = "tfstate"
  #   key                  = "container-apps.tfstate"
  # }
}

provider "azurerm" {
  features {}

  # Automatically uses Azure CLI authentication (az login)
  # No hardcoded credentials needed
}
