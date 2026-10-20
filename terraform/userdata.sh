#!/bin/bash
set -e

# ==============================================================================
# SAKEC DevSecOps Lab - EC2 Cloud-Init Bootstrap Script
# Step 7 Requirement:
# "use terraform to create aws ec2 machine (ubuntu) - docker cli run your image
#  pushed on ecr on docker cli. show your running application on public instance ip on proper port."
# ==============================================================================

# Output logging
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/null) 2>&1
echo "=== Starting SafeCampus Server Initialization at $(date) ==="

# 1. Update package list and install system dependencies
echo "Installing Docker CLI, curl, and AWS CLI..."
apt-get update -y
apt-get install -y docker.io awscli curl

# 2. Start and enable Docker service
systemctl start docker
systemctl enable docker
usermod -aG docker ubuntu

# 3. Authenticate Docker CLI to AWS ECR using Instance IAM Profile
echo "Authenticating Docker with AWS ECR..."
AWS_REGION="${aws_region}"
ECR_REGISTRY="${ecr_registry_url}"
ECR_REPO="${ecr_repo_name}"
IMAGE_TAG="${image_tag}"
FULL_IMAGE="$${ECR_REGISTRY}/$${ECR_REPO}:$${IMAGE_TAG}"

# Wait up to 120 seconds for ECR image availability if pipeline is concurrently pushing
SUCCESS=0
for i in {1..12}; do
  echo "Attempt $i: Logging into ECR and attempting to pull $${FULL_IMAGE}..."
  if aws ecr get-login-password --region "$${AWS_REGION}" | docker login --username AWS --password-stdin "$${ECR_REGISTRY}"; then
    if docker pull "$${FULL_IMAGE}"; then
      echo "Successfully pulled $${FULL_IMAGE} from AWS ECR!"
      docker run -d \
        --name safecampus-app \
        --restart always \
        -p 80:3000 \
        -p 3000:3000 \
        "$${FULL_IMAGE}"
      SUCCESS=1
      break
    fi
  fi
  echo "Image not ready yet. Retrying in 10 seconds..."
  sleep 10
done

# Fallback: In case the instance was launched prior to ECR image push
if [ $SUCCESS -eq 0 ]; then
  echo "Warning: ECR image not ready at launch time. Running fallback container..."
  docker run -d \
    --name safecampus-app \
    --restart always \
    -p 80:3000 \
    -p 3000:3000 \
    node:20-alpine sh -c "echo '<h1>SafeCampus Emergency System - Bootstrapping from AWS ECR...</h1><p>Trigger Jenkins pipeline or run: docker pull $${FULL_IMAGE}</p>' > index.html && npx -y http-server -p 3000"
fi

echo "=== SafeCampus Deployment Completed Successfully at $(date) ==="
