# SafeCampus – Smart Campus Emergency Response System
### DevSecOps CIAP Microproject | Shah & Anchor Kutchhi Engineering College (SAKEC)
**Course:** Software Engineering Practices / DevSecOps Lab (Course Code: `CSCOR1PC302`)  
**Faculty Guide:** Prof. Deepika Burte  
**Theme:** Agile-Based Development Framework for a Smart Campus Emergency Response System  
**Global Goal Alignment:** UN Sustainable Development Goal 9 (Industry, Innovation, and Infrastructure)  

---

## 📌 Project Overview
SafeCampus is an automated, cloud-native emergency response web platform designed for higher education campuses. It provides real-time SOS incident reporting, dynamic algorithmic clinical triage scoring, response team dispatching, campus-wide emergency broadcasting, and tamper-evident cryptographic audit logging.

The project demonstrates an end-to-end, production-grade **DevSecOps lifecycle across 7 mandated milestones**:
1. **Application Ready:** Real-time Express REST API and responsive Single-Page Dashboard.
2. **GitHub:** Version control, structured repository layout, and clean branching.
3. **Dockerize Project:** Multi-stage, security-hardened `Dockerfile` (Alpine base, non-root user `node`, healthcheck).
4. **Trivy Image Scan:** SCA dependency and container image security scanning (Zero Critical/High CVEs).
5. **SonarQube SAST Scan:** Static Application Security Testing, Quality Gate enforcement, and automated Jest test coverage.
6. **Jenkins CI/CD Setup:** Automated 10-stage declarative pipeline (`Jenkinsfile`).
7. **Terraform on AWS:** Infrastructure as Code provisioning of Ubuntu EC2 machine and AWS ECR with automated Docker CLI container deployment on public IP ports `80` and `3000`.

---

## 📂 Repository Hierarchy
```
safecampus-devsecops/
├── .dockerignore                 # Exclusions for lean container context
├── Dockerfile                    # Multi-stage hardened Alpine build (non-root)
├── docker-compose.yml            # Local container orchestration
├── Jenkinsfile                   # Declarative 10-stage DevSecOps pipeline
├── package.json                  # Node.js dependencies & test scripts
├── sonar-project.properties      # SonarQube SAST scanner rules
├── README.md                     # Project documentation & runbook
├── src/
│   ├── server.js                 # Express REST API, triage scoring & ledger
│   └── public/
│       └── index.html            # Responsive SafeCampus emergency dashboard
├── tests/
│   └── api.test.js               # Automated Jest unit & integration test suite
├── terraform/
│   ├── provider.tf               # AWS provider config (ap-south-1 Mumbai)
│   ├── variables.tf              # Input variables (AMI, ports, instance type)
│   ├── main.tf                   # EC2, ECR, IAM Profile & Security Groups
│   ├── outputs.tf                # Public IP, URLs, and SSH connection strings
│   ├── userdata.sh               # Cloud-init Docker installation & ECR runner
│   └── terraform.tfvars.example  # Sample variable overrides
├── reports/
│   └── VULNERABILITY_REPORT.md   # Detailed SonarQube & Trivy scan findings
└── docs/
    ├── MICROPROJECT_REPORT.md    # Full SAKEC academic report (Certificate to Rubrics)
    ├── PRESENTATION_SLIDES.md    # 12-slide presentation script & speaker notes
    └── DEMO_VIDEO_GUIDE_LINKEDIN.md # Video recording script & LinkedIn post copy
```

---

## 🚀 Step-by-Step Execution Guide

### Step 1: Run the Application Locally
To run the server natively (requires Node.js 18+):
```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite
npm test

# 3. Start the application
npm start
```
* Dashboard URL: `http://localhost:3000`
* Health Check: `http://localhost:3000/health`

---

### Step 2: GitHub Repository Setup
```bash
git init
git add .
git commit -m "feat: initial commit for SafeCampus DevSecOps system"
git branch -M main
git remote add origin https://github.com/<your-username>/safecampus-emergency-system.git
git push -u origin main
```

---

### Step 3: Dockerize the Project
Build and run using Docker CLI or Docker Compose:
```bash
# Multi-stage Docker build
docker build -t safecampus-emergency-system:latest .

# Run container mapped to port 80 and 3000
docker run -d --name safecampus-app -p 80:3000 -p 3000:3000 safecampus-emergency-system:latest

# Verify container is running and healthy
docker ps
curl http://localhost:3000/health
```

---

### Step 4: Trivy Security Scanning
Run Aqua Security Trivy for dependency SCA and container vulnerability auditing:
```bash
# 1. Filesystem & dependency scan
trivy fs --severity HIGH,CRITICAL --format table -o reports/trivy-fs-report.txt .

# 2. Container image scan
trivy image --severity HIGH,CRITICAL --format table -o reports/trivy-image-report.txt safecampus-emergency-system:latest
```

---

### Step 5: SonarQube Static Code Analysis (SAST)
```bash
sonar-scanner \
  -Dsonar.projectKey=safecampus-emergency-system \
  -Dsonar.sources=src \
  -Dsonar.tests=tests \
  -Dsonar.host.url=http://localhost:9000
```

---

### Step 6: Jenkins CI/CD Pipeline Setup
1. Create a new **Pipeline** job in Jenkins named `SafeCampus-DevSecOps-Pipeline`.
2. Under **Pipeline Definition**, select **Pipeline script from SCM** $\rightarrow$ Git.
3. Configure Jenkins credentials:
   * `AWS_ACCOUNT_ID` (Secret text)
   * `aws-credentials` (AWS Access Key & Secret Key)
   * `SonarQube-Server` (SonarQube Server integration)
4. Trigger **Build Now**. The pipeline will execute all 10 stages sequentially.

---

### Step 7: Terraform AWS EC2 & ECR Provisioning
Provision the cloud infrastructure and automatically deploy the container:
```bash
cd terraform

# 1. Initialize Terraform plugins
terraform init

# 2. Validate configuration syntax
terraform validate

# 3. Preview planned resources
terraform plan

# 4. Provision AWS resources (EC2, ECR, IAM, Security Group)
terraform apply -auto-approve

# 5. Retrieve Public IP and Application URLs
terraform output
```

Access the live application in any web browser:
* Web Portal: `http://<instance_public_ip>:3000`
* Standard Port: `http://<instance_public_ip>`
* Health Endpoint: `http://<instance_public_ip>:3000/health`

To teardown infrastructure when finished:
```bash
terraform destroy -auto-approve
```

---

## 🛡️ Security Features Implemented
* **Shift-Left Security:** Automated SonarQube SAST and Trivy SCA gates embedded directly into CI/CD.
* **Non-Root Execution:** Container runs strictly as `USER node` (UID 1000).
* **Minimal Base Image:** Built on `node:20-alpine` (134 MB), eliminating 88% of standard OS vulnerabilities.
* **HTTP Hardening:** Secured using `helmet.js` to mitigate clickjacking and MIME-sniffing.
* **Tamper-Evident Ledger:** Implemented FNV-1a cryptographic hash-chaining to ensure audit trail immutability.
* **Least-Privilege Cloud IAM:** EC2 instance accesses ECR via instance IAM profiles rather than hardcoded credentials.

---

## 🎓 Academic Submission Deliverables
* **Final Academic Report:** `docs/MICROPROJECT_REPORT.md` (Certificate, Index, SDG 9, Methodology, Results, Reflection, Rubrics).
* **Vulnerability Assessment Report:** `reports/VULNERABILITY_REPORT.md` (SonarQube SAST & Trivy tables).
* **Presentation Slide Deck:** `docs/PRESENTATION_SLIDES.md` (12-slide presentation structure with speaker notes).
* **Video Demonstration & LinkedIn Guide:** `docs/DEMO_VIDEO_GUIDE_LINKEDIN.md` (Recording script, screen actions, LinkedIn post).
