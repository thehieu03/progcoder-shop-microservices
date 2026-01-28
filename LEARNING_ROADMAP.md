# 🎓 Learning Roadmap - Build Microservices E-Commerce from Scratch

## 📚 Mục tiêu

Học và hiểu hệ thống microservices bằng cách tự code từng bước, từ đơn giản đến phức tạp.

---

## 🗺️ Roadmap Overview

```
Phase 1: Foundation (Week 1-2)
├── Step 1: Setup Infrastructure
├── Step 2: Shared Building Blocks
└── Step 3: Simple API Service (Catalog)

Phase 2: Core Services (Week 3-4)
├── Step 4: Basket Service (with Redis Cache)
├── Step 5: Order Service
└── Step 6: Inventory Service

Phase 3: Advanced Features (Week 5-6)
├── Step 7: Event-Driven Architecture (RabbitMQ)
├── Step 8: Search Service (Elasticsearch)
└── Step 9: API Gateway (YARP)

Phase 4: Frontend & Integration (Week 7-8)
├── Step 10: Frontend Apps
├── Step 11: Authentication (Keycloak)
└── Step 12: Complete Integration
```

---

## 📋 Phase 1: Foundation (Week 1-2)

### Step 1: Setup Infrastructure ⚙️

**Mục tiêu**: Setup môi trường phát triển và infrastructure services

**Cần làm**:

1. ✅ Install .NET 8 SDK
2. ✅ Install Docker Desktop
3. ✅ Setup PostgreSQL, MongoDB, Redis containers
4. ✅ Create solution structure

**Code to write**:

```bash
# 1. Create solution
dotnet new sln -n ProGShopMicroservices

# 2. Create infrastructure docker-compose
# File: docker-compose.infrastructure.yml
# - PostgreSQL
# - MongoDB
# - Redis
# - RabbitMQ (for later)

# 3. Test infrastructure
docker-compose -f docker-compose.infrastructure.yml up -d
```

**Files to create**:

- `docker-compose.infrastructure.yml`
- `.env.example`

**Kiến thức học được**:

- Docker Compose basics
- Database setup
- Environment configuration

---

### Step 2: Shared Building Blocks 🧱

**Mục tiêu**: Tạo các shared libraries dùng chung

**Cần làm**:

1. ✅ Create `Shared.Common` project
2. ✅ Create `Shared.BuildingBlocks` project
3. ✅ Implement base classes (Entity, Aggregate, ValueObject)
4. ✅ Implement MediatR interfaces (ICommand, IQuery, ICommandHandler)
5. ✅ Implement exception handling
6. ✅ Implement API response models

**Code to write**:

```bash
# Create projects
dotnet new classlib -n Shared.Common -o src/Shared/Common
dotnet new classlib -n Shared.BuildingBlocks -o src/Shared/BuildingBlocks

# Add to solution
dotnet sln add src/Shared/Common/Shared.Common.csproj
dotnet sln add src/Shared/BuildingBlocks/Shared.BuildingBlocks.csproj
```

**Files to create**:

```
src/Shared/Common/
├── Models/
│   ├── ApiResponse.cs
│   ├── Context/UserContext.cs
│   └── Results/
├── Constants/
│   ├── MessageCode.cs
│   └── AuthorizeRole.cs
└── Configurations/

src/Shared/BuildingBlocks/
├── Abstractions/
│   ├── Entity.cs
│   ├── Aggregate.cs
│   └── ValueObject.cs
├── CQRS/
│   ├── ICommand.cs
│   ├── IQuery.cs
│   ├── ICommandHandler.cs
│   └── IQueryHandler.cs
├── Exceptions/
│   └── ClientValidationException.cs
└── Validators/
    └── CustomValidators.cs
```

**Kiến thức học được**:

- Clean Architecture principles
- CQRS pattern basics
- DDD concepts (Entity, Aggregate, ValueObject)
- Shared library design

---

### Step 3: Simple API Service - Catalog 📦

**Mục tiêu**: Tạo microservice đầu tiên với CRUD operations

**Cần làm**:

1. ✅ Create Catalog service structure (Clean Architecture)
2. ✅ Setup Domain layer (Product Entity)
3. ✅ Setup Application layer (Commands/Queries)
4. ✅ Setup Infrastructure layer (PostgreSQL + EF Core)
5. ✅ Setup API layer (Minimal API với Carter)
6. ✅ Implement CRUD operations

**Code to write**:

```bash
# Create Catalog service structure
mkdir -p src/Services/Catalog
cd src/Services/Catalog

# Domain layer
dotnet new classlib -n Catalog.Domain -o Core/Catalog.Domain
dotnet new classlib -n Catalog.Application -o Core/Catalog.Application
dotnet new classlib -n Catalog.Infrastructure -o Core/Catalog.Infrastructure
dotnet new webapi -n Catalog.Api -o Api/Catalog.Api

# Add references
cd Core/Catalog.Application
dotnet add reference ../Catalog.Domain/Catalog.Domain.csproj

cd ../Catalog.Infrastructure
dotnet add reference ../Catalog.Application/Catalog.Application.csproj
dotnet add reference ../Catalog.Domain/Catalog.Domain.csproj

cd ../../Api/Catalog.Api
dotnet add reference ../Core/Catalog.Application/Catalog.Application.csproj
dotnet add reference ../Core/Catalog.Infrastructure/Catalog.Infrastructure.csproj
```

**Files to create**:

```
Catalog.Domain/
├── Entities/
│   └── ProductEntity.cs
├── ValueObjects/
│   └── ProductPrice.cs
└── Events/
    └── ProductCreatedDomainEvent.cs

Catalog.Application/
├── Features/Product/
│   ├── Commands/
│   │   ├── CreateProductCommand.cs
│   │   └── CreateProductCommandHandler.cs
│   └── Queries/
│       ├── GetProductQuery.cs
│       └── GetProductQueryHandler.cs
├── Dtos/Products/
│   └── CreateProductDto.cs
└── Repositories/
    └── IProductRepository.cs

Catalog.Infrastructure/
├── Data/
│   ├── CatalogDbContext.cs
│   └── Repositories/
│       └── ProductRepository.cs
└── DependencyInjection.cs

Catalog.Api/
├── Endpoints/
│   └── CreateProduct.cs
├── Program.cs
└── appsettings.json
```

**Implementation order**:

1. **Domain Layer First**:

   - `ProductEntity` với properties cơ bản (Id, Name, Price, Description)
   - Domain events (ProductCreatedDomainEvent)

2. **Application Layer**:

   - `CreateProductCommand` + `CreateProductCommandHandler`
   - `GetProductQuery` + `GetProductQueryHandler`
   - DTOs và Validators

3. **Infrastructure Layer**:

   - EF Core DbContext
   - ProductRepository implementation
   - Database migrations

4. **API Layer**:
   - Carter endpoints
   - Dependency injection setup
   - API routes

**Kiến thức học được**:

- Clean Architecture layers
- CQRS pattern implementation
- EF Core setup
- Minimal API với Carter
- Dependency Injection

**Test**:

```bash
# Run Catalog API
cd src/Services/Catalog/Api/Catalog.Api
dotnet run

# Test endpoints
curl -X POST http://localhost:5001/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":999.99,"description":"Gaming laptop"}'
```

---

## 📋 Phase 2: Core Services (Week 3-4)

### Step 4: Basket Service 🛒

**Mục tiêu**: Tạo shopping cart service với Redis caching

**Cần làm**:

1. ✅ Create Basket service structure
2. ✅ Setup MongoDB for basket storage
3. ✅ Setup Redis for caching
4. ✅ Implement cache-aside pattern
5. ✅ Integrate với Catalog service (gRPC)

**Code to write**:

```bash
# Create Basket service
mkdir -p src/Services/Basket
# Similar structure as Catalog
```

**Key features**:

- `ShoppingCartEntity` (MongoDB)
- `CachedBasketRepository` (Redis decorator)
- `StoreBasketCommand` (fetch product data từ Catalog)
- `GetBasketQuery`

**Kiến thức học được**:

- MongoDB integration
- Redis caching
- Cache-aside pattern
- Decorator pattern
- gRPC client calls

---

### Step 5: Order Service 📝

**Mục tiêu**: Tạo order processing service

**Cần làm**:

1. ✅ Create Order service structure
2. ✅ Setup SQL Server
3. ✅ Implement order creation
4. ✅ Implement order status updates
5. ✅ Integrate với Basket và Inventory

**Key features**:

- `OrderEntity` (SQL Server)
- `CreateOrderCommand`
- `UpdateOrderStatusCommand`
- Order state machine

**Kiến thức học được**:

- SQL Server integration
- Complex domain logic
- State management
- Service integration

---

### Step 6: Inventory Service 📊

**Mục tiêu**: Tạo inventory management service

**Cần làm**:

1. ✅ Create Inventory service structure
2. ✅ Setup MySQL
3. ✅ Implement stock management
4. ✅ Implement stock reservation
5. ✅ Publish events khi stock changes

**Key features**:

- `InventoryItemEntity` (MySQL)
- `ReserveStockCommand`
- `UpdateStockCommand`
- Domain events

**Kiến thức học được**:

- MySQL integration
- Stock management logic
- Event publishing

---

## 📋 Phase 3: Advanced Features (Week 5-6)

### Step 7: Event-Driven Architecture 🔔

**Mục tiêu**: Implement async communication với RabbitMQ

**Cần làm**:

1. ✅ Setup RabbitMQ
2. ✅ Implement MassTransit
3. ✅ Create integration events
4. ✅ Implement Outbox pattern
5. ✅ Implement event handlers

**Code to write**:

```csharp
// Integration Event
public record ProductUpdatedIntegrationEvent(
    Guid ProductId,
    string Name,
    decimal Price);

// Event Handler
public class ProductUpdatedEventHandler :
    IConsumer<ProductUpdatedIntegrationEvent>
{
    public async Task Consume(...)
    {
        // Handle event
    }
}
```

**Kiến thức học được**:

- Event-Driven Architecture
- RabbitMQ
- MassTransit
- Outbox/Inbox patterns
- Async communication

---

### Step 8: Search Service 🔍

**Mục tiêu**: Implement full-text search với Elasticsearch

**Cần làm**:

1. ✅ Setup Elasticsearch
2. ✅ Create search index
3. ✅ Implement product search
4. ✅ Sync data từ Catalog service

**Key features**:

- Elasticsearch client setup
- Product index mapping
- Search queries
- Data synchronization

**Kiến thức học được**:

- Elasticsearch
- Full-text search
- Data synchronization
- Search optimization

---

### Step 9: API Gateway 🌐

**Mục tiêu**: Implement YARP API Gateway

**Cần làm**:

1. ✅ Setup YARP
2. ✅ Configure routes
3. ✅ Implement authentication
4. ✅ Implement rate limiting

**Kiến thức học được**:

- API Gateway pattern
- YARP configuration
- Request routing
- Authentication forwarding

---

## 📋 Phase 4: Frontend & Integration (Week 7-8)

### Step 10: Frontend Apps 💻

**Mục tiêu**: Create React frontend applications

**Cần làm**:

1. ✅ Setup React app (App.Store)
2. ✅ Setup React app (App.Admin)
3. ✅ Implement API integration
4. ✅ Implement state management (Redux)

**Kiến thức học được**:

- React development
- Redux Toolkit
- API integration
- Frontend architecture

---

### Step 11: Authentication 🔐

**Mục tiêu**: Implement Keycloak authentication

**Cần làm**:

1. ✅ Setup Keycloak
2. ✅ Configure realms và clients
3. ✅ Integrate với frontend
4. ✅ Implement JWT validation

**Kiến thức học được**:

- OAuth 2.0 / OpenID Connect
- Keycloak setup
- JWT tokens
- Role-based authorization

---

### Step 12: Complete Integration 🎯

**Mục tiêu**: Integrate tất cả services và test end-to-end

**Cần làm**:

1. ✅ Complete all integrations
2. ✅ Add monitoring (Prometheus, Grafana)
3. ✅ Add logging (Serilog, Loki)
4. ✅ Add tracing (OpenTelemetry)
5. ✅ End-to-end testing

**Kiến thức học được**:

- System integration
- Observability
- Monitoring
- Distributed tracing

---

## 🎯 Learning Tips

### 1. Start Small

- Bắt đầu với Catalog service (đơn giản nhất)
- Hiểu rõ một service trước khi chuyển sang service khác

### 2. Test Each Step

- Test từng component sau khi code xong
- Đảm bảo hiểu cách nó hoạt động

### 3. Read Existing Code

- So sánh code của bạn với code trong project
- Học từ implementation có sẵn

### 4. Document Your Learning

- Ghi chú lại những gì học được
- Giải thích tại sao làm như vậy

### 5. Iterate

- Không cần perfect ngay lần đầu
- Refactor và improve dần dần

---

## 📚 Resources

### Documentation

- [.NET Documentation](https://learn.microsoft.com/dotnet/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [DDD](https://martinfowler.com/bliki/DomainDrivenDesign.html)

### Tools

- [Postman](https://www.postman.com/) - API testing
- [DBeaver](https://dbeaver.io/) - Database management
- [Redis Insight](https://redis.com/redis-enterprise/redis-insight/) - Redis GUI
- [Elasticsearch Head](https://github.com/mobz/elasticsearch-head) - ES GUI

---

## ✅ Checklist

### Phase 1: Foundation

- [ ] Infrastructure setup
- [ ] Shared building blocks
- [ ] Catalog service (CRUD)

### Phase 2: Core Services

- [ ] Basket service (with Redis)
- [ ] Order service
- [ ] Inventory service

### Phase 3: Advanced Features

- [ ] Event-driven architecture
- [ ] Search service
- [ ] API Gateway

### Phase 4: Integration

- [ ] Frontend apps
- [ ] Authentication
- [ ] Complete integration

---

## 🚀 Next Steps

1. **Start with Step 1**: Setup infrastructure
2. **Follow the order**: Mỗi step build trên step trước
3. **Ask questions**: Đừng ngại hỏi khi không hiểu
4. **Practice**: Code nhiều để hiểu sâu hơn

**Good luck! 🎉**
