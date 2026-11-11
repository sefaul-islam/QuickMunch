# AGENTS.md — QuickMunch

## 1. Project Overview

QuickMunch is a microservices-based food delivery platform built using Java and Spring Boot.

The system supports:
- User registration and profile management.
- Restaurant management.
- Food menu management.
- Order placement and tracking.
- Asynchronous notifications.
- Authentication and role-based authorization.

The goal is to maintain a production-oriented, scalable and maintainable backend architecture.

## 2. Technology Stack

### Backend
- Java
- Spring Boot
- Spring Security
- Spring Data JPA / Hibernate
- Maven

### Infrastructure
- PostgreSQL
- Redis
- RabbitMQ
- Keycloak
- Docker
- Docker Compose

### Deployment (planned / evolving)
- Kubernetes
- Terraform
- GitHub Actions

Do not introduce additional technologies without a clear technical justification.

## 3. Microservices Architecture

Each microservice owns its business logic and data.

### user-service
Responsible for:
- User profiles.
- User information.
- Delivery addresses.
- User-related operations.

### restaurant-service
Responsible for:
- Restaurant management.
- Restaurant ownership.
- Food menu management.
- Restaurant-related operations.

### order-service
Responsible for:
- Order creation.
- Order lifecycle management.
- Order item management.
- Order validation.
- Order-related events.

### notification-service
Responsible for:
- Processing notification events.
- Sending email notifications.
- Handling asynchronous notification workflows.

Never directly access another service's database.

Never share JPA entities between microservices.

## 4. Authentication and Authorization

Keycloak is the central identity provider.

Rules:
- Use Spring Security OAuth2 Resource Server.
- Validate JWT tokens through the configured Keycloak issuer.
- Extract the Keycloak subject (`sub`) as the external user identifier.
- Use existing security utilities and JWT authentication converters.
- Follow the existing role-mapping conventions.
- Roles are mapped to Spring Security authorities using the `ROLE_` prefix.

Never implement a separate JWT authentication mechanism.

Never trust user IDs or roles supplied through request bodies when they should come from the authenticated principal.

Never expose credentials, access tokens or secrets in logs.

## 5. Inter-Service Communication

Use synchronous HTTP communication when an immediate response is required.

Use RabbitMQ for asynchronous communication.

Rules:
- Follow existing event naming conventions.
- Use the existing RabbitMQ exchanges and routing-key conventions.
- Keep event payloads independent of internal JPA entities.
- Design consumers to handle duplicate message delivery.
- Implement appropriate error handling and retry strategies.
- Avoid circular service dependencies.

Existing order event conventions:

Exchange:
- order.exchange

Routing keys:
- order.created
- order.status.updated
- order.cancelled

Do not introduce service discovery or an API Gateway unless explicitly requested.

## 6. Database Guidelines

- Each service owns its database and schema.
- Use Spring Data JPA for persistence.
- Use DTOs for API request and response models.
- Avoid exposing entities directly through controllers.
- Use transactions at the appropriate service-layer boundaries.
- Avoid remote HTTP calls inside database transactions.
- Prevent N+1 query problems.
- Use database migrations when a migration strategy is established.

Do not introduce cross-service foreign-key dependencies.

## 7. Coding Standards

- Follow existing package structures.
- Follow existing naming conventions.
- Prefer constructor injection.
- Keep controllers thin.
- Keep business logic inside service classes.
- Use DTOs for external communication.
- Avoid unnecessary abstractions.
- Avoid duplicated business logic.
- Use meaningful exception handling.
- Keep methods focused and readable.
- Prefer immutable objects where appropriate.

Follow the existing codebase conventions rather than introducing a completely new coding style.

## 8. API Development

- Follow REST conventions.
- Use appropriate HTTP status codes.
- Validate incoming requests using Jakarta Validation.
- Follow existing response structures.
- Use consistent exception handling.
- Never expose internal implementation details.
- Do not break existing API contracts without explicit approval.

## 9. Testing Requirements

Every new feature should include appropriate tests.

### Unit Testing
- Test business logic.
- Test validation and error scenarios.
- Mock external dependencies where appropriate.

### Integration Testing
- Verify database interactions.
- Verify API behavior.
- Verify RabbitMQ integration where relevant.
- Verify security and authorization behavior.

Never remove or weaken existing tests merely to make a build pass.

## 10. Docker and Infrastructure

- Follow existing Docker Compose conventions.
- Use environment variables for configuration.
- Never hardcode secrets.
- Keep container configurations reproducible.
- Use health checks where appropriate.
- Avoid unnecessary infrastructure changes.

For Kubernetes and Terraform changes, inspect the existing infrastructure configuration before modifying anything.

## 11. AI Agent Working Instructions

Before implementing any task:

1. Inspect the relevant existing code.
2. Understand the affected microservices.
3. Identify dependencies and API contracts.
4. Identify possible security and data consistency implications.
5. Propose an implementation plan.

During implementation:

- Modify only relevant files.
- Follow existing architecture and conventions.
- Avoid unnecessary dependencies.
- Do not silently change unrelated functionality.
- Do not assume missing business requirements.

After implementation:

1. Run relevant tests.
2. Run the application build.
3. Inspect the final Git diff.
4. Report modified files.
5. Report tests executed and their results.
6. Explain any remaining limitations.

Never claim a feature works without verification.

## 12. Restricted Changes

Do not perform these actions without explicit approval:

- Changing microservice boundaries.
- Introducing new infrastructure technologies.
- Changing authentication architecture.
- Changing existing API contracts.
- Deleting existing functionality.
- Modifying database structures with destructive consequences.
- Changing RabbitMQ event contracts.
- Introducing an API Gateway.
- Adding unnecessary dependencies.

When requirements are ambiguous, ask before making architectural assumptions.

## 13. Documentation

Keep documentation updated when introducing:
- New APIs.
- New RabbitMQ events.
- Database schema changes.
- Authentication changes.
- Infrastructure changes.
- New architectural decisions.

Refer to the documentation in `docs/` for detailed architecture and implementation specifications.