# 🎯 100 Days Feature-Based Learning Plan

## 📅 Overview

**100 days = 100 features = Complete Microservices System**

Kế hoạch học tập 100 ngày để xây dựng hệ thống E-Commerce Microservices hoàn chỉnh sử dụng .NET 8, Clean Architecture, DDD, CQRS.

---

## 📋 Phase 1: Foundation & Setup (Days 1-10)

### Day 1: Setup Environment Variables
- Setup biến môi trường cho development
- Configure .env files
- Setup configuration management

### Day 2: Setup Infrastructure - Databases
- Setup PostgreSQL, MongoDB, MySQL, SQL Server
- Configure Docker Compose
- Test database connections

### Day 3: Setup Infrastructure - Cache & Message Broker
- Setup Redis (caching)
- Setup RabbitMQ (message broker)
- Configure Docker Compose

### Day 4: Create Shared.Common - API Response Models
- Build reusable API response classes
- Standardize response format

### Day 5: Create Shared.Common - Constants & Messages
- Build error message constants
- Create message codes

### Day 6: Create Shared.BuildingBlocks - Entity Base Class
- Build base Entity class
- Implement common properties

### Day 7: Create Shared.BuildingBlocks - Aggregate Base Class
- Build base Aggregate class với Domain Events
- Implement domain event handling

### Day 8: Create CQRS Interfaces - Commands
- Build CQRS Command interfaces
- Define command pattern

### Day 9: Create CQRS Interfaces - Queries
- Build CQRS Query interfaces
- Define query pattern

### Day 10: Setup MediatR
- Configure MediatR for CQRS
- Setup pipeline behaviors

---

## 📋 Phase 2: Catalog Service - Core Features (Days 11-30)

### Day 11: Create Catalog Service Structure
- Setup Catalog service projects theo Clean Architecture
- Configure dependencies

### Day 12: Create Product Entity - Basic Properties
- Build Product domain entity với đầy đủ properties

### Day 13: Create Product Entity - Methods
- Add business logic methods to Product Entity

### Day 14: Create CreateProductDto
- Build Data Transfer Objects (DTOs) for Product

### Day 15: Create CreateProductCommand
- Build Command và Validator cho creating products

### Day 16: Create CreateProductCommandHandler - Part 1
- Create Command Handler class và setup dependencies

### Day 17: Create CreateProductCommandHandler - Part 2
- Complete Handler implementation và save to database

### Day 18: Setup EF Core for Catalog
- Configure Entity Framework Core cho Catalog service
- Setup Marten DocumentStore

### Day 19: Create Product Repository Interface
- Định nghĩa `IProductRepository` interface

### Day 20: Create Product Repository Implementation
- Implement `ProductRepository` class sử dụng Marten

### Day 21: Create Database Migration
- Tạo và apply database migration cho Catalog service

### Day 22: Create CreateProduct API Endpoint
- Tạo HTTP endpoint để tạo products sử dụng Carter (Minimal API)

### Day 23: Test CreateProduct Feature End-to-End
- Test complete flow của CreateProduct feature từ API endpoint đến database

### Day 24: Create GetProductById Query & API Endpoint
- Tạo HTTP GET endpoint để lấy product theo ID sử dụng CQRS Query pattern

### Day 25-30: Additional Product Features
- GetAllProducts với pagination
- UpdateProduct
- DeleteProduct
- SearchProducts
- Product filtering và sorting

---

## 📋 Phase 3: Additional Services (Days 31-60)

### Days 31-42: Order Service (đã hoàn thành theo tiến độ hiện tại)
- Core CRUD/query cho Order
- Update/Cancel/Status management
- Domain events + Outbox integration events
- E2E test + hardening cơ bản

### Days 43-60: Payment Service (thực tế hơn + khớp các file Day 43-48 hiện có)
- (Day 43) Initialize structure & Domain
- (Day 44) CreatePayment command + API
- (Day 45) GetPayment queries + APIs
- (Day 46) ProcessPayment + gateway abstraction
- (Day 47) VNPay integration
- (Day 48) Momo integration
- (Day 49-52) Webhook/IPN endpoints + signature verify + idempotency
- (Day 53-55) Payment domain events + outbox publishing (giống Order pattern)
- (Day 56-58) Reconciliation jobs + retry policy + dead-letter handling
- (Day 59-60) E2E Payment scenarios + hardening

### Days 61-75: Identity/User Service (Auth/RBAC tối thiểu để chạy E2E)
- (Day 61-63) Service structure + persistence
- (Day 64-66) Register/Login + JWT
- (Day 67-69) Roles (Admin/User) + policy/claims
- (Day 70-72) CurrentUser/Actor integration thống nhất giữa services
- (Day 73-75) E2E auth + hardening (token expiry, refresh nếu cần)

---

## 📋 Phase 4: Integration & Communication (Days 61-80)

### Days 76-95: Integration & Communication (Event-driven + Saga mức tối thiểu)
- (Day 76-78) Contract-first integration events (OrderCreated, PaymentCompleted, PaymentFailed)
- (Day 79-82) Subscribe/payment result -> update Order status (saga mức tối thiểu)
- (Day 83-86) Idempotency rules (consumer dedupe, message keys)
- (Day 87-90) Retry + backoff + poison message strategy
- (Day 91-92) API Gateway (nếu có nhu cầu) / hoặc chỉ reverse-proxy
- (Day 93-95) Integration tests cho event-driven flows

---

## 📋 Phase 5: Advanced Features (Days 81-100)

## 📋 Phase 5: MVP Finish Line (Days 96-110)

### Days 96-102: Observability baseline
- Health checks chuẩn cho từng service
- Structured logging + correlation id
- Metrics cơ bản (requests, errors, outbox lag)

### Days 103-110: Testing + Release baseline
- Unit tests cho Domain/Handlers quan trọng
- Integration tests (DB + message broker)
- E2E tests theo swagger scripts
- Docker compose “one command up” cho toàn hệ thống

---

## 📋 Phase 6: Production-Ready Extension (Days 111-140) (khuyến nghị)

### Days 111-120: CI/CD + Environments
- Build pipeline + lint + test
- Migrations strategy + config per env
- Secret management (không hardcode keys)

### Days 121-130: Security + Reliability
- Rate limit + request validation edges
- Payment webhook security hardening
- Audit logs cho admin actions

### Days 131-140: Deployment + Scaling
- Deployment strategy (VM/K8s tuỳ khả năng)
- Observability stack (Prometheus/Grafana/ELK/OpenTelemetry tuỳ chọn)
- Load test + tuning

---

## 🎯 Learning Goals

Sau 100 ngày, bạn sẽ:
- ✅ Hiểu rõ Microservices Architecture
- ✅ Thành thạo Clean Architecture & DDD
- ✅ Nắm vững CQRS pattern
- ✅ Biết cách implement Event-Driven Architecture
- ✅ Có kinh nghiệm với Docker & Kubernetes
- ✅ Hiểu về Distributed Systems
- ✅ Có project portfolio hoàn chỉnh

---

## 📝 Notes

- Mỗi ngày tập trung vào một feature cụ thể
- Code theo best practices
- Document mọi thứ bạn học được
- Test kỹ lưỡng từng feature
- Review và refactor code thường xuyên

---

**Chúc bạn thành công với hành trình 100 ngày! 🚀**
