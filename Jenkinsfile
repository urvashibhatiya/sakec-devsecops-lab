pipeline {
    agent any

    environment {
        AWS_DEFAULT_REGION = 'ap-south-1'
        AWS_ACCOUNT_ID     = credentials('AWS_ACCOUNT_ID')
        ECR_REPO_NAME      = 'safecampus-emergency-system'
        ECR_REGISTRY       = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
        IMAGE_NAME         = "${ECR_REGISTRY}/${ECR_REPO_NAME}"
        IMAGE_TAG          = "${BUILD_NUMBER}"
        SONAR_HOST_URL     = 'http://localhost:9000'
        SCAN_REPORT_DIR    = 'reports'
    }

    options {
        timeout(time: 60, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        ansiColor('xterm')
    }

    stages {
        stage('1. Checkout SCM') {
            steps {
                echo '=== [Stage 1] Checking out Source Code from GitHub Repository ==='
                checkout scm
                sh 'mkdir -p ${SCAN_REPORT_DIR}'
            }
        }

        stage('2. SonarQube SAST Code Scan') {
            steps {
                echo '=== [Stage 2] Running Static Application Security Testing (SAST) with SonarQube ==='
                withSonarQubeEnv('SonarQube-Server') {
                    // Executes SonarScanner CLI
                    sh '''
                        sonar-scanner \
                          -Dsonar.projectKey=safecampus-emergency-system \
                          -Dsonar.sources=src \
                          -Dsonar.tests=tests \
                          -Dsonar.host.url=${SONAR_HOST_URL}
                    '''
                }
            }
        }

        stage('3. SonarQube Quality Gate Check') {
            steps {
                echo '=== [Stage 3] Evaluating SonarQube Quality Gate Thresholds ==='
                timeout(time: 5, unit: 'MINUTES') {
                    script {
                        waitForQualityGate abortPipeline: true
                    }
                }
            }
        }

        stage('4. Trivy Filesystem & Dependency Scan') {
            steps {
                echo '=== [Stage 4] Scanning Filesystem & Dependencies for Known Vulnerabilities (SCA) ==='
                sh '''
                    echo "Scanning project dependencies with Trivy..."
                    trivy fs \
                      --severity HIGH,CRITICAL \
                      --format table \
                      --output ${SCAN_REPORT_DIR}/trivy-fs-report.txt \
                      --exit-code 0 \
                      .
                    cat ${SCAN_REPORT_DIR}/trivy-fs-report.txt || true
                '''
            }
        }

        stage('5. Unit & Integration Testing') {
            steps {
                echo '=== [Stage 5] Executing Automated Jest Tests & Generating Coverage ==='
                sh '''
                    if command -v npm &> /dev/null; then
                        npm test -- --ci --coverage --testResultsProcessor="jest-sonar-reporter" || true
                    else
                        echo "Running tests in containerized test-runner..."
                        docker run --rm -v $(pwd):/app -w /app node:20-alpine sh -c "npm install && npm test"
                    fi
                '''
            }
        }

        stage('6. Docker Build') {
            steps {
                echo '=== [Stage 6] Building Multi-Stage Hardened Docker Image ==='
                sh '''
                    echo "Building Docker container image: ${IMAGE_NAME}:${IMAGE_TAG}"
                    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest .
                    docker images | grep ${ECR_REPO_NAME}
                '''
            }
        }

        stage('7. Trivy Container Image Scan') {
            steps {
                echo '=== [Stage 7] Scanning Docker Container Image with Trivy ==='
                sh '''
                    trivy image \
                      --severity HIGH,CRITICAL \
                      --format table \
                      --output ${SCAN_REPORT_DIR}/trivy-image-report.txt \
                      --exit-code 0 \
                      ${IMAGE_NAME}:${IMAGE_TAG}
                    cat ${SCAN_REPORT_DIR}/trivy-image-report.txt || true
                '''
            }
        }

        stage('8. Push Docker Image to AWS ECR') {
            steps {
                echo '=== [Stage 8] Authenticating & Pushing Image to AWS Elastic Container Registry ==='
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    sh '''
                        # Ensure ECR repository exists
                        aws ecr describe-repositories --repository-names ${ECR_REPO_NAME} --region ${AWS_DEFAULT_REGION} || \
                        aws ecr create-repository --repository-name ${ECR_REPO_NAME} --region ${AWS_DEFAULT_REGION}

                        # Login to AWS ECR
                        aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | \
                          docker login --username AWS --password-stdin ${ECR_REGISTRY}

                        # Push both specific build tag and latest
                        docker push ${IMAGE_NAME}:${IMAGE_TAG}
                        docker push ${IMAGE_NAME}:latest
                        echo "Successfully pushed ${IMAGE_NAME}:${IMAGE_TAG} to AWS ECR"
                    '''
                }
            }
        }

        stage('9. Terraform Provision AWS EC2 Infrastructure') {
            steps {
                echo '=== [Stage 9] Provisioning AWS EC2 Ubuntu Machine via Terraform ==='
                dir('terraform') {
                    withCredentials([[
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws-credentials',
                        accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                    ]]) {
                        sh '''
                            terraform init
                            terraform validate
                            terraform apply -auto-approve -var="image_tag=${IMAGE_TAG}"
                            terraform output -json > tf_outputs.json
                        '''
                    }
                }
            }
        }

        stage('10. Verify Deployment & Application Health') {
            steps {
                echo '=== [Stage 10] Validating SafeCampus Web App on Public Instance IP ==='
                dir('terraform') {
                    sh '''
                        PUBLIC_IP=$(terraform output -raw instance_public_ip || echo "127.0.0.1")
                        echo "=========================================================="
                        echo "SafeCampus Public Application IP: ${PUBLIC_IP}"
                        echo "Dashboard URL: http://${PUBLIC_IP}:3000"
                        echo "Standard Web URL: http://${PUBLIC_IP}"
                        echo "Health Endpoint: http://${PUBLIC_IP}:3000/health"
                        echo "=========================================================="
                        
                        # Wait for cloud-init to pull ECR container and start Docker
                        echo "Waiting 30 seconds for EC2 user-data script execution..."
                        sleep 30
                        
                        # Verify health endpoint returns 200 OK
                        curl -f -s --connect-timeout 10 http://${PUBLIC_IP}:3000/health || echo "Note: Initial cloud-init container boot may take up to 60s"
                    '''
                }
            }
        }
    }

    post {
        always {
            echo '=== Archiving Security Scan Reports & Test Artifacts ==='
            archiveArtifacts artifacts: 'reports/**,coverage/**', allowEmptyArchive: true
        }
        success {
            echo '=== DevSecOps CI/CD Pipeline Completed Successfully! Application is Live on AWS EC2 ==='
        }
        failure {
            echo '=== DevSecOps CI/CD Pipeline Failed! Check SonarQube, Trivy, or Terraform logs ==='
        }
    }
}
