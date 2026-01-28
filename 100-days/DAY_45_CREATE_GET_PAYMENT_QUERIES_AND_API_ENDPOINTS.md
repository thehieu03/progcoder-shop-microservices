# 📘 Day 45: Create GetPayment Queries & API Endpoints

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Tạo các Query để đọc dữ liệu Payment: lấy theo ID, lấy theo OrderId, và lấy danh sách Payments với pagination.

Bạn sẽ:

1.  **Queries**: Định nghĩa `GetPaymentByIdQuery`, `GetPaymentByOrderIdQuery`, `GetAllPaymentsQuery`.
2.  **Handlers**: Implement Query Handlers tương ứng.
3.  **Endpoints**: Expose 3 API endpoints GET.
4.  **Testing**: Verify qua Swagger.

**Thời gian ước tính**: 60-90 phút.

---

## ✅ Checklist - Đánh dấu khi hoàn thành

### Application Layer - Queries (Bước 1-3)

- [ ] Create `GetPaymentByIdQuery.cs` và Handler
- [ ] Create `GetPaymentByOrderIdQuery.cs` và Handler
- [ ] Create `GetAllPaymentsQuery.cs` với pagination và Handler
- [ ] Create `GetPaymentsFilter.cs` cho filtering

### Repository Layer (Bước 4)

- [ ] Update `IPaymentRepository.cs` với các methods mới
- [ ] Update `PaymentRepository.cs` implementation

### API Layer - Endpoints (Bước 5-7)

- [ ] Create `GetPaymentById.cs` endpoint
- [ ] Create `GetPaymentByOrderId.cs` endpoint
- [ ] Create `GetAllPayments.cs` endpoint (Admin)

### Testing (Bước 8)

- [ ] Test GetPaymentById với valid/invalid ID
- [ ] Test GetPaymentByOrderId
- [ ] Test GetAllPayments với pagination

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Create GetPaymentByIdQuery (15 phút)

#### 1.1. Create Query

Tạo file `src/Services/Payment/Core/Payment.Application/Features/Payment/Queries/GetPaymentByIdQuery.cs`:

```csharp
using BuildingBlocks.CQRS;
using Payment.Application.Dtos;

namespace Payment.Application.Features.Payment.Queries;

public record GetPaymentByIdQuery(Guid PaymentId) : IQuery<PaymentDto>;
```

#### 1.2. Create Handler

Tạo file `src/Services/Payment/Core/Payment.Application/Features/Payment/Queries/GetPaymentByIdQueryHandler.cs`:

```csharp
using AutoMapper;
using BuildingBlocks.CQRS;
using BuildingBlocks.Exceptions;
using Common.Constants;
using Payment.Application.Dtos;
using Payment.Domain.Repositories;

namespace Payment.Application.Features.Payment.Queries;

public class GetPaymentByIdQueryHandler(
    IPaymentRepository paymentRepository,
    IMapper mapper)
    : IQueryHandler<GetPaymentByIdQuery, PaymentDto>
{
    public async Task<PaymentDto> Handle(GetPaymentByIdQuery query, CancellationToken cancellationToken)
    {
        var payment = await paymentRepository.GetByIdAsync(query.PaymentId, cancellationToken);

        if (payment is null)
        {
            throw new NotFoundException(MessageCode.PaymentNotFound, query.PaymentId);
        }

        return mapper.Map<PaymentDto>(payment);
    }
}
```

### Bước 2: Create GetPaymentByOrderIdQuery (15 phút)

#### 2.1. Create Query

Tạo file `src/Services/Payment/Core/Payment.Application/Features/Payment/Queries/GetPaymentByOrderIdQuery.cs`:

```csharp
using BuildingBlocks.CQRS;
using Payment.Application.Dtos;

namespace Payment.Application.Features.Payment.Queries;

public record GetPaymentByOrderIdQuery(Guid OrderId) : IQuery<PaymentDto?>;
```

#### 2.2. Create Handler

Tạo file `src/Services/Payment/Core/Payment.Application/Features/Payment/Queries/GetPaymentByOrderIdQueryHandler.cs`:

```csharp
using AutoMapper;
using BuildingBlocks.CQRS;
using Payment.Application.Dtos;
using Payment.Domain.Repositories;

namespace Payment.Application.Features.Payment.Queries;

public class GetPaymentByOrderIdQueryHandler(
    IPaymentRepository paymentRepository,
    IMapper mapper)
    : IQueryHandler<GetPaymentByOrderIdQuery, PaymentDto?>
{
    public async Task<PaymentDto?> Handle(GetPaymentByOrderIdQuery query, CancellationToken cancellationToken)
    {
        var payment = await paymentRepository.GetByOrderIdAsync(query.OrderId, cancellationToken);

        if (payment is null)
        {
            return null;
        }

        return mapper.Map<PaymentDto>(payment);
    }
}
```

### Bước 3: Create GetAllPaymentsQuery với Pagination (20 phút)

#### 3.1. Create Filter Model

Tạo file `src/Services/Payment/Core/Payment.Application/Models/Filters/GetPaymentsFilter.cs`:

```csharp
using Payment.Domain.Enums;

namespace Payment.Application.Models.Filters;

public class GetPaymentsFilter
{
    public Guid? OrderId { get; set; }
    public PaymentStatus? Status { get; set; }
    public PaymentMethod? Method { get; set; }
    public DateTimeOffset? FromDate { get; set; }
    public DateTimeOffset? ToDate { get; set; }
    public decimal? MinAmount { get; set; }
    public decimal? MaxAmount { get; set; }
}
```

#### 3.2. Create Result Model

Tạo file `src/Services/Payment/Core/Payment.Application/Models/Results/GetAllPaymentsResult.cs`:

```csharp
using BuildingBlocks.Pagination;
using Payment.Application.Dtos;

namespace Payment.Application.Models.Results;

public record GetAllPaymentsResult(PaginatedResult<PaymentDto> Payments);
```

#### 3.3. Create Query

Tạo file `src/Services/Payment/Core/Payment.Application/Features/Payment/Queries/GetAllPaymentsQuery.cs`:

```csharp
using BuildingBlocks.CQRS;
using BuildingBlocks.Pagination;
using Common.Models;
using Payment.Application.Dtos;
using Payment.Application.Models.Filters;

namespace Payment.Application.Features.Payment.Queries;

public record GetAllPaymentsQuery(
    PaginationRequest PaginationRequest,
    GetPaymentsFilter? Filter = null
) : IQuery<PaginatedResult<PaymentDto>>;
```

#### 3.4. Create Handler

Tạo file `src/Services/Payment/Core/Payment.Application/Features/Payment/Queries/GetAllPaymentsQueryHandler.cs`:

```csharp
using AutoMapper;
using BuildingBlocks.CQRS;
using BuildingBlocks.Pagination;
using Payment.Application.Dtos;
using Payment.Domain.Repositories;

namespace Payment.Application.Features.Payment.Queries;

public class GetAllPaymentsQueryHandler(
    IPaymentRepository paymentRepository,
    IMapper mapper)
    : IQueryHandler<GetAllPaymentsQuery, PaginatedResult<PaymentDto>>
{
    public async Task<PaginatedResult<PaymentDto>> Handle(
        GetAllPaymentsQuery query,
        CancellationToken cancellationToken)
    {
        var (payments, totalCount) = await paymentRepository.GetAllAsync(
            filter: query.Filter,
            pageNumber: query.PaginationRequest.PageNumber,
            pageSize: query.PaginationRequest.PageSize,
            cancellationToken: cancellationToken);

        var paymentDtos = mapper.Map<List<PaymentDto>>(payments);

        return new PaginatedResult<PaymentDto>(
            pageNumber: query.PaginationRequest.PageNumber,
            pageSize: query.PaginationRequest.PageSize,
            totalCount: totalCount,
            items: paymentDtos);
    }
}
```

### Bước 4: Update Repository (15 phút)

#### 4.1. Update IPaymentRepository

Cập nhật file `src/Services/Payment/Core/Payment.Domain/Repositories/IPaymentRepository.cs`:

```csharp
using Payment.Domain.Entities;

namespace Payment.Domain.Repositories;

public interface IPaymentRepository
{
    // Existing methods
    Task<PaymentEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PaymentEntity?> GetByOrderIdAsync(Guid orderId, CancellationToken cancellationToken = default);
    void Add(PaymentEntity payment);
    void Update(PaymentEntity payment);

    // New methods for Day 45
    Task<(IEnumerable<PaymentEntity> Items, int TotalCount)> GetAllAsync(
        object? filter = null,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<PaymentEntity>> GetByOrderIdListAsync(
        Guid orderId,
        CancellationToken cancellationToken = default);

    Task<int> CountAsync(CancellationToken cancellationToken = default);
}
```

#### 4.2. Update PaymentRepository

Cập nhật file `src/Services/Payment/Core/Payment.Infrastructure/Repositories/PaymentRepository.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using Payment.Application.Models.Filters;
using Payment.Domain.Entities;
using Payment.Domain.Repositories;
using Payment.Infrastructure.Data;

namespace Payment.Infrastructure.Repositories;

public class PaymentRepository(PaymentDbContext dbContext) : IPaymentRepository
{
    public async Task<PaymentEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Payments
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<PaymentEntity?> GetByOrderIdAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Payments
            .AsNoTracking()
            .OrderByDescending(p => p.CreatedOnUtc)
            .FirstOrDefaultAsync(p => p.OrderId == orderId, cancellationToken);
    }

    public async Task<IEnumerable<PaymentEntity>> GetByOrderIdListAsync(
        Guid orderId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Payments
            .AsNoTracking()
            .Where(p => p.OrderId == orderId)
            .OrderByDescending(p => p.CreatedOnUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IEnumerable<PaymentEntity> Items, int TotalCount)> GetAllAsync(
        object? filter = null,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Payments.AsNoTracking();

        // Apply filters
        if (filter is GetPaymentsFilter f)
        {
            if (f.OrderId.HasValue)
                query = query.Where(p => p.OrderId == f.OrderId.Value);

            if (f.Status.HasValue)
                query = query.Where(p => p.Status == f.Status.Value);

            if (f.Method.HasValue)
                query = query.Where(p => p.Method == f.Method.Value);

            if (f.FromDate.HasValue)
                query = query.Where(p => p.CreatedOnUtc >= f.FromDate.Value);

            if (f.ToDate.HasValue)
                query = query.Where(p => p.CreatedOnUtc <= f.ToDate.Value);

            if (f.MinAmount.HasValue)
                query = query.Where(p => p.Amount >= f.MinAmount.Value);

            if (f.MaxAmount.HasValue)
                query = query.Where(p => p.Amount <= f.MaxAmount.Value);
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var items = await query
            .OrderByDescending(p => p.CreatedOnUtc)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<int> CountAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Payments.CountAsync(cancellationToken);
    }

    public void Add(PaymentEntity payment)
    {
        dbContext.Payments.Add(payment);
    }

    public void Update(PaymentEntity payment)
    {
        dbContext.Payments.Update(payment);
    }
}
```

### Bước 5: Create GetPaymentById Endpoint (10 phút)

Tạo file `src/Services/Payment/Api/Payment.Api/Endpoints/GetPaymentById.cs`:

```csharp
using Carter;
using Common.Models.Responses;
using MediatR;
using Payment.Api.Constants;
using Payment.Application.Dtos;
using Payment.Application.Features.Payment.Queries;

namespace Payment.Api.Endpoints;

public sealed class GetPaymentById : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiRoutes.Payment.GetById, HandleGetPaymentByIdAsync)
            .WithTags(ApiRoutes.Payment.Tags)
            .WithName(nameof(GetPaymentById))
            .Produces<ApiGetResponse<PaymentDto>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .WithDescription("Get payment by ID")
            .RequireAuthorization();
    }

    private async Task<IResult> HandleGetPaymentByIdAsync(
        ISender sender,
        Guid paymentId)
    {
        var query = new GetPaymentByIdQuery(paymentId);

        var result = await sender.Send(query);

        return Results.Ok(new ApiGetResponse<PaymentDto>(result));
    }
}
```

### Bước 6: Create GetPaymentByOrderId Endpoint (10 phút)

Tạo file `src/Services/Payment/Api/Payment.Api/Endpoints/GetPaymentByOrderId.cs`:

```csharp
using Carter;
using Common.Models.Responses;
using MediatR;
using Payment.Api.Constants;
using Payment.Application.Dtos;
using Payment.Application.Features.Payment.Queries;

namespace Payment.Api.Endpoints;

public sealed class GetPaymentByOrderId : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiRoutes.Payment.GetByOrderId, HandleGetPaymentByOrderIdAsync)
            .WithTags(ApiRoutes.Payment.Tags)
            .WithName(nameof(GetPaymentByOrderId))
            .Produces<ApiGetResponse<PaymentDto?>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .WithDescription("Get payment by Order ID (returns latest payment for the order)")
            .RequireAuthorization();
    }

    private async Task<IResult> HandleGetPaymentByOrderIdAsync(
        ISender sender,
        Guid orderId)
    {
        var query = new GetPaymentByOrderIdQuery(orderId);

        var result = await sender.Send(query);

        if (result is null)
        {
            return Results.Ok(new ApiGetResponse<PaymentDto?>(null, "No payment found for this order"));
        }

        return Results.Ok(new ApiGetResponse<PaymentDto?>(result));
    }
}
```

### Bước 7: Create GetAllPayments Endpoint - Admin (15 phút)

#### 7.1. Update ApiRoutes

Cập nhật file `src/Services/Payment/Api/Payment.Api/Constants/ApiRoutes.cs`:

```csharp
namespace Payment.Api.Constants;

public static class ApiRoutes
{
    public static class Payment
    {
        public const string Tags = "Payments";
        private const string Base = "/api/payments";
        private const string AdminBase = "/api/admin/payments";

        // User endpoints
        public const string Create = Base;
        public const string GetById = Base + "/{paymentId:guid}";
        public const string GetByOrderId = Base + "/order/{orderId:guid}";
        public const string Process = Base + "/{paymentId:guid}/process";
        public const string Refund = Base + "/{paymentId:guid}/refund";

        // Admin endpoints
        public const string AdminGetAll = AdminBase;
        public const string AdminGetById = AdminBase + "/{paymentId:guid}";
    }
}
```

#### 7.2. Create GetAllPayments Endpoint

Tạo file `src/Services/Payment/Api/Payment.Api/Endpoints/GetAllPayments.cs`:

```csharp
using BuildingBlocks.Pagination;
using Carter;
using Common.Models;
using Common.Models.Responses;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Payment.Api.Constants;
using Payment.Application.Dtos;
using Payment.Application.Features.Payment.Queries;
using Payment.Application.Models.Filters;
using Payment.Domain.Enums;

namespace Payment.Api.Endpoints;

public sealed class GetAllPayments : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiRoutes.Payment.AdminGetAll, HandleGetAllPaymentsAsync)
            .WithTags(ApiRoutes.Payment.Tags)
            .WithName(nameof(GetAllPayments))
            .Produces<ApiGetResponse<PaginatedResult<PaymentDto>>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .WithDescription("Get all payments with pagination and filters (Admin only)")
            .RequireAuthorization("AdminPolicy"); // Requires Admin role
    }

    private async Task<IResult> HandleGetAllPaymentsAsync(
        ISender sender,
        [AsParameters] PaginationRequest paginationRequest,
        [FromQuery] Guid? orderId = null,
        [FromQuery] PaymentStatus? status = null,
        [FromQuery] PaymentMethod? method = null,
        [FromQuery] DateTimeOffset? fromDate = null,
        [FromQuery] DateTimeOffset? toDate = null,
        [FromQuery] decimal? minAmount = null,
        [FromQuery] decimal? maxAmount = null)
    {
        var filter = new GetPaymentsFilter
        {
            OrderId = orderId,
            Status = status,
            Method = method,
            FromDate = fromDate,
            ToDate = toDate,
            MinAmount = minAmount,
            MaxAmount = maxAmount
        };

        var query = new GetAllPaymentsQuery(paginationRequest, filter);

        var result = await sender.Send(query);

        return Results.Ok(new ApiGetResponse<PaginatedResult<PaymentDto>>(result));
    }
}
```

### Bước 8: Test (15 phút)

#### 8.1. Build and Run

```bash
# Build
dotnet build src/Services/Payment

# Run
dotnet run --project src/Services/Payment/Api/Payment.Api
```

#### 8.2. Test Endpoints

**1. Test GetPaymentById:**

```http
GET /api/payments/{paymentId}
Authorization: Bearer <token>
```

**Expected Response (200 OK):**
```json
{
  "data": {
    "id": "...",
    "orderId": "...",
    "transactionId": null,
    "amount": 299.99,
    "status": 1,
    "statusName": "Pending",
    "method": 1,
    "methodName": "VnPay",
    "createdOnUtc": "2024-01-01T00:00:00Z"
  }
}
```

**2. Test GetPaymentByOrderId:**

```http
GET /api/payments/order/{orderId}
Authorization: Bearer <token>
```

**3. Test GetAllPayments (Admin):**

```http
GET /api/admin/payments?pageNumber=1&pageSize=10&status=1
Authorization: Bearer <admin-token>
```

**Expected Response (200 OK):**
```json
{
  "data": {
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 25,
    "totalPages": 3,
    "items": [
      {
        "id": "...",
        "orderId": "...",
        "amount": 299.99,
        "status": 1,
        "statusName": "Pending",
        "method": 1,
        "methodName": "VnPay"
      }
    ]
  }
}
```

**4. Test với Invalid ID (404):**

```http
GET /api/payments/00000000-0000-0000-0000-000000000000
```

**Expected Response (404 Not Found):**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Payment not found: 00000000-0000-0000-0000-000000000000"
}
```

---

## 📝 Ghi chú cho Day 45

### Query Pattern Best Practices

1. **AsNoTracking**: Luôn sử dụng cho read-only queries để tăng performance
2. **Projection**: Có thể map trực tiếp trong query thay vì load toàn bộ entity
3. **Pagination**: Luôn áp dụng cho list endpoints để tránh load quá nhiều data

### Optional: Add Projection Query

Nếu muốn tối ưu hơn, có thể project trực tiếp:

```csharp
var paymentDtos = await query
    .Select(p => new PaymentDto
    {
        Id = p.Id,
        OrderId = p.OrderId,
        Amount = p.Amount,
        Status = p.Status,
        Method = p.Method,
        // ...
    })
    .ToListAsync(cancellationToken);
```

---

## 🔗 Summary - Files Created/Modified

### New Files

| File | Description |
|------|-------------|
| `Queries/GetPaymentByIdQuery.cs` | Query record |
| `Queries/GetPaymentByIdQueryHandler.cs` | Query handler |
| `Queries/GetPaymentByOrderIdQuery.cs` | Query record |
| `Queries/GetPaymentByOrderIdQueryHandler.cs` | Query handler |
| `Queries/GetAllPaymentsQuery.cs` | Query with pagination |
| `Queries/GetAllPaymentsQueryHandler.cs` | Query handler |
| `Models/Filters/GetPaymentsFilter.cs` | Filter model |
| `Endpoints/GetPaymentById.cs` | API endpoint |
| `Endpoints/GetPaymentByOrderId.cs` | API endpoint |
| `Endpoints/GetAllPayments.cs` | Admin API endpoint |

### Modified Files

| File | Changes |
|------|---------|
| `IPaymentRepository.cs` | Added GetAllAsync, GetByOrderIdListAsync, CountAsync |
| `PaymentRepository.cs` | Implemented new methods |
| `ApiRoutes.cs` | Added AdminGetAll route |

---

## 🚀 Next Steps

- **Day 46**: Create ProcessPayment Command (Payment Gateway integration)
- **Day 47**: Integrate VNPay/Momo Payment Gateway
- **Day 48**: Create Payment Webhook Handler
- **Day 49**: Add Payment Domain Events & Integration Events

---

**Chúc bạn hoàn thành tốt Day 45! 💳📖**
