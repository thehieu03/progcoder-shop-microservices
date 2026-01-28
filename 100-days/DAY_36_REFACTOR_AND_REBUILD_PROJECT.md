# 📘 Day 36: Refactor & Rebuild Project - Code Lại Toàn Bộ Project

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Code lại toàn bộ project từ đầu với kiến thức đã học, áp dụng best practices và refactor code hiện tại.

Bạn sẽ:

1.  **Review**: Đánh giá lại toàn bộ codebase hiện tại.
2.  **Refactor**: Cải thiện code quality, structure, và patterns.
3.  **Rebuild**: Code lại các components quan trọng với best practices.
4.  **Testing**: Verify toàn bộ hệ thống hoạt động đúng.

**Thời gian ước tính**: 4-6 giờ (có thể chia thành nhiều session).

---

## ✅ Checklist - Đánh dấu khi hoàn thành

### Phase 1: Review & Analysis (Bước 1-2)

- [ ] Review toàn bộ cấu trúc project
- [ ] Identify các vấn đề và code smells
- [ ] List các components cần refactor
- [ ] Document findings và improvement plan

### Phase 2: Shared Components Refactor (Bước 3-5)

- [ ] Refactor BuildingBlocks (CQRS, Behaviors, Exceptions)
- [ ] Refactor Common (Extensions, Helpers, Configurations)
- [ ] Verify và fix missing components từ MISSING_COMPONENTS.md
- [ ] Improve error handling và validation
- [ ] Standardize API responses

### Phase 3: Catalog Service Refactor (Bước 6-8)

- [ ] Review Domain entities và business logic
- [ ] Refactor Application layer (Commands, Queries, Handlers)
- [ ] Improve Infrastructure layer (Repositories, Services)
- [ ] Refactor API endpoints
- [ ] Update tests

### Phase 4: Order Service Refactor (Bước 9-11)

- [ ] Review Order domain model
- [ ] Refactor Order commands và queries
- [ ] Improve Order API endpoints
- [ ] Verify integration với các services khác

### Phase 5: Infrastructure & Configuration (Bước 12-13)

- [ ] Review Docker Compose configuration
- [ ] Verify database migrations
- [ ] Check environment variables
- [ ] Review API Gateway configuration

### Phase 6: Testing & Verification (Bước 14)

- [ ] Build toàn bộ solution
- [ ] Run all services
- [ ] Test end-to-end flows
- [ ] Verify Swagger documentation
- [ ] Check logs và error handling

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Review Project Structure (30 phút)

#### 1.1. Kiểm tra cấu trúc thư mục

```bash
# Review toàn bộ cấu trúc
tree /F src/ > project_structure.txt

# Check các services
ls src/Services/
ls src/Shared/
ls src/Apps/
```

#### 1.2. Review Solution File

Mở `progcoder-shop-microservices.sln` và verify:
- Tất cả projects đã được include
- Project references đúng
- Build order hợp lý

#### 1.3. Review Dependencies

Kiểm tra `Directory.Packages.props` và `Directory.Build.props`:
- Package versions consistent
- No deprecated packages
- All necessary packages included

### Bước 2: Identify Issues & Create Improvement Plan (30 phút)

Tạo file `REFACTOR_PLAN.md` để document:

```markdown
# Refactor Plan - Day 36

## Issues Found:
1. [ ] Missing components (check MISSING_COMPONENTS.md)
2. [ ] Code duplication
3. [ ] Inconsistent naming conventions
4. [ ] Missing error handling
5. [ ] Missing validation
6. [ ] Missing logging
7. [ ] Missing documentation

## Improvements Needed:
1. [ ] Standardize exception handling
2. [ ] Improve validation patterns
3. [ ] Add missing unit tests
4. [ ] Refactor repository implementations
5. [ ] Improve API response consistency
6. [ ] Add missing extension methods
7. [ ] Fix configuration issues
```

### Bước 3: Fix Missing Components (60 phút)

Dựa vào `MISSING_COMPONENTS.md`, tạo các components còn thiếu:

#### 3.1. ValidationBehavior & LoggingBehavior

Nếu chưa có, tạo theo hướng dẫn trong `MISSING_COMPONENTS.md`:

```bash
# Verify files exist
ls src/Shared/BuildingBlocks/Behaviors/ValidationBehavior.cs
ls src/Shared/BuildingBlocks/Behaviors/LoggingBehavior.cs
```

#### 3.2. Actor Value Object

```bash
# Verify
ls src/Shared/Common/ValueObjects/Actor.cs
```

#### 3.3. String Extensions

```bash
# Verify
ls src/Shared/Common/Extensions/StringExtensions.cs
```

#### 3.4. MessageCode Constants

Mở `src/Shared/Common/Constants/MessageCode.cs` và verify tất cả constants cần thiết đã có.

### Bước 4: Refactor BuildingBlocks (45 phút)

#### 4.1. Review CQRS Interfaces

File: `src/Shared/BuildingBlocks/CQRS/`

```csharp
// Verify ICommand, ICommandHandler
// Verify IQuery, IQueryHandler
// Ensure consistent naming và structure
```

#### 4.2. Review Behaviors

```csharp
// ValidationBehavior - ensure proper error messages
// LoggingBehavior - ensure proper log levels
// Add performance logging if needed
```

#### 4.3. Review Exceptions

File: `src/Shared/BuildingBlocks/Exceptions/`

Verify:
- CustomExceptionHandler
- NotFoundException
- UnauthorizedException
- InternalServerException
- ClientValidationException

### Bước 5: Refactor Common Components (45 phút)

#### 5.1. Review Extensions

```bash
# Check all extension methods
ls src/Shared/Common/Extensions/
```

Verify:
- StringExtensions (Slugify, etc.)
- EnumExtension
- HashExtension
- NumericExtension
- QueryableExtension

#### 5.2. Review Configurations

```bash
# Check all configuration classes
ls src/Shared/Common/Configurations/
```

Verify consistency trong naming và structure.

#### 5.3. Review Models

```bash
# Check API response models
ls src/Shared/Common/Models/
```

Verify:
- PaginationRequest
- ApiResponse models
- ErrorResult

### Bước 6: Refactor Catalog Domain (60 phút)

#### 6.1. Review Product Entity

File: `src/Services/Catalog/Core/Catalog.Domain/Entities/ProductEntity.cs`

Verify:
- Business logic methods
- Domain events
- Value objects
- Validation rules

#### 6.2. Review Domain Events

```bash
ls src/Services/Catalog/Core/Catalog.Domain/Events/
```

Ensure:
- Events properly defined
- Event handlers registered
- Integration events mapped correctly

#### 6.3. Review Value Objects

```bash
ls src/Services/Catalog/Core/Catalog.Domain/ValueObjects/
```

### Bước 7: Refactor Catalog Application Layer (60 phút)

#### 7.1. Review Commands

```bash
ls src/Services/Catalog/Core/Catalog.Application/Features/Product/Commands/
```

Verify:
- Command validation
- Command handlers
- Error handling
- Logging

#### 7.2. Review Queries

```bash
ls src/Services/Catalog/Core/Catalog.Application/Features/Product/Queries/
```

Verify:
- Query handlers
- Pagination
- Filtering
- Mapping

#### 7.3. Review DTOs

```bash
ls src/Services/Catalog/Core/Catalog.Application/Dtos/
```

Ensure:
- Consistent naming
- Proper validation attributes
- Complete mapping profiles

### Bước 8: Refactor Catalog Infrastructure (45 phút)

#### 8.1. Review Repository Implementation

File: `src/Services/Catalog/Core/Catalog.Infrastructure/Repositories/`

Verify:
- Repository pattern correctly implemented
- Unit of Work pattern
- Transaction handling
- Error handling

#### 8.2. Review Services

```bash
ls src/Services/Catalog/Core/Catalog.Infrastructure/Services/
```

Verify:
- MinIO service
- Seed data service
- External service integrations

### Bước 9: Refactor Catalog API (45 phút)

#### 9.1. Review Endpoints

```bash
ls src/Services/Catalog/Api/Catalog.Api/Endpoints/
```

Verify:
- Consistent endpoint structure
- Proper Swagger documentation
- Authorization policies
- Error responses

#### 9.2. Review API Routes

File: `src/Services/Catalog/Api/Catalog.Api/Constants/ApiRoutes.cs`

Ensure:
- Consistent route naming
- Proper route organization
- RESTful conventions

### Bước 10: Refactor Order Service (90 phút)

#### 10.1. Review Order Domain

```bash
ls src/Services/Order/Core/Order.Domain/
```

Review:
- Order entity
- OrderItem entity
- Domain events
- Business logic

#### 10.2. Refactor Order Commands

```bash
ls src/Services/Order/Core/Order.Application/Features/Order/Commands/
```

Verify:
- CreateOrderCommand
- UpdateOrderCommand
- DeleteOrderCommand
- Proper validation

#### 10.3. Refactor Order Queries

```bash
ls src/Services/Order/Core/Order.Application/Features/Order/Queries/
```

Verify:
- GetOrderByIdQuery
- GetOrdersByCustomerQuery
- GetAllOrdersQuery (nếu có)
- Pagination support

#### 10.4. Refactor Order API

```bash
ls src/Services/Order/Api/Order.Api/Endpoints/
```

Ensure:
- All endpoints properly implemented
- Swagger documentation
- Authorization

### Bước 11: Review Integration Points (30 phút)

#### 11.1. Review gRPC Services

```bash
ls src/Services/*/Api/*.Grpc/
```

Verify:
- gRPC interceptors
- API key validation
- Error handling

#### 11.2. Review Event Handlers

```bash
ls src/Services/*/Worker/*.Consumer/
```

Verify:
- Integration event handlers
- Outbox processors
- Error handling và retry logic

### Bước 12: Review Infrastructure Configuration (30 phút)

#### 12.1. Review Docker Compose

```bash
# Check infrastructure services
cat docker-compose.infrastructure.yml

# Check application services
cat docker-compose.yml
```

Verify:
- All services properly configured
- Environment variables
- Network configuration
- Volume mounts

#### 12.2. Review Environment Variables

```bash
# Check .env.sample
cat .env.sample

# Verify all required variables documented
```

### Bước 13: Review Database Migrations (30 phút)

#### 13.1. Check Migrations

```bash
# For each service with database
ls src/Services/Catalog/Core/Catalog.Infrastructure/Migrations/
ls src/Services/Order/Core/Order.Infrastructure/Migrations/
```

Verify:
- Migrations properly named
- No missing migrations
- Seed data included if needed

#### 13.2. Test Migrations

```bash
# Test migration scripts
./run-migration-windows.bat
# or
./run-migration-linux.sh
```

### Bước 14: Build & Test Everything (60 phút)

#### 14.1. Clean & Build Solution

```bash
# Clean solution
dotnet clean

# Restore packages
dotnet restore

# Build solution
dotnet build --no-restore
```

#### 14.2. Run All Services

```bash
# Start infrastructure
docker-compose -f docker-compose.infrastructure.yml up -d

# Wait for services to be ready
# Then start application services
docker-compose up -d
```

#### 14.3. Test Endpoints

1. **Catalog Service**:
   - `GET /catalog-service/api/products` - List products
   - `GET /catalog-service/api/products/{id}` - Get product by ID
   - `POST /catalog-service/api/products` - Create product
   - `PUT /catalog-service/api/products/{id}` - Update product
   - `DELETE /catalog-service/api/products/{id}` - Delete product

2. **Order Service**:
   - `GET /order-service/api/orders/{id}` - Get order by ID
   - `GET /order-service/api/orders/me` - Get my orders
   - `POST /order-service/api/orders` - Create order

3. **Verify Swagger**:
   - Open Swagger UI for each service
   - Test endpoints through Swagger

#### 14.4. Check Logs

```bash
# Check service logs
docker-compose logs -f catalog-api
docker-compose logs -f order-api

# Check for errors
docker-compose logs | grep -i error
```

#### 14.5. Verify Health Checks

```bash
# Check health endpoints
curl http://localhost:5001/health
curl http://localhost:5005/health
```

---

## 🎯 Best Practices Checklist

Sau khi refactor, đảm bảo:

### Code Quality

- [ ] No code duplication
- [ ] Consistent naming conventions
- [ ] Proper error handling everywhere
- [ ] Comprehensive logging
- [ ] Input validation on all endpoints
- [ ] Proper use of async/await

### Architecture

- [ ] Clean Architecture layers respected
- [ ] DDD principles followed
- [ ] CQRS pattern properly implemented
- [ ] Repository pattern correctly used
- [ ] Dependency injection properly configured

### Security

- [ ] Authorization on all endpoints
- [ ] API key validation for gRPC
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] XSS prevention

### Performance

- [ ] Proper use of async/await
- [ ] Database queries optimized
- [ ] Caching where appropriate
- [ ] Pagination on list endpoints

### Documentation

- [ ] Swagger documentation complete
- [ ] Code comments where needed
- [ ] README updated
- [ ] API documentation clear

---

## 📝 Notes & Tips

### Refactoring Strategy

1. **Start Small**: Bắt đầu với Shared components, sau đó đến từng service
2. **Test Frequently**: Test sau mỗi refactor lớn
3. **Commit Often**: Commit sau mỗi phase hoàn thành
4. **Document Changes**: Ghi lại các thay đổi quan trọng

### Common Issues to Fix

1. **Missing null checks**: Thêm null checks ở tất cả nơi cần thiết
2. **Inconsistent error messages**: Standardize error messages
3. **Missing validation**: Thêm FluentValidation cho tất cả commands/queries
4. **Poor logging**: Improve logging với proper log levels
5. **Hard-coded values**: Move to configuration

### Testing Strategy

1. **Unit Tests**: Test business logic
2. **Integration Tests**: Test API endpoints
3. **E2E Tests**: Test complete flows
4. **Manual Testing**: Test through Swagger

---

## 🚀 Next Steps After Day 36

Sau khi hoàn thành Day 36, bạn có thể:

1. **Day 37**: Create UpdateOrder Command & API Endpoint
2. **Day 38**: Create CancelOrder Command & API Endpoint
3. **Day 39**: Create Order Status Management
4. **Day 40**: Test End-to-End Order Service

Hoặc tiếp tục với các services khác:
- Basket Service
- Inventory Service
- Discount Service
- Notification Service

---

## 📚 Resources

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [DDD](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [CQRS](https://martinfowler.com/bliki/CQRS.html)
- [.NET Best Practices](https://docs.microsoft.com/en-us/dotnet/architecture/)

---

**Chúc bạn hoàn thành tốt Day 36! Đây là một ngày quan trọng để củng cố kiến thức và cải thiện code quality. 🚀**
