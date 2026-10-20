# ==============================================================================
# SAKEC DevSecOps Lab - Terraform Deployment Outputs
# ==============================================================================

output "instance_id" {
  description = "AWS EC2 Instance ID"
  value       = aws_instance.safecampus_server.id
}

output "instance_public_ip" {
  description = "Public IPv4 address of the deployed SafeCampus server"
  value       = aws_instance.safecampus_server.public_ip
}

output "app_url_port_80" {
  description = "Direct HTTP Web URL"
  value       = "http://${aws_instance.safecampus_server.public_ip}"
}

output "app_url_port_3000" {
  description = "SafeCampus Application URL (Port 3000)"
  value       = "http://${aws_instance.safecampus_server.public_ip}:3000"
}

output "health_endpoint" {
  description = "Application Healthcheck Endpoint"
  value       = "http://${aws_instance.safecampus_server.public_ip}:3000/health"
}

output "ecr_repository_url" {
  description = "Amazon Elastic Container Registry (ECR) URI"
  value       = aws_ecr_repository.safecampus_ecr.repository_url
}

output "ssh_connection_string" {
  description = "SSH CLI command to connect to Ubuntu EC2 machine"
  value       = "ssh -i ${var.key_name}.pem ubuntu@${aws_instance.safecampus_server.public_ip}"
}
