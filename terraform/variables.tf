# ==============================================================================
# SAKEC DevSecOps Lab - Terraform Input Variables
# ==============================================================================

variable "aws_region" {
  description = "AWS deployment region (ap-south-1 for Mumbai, India)"
  type        = string
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "EC2 Instance size (Free tier eligible t2.micro or t3.micro)"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "AWS EC2 Key Pair name for SSH administration"
  type        = string
  default     = "safecampus-key"
}

variable "ecr_repo_name" {
  description = "AWS ECR Repository Name for SafeCampus Docker image"
  type        = string
  default     = "safecampus-emergency-system"
}

variable "image_tag" {
  description = "Docker image tag to deploy from AWS ECR"
  type        = string
  default     = "latest"
}

variable "app_port" {
  description = "Port exposed by SafeCampus container application"
  type        = number
  default     = 3000
}
