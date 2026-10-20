# ==============================================================================
# SAKEC DevSecOps Lab - Terraform AWS Provider Configuration
# Project: SafeCampus Emergency Response System
# ==============================================================================

terraform {
  required_version = ">= 1.3.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "SafeCampus"
      Course      = "CSCOR1PC302"
      College     = "SAKEC"
      Environment = "DevSecOps-Microproject"
      SDG         = "Goal-9-Industry-Innovation-Infrastructure"
    }
  }
}
