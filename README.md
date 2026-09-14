# 🍔 QuickMunch

> A scalable, cloud-native food delivery platform built with **Spring Boot, Docker, Kubernetes, Terraform, and GitHub Actions**.

**QuickMunch** is a food delivery application currently under development. The goal of this project is not only to build a functional food delivery platform, but also to explore how a modern backend system can be designed, containerized, deployed, and managed using **microservices and DevOps practices**.

🚧 **Project Status: In Development**

A lot of the system is still being built. The current implementation contains the initial **User Service**, while additional microservices, infrastructure, CI/CD pipelines, and Kubernetes deployment are planned.

---

## 🎯 Project Goals

QuickMunch is being developed with two main goals:

### 1. Build a real-world food delivery platform

The application will eventually support functionality such as:

* User registration and authentication
* Google OAuth2 login
* Restaurant management
* Food/menu management
* Cart management
* Order placement
* Order tracking
* Payments
* Notifications
* Reviews and ratings

### 2. Build it using modern DevOps architecture

The project will also focus on:

* Microservices architecture
* Docker containerization
* Kubernetes orchestration
* Infrastructure as Code
* Automated CI/CD
* Service discovery
* Asynchronous communication
* Scalable deployments
* Monitoring and observability

---

# 🏗️ Planned Architecture

The final architecture is still evolving.

The current planned direction is:

```text
                         ┌───────────────┐
                         │    Client     │
                         │ Web / Mobile  │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │ API Gateway   │
                         └───────┬───────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
          ▼                      ▼                      ▼
 ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
 │  User Service   │    │ Restaurant      │    │  Order Service  │
 │                 │    │ Service         │    │                 │
 └────────┬────────┘    └────────┬────────┘    └────────┬────────┘
          │                      │                      │
          ▼                      ▼                      ▼
      PostgreSQL            PostgreSQL             PostgreSQL

                         ┌─────────────────┐
                         │ Notification    │
                         │ Service         │
                         └────────┬────────┘
                                  │
                                  ▼
                            Message Broker
```

The architecture above is **not final** and will change as development progresses.

---

# 🧩 Planned Microservices

| Service              | Purpose                               | Status         |
| -------------------- | ------------------------------------- | -------------- |
| User Service         | Authentication, users, profiles       | 🟡 In Progress |
| Restaurant Service   | Restaurants and restaurant management | 🔴 Planned     |
| Menu Service         | Food/menu management                  | 🔴 Planned     |
| Cart Service         | Shopping cart management              | 🔴 Planned     |
| Order Service        | Order creation and management         | 🔴 Planned     |
| Payment Service      | Payment processing                    | 🔴 Planned     |
| Notification Service | Email/notification processing         | 🔴 Planned     |
| Review Service       | Ratings and reviews                   | 🔴 Planned     |
| API Gateway          | Central entry point for clients       | 🔴 Planned     |

The service boundaries may change as the project evolves.

---

# 👤 Current Implementation — User Service

The **User Service** is currently the first implemented service in QuickMunch.

### Current technologies

* Java
* Spring Boot
* Spring Security
* Spring Data JPA
* PostgreSQL
* OAuth2 / Google Login
* Docker

### Current responsibilities

The User Service is being designed to handle:

* User authentication
* User information
* Google OAuth2 authentication
* Persistent user information
* User-related database operations

The service is currently being developed and additional functionality will be added later.

---

# 🐳 Docker

QuickMunch services are being containerized using Docker.

The current development setup includes:

```text
Docker
│
├── User Service
│
└── PostgreSQL
```

The services communicate through a Docker network during local development.

Example:

```text
quickmunch network

┌─────────────────────────────┐
│                             │
│  quickmunch-user-service    │
│           │                 │
│           │                 │
│           ▼                 │
│     quickmunchdb            │
│     PostgreSQL              │
│                             │
└─────────────────────────────┘
```

Docker Compose may be introduced later as the number of services increases.

---

# ☸️ Kubernetes

Kubernetes will be used to orchestrate the application in the deployment environment.

The current plan is to build and deploy the application using a Kubernetes cluster created with **kubeadm**.

Planned Kubernetes responsibilities include:

* Pod management
* Service discovery
* Load balancing
* Rolling deployments
* Self-healing
* Horizontal scaling
* Configuration management
* Secret management

The Kubernetes architecture is still under development.

---

# 🏗️ Infrastructure as Code

**Terraform** will be used to provision and manage infrastructure.

The goal is to avoid manually creating infrastructure and instead define it as code.

Planned infrastructure may include:

```text
Terraform
    │
    ├── Compute infrastructure
    ├── Networking
    ├── Security groups
    ├── Kubernetes infrastructure
    └── Supporting resources
```

The exact infrastructure design will evolve during development.

---

# 🔄 CI/CD

GitHub Actions will be used to build the project's CI/CD pipeline.

The planned workflow is:

```text
Developer
    │
    ▼
Git Push
    │
    ▼
GitHub
    │
    ▼
GitHub Actions
    │
    ├── Build
    ├── Test
    ├── Code Quality
    ├── Security Scan
    ├── Docker Build
    └── Image Push
             │
             ▼
        Container Registry
             │
             ▼
         Kubernetes
             │
             ▼
        Application
```

Additional tools such as **Trivy** and **SonarQube** may be integrated into the pipeline.

---

# 🛠️ Technology Stack

## Backend

* Java
* Spring Boot
* Spring Security
* Spring Data JPA
* REST APIs

## Database

* PostgreSQL

## Authentication

* Spring Security
* OAuth2
* Google OAuth2

## Containerization

* Docker

## Orchestration

* Kubernetes
* kubeadm

## Infrastructure

* Terraform

## CI/CD

* GitHub Actions

## Planned DevOps / Supporting Technologies

* Container Registry
* Nginx
* Load Balancing
* RabbitMQ
* Redis
* Trivy
* SonarQube

> Technologies marked as planned may change during development.

---

# 📁 Project Structure

The repository structure is currently evolving.

The planned structure may look similar to:

```text
quickmunch/
│
├── services/
│   │
│   ├── user-service/
│   │
│   ├── restaurant-service/
│   │
│   ├── menu-service/
│   │
│   ├── cart-service/
│   │
│   ├── order-service/
│   │
│   └── notification-service/
│
├── infrastructure/
│   │
│   └── terraform/
│
├── kubernetes/
│   │
│   ├── namespaces/
│   ├── deployments/
│   ├── services/
│   └── ingress/
│
├── .github/
│   └── workflows/
│
└── README.md
```

This structure is a **planned direction** and may change as the project grows.

---

# 🚀 Development Roadmap

## Phase 1 — Foundation

* [x] Create project
* [x] Create User Service
* [x] Set up Spring Boot
* [x] Set up PostgreSQL
* [x] Containerize User Service
* [x] Containerize PostgreSQL
* [x] Configure Docker networking
* [ ] Complete User Service
* [ ] Add comprehensive tests

## Phase 2 — Core Services

* [ ] Restaurant Service
* [ ] Menu Service
* [ ] Cart Service
* [ ] Order Service
* [ ] Payment Service
* [ ] Notification Service
* [ ] Review Service

## Phase 3 — Communication

* [ ] Define service communication patterns
* [ ] Implement synchronous service communication
* [ ] Introduce RabbitMQ for asynchronous operations
* [ ] Implement notification workers
* [ ] Add Redis where appropriate

## Phase 4 — Kubernetes

* [ ] Create Kubernetes cluster using kubeadm
* [ ] Create namespaces
* [ ] Create Deployments
* [ ] Create Services
* [ ] Configure ConfigMaps
* [ ] Configure Secrets
* [ ] Configure Ingress
* [ ] Implement health checks
* [ ] Implement rolling deployments
* [ ] Test horizontal scaling

## Phase 5 — Infrastructure

* [ ] Create Terraform configuration
* [ ] Provision required infrastructure
* [ ] Automate Kubernetes infrastructure
* [ ] Manage infrastructure configuration through Terraform

## Phase 6 — CI/CD

* [ ] Create GitHub Actions pipeline
* [ ] Automate application testing
* [ ] Build Docker images
* [ ] Scan images with Trivy
* [ ] Integrate SonarQube
* [ ] Push images to a container registry
* [ ] Deploy to Kubernetes automatically

## Phase 7 — Production Readiness

* [ ] Monitoring
* [ ] Logging
* [ ] Metrics
* [ ] Distributed tracing
* [ ] Secrets management
* [ ] Backup strategy
* [ ] Failure testing
* [ ] Load testing
* [ ] Security hardening

---

# 📌 Current Status

> **QuickMunch is an active work in progress.**

At the moment, development is focused on the **User Service** and establishing the foundation for the rest of the platform.

The Kubernetes, Terraform, CI/CD, and additional microservices architecture are planned but **not yet fully implemented**.

This README will be updated as new components are completed.

---

# 🎓 Project Purpose

QuickMunch is being built as a hands-on project to understand how a real-world distributed application can move from:

```text
Application Code
       ↓
Docker
       ↓
Microservices
       ↓
Kubernetes
       ↓
Infrastructure as Code
       ↓
CI/CD
       ↓
Scalable Deployment
```

Rather than treating each technology independently, the project aims to connect them into one complete system.

---

# 📜 License

This project is currently under development.
