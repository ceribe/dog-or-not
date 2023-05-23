provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "resource_group" {
  name     = "dog-or-not-resource-group"
  location = "West Europe"
}

resource "azurerm_service_plan" "service_plan" {
  name                = "dog-or-not-service-plan"
  resource_group_name = azurerm_resource_group.resource_group.name
  location            = azurerm_resource_group.resource_group.location
  os_type             = "Linux"
  sku_name            = "Y1"
}

# Storage account used for storing uploaded functions
resource "azurerm_storage_account" "code_storage_account" {
  name                     = "dogornotcodesa"
  resource_group_name      = azurerm_resource_group.resource_group.name
  location                 = azurerm_resource_group.resource_group.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# Storage account used for storing application's state
resource "azurerm_storage_account" "db_storage_account" {
  name                     = "dogornotdbsa"
  resource_group_name      = azurerm_resource_group.resource_group.name
  location                 = azurerm_resource_group.resource_group.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  blob_properties {
    cors_rule {
      allowed_headers = ["*"]
      allowed_methods = ["POST"]
      allowed_origins = ["*"]
      exposed_headers = ["*"]
      max_age_in_seconds = 86400
    }
  }
}

data "azurerm_storage_account_sas" "db_storage_account_sas" {
  connection_string = azurerm_storage_account.db_storage_account.primary_connection_string
  https_only        = true
  signed_version    = "2022-07-29"

  resource_types {
    service   = true
    container = true
    object    = true
  }

  services {
    blob  = true
    queue = true
    table = true
    file  = true
  }

  start  = "2023-03-21T00:00:00Z"
  expiry = "2024-03-21T00:00:00Z"

  permissions {
    read    = true
    write   = true
    delete  = false
    list    = false
    add     = true
    create  = true
    update  = false
    process = false
    tag     = false
    filter  = false
  }
}

output "sas_url_query_string" {
  value = data.azurerm_storage_account_sas.db_storage_account_sas.sas
}

# Table storing photo's names, references and status
resource "azurerm_storage_table" "photo_info_table" {
  name                 = "photoinfo"
  storage_account_name = azurerm_storage_account.db_storage_account.name
}

# Container used to store uploaded photos
resource "azurerm_storage_container" "photos" {
  name                  = "photos"
  storage_account_name  = azurerm_storage_account.db_storage_account.name
  container_access_type = "private"
}

resource "azurerm_linux_function_app" "dog-or-not-app" {
  name                      = "dog-or-not"
  location                  = azurerm_resource_group.resource_group.location
  resource_group_name       = azurerm_resource_group.resource_group.name
  service_plan_id       =     azurerm_service_plan.service_plan.id
  storage_account_name      = azurerm_storage_account.code_storage_account.name
  storage_account_access_key = azurerm_storage_account.code_storage_account.primary_access_key

  site_config {
    application_stack {
      node_version = "18"
    }
  }

  app_settings = {
    FUNCTIONS_WORKER_RUNTIME = "node"
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = false
    CONNSTRING = azurerm_storage_account.db_storage_account.primary_connection_string
    TABLE = azurerm_storage_table.photo_info_table.name
  }
}
