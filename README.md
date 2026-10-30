# 🍔 QuickMunch

> A cloud-native food delivery platform built with **Java, Spring Boot, PostgreSQL, RabbitMQ, Docker, Kubernetes, Terraform, and GitHub Actions**.

QuickMunch is a food delivery microservices project focused on building a functional backend while learning how distributed applications are designed, containerized, tested, deployed, and operated using modern DevOps practices.

The project explores service-to-service communication, asynchronous event processing, authentication, container orchestration, infrastructure as code, and automated deployment.

**Project Status: Active Development**

The User, Restaurant, and Order Services are implemented, and the Order Service is integrated with the Notification Service through RabbitMQ. Authentication is being consolidated around Keycloak and Spring Security OAuth2 Resource Server. The current major focus is to finish and verify the Keycloak integration, then implement a reliable Payment Service using SSLCommerz. Kubernetes deployment, Terraform automation, CI/CD, and broader production hardening remain planned.

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
* [Immediate Development Focus](#-immediate-development-focus)
* [Engineering Goals](#-engineering-goals)
* [License](#-license)

---

## 🎯 Project Overview

QuickMunch has two primary objectives.

### 1. Build a food delivery backend

The platform is being developed around independent services responsible for different business capabilities.

Planned functionality includes:

* User profiles and authentication through Keycloak
* Role-based authorization using Keycloak JWT claims
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
* Keycloak-based authentication and JWT validation with Spring Security OAuth2 Resource Server
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
                                            │ (Planned:       │
                                            │  SSLCommerz)    │
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
| User Service         | User profiles and Keycloak-backed API authentication | Implemented; Keycloak hardening in progress |
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
* Spring Security OAuth2 Resource Server
* Keycloak as the identity provider
* JWT bearer-token validation using the configured issuer and Keycloak JWK set
* Conversion of Keycloak realm roles into Spring Security authorities (for example, `ROLE_CUSTOMER`)
* Spring Data JPA and PostgreSQL for application user/profile data
* User profile and account information

The authentication migration is replacing the earlier custom JWT / direct Google OAuth2 approach. The remaining work is to finish authorization rules, verify role mappings across services, and settle the user-profile synchronization strategy.

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

### Payment Service — Planned (SSLCommerz)

The Payment Service is the next major backend capability. The current plan is to integrate **SSLCommerz** as the payment gateway, while keeping the gateway-specific implementation behind a provider integration layer.

Planned responsibilities include:

* Create and track payment attempts independently of order records
* Verify order ownership and retrieve the authoritative payable amount from the Order Service
* Initiate SSLCommerz hosted checkout sessions
* Handle success, failure, cancellation callbacks, and IPN notifications
* Validate transactions server-to-server using the SSLCommerz Order Validation API
* Implement API idempotency and duplicate-notification protection
* Track transaction identifiers and payment state transitions
* Publish payment outcome events through RabbitMQ
* Use a transactional outbox to avoid losing events after a database commit
* Support reconciliation for timeouts and uncertain gateway responses
* Add refund handling after the core payment lifecycle is reliable

The browser redirect will not be treated as proof of payment. A payment will be marked successful only after server-side gateway validation confirms the transaction, amount, and currency.

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

Keycloak is being used as the identity provider. Services are being configured as OAuth2 Resource Servers so Spring Security can validate bearer JWTs using Keycloak's issuer metadata/JWK endpoint. Keycloak realm roles are mapped into Spring Security authorities for role-based authorization.

The broader security roadmap includes:

* Complete and verify Keycloak authentication across protected services
* Consistent authorization and role mapping across services
* Decide how local application user/profile records are created or synchronized from the Keycloak subject (`sub`)
* Secure JWT validation and issuer configuration
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
├── PostgreSQL 17 (service databases)
├── RabbitMQ 4 (management image)
└── Keycloak (authentication provider; local setup/configuration)
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
| Identity and Security  | Keycloak, Spring Security OAuth2 Resource Server, JWT |
| Persistence            | Spring Data JPA, Hibernate               |
| Database               | PostgreSQL                               |
| API Communication      | REST APIs                                |
| Messaging              | RabbitMQ                                 |
| Email                  | Spring `JavaMailSender`                  |
| Payment Gateway        | SSLCommerz — planned                     |
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

KEYCLOAK_ISSUER_URI
KEYCLOAK_JWK_SET_URI

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

### 5. Configure Keycloak authentication

Configure the Keycloak realm, clients, users, and roles required by the application. Each Spring Boot resource server must use the correct Keycloak issuer URI (and, where explicitly configured, the corresponding JWK Set URI). The local issuer commonly follows this pattern:

```text
http://localhost:8080/realms/<realm-name>
```

Use the actual realm and deployment URL from your environment. Do not hardcode production URLs or commit client secrets and other credentials.

**Note:** Exact service ports, API endpoints, Compose commands, and environment-variable names should be documented from the current implementation rather than assumed from this overview.

---

## 🗺️ Development Roadmap

### Phase 1 — Core Backend Services

* [x] Implement User Service foundation and user/profile persistence
* [x] Implement Restaurant Service
* [x] Implement Order Service
* [x] Implement Notification Service foundation
* [x] Integrate RabbitMQ with the order workflow
* [x] Establish order-created event consumption and email delivery
* [x] Run the core services with PostgreSQL and RabbitMQ in the local containerized environment
* [ ] Expand automated test coverage across services
* [ ] Standardize validation and error responses
* [ ] Document service APIs and configuration

### Phase 2 — Authentication and Authorization (Current Priority)

* [x] Set up Keycloak realm and create test users
* [x] Configure Spring Security OAuth2 Resource Server to validate Keycloak JWTs
* [x] Configure issuer/JWK-based token verification
* [x] Implement Keycloak realm-role to Spring Security authority conversion
* [ ] Finalize authorization rules and test customer / restaurant-owner / delivery roles
* [ ] Apply and verify consistent JWT validation in every protected service
* [ ] Decide and implement just-in-time local user creation/profile synchronization using the Keycloak `sub` claim
* [ ] Verify service-to-service authentication for trusted internal calls
* [ ] Remove obsolete custom JWT / Google OAuth2 authentication code where no longer needed

### Phase 3 — Reliable Distributed Communication

* [x] Establish synchronous REST communication between core services
* [x] Configure order exchange and routing-key conventions
* [x] Connect order-created events to the notification workflow
* [ ] Complete and test status-update and cancellation consumers
* [ ] Add idempotent event processing
* [ ] Configure retries and dead-letter queues
* [ ] Improve timeout and downstream-failure handling
* [ ] Evaluate the transactional outbox pattern for reliable event publication

### Phase 4 — Payment Processing (Next Major Feature)

* [ ] Define payment entities, transaction attempts, and payment state machine
* [ ] Create the Payment Service and PostgreSQL schema
* [ ] Implement secure order lookup/ownership and authoritative amount verification
* [ ] Integrate SSLCommerz sandbox session initiation and hosted checkout
* [ ] Implement success, failure, and cancellation return endpoints
* [ ] Implement the IPN endpoint and server-side transaction validation
* [ ] Verify transaction ID, amount, currency, and gateway validation status
* [ ] Add idempotency keys for payment initiation
* [ ] Protect against duplicate IPN/callback processing and concurrent payment attempts
* [ ] Model pending, successful, failed, cancelled, and unknown outcomes safely
* [ ] Publish payment events through RabbitMQ
* [ ] Implement the transactional outbox and idempotent event consumption
* [ ] Add reconciliation for uncertain/time-out transactions
* [ ] Add refund support after the primary flow is tested
* [ ] Test successful, failed, cancelled, duplicated, delayed, and interrupted payment scenarios

### Phase 5 — Containerization and Local Infrastructure

* [ ] Standardize Dockerfiles across services
* [ ] Finalize Docker Compose configuration
* [ ] Externalize configuration and secrets
* [ ] Add appropriate container health checks
* [ ] Optimize image sizes and build caching
* [ ] Test clean startup and recovery behavior

### Phase 6 — Kubernetes Deployment

* [ ] Provision a kubeadm cluster
* [ ] Configure namespaces and networking
* [ ] Deploy application services
* [ ] Configure Kubernetes Services and DNS
* [ ] Configure Ingress
* [ ] Configure ConfigMaps and Secrets
* [ ] Add health probes and resource limits
* [ ] Implement and test rolling deployments
* [ ] Validate scaling and recovery behavior

### Phase 7 — Terraform and Cloud Infrastructure

* [ ] Define reusable Terraform configurations
* [ ] Configure networking and compute resources
* [ ] Configure remote state and state locking
* [ ] Provision infrastructure through Terraform
* [ ] Automate cluster infrastructure where appropriate
* [ ] Document infrastructure costs and teardown procedures

### Phase 8 — CI/CD and Security

* [ ] Build GitHub Actions workflows
* [ ] Run automated tests during pull requests
* [ ] Build and version container images
* [ ] Publish images to a container registry
* [ ] Integrate SonarQube
* [ ] Integrate Trivy
* [ ] Secure deployment credentials
* [ ] Automate Kubernetes deployments
* [ ] Verify deployments through health checks

### Phase 9 — Production Readiness

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

## 🎯 Immediate Development Focus

The current implementation order is intentionally focused. Avoid starting Kubernetes or Terraform deployment work before the application security and payment workflows are stable.

1. **Finish Keycloak integration:** complete role-based authorization, validate tokens in each service, and settle how Keycloak identities map to local user records.
2. **Build the Payment Service:** implement the payment data model and state machine, then integrate SSLCommerz sandbox checkout and server-side validation.
3. **Make payment events reliable:** add idempotency, duplicate IPN protection, a transactional outbox, and idempotent RabbitMQ consumers.
4. **Test failure scenarios:** cover gateway timeouts, duplicate callbacks, failed payments, delayed notifications, and service restarts.
5. **Return to platform engineering:** strengthen automated tests and local container behavior, then move to Kubernetes, Terraform, and GitHub Actions.

### Payment architecture decisions

* The Payment Service owns payment records and payment status; the Order Service owns order records and order status.
* The Payment Service must not write directly to the Order Service database.
* The payable amount must come from trusted order data, never from a frontend-supplied amount.
* A browser redirect is not proof of payment. Validate the transaction with SSLCommerz from the backend before marking it successful.
* Publish payment outcomes through RabbitMQ; use an outbox to avoid losing events between database commits and message publication.
* Treat timeouts as potentially uncertain outcomes and reconcile with the gateway before creating another charge.

---

## 📊 Current Project Status

QuickMunch has progressed beyond its initial single-service stage.

### Implemented foundations

* User Service with user/profile persistence and Keycloak-based JWT authentication integration in progress
* Keycloak realm, test-user setup, issuer/JWK configuration, and role conversion work
* Restaurant Service
* Order Service with order validation and lifecycle handling
* RabbitMQ order-event integration (`order.exchange` and order routing keys)
* Notification Service consuming order-created events and sending emails
* Local Docker environment using PostgreSQL 17 and RabbitMQ 4

### Major work remaining

* Finish Keycloak authorization and cross-service security verification
* Payment Service and SSLCommerz integration
* Stronger automated testing and distributed failure handling
* Kubernetes deployment and Ingress
* Terraform-managed infrastructure
* Automated CI/CD and security scanning
* Monitoring, observability, and operational hardening

The project is under active development. Completed application features should not be confused with production deployment or operational readiness; those are separate engineering milestones.

---

## 📜 License

No license has been specified yet. Until a license is added to the repository, the project's reuse and redistribution terms should not be assumed.
