# ��� Self-Healing AWS Infrastructure (ECS + CloudWatch + Lambda)

## ��� Overview

This project demonstrates a **self-healing cloud infrastructure** built on AWS that can automatically detect application failures and remediate them **without human intervention**.

The system monitors a containerized application running on **ECS Fargate** using **CloudWatch alarms**. When a failure or performance issue is detected, an **AWS Lambda function** is triggered to take corrective action such as restarting tasks or scaling the service. Human-readable alerts are sent via **SNS** so engineers stay informed.

This project was built to simulate **real-world production incidents** and showcase practical DevOps and SRE skills at a junior-to-mid level.

---

## ��� Problem Statement

Modern cloud applications frequently experience issues such as:

* Application crashes
* Memory leaks
* CPU exhaustion
* Bad deployments causing 5XX errors

In many teams, these issues are still handled **manually**, leading to:

* Slow incident response
* Downtime
* On-call fatigue

**Goal:** Build a system that detects these issues early and automatically fixes them while notifying engineers.

---

## ��� Solution Architecture

### High-Level Architecture Diagram

```
                 ┌──────────────┐
                 │    Users     │
                 └──────┬───────┘
                        │ HTTP
                        ▼
              ┌────────────────────┐
              │ Application Load    │
              │ Balancer (ALB)      │
              └─────────┬──────────┘
                        │
                        ▼
              ┌────────────────────┐
              │ ECS Fargate Service │
              │ (Breakable App)    │
              │  - Desired: 2      │
              └─────────┬──────────┘
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
┌─────────────┐ ┌─────────────┐ ┌────────────────────┐
│ CloudWatch  │ │ CloudWatch  │ │ Application ELB    │
│ CPU Alarm   │ │ Memory Alarm│ │ 5XX Error Metrics  │
└──────┬──────┘ └──────┬──────┘ └─────────┬──────────┘
       │               │                  │
       └───────────────┼──────────────────┘
                       ▼
              ┌────────────────────┐
              │ EventBridge Rule   │
              │ (Alarm State Change│
              │        = ALARM)    │
              └─────────┬──────────┘
                        ▼
              ┌────────────────────┐
              │ Lambda Remediation │
              │  - Restart tasks  │
              │  - Scale service  │
              └─────────┬──────────┘
                        │
        ┌───────────────┼────────────────┐
        │                                │
        ▼                                ▼
┌─────────────┐                  ┌─────────────────┐
│ ECS Control │                  │ SNS Notifications│
│ Plane       │                  │ (Email / Slack) │
└─────────────┘                  └─────────────────┘
```

**High-level flow:**

```
User → Application Load Balancer → ECS Fargate Service
                                 ↓
                        CloudWatchMetrics&Alarms
                                    ↓
                           EventBridge Rule
                                 ↓
                         Lambda Auto-Remediation
                                 ↓
                         ECS Action + SNS Alert
```

---

## ��� AWS Services Used

* **ECS Fargate** – Runs containerized application
* **Application Load Balancer (ALB)** – Traffic routing and health checks
* **CloudWatch** – Metrics, logs, and alarms
* **EventBridge** – Alarm-to-Lambda integration
* **Lambda** – Automated remediation logic
* **SNS** – Human-readable notifications
* **ECR** – Container image storage
* **IAM** – Least-privilege access control

---

## ��� Breakable Application

The application is intentionally designed to fail in realistic ways.

### Endpoints

| Endpoint       | Description        | Purpose               |
| -------------- | ------------------ | --------------------- |
| `/`            | Health check       | ALB health checks     |
| `/crash`       | Terminates process | Simulates app crash   |
| `/memory-leak` | Consumes memory    | Triggers memory alarm |
| `/cpu-spike`   | Burns CPU          | Triggers CPU alarm    |
| `/slow`        | Delayed response   | Simulates latency     |

---

## ⏰ Monitoring & Alarms

CloudWatch alarms are configured with **production-safe thresholds**:

| Alarm           | Threshold       | Action              |
| --------------- | --------------- | ------------------- |
| High Memory     | >75% for 2 min  | Restrt ECS tasks   |
| High CPU        | >80% for 3 min  | Scae service       |
| ALB 5XX Errors  | ≥5 errors/min   | Restt taskalars       |
| Unhealthy Tasks | < desired count | Alert + remediation |

All alarms publish events to **EventBridge**, which triggers Lambda.

---

## �� Lambda Auto-Remediation Logic

The Lambda function acts as the **decision engine**.

### Behavior

* Parses CloudWatch alarm events
* Applies deterministic remediation rules
* Executes ECS actions
* Sends contextual SNS alerts

### Example Rules

* Memory leak → Restart ECS tasks
* CPU pressure → Scale servce up
* 5XX errors → Restart tasks

Guardrails are implemeted to prevent:

* Infnite reinistarts
* Runaway scalg

---

## ��� Notficationinis

Engineers receive alerts such as:

```
��� Alarm Triggered: ecs-high-memory-self-healing
��� Action Taken: Restarted ECS tasks
��� Cluster: self-healing-cluster
��� Service: breakable-app-service
```

This ensures **visibility without manual intervention**.

---

## ��� Failure Scenarios ested

* ManuTal crash via `/crash`
* Memory leak via `/memory-leak`
* CPU spike via `/cpu-spike`
* Application returning 5XX errors

Each scenario successfully triggered alarms and automatic recovery.

---

## ��� Security & Best Practices

* IAM roles follow **least privilege**
* No hardcoded credentials
* Configuration via environment variables
* Guardrails on scaling actions

---

## ��� Cost Awareness

* Fargate used to avoid idle EC2 costs
* Conservative alarmthreholds
* Slimits enforced in Lmbd saling aca

This project is designed to be **low-cost** while demonstrating production patterns.

---

## ��� Repository Structure

```
.
├── app/            # Breakable application source
├── lambda/         # Auto-remediation logic
├── terraform/      # Infrastructure as Code (optional)
├── diagrams/       # Architecture diagrams
└── README.md
```

---

## ��� How to Run

1. Build and push Docker image to ECR
2. Deploy ECS service behind ALB
3. Configure CloudWatch alarms
4. Deploy Lambda + EventBridge rule
5. Trigger failure endpoints and observe self-healing

---

## ��� What This Project Demonstrates

* Real-world DevOps problem solving
* AWS ECS production patterns
* Monitoring and alert design
* Automated remediation
* Cost and safety awareness

---

## ��� Future Improvements

* Multi-service support
* Cooldown state stored in DynamoDB
* Deployment rollback logic
* Slack / PagerDuty integration
* Terraform-only deployment

---

## ��� Author

**Gdswill Nwaia**Junior DevOps Engineer (AWS)
on

---

## ��� Final Note

This project focuses on **thinking like a production engineer**, not just deploying containers. It reflects how real teams build resilient systems in the cloud.

