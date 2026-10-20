# ==============================================================================
# SAKEC DevSecOps Lab - Terraform Infrastructure as Code (AWS EC2 + Docker)
# Provisions an Ubuntu 22.04 LTS server, installs Docker CLI, pulls the ECR image,
# and runs the SafeCampus Emergency Response System on public IP ports 80 & 3000.
# ==============================================================================

# Data lookup for current AWS account ID
data "aws_caller_identity" "current" {}

# Data lookup for the latest Ubuntu 22.04 LTS AMI
data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

# ----------------- AWS ECR Repository -----------------
resource "aws_ecr_repository" "safecampus_ecr" {
  name                 = var.ecr_repo_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "SafeCampus-ECR"
  }
}

# ECR Lifecycle Policy to keep the latest 5 images and save costs
resource "aws_ecr_lifecycle_policy" "ecr_policy" {
  repository = aws_ecr_repository.safecampus_ecr.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Retain only the latest 5 build images"
        selection = {
          tagStatus   = "any"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 14
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# ----------------- IAM Role & Profile for EC2 Instance -----------------
resource "aws_iam_role" "ec2_ecr_role" {
  name = "safecampus-ec2-ecr-read-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Attach AWS managed policy for ECR read-only access
resource "aws_iam_role_policy_attachment" "ecr_readonly_attach" {
  role       = aws_iam_role.ec2_ecr_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "safecampus-ec2-instance-profile"
  role = aws_iam_role.ec2_ecr_role.name
}

# ----------------- Security Group for SafeCampus -----------------
resource "aws_security_group" "safecampus_sg" {
  name        = "safecampus-security-group"
  description = "Allow inbound SSH, HTTP, and SafeCampus application ports"

  # SSH access
  ingress {
    description = "SSH administration port"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Standard HTTP
  ingress {
    description = "Standard HTTP Web Port"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # SafeCampus Node.js application port
  ingress {
    description = "SafeCampus Application Port"
    from_port   = var.app_port
    to_port     = var.app_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Alternative Web/DevSecOps testing port
  ingress {
    description = "Alternative DevSecOps Port"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound Internet Access
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "SafeCampus-SG"
  }
}

# ----------------- EC2 Virtual Machine (Ubuntu 22.04 LTS) -----------------
resource "aws_instance" "safecampus_server" {
  ami                  = data.aws_ami.ubuntu.id
  instance_type        = var.instance_type
  key_name             = var.key_name
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

  vpc_security_group_ids = [aws_security_group.safecampus_sg.id]

  # User data script to configure Docker CLI and run container from ECR
  user_data = templatefile("${path.module}/userdata.sh", {
    aws_region        = var.aws_region
    ecr_registry_url  = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
    ecr_repo_name     = var.ecr_repo_name
    image_tag         = var.image_tag
    app_port          = var.app_port
  })

  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    delete_on_termination = true
  }

  tags = {
    Name = "SafeCampus-Production-Server"
  }
}
