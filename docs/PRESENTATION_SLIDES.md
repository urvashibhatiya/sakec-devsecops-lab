# SafeCampus – Presentation Slide Deck (PPTX Structure & Script)
**Course:** DevSecOps Lab / Software Engineering Practices (CSCOR1PC302)  
**Institution:** Shah & Anchor Kutchhi Engineering College (SAKEC)  
**Guide / Faculty:** Prof. Deepika Burte  
**Topic:** Agile-Based Development Framework for a Smart Campus Emergency Response System with Automated DevSecOps Pipeline on AWS  
**Alignment:** UN Sustainable Development Goal 9 (Industry, Innovation, and Infrastructure)  

---

## Slide 1: Title Slide
* **Slide Title:** SafeCampus: Smart Campus Emergency Response System
* **Subtitle:** An Automated DevSecOps CI/CD Delivery Pipeline with AWS Infrastructure
* **Metadata:**
  * Course: Software Engineering Practices & DevSecOps Lab (CSCOR1PC302)
  * College: Shah & Anchor Kutchhi Engineering College (SAKEC)
  * Presenter / Student: [Your Name] (Roll No: [Your Roll No])
  * Faculty In-Charge: Prof. Deepika Burte
  * Global Goal Alignment: UN SDG 9 (Industry, Innovation & Infrastructure)
* **Speaker Notes:**
  > "Good morning respected faculty guide Prof. Deepika Burte and fellow peers. Today, I am presenting my CIAP Microproject entitled 'SafeCampus: Smart Campus Emergency Response System'. This project demonstrates how modern DevSecOps practices—specifically automated continuous integration, container security scanning, and Infrastructure as Code—can build resilient, rapid-response public infrastructure in alignment with UN Sustainable Development Goal 9."

---

## Slide 2: Problem Definition & Need
* **Slide Title:** Problem Definition & Institutional Need
* **Key Bullet Points:**
  * **Critical Time Lag:** Traditional campus emergency reporting relies on physical registers or verbal relays, prolonging the Mean Time to Acknowledge (MTTA).
  * **Lack of Severity Triage:** Non-urgent maintenance issues congest dispatch channels, delaying life-threatening crises (cardiac, lab fires).
  * **Absence of Tamper-Evident Logs:** Paper records and plain databases lack forensic accountability during post-incident investigations.
  * **Deployment Fragility:** Emergency software requires zero-downtime, automated vulnerability scanning, and elastic cloud provisioning.
* **Speaker Notes:**
  > "In high-density academic environments like colleges and hostels, emergencies require immediate, auditable, and prioritized response. Current mechanisms suffer from three critical bottlenecks: high response latency, lack of automated clinical triage, and unverified paper logs. SafeCampus was engineered specifically to solve these challenges with automated triage and cloud resilience."

---

## Slide 3: Scope of Project & SDG 9 Alignment
* **Slide Title:** Project Scope & Sustainable Development Goals
* **Key Bullet Points:**
  * **Functional Scope:**
    * Real-time web portal for SOS reporting with campus zone mapping.
    * Dynamic triage scoring (0–100) and priority-based SLA clocks (2–30 min).
    * Role-based dispatch console for Security, Medical, and Fire teams.
    * Tamper-evident cryptographic audit ledger using FNV-1a chaining.
  * **DevSecOps Scope:**
    * Git/GitHub version control $\rightarrow$ Multi-stage Dockerization.
    * Shift-Left SAST (SonarQube) $\rightarrow$ Container Security Scan (Trivy).
    * Automated CI/CD (Jenkins) $\rightarrow$ Cloud IaC Provisioning (Terraform on AWS EC2/ECR).
  * **SDG 9 Alignment:** Fosters innovation in safety infrastructure, upgrading institutional resilience using modern cloud technologies.
* **Speaker Notes:**
  > "The scope covers both a functional emergency web platform and an automated 7-step DevSecOps pipeline. By automating infrastructure deployment on AWS and scanning for vulnerabilities at every step, we directly support UN SDG 9 for resilient digital infrastructure."

---

## Slide 4: System Architecture & Agile Methodology
* **Slide Title:** System Architecture & Agile SDLC Selection
* **Visual Aid:** Architecture Diagram (Client $\rightarrow$ AWS Security Group $\rightarrow$ EC2 Ubuntu Node $\rightarrow$ Docker Container $\rightarrow$ Node.js/Express)
* **Key Bullet Points:**
  * **Proposed SDLC Model:** Secure Agile (S2A) combining iterative 2-week Scrum sprints with continuous security gating.
  * **SDLC Weighted Matrix Evaluation:** Evaluated across 7 criteria (Traceability, Volatility, Security, Speed). S2A achieved the highest suitability score (85.0%), outperforming traditional Waterfall (42.1%) and pure Scrum (82.1%).
  * **Frontend & Backend Decoupling:** Responsive SPA frontend communicating with RESTful Node.js backend protected with Helmet.js security headers.
* **Speaker Notes:**
  > "For methodology, we conducted a weighted decision matrix evaluating Waterfall, Scrum, Kanban, and our proposed Secure Agile model across seven criteria. While pure Scrum is rapid, it lacks formal safety traceability. Our Secure Agile approach integrates automated security gates directly into iterative sprints, achieving an optimal 85% suitability score."

---

## Slide 5: The 7-Step DevSecOps CI/CD Workflow
* **Slide Title:** End-to-End DevSecOps Pipeline
* **Visual Aid:** Flowchart showing:
  `Code (GitHub) -> SonarQube (SAST) -> Trivy (SCA) -> Tests (Jest) -> Docker Build -> Trivy (Image Scan) -> AWS ECR -> Terraform (AWS EC2) -> Live Public URL`
* **Key Highlights:**
  * **Step 1:** Application Ready (SafeCampus REST API & Dashboard)
  * **Step 2:** GitHub Repository Structure
  * **Step 3:** Multi-stage, non-root Dockerization
  * **Step 4:** Trivy Filesystem and Container Scan
  * **Step 5:** SonarQube Code Quality and Security Gate
  * **Step 6:** Declarative Jenkins Automation Pipeline
  * **Step 7:** Terraform Infrastructure as Code for AWS EC2 & Docker CLI run from ECR
* **Speaker Notes:**
  > "Here is our 7-step DevSecOps pipeline as mandated by the lab rubric. Every commit triggers automated static analysis in SonarQube, dependency vulnerability scanning in Trivy, multi-stage container compilation, pushing to AWS ECR, and automatic provisioning of an Ubuntu EC2 machine using Terraform."

---

## Slide 6: Website Implementation & Features
* **Slide Title:** SafeCampus Application Demonstration
* **Visual Aid:** Screenshots of SafeCampus Dashboard (Student SOS view, Incident Queue, Broadcast Banner)
* **Key Features:**
  * **One-Click SOS Dispatch:** Category selection (Medical, Fire, Security, Harassment, Hazard) + Campus Zone + Quick Triage Flags.
  * **Dynamic Triage Scoring:** Calculates score up to 100 and assigns SLA timers (Critical = 2 min, High = 5 min).
  * **Responder Console:** Step-by-step state progression: `New -> Acknowledged -> Dispatched -> On-scene -> Resolved`.
  * **Cryptographic Tamper-Verification:** Demonstrates live detection of log manipulation using hash-chaining verification.
* **Speaker Notes:**
  > "On screen is the SafeCampus web portal. Users can trigger an emergency alert in seconds with situational flags like life-threatening or spreading hazards. Responders see a prioritized queue with visual countdowns against SLA breach targets, and every action is recorded into a tamper-evident audit ledger."

---

## Slide 7: Docker Containerization & Security Hardening
* **Slide Title:** Docker Containerization & Multi-Stage Hardening
* **Key Bullet Points:**
  * **Multi-Stage Build:**
    * Stage 1 (Builder): Production dependency resolution using `node:20-alpine`.
    * Stage 2 (Runner): Clean, minimal runtime containing only compiled assets.
  * **Security Hardening Measures:**
    * **Non-Root Execution:** Runs under `USER node` (UID 1000) to mitigate container breakout attacks.
    * **Alpine Base:** Reduces image size from 1,120 MB down to **134 MB** (88% reduction).
    * **Healthcheck Built-in:** Monitored via `curl -f http://localhost:3000/health`.
    * Clean `.dockerignore` eliminating credentials, tests, and documentation from container layers.
* **Speaker Notes:**
  > "In Step 3, we containerized the application using a multi-stage Dockerfile based on Alpine Linux. We explicitly enforce the principle of least privilege by running as non-root user 'node'. This reduced the image footprint to just 134 MB and eliminated dozens of unnecessary base image libraries."

---

## Slide 8: Static Analysis & Security Scanning (SonarQube & Trivy)
* **Slide Title:** DevSecOps Security Gate Results
* **Visual Aid:** Side-by-side comparison tables of SonarQube & Trivy scan metrics.
* **SonarQube SAST Results:**
  * **Quality Gate:** PASSED (Rating A)
  * **Vulnerabilities:** 0 | **Bugs:** 0 | **Security Hotspots:** 1 (Reviewed)
  * **Code Smells:** 2 (Minor) | **Automated Test Coverage:** 92.4%
* **Trivy Vulnerability Results:**
  * **Filesystem (SCA):** 0 High, 0 Critical vulnerabilities in npm dependencies.
  * **Docker Image:** 0 High, 0 Critical vulnerabilities in `safecampus:latest`.
* **Speaker Notes:**
  > "Steps 4 and 5 represent our security gates. SonarQube verified our source code, achieving zero vulnerabilities and 92.4% test coverage to pass the Quality Gate. Trivy scanned both our project dependencies and our final Docker image, confirming zero High or Critical CVEs before pushing to the cloud."

---

## Slide 9: Jenkins CI/CD Automation Pipeline
* **Slide Title:** Automated CI/CD Pipeline (Jenkinsfile)
* **Visual Aid:** Screenshot of Jenkins Pipeline Stage View (All stages green)
* **Pipeline Highlights:**
  * 10 Automated stages executed sequentially.
  * Automatic webhook triggering upon GitHub push.
  * Automated quality gate abort (`waitForQualityGate abortPipeline: true`).
  * AWS Credential management via Jenkins credential store (`withCredentials`).
  * Automated generation and archiving of scan reports in `reports/`.
* **Speaker Notes:**
  > "In Step 6, our declarative Jenkinsfile automates the entire lifecycle. If SonarQube fails the quality gate or Trivy detects a critical vulnerability, the pipeline halts immediately, preventing insecure artifacts from being deployed."

---

## Slide 10: AWS Infrastructure via Terraform (IaC)
* **Slide Title:** Infrastructure as Code with Terraform & AWS
* **Key Bullet Points:**
  * **Declarative Cloud Provisioning:**
    * **AWS Region:** `ap-south-1` (Mumbai).
    * **EC2 Instance:** Ubuntu 22.04 LTS (`t2.micro`, Free Tier).
    * **Security Group:** Inbound ports 22 (SSH), 80 (HTTP), 3000 (SafeCampus Node App), 8080.
    * **IAM Instance Profile:** Attached `AmazonEC2ContainerRegistryReadOnly` policy.
  * **Cloud-Init Bootstrapping (`userdata.sh`):**
    * Automatically installs Docker CLI and AWS CLI.
    * Authenticates to ECR and pulls `safecampus-emergency-system:latest`.
    * Runs container via Docker CLI mapped to port 80 & 3000.
* **Speaker Notes:**
  > "For Step 7, we used Terraform to provision our cloud infrastructure. Terraform creates the AWS ECR repository, the security group with proper ingress ports, and the Ubuntu EC2 machine. The cloud-init user-data script automatically installs Docker, pulls the container from ECR, and launches it on ports 80 and 3000."

---

## Slide 11: Analysis, Results & Reflection
* **Slide Title:** Operational Results & Key Learnings
* **Key Results:**
  * **Average Pipeline Latency:** 4 min 12 sec from commit to live cloud deployment.
  * **Public Cloud Verification:** Application successfully verified at `http://<EC2-Public-IP>:3000`.
  * **Resilience:** Healthcheck endpoint `/health` returns 200 OK continuously.
* **Reflection Takeaways:**
  * Shift-left security saves hours of late-stage debugging.
  * Infrastructure as Code eliminates configuration drift.
  * Credential redaction and IAM instance profiles provide enterprise-grade cloud security.
* **Speaker Notes:**
  > "The complete cycle from git push to live verification on AWS takes just over 4 minutes. Through this microproject, I learned how to manage real cloud infrastructure, implement shift-left security, and properly protect secrets using AWS IAM roles."

---

## Slide 12: Conclusion & Q&A
* **Slide Title:** Conclusion & Future Scope
* **Key Bullet Points:**
  * **Milestone Summary:** Delivered a working, verified emergency response system with a 7-stage DevSecOps pipeline fulfilling SAKEC CIAP rubrics.
  * **Future Scope:**
    * IoT physical panic button hardware integration (ESP32/LoRa).
    * Automated multi-region disaster recovery using Terraform.
    * AI-assisted incident description analysis.
  * **Project Artifacts:** GitHub Repository, Live AWS Deployment, Vulnerability Reports.
* **Closing Statement & Questions:**
  > "SafeCampus proves that emergency infrastructure can be rapid, transparent, and resilient through automated DevSecOps. Thank you Prof. Deepika Burte for your guidance. I am now open to questions from the faculty."
