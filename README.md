# 🍔 QuickMunch

> A cloud-native food delivery platform built with **Java, Spring Boot, PostgreSQL, RabbitMQ, Docker, Kubernetes, Terraform, and GitHub Actions**.

QuickMunch is a food delivery microservices project focused on building a functional backend while learning how distributed applications are designed, containerized, tested, deployed, and operated using modern DevOps practices.

The project explores service-to-service communication, asynchronous event processing, authentication, container orchestration, infrastructure as code, and automated deployment.

**Project Status: Active Development**

The core User, Restaurant, and Order Services have been implemented, alongside RabbitMQ-based event communication with the Notification Service. Payment processing, comprehensive testing, Kubernetes deployment, infrastructure automation, and production-readiness improvements remain on the roadmap.

---

## 📌 Table of Contents

* [Project Overview](#-project-overview)
* [Architecture](#️-architecture)
* [Microservices](#-microservices)
* [Technology Stack](#️-technology-stack)
* [Service Communication](#-service-communication)
* [Authentication and Security](#-authentication-and-security)
* [Docker and Local Development](#-docker-and-local-development)
* [Kubernetes](#️-kubernetes)
* [Infrastructure as Code](#️-infrastructure-as-code)
* [CI/CD](#-cicd)
* [Project Structure](#-project-structure)
* [Getting Started](#-getting-started)
* [Development Roadmap](#-development-roadmap)
* [Engineering Goals](#-engineering-goals)
* [License](#-license)

---

## 🎯 Project Overview

QuickMunch has two primary objectives.

### 1. Build a food delivery backend

The platform is being developed around independent services responsible for different business capabilities.

Planned functionality includes:

* User registration and authentication
* Google OAuth2 login
* Restaurant and food management
* Order creation and lifecycle management
* Payment processing
* Email notifications
* Reviews and ratings
* Order status updates

### 2. Apply real-world backend and DevOps practices

The project explores:

* Microservices architecture
* RESTful APIs and synchronous communication
* Asynchronous messaging with RabbitMQ
* Independent service containerization
* PostgreSQL persistence
* Spring Security and JWT authentication
* Infrastructure provisioning with Terraform
* Kubernetes orchestration using kubeadm
* CI/CD automation with GitHub Actions
* Logging, monitoring, reliability, and failure handling

The goal is to understand not only how to make an application work, but also how its components communicate, deploy, recover, and evolve independently.

---

## 🏗️ Architecture

QuickMunch follows a microservices-oriented architecture. Each service owns a specific business responsibility and can evolve independently.

The following diagram represents the current architectural direction. Components marked as planned are not yet fully implemented or deployed.

```text
                         ┌─────────────────────┐
                         │   Web / Mobile      │
                         │       Client        │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Kubernetes Ingress  │
                         │     (Planned)       │
                         └──────────┬──────────┘
                                    │
                ┌───────────────────┼──────────────────┐
                │                   │                  │
                ▼                   ▼                  ▼
        ┌──────────────┐   ┌────────────────┐  ┌──────────────┐
        │ User Service │   │   Restaurant   │  │ Order Service│
        │              │   │    Service     │  │              │
        └──────┬───────┘   └───────┬────────┘  └──────┬───────┘
               │                   │                  │
               ▼                   ▼                  ▼
        ┌──────────────┐   ┌────────────────┐  ┌──────────────┐
        │  PostgreSQL  │   │  PostgreSQL    │  │  PostgreSQL  │
        └──────────────┘   └────────────────┘  └──────────────┘
                                                      │
                                                      ▼
                                            ┌──────────────────┐
                                            │     RabbitMQ     │
                                            │  Order Events    │
                                            └────────┬─────────┘
                                                     │
                                                     ▼
                                            ┌──────────────────┐
                                            │  Notification    │
                                            │     Service      │
                                            └────────┬─────────┘
                                                     │
                                                     ▼
                                               Email Provider


                                            ┌──────────────────┐
                                            │  Payment Service │
                                            │     (Planned)    │
                                            └──────────────────┘
```

### Architecture decisions

* **Microservices:** Business responsibilities are separated into independently developed services.
* **Database ownership:** Each service should own its data and expose the required operations through its API.
* **Synchronous communication:** REST APIs are used when an immediate response is required.
* **Asynchronous communication:** RabbitMQ handles order events and downstream processing.
* **Service discovery:** Kubernetes Services and cluster DNS will provide service discovery within the Kubernetes environment.
* **External access:** Kubernetes Ingress is planned as the external entry point. A separate Spring Cloud API Gateway is not part of the current design.

The architecture will evolve as additional services and infrastructure are implemented.

---

## 🧩 Microservices

| Service              | Responsibility                                      | Status                        |
| -------------------- | --------------------------------------------------- | ----------------------------- |
| User Service         | Authentication, users, profiles, Google OAuth2      | Implemented                   |
| Restaurant Service   | Restaurant management and related data              | Implemented                   |
| Order Service        | Order creation, validation, persistence, and events | Implemented                   |
| Notification Service | Order-event consumption and email delivery          | Integrated; hardening planned |
| Payment Service      | Payment processing and transaction management       | Planned                       |
| Menu Service         | Dedicated food/menu management                      | Under consideration           |
| Cart Service         | Shopping cart management                            | Under consideration           |
| Review Service       | Ratings and reviews                                 | Under consideration           |

Separate Menu, Cart, and Review Services will be introduced only if they provide useful business boundaries.

### User Service

The User Service handles user-related operations and provides the foundation for authentication.

Current technologies and capabilities include:

* Java and Spring Boot
* Spring Security
* Spring Data JPA and PostgreSQL
* Google OAuth2 login and user persistence
* JWT-based request authentication
* User profile and account information

### Restaurant Service

The Restaurant Service handles restaurant-related business data and operations.

Its responsibilities include:

* Restaurant management
* Restaurant data persistence
* Restaurant-related API operations
* Supplying restaurant information to other services

The Order Service communicates with this service when it needs restaurant and food-item information.

### Order Service

The Order Service coordinates the order creation workflow.

Its current responsibilities include:

* Validating relevant user and restaurant information
* Retrieving food-item information
* Calculating order totals
* Creating order records
* Managing order status and payment status fields
* Publishing order-related events through RabbitMQ

### Notification Service

The Notification Service processes order events and handles email delivery.

Its current implementation includes:

* A RabbitMQ consumer for order-created events
* Event deserialization into a notification DTO
* Email delivery through Spring's `JavaMailSender`
* A separate notification-processing component

The service keeps notification processing outside the synchronous order-creation request.

Future improvements include retries, duplicate-event protection, dead-letter queues, and delivery tracking.

### Payment Service — Planned

The Payment Service will handle payment operations independently of the Order Service.

Planned responsibilities include:

* Payment initiation and transaction records
* Integration with a payment provider
* Payment status tracking
* Secure callback and webhook verification
* Idempotent payment processing
* Payment success and failure events
* Integration with the order lifecycle

Payment status will be based on verified server-side provider responses rather than client-submitted success messages. The payment provider and final integration workflow have not yet been selected.

---

## 🔄 Service Communication

QuickMunch uses both synchronous and asynchronous communication, depending on the operation.

### Synchronous communication

REST APIs are used when a service needs an immediate response from another service.

For example, when creating an order, the Order Service retrieves relevant user, restaurant, and food-item information before processing the order.

```text
Order Request
     │
     ▼
Order Service
     │
     ├──► User Service
     │       └── User validation / information
     │
     ├──► Restaurant Service
     │       └── Restaurant / food information
     │
     ▼
Order Persistence
```

Synchronous communication introduces dependencies on downstream service availability. Timeouts, error handling, and resilience mechanisms are important areas for improvement.

### Asynchronous communication with RabbitMQ

RabbitMQ is used to publish order events for downstream processing.

| Component             | Name                   |
| --------------------- | ---------------------- |
| Exchange              | `order.exchange`       |
| Order created         | `order.created`        |
| Order status updated  | `order.status.updated` |
| Order cancelled       | `order.cancelled`      |
| Created-order queue   | `order-created`        |
| Status-update queue   | `order-status-updated` |
| Cancelled-order queue | `order-cancelled`      |

The Notification Service currently consumes events from the created-order queue.

```text
Order Service
     │
     │ Publish OrderEvent
     ▼
order.exchange
     │
     │ Routing key: order.created
     ▼
order-created queue
     │
     ▼
Notification Service
     │
     ▼
Email Service
     │
     ▼
Email Provider
```

Order events can contain information such as the order number, user identifier, restaurant identifier, email address, order status, total amount, delivery address, event type, and timestamp.

The exchange and routing-key conventions establish the messaging structure for additional consumers and event types.

**Reliability considerations:** RabbitMQ delivery alone does not guarantee exactly-once processing or successful email delivery. Production hardening will need to address duplicate events, idempotent consumers, retry policies, dead-letter queues, message durability, and reliable event publication.

---

## 🔐 Authentication and Security

Security is an important part of QuickMunch's backend design.

The User Service provides the foundation for authentication using Spring Security, Google OAuth2, and JWT-based request validation.

The broader security roadmap includes:

* Consistent authentication and authorization across protected APIs
* Secure JWT signing and verification
* Role-based authorization where required
* Environment-based configuration for credentials
* Secret management for database, messaging, and email credentials
* Input validation and consistent error responses
* Dependency and container vulnerability scanning
* Verification of payment-provider callbacks and webhooks

Sensitive credentials must not be committed to source control. Production credentials should be managed using an appropriate secret-management mechanism.

---

## 🐳 Docker and Local Development

Docker is used to package application services and supporting infrastructure into reproducible environments.

The development environment includes containerized application services and PostgreSQL, with RabbitMQ supporting asynchronous messaging.

The intended local topology is:

```text
Docker Compose Environment
│
├── User Service
├── Restaurant Service
├── Order Service
├── Notification Service
├── PostgreSQL
└── RabbitMQ
```

The exact services and configurations depend on the current Compose file.

### Containerization goals

* Build an image for each service
* Keep service configuration outside application source code
* Use environment variables for deployment-specific settings
* Persist database data with appropriate volumes
* Configure health checks and startup behavior
* Optimize image sizes and build caching
* Avoid embedding credentials in images
* Support repeatable local builds and deployments

Image size is monitored as part of the containerization process. The goal is to remove unnecessary dependencies without sacrificing maintainability, security, or debugging capability.

---

## ☸️ Kubernetes

Kubernetes will orchestrate QuickMunch in a clustered deployment environment.

The current deployment direction is to build a Kubernetes cluster using **kubeadm** and deploy the services into it.

Planned capabilities include:

* Namespaces for environment and resource organization
* Deployments and Services for application workloads
* Kubernetes DNS for service discovery
* Ingress for external HTTP/HTTPS access
* ConfigMaps and Secrets for configuration
* Readiness, liveness, and startup probes where appropriate
* Rolling updates and rollback strategies
* Resource requests and limits
* Horizontal Pod Autoscaling where supported by metrics
* Persistent storage for stateful components
* Network policies and access restrictions

The design does not require a separate Eureka service registry or Spring Cloud API Gateway. Kubernetes Services and cluster DNS will provide service discovery within the cluster.

Kubernetes manifests, cluster provisioning, and deployment automation remain part of the roadmap.

---

## 🏗️ Infrastructure as Code

Terraform will define and manage infrastructure declaratively.

The goal is to make infrastructure reproducible, reviewable, and easier to maintain instead of relying entirely on manual cloud-console operations.

Potential infrastructure components include:

* Cloud compute instances
* Virtual networking and subnets
* Security groups and access rules
* Load balancing and ingress-related infrastructure
* Kubernetes cluster nodes
* Supporting storage and networking resources
* Remote Terraform state and state locking

The infrastructure will be designed incrementally, with attention to state management, least-privilege permissions, cost control, and resource lifecycle management.

The final cloud architecture and automated provisioning workflow are still under development.

---

## 🔁 CI/CD

GitHub Actions is the intended CI/CD platform for automating application validation, image publishing, and deployment.

The target workflow is:

```text
Developer Push / Pull Request
             │
             ▼
        GitHub Actions
             │
             ├── Compile and Build
             ├── Run Unit Tests
             ├── Run Integration Tests
             ├── Analyze Code Quality
             ├── Scan Dependencies
             ├── Build Docker Images
             ├── Scan Container Images
             └── Publish Versioned Images
                         │
                         ▼
                Container Registry
                         │
                         ▼
                 Kubernetes Deploy
                         │
                         ▼
                 Health Verification
```

Planned integrations include:

* GitHub Actions for workflow automation
* JUnit for automated Java testing
* SonarQube for code-quality analysis
* Trivy for vulnerability scanning
* A container registry for versioned images
* Kubernetes deployment automation

The workflow describes the target pipeline. Individual stages should be marked complete only after they have been implemented and verified.

---

## 🛠️ Technology Stack

| Category               | Technologies                             |
| ---------------------- | ---------------------------------------- |
| Language               | Java                                     |
| Backend Framework      | Spring Boot                              |
| Security               | Spring Security, JWT, OAuth2             |
| Persistence            | Spring Data JPA, Hibernate               |
| Database               | PostgreSQL                               |
| API Communication      | REST APIs                                |
| Messaging              | RabbitMQ                                 |
| Email                  | Spring `JavaMailSender`                  |
| Containerization       | Docker, Docker Compose                   |
| Orchestration          | Kubernetes, kubeadm                      |
| Service Discovery      | Kubernetes Services and DNS              |
| Infrastructure as Code | Terraform                                |
| CI/CD                  | GitHub Actions                           |
| Testing                | JUnit; broader automated testing planned |
| Code Quality           | SonarQube — planned integration          |
| Security Scanning      | Trivy — planned integration              |

Additional technologies such as Redis, a payment provider, and dedicated observability tooling may be introduced when they address a specific architectural requirement.

---

## 📁 Project Structure

The repository is organized around independently developed services and supporting infrastructure. The exact directory layout may evolve as the project grows.

An illustrative structure is:

```text
quickmunch/
│
├── user-service/
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── restaurant-service/
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── order-service/
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── notification-service/
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── payment-service/              # Planned
│
├── infrastructure/
│   └── terraform/
│
├── kubernetes/
│   ├── namespaces/
│   ├── deployments/
│   ├── services/
│   ├── config/
│   └── ingress/
│
├── .github/
│   └── workflows/
│
├── compose.yaml                  # If maintained at repository root
└── README.md
```

This is a reference layout, not a guarantee of the repository's exact current file structure.

---

## 🚀 Getting Started

### Prerequisites

Install the following tools before running the services:

* JDK compatible with the project's Spring Boot version
* Maven, or use the included Maven Wrapper
* Docker Engine
* Docker Compose

PostgreSQL and RabbitMQ can be run as containers rather than installed directly on the host.

### 1. Clone the repository

```bash
git clone https://github.com/sefaul-islam/QuickMunch.git
cd QuickMunch
```

Ensure that the repository URL and capitalization match the actual GitHub repository.

### 2. Configure environment variables

Configure the database, RabbitMQ, authentication, and email settings required by the services you want to run.

Typical configuration categories include:

```text
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD

RABBITMQ_HOST
RABBITMQ_PORT
RABBITMQ_USERNAME
RABBITMQ_PASSWORD

JWT_SECRET

GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET

MAIL_HOST
MAIL_PORT
MAIL_USERNAME
MAIL_PASSWORD
```

These are illustrative variable names. Use the actual names expected by each service's configuration.

Keep secrets in an untracked local environment file or another appropriate secret store. Do not commit real credentials.

### 3. Start the development environment

If the repository's Compose configuration is available at the root:

```bash
docker compose up --build
```

To run the environment in the background:

```bash
docker compose up --build -d
```

Check service status and logs:

```bash
docker compose ps
docker compose logs -f
```

### 4. Run an individual service

For a Maven-based service, navigate to its directory and run:

```bash
./mvnw spring-boot:run
```

If Maven is installed globally, use:

```bash
mvn spring-boot:run
```

Make sure the service's required database, messaging infrastructure, and environment variables are configured before starting it.

### 5. Configure authentication

Google OAuth2 login requires valid Google OAuth client credentials and an authorized redirect URI matching the application's configuration.

JWT signing configuration must also be supplied securely. Do not use example credentials or development secrets in a production deployment.

**Note:** Exact service ports, API endpoints, Compose commands, and environment-variable names should be documented from the current implementation rather than assumed from this overview.

---

## 🗺️ Development Roadmap

### Phase 1 — Core Backend Services

* [x] Implement User Service
* [x] Implement Restaurant Service
* [x] Implement Order Service
* [x] Implement Notification Service foundation
* [x] Integrate RabbitMQ with the order workflow
* [x] Establish asynchronous order-event consumption
* [ ] Expand automated test coverage across services
* [ ] Standardize validation and error responses
* [ ] Document service APIs and configuration

### Phase 2 — Reliable Distributed Communication

* [x] Establish synchronous REST communication between core services
* [x] Configure order exchange and routing-key conventions
* [x] Connect order-created events to the notification workflow
* [ ] Complete and test status-update and cancellation consumers
* [ ] Add idempotent event processing
* [ ] Configure retries and dead-letter queues
* [ ] Improve timeout and downstream-failure handling
* [ ] Evaluate the transactional outbox pattern for reliable event publication

### Phase 3 — Payment Processing

* [ ] Define payment domain and transaction lifecycle
* [ ] Implement Payment Service
* [ ] Select a suitable payment provider
* [ ] Integrate payment initiation and verification
* [ ] Validate provider callbacks or webhooks
* [ ] Implement idempotency and duplicate-request protection
* [ ] Publish payment outcome events
* [ ] Define order and payment state transitions
* [ ] Test failed, pending, duplicated, and successful payment scenarios

### Phase 4 — Containerization and Local Infrastructure

* [ ] Standardize Dockerfiles across services
* [ ] Finalize Docker Compose configuration
* [ ] Externalize configuration and secrets
* [ ] Add appropriate container health checks
* [ ] Optimize image sizes and build caching
* [ ] Test clean startup and recovery behavior

### Phase 5 — Kubernetes Deployment

* [ ] Provision a kubeadm cluster
* [ ] Configure namespaces and networking
* [ ] Deploy application services
* [ ] Configure Kubernetes Services and DNS
* [ ] Configure Ingress
* [ ] Configure ConfigMaps and Secrets
* [ ] Add health probes and resource limits
* [ ] Implement and test rolling deployments
* [ ] Validate scaling and recovery behavior

### Phase 6 — Terraform and Cloud Infrastructure

* [ ] Define reusable Terraform configurations
* [ ] Configure networking and compute resources
* [ ] Configure remote state and state locking
* [ ] Provision infrastructure through Terraform
* [ ] Automate cluster infrastructure where appropriate
* [ ] Document infrastructure costs and teardown procedures

### Phase 7 — CI/CD and Security

* [ ] Build GitHub Actions workflows
* [ ] Run automated tests during pull requests
* [ ] Build and version container images
* [ ] Publish images to a container registry
* [ ] Integrate SonarQube
* [ ] Integrate Trivy
* [ ] Secure deployment credentials
* [ ] Automate Kubernetes deployments
* [ ] Verify deployments through health checks

### Phase 8 — Production Readiness

* [ ] Centralize application logs
* [ ] Collect metrics and configure monitoring
* [ ] Introduce distributed tracing
* [ ] Configure alerting
* [ ] Define database backup and recovery procedures
* [ ] Perform load and failure testing
* [ ] Review service authentication and network security
* [ ] Test message redelivery and duplicate-event handling
* [ ] Document operational procedures and troubleshooting

---

## 🎓 Engineering Goals

QuickMunch is intended to demonstrate practical engineering beyond building endpoints.

The project emphasizes understanding the trade-offs involved in a distributed system, including:

* **Service boundaries:** Separating business capabilities without creating unnecessary microservices.
* **Data ownership:** Keeping persistence responsibilities clear between services.
* **Communication:** Choosing REST for request-response operations and messaging for asynchronous work.
* **Consistency:** Managing order and payment state transitions across independent services.
* **Reliability:** Handling retries, timeouts, duplicate messages, and partial failures.
* **Security:** Protecting credentials, validating identity, and verifying external payment events.
* **Deployment:** Creating repeatable container builds and controlled Kubernetes rollouts.
* **Automation:** Using infrastructure as code and CI/CD to reduce manual operational work.
* **Observability:** Making application behavior diagnosable through logs, metrics, and traces.

These concerns will be addressed incrementally as the project moves from a working microservices backend toward a more reliable deployment.

---

## 📊 Current Project Status

QuickMunch has progressed beyond its initial single-service stage.

### Implemented foundations

* User Service with authentication-related functionality
* Restaurant Service
* Order Service
* RabbitMQ order-event integration
* Notification Service consuming order-created events and sending emails
* Containerized development environment

### Major work remaining

* Payment Service and provider integration
* Stronger automated testing and distributed failure handling
* Kubernetes deployment and Ingress
* Terraform-managed infrastructure
* Automated CI/CD and security scanning
* Monitoring, observability, and operational hardening

The project is under active development. Completed application features should not be confused with production deployment or operational readiness; those are separate engineering milestones.

---

## 📜 License

No license has been specified yet. Until a license is added to the repository, the project's reuse and redistribution terms should not be assumed.
