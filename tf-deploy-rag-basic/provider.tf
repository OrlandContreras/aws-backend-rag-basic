terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.93.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "3.7.1"
    }
  }
  required_version = ">= 1.11.3"
}

provider "aws" {
  region = var.region # Región donde se desplegará el agente
}
