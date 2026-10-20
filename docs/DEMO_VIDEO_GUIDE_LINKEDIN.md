# Demonstration Video Guide & LinkedIn Post Template
**Course:** DevSecOps Lab / Software Engineering Practices (CSCOR1PC302)  
**Institution:** Shah & Anchor Kutchhi Engineering College (SAKEC)  
**Faculty Guide:** Prof. Deepika Burte  
**Project:** SafeCampus – Smart Campus Emergency Response System  

---

## 1. Video Recording Script & Screen-by-Screen Walkthrough
**Target Duration:** 3 to 5 Minutes  
**Tool Recommendation:** OBS Studio, Loom, or Windows Xbox Game Bar (`Win + G`)  

> **CRITICAL SECURITY NOTE:** Ensure that no AWS Secret Access Keys, passwords, or personal credentials appear on screen. The scripts and Jenkinsfile in this project already use environment variables and IAM instance profiles to keep secrets invisible.

---

### Step-by-Step Recording Sequence

#### Part 1: Introduction & SDG 9 Alignment (0:00 – 0:45)
* **What to show on screen:** Title slide of your presentation OR the top header of the SafeCampus web portal showing the SAKEC logo and SDG 9 badge.
* **What to say (Voiceover):**
  > *"Hello everyone! Today, I am demonstrating my DevSecOps Continuous Internal Assessment Practical (CIAP) microproject at Shah & Anchor Kutchhi Engineering College, guided by Prof. Deepika Burte. My project is 'SafeCampus', an Agile-based Smart Campus Emergency Response System aligned with United Nations Sustainable Development Goal 9 for resilient infrastructure. I will walk through all 7 required steps: the working application, Dockerization, Trivy and SonarQube security scanning, automated Jenkins CI/CD, and Terraform deployment on AWS EC2."*

#### Part 2: Working Web Application Demonstration (0:45 – 1:45)
* **What to show on screen:** Browser window open at `http://localhost:3000` (or your live AWS EC2 public IP).
* **Actions to perform:**
  1. **Student SOS Report:** Select "Medical emergency", location "Hostel B", check "Someone's life is at risk" (+45 score), and click **"SEND SOS ALERT"**.
  2. Point out that the incident gets tagged as **Critical** with a **2-minute SLA** countdown timer.
  3. **Responder Console:** Click "Responder", enter demo PIN `1111`. Click "Unlock".
  4. Show the incident queue. Assign team **"Medical"**, then click **"Mark Dispatched"**, then **"Mark On-scene"**, and finally **"Mark Resolved"**.
  5. **Audit Chain & Tamper Test:** Switch to Admin (PIN `9999`), open the **"Audit & metrics"** tab. Click **"Verify Hash Chain"** (shows green checkmark). Then click **"Simulate Tamper Test"** to prove that altering any audit entry breaks the cryptographic hash link.
* **What to say (Voiceover):**
  > *"Here is the SafeCampus application. When a user reports a crisis with life-risk flags, our triage algorithm automatically classifies it as Critical with an urgent 2-minute SLA. Responders unlock their console with role-based access to dispatch medical or security teams. Every status change is cryptographically recorded in an immutable FNV-1a hash chain, providing verifiable audit trails for post-incident reviews."*

#### Part 3: Docker Containerization & Security Hardening (1:45 – 2:30)
* **What to show on screen:** VS Code showing `Dockerfile`.
* **Actions to perform:**
  1. Highlight the multi-stage build: `FROM node:20-alpine AS builder` and `FROM node:20-alpine AS runner`.
  2. Highlight line `USER node` (UID 1000) and the built-in `HEALTHCHECK`.
  3. Open terminal and run `docker images | grep safecampus` to show the lightweight 134 MB image size.
* **What to say (Voiceover):**
  > *"In Step 3, we containerized the application. Rather than using bloated base images, we designed a multi-stage Dockerfile based on Alpine Linux. We enforce the principle of least privilege by running as non-root user 'node', and we included an active healthcheck on our API endpoint."*

#### Part 4: Security Scanning with SonarQube & Trivy (2:30 – 3:30)
* **What to show on screen:** SonarQube dashboard and Terminal with Trivy scan outputs.
* **Actions to perform:**
  1. **SonarQube Dashboard:** Show **Quality Gate: PASSED**, 0 Bugs, 0 Vulnerabilities, and test coverage above 90%.
  2. **Trivy Terminal Scan:** Show `reports/VULNERABILITY_REPORT.md` or run:
     ```bash
     trivy image --severity HIGH,CRITICAL safecampus-emergency-system:latest
     ```
  3. Show the output displaying `Total: 0 (HIGH: 0, CRITICAL: 0)`.
* **What to say (Voiceover):**
  > *"Steps 4 and 5 represent our DevSecOps security gates. In SonarQube, our code passed the Quality Gate with zero vulnerabilities and over 90% automated test coverage. Then, we used Aqua Security Trivy to scan both our dependencies and our container image, proving zero High or Critical vulnerabilities before any code reaches the cloud."*

#### Part 5: Jenkins CI/CD & Terraform AWS EC2 Deployment (3:30 – 4:30)
* **What to show on screen:** Jenkins Pipeline Stage View (all stages green) + AWS EC2 Console + Live Public IP in browser.
* **Actions to perform:**
  1. Show the Jenkins Pipeline: Stages 1 through 10 green.
  2. Show `terraform/main.tf` and the AWS Management Console showing the running Ubuntu EC2 instance (`SafeCampus-Production-Server`).
  3. Open a new browser tab and type `http://<EC2-PUBLIC-IP>:3000`.
  4. Show that the SafeCampus application is live, responsive, and working on the public internet!
* **What to say (Voiceover):**
  > *"In Steps 6 and 7, our declarative Jenkins pipeline automates the entire delivery. After passing tests and scans, the image is pushed to AWS Elastic Container Registry. Terraform then provisions an Ubuntu EC2 machine on AWS, where the cloud-init script uses Docker CLI to pull the ECR image and launch it. As you can see right here in my browser, our application is now live on the public EC2 IP on ports 80 and 3000! Thank you."*

---

## 2. Professional LinkedIn Post Template
Copy and customize this post when sharing your video on LinkedIn:

```markdown
🚀 Excited to share my DevSecOps CIAP Microproject: SafeCampus – Smart Campus Emergency Response System! 🛡️🎓

As part of the Continuous Internal Assessment Practical for Software Engineering Practices / DevSecOps Lab (CSCOR1PC302) at Shah & Anchor Kutchhi Engineering College (SAKEC), under the guidance of Prof. Deepika Burte, I engineered a cloud-native, tamper-evident campus safety platform aligned with UN Sustainable Development Goal 9 (Industry, Innovation, and Infrastructure).

Rather than just building a standard web app, I implemented a complete, automated 7-step DevSecOps lifecycle:

✅ 1. Application Development: Real-time emergency SOS reporting, clinical triage scoring, SLA countdown clocks, and a cryptographically chained tamper-evident audit ledger.
✅ 2. GitHub Version Control: Disciplined branching model and automated status checks.
✅ 3. Docker Containerization: Multi-stage, Alpine-based container build running as an unprivileged non-root user (USER node), reducing image size to 134 MB.
✅ 4. Dependency & Container Security: Integrated Aqua Security Trivy for SCA and container vulnerability auditing (0 High, 0 Critical CVEs).
✅ 5. SAST Code Analysis: Configured SonarQube static analysis with automated quality gate enforcement (>90% test coverage).
✅ 6. Automated CI/CD Pipeline: Built a declarative Jenkins pipeline orchestrating linting, testing, security scanning, and container pushes.
✅ 7. Infrastructure as Code (IaC) with Terraform: Automated AWS EC2 (Ubuntu 22.04 LTS) and AWS ECR provisioning with IAM instance profiles, deploying the container live via Docker CLI.

🌐 Live Application verified on AWS EC2 public IPv4 on ports 80 & 3000!

Watch the 4-minute demonstration video below showcasing the live architecture, security reports, and deployment workflow. (All credentials and access keys have been securely managed and redacted).

Special thanks to Prof. Deepika Burte for her continuous mentorship and guidance throughout this practical course!

#DevSecOps #CloudComputing #Terraform #AWS #Docker #Jenkins #SonarQube #Trivy #SoftwareEngineering #SAKEC #MumbaiUniversity #SDG9 #ContinuousIntegration #CyberSecurity
```
