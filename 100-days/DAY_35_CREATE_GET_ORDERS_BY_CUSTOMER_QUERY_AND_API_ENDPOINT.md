# 📘 Day 35: Create GetOrdersByCustomer Query & API Endpoint

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Tạo query và API endpoint để lấy danh sách đơn hàng của người dùng hiện tại (My Orders).

Bạn sẽ:

1.  **Definitions**: Định nghĩa Query record `GetOrdersByCustomerQuery` với pagination.
2.  **Implementation**: Implement Query Handler để query DB theo `CustomerId`.
3.  **Endpoint**: Expose API endpoint `/orders/me`.
4.  **Testing**: Verify qua Swagger (cần authentication).

**Thời gian ước tính**: 45-60 phút.

---

## ✅ Checklist - Đánh dấu khi hoàn thành

### Application Layer - Query (Bước 1-2)

- [ ] Create `GetOrdersByCustomerQuery` record (support PaginationRequest)
- [ ] Create `GetOrdersByCustomerQueryHandler` class
- [ ] Implement filter by `CustomerId` (lấy từ Actor/Claims)
- [ ] Implement pagination (Skip/Take)
- [ ] Implement mapping List<OrderEntity> -> List<OrderDto>

### API Layer - Endpoint (Bước 3)

- [ ] Verify route `GetOrdersByCurrentUser` trong `ApiRoutes`
- [ ] Create `GetOrdersByCustomer` endpoint class
- [ ] Setup Claims extraction từ `HttpContextAccessor`

### Testing (Bước 4)

- [ ] Build & Run Project
- [ ] Authenticate (Get Token)
- [ ] Test endpoint `GET /orders/me`
- [ ] Verify chỉ trả về orders của logged-in user

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Create GetOrdersByCustomerQuery (10 phút)

Tạo file `src/Services/Order/Core/Order.Application/Features/Order/Queries/GetOrdersByCustomerQuery.cs`:

```csharp
using BuildingBlocks.CQRS;
using Common.Models; // PaginationRequest
using Order.Application.Dtos.Orders;

namespace Order.Application.Features.Order.Queries;

public record GetOrdersByCustomerQuery(PaginationRequest PaginationRequest) : IQuery<PaginatedResult<OrderDto>>;
```

**Lưu ý**: `PaginatedResult<T>` là class wrapper chuẩn (thường nằm trong `BuildingBlocks` hoặc `Common`). Nếu chưa có, bạn có thể trả về `IEnumerable<OrderDto>` đơn giản trước hoặc tạo class `PaginatedResult`.

### Bước 2: Create GetOrdersByCustomerQueryHandler (20 phút)

Trong cùng file hoặc file tách biệt `src/Services/Order/Core/Order.Application/Features/Order/Queries/GetOrdersByCustomerQueryHandler.cs`:

```csharp
using AutoMapper;
using BuildingBlocks.CQRS;
using BuildingBlocks.Authentication.Interfaces; // ICurrentUserProvider/ICurrentUserService
using Common.Models;
using Order.Application.Dtos.Orders;
using Order.Domain.Abstractions;

namespace Order.Application.Features.Order.Queries;

public class GetOrdersByCustomerQueryHandler(
    IUnitOfWork unitOfWork,
    IMapper mapper,
    ICurrentUserProvider currentUserProvider) // hoặc IHttpContextAccessor
    : IQueryHandler<GetOrdersByCustomerQuery, PaginatedResult<OrderDto>>
{
    public async Task<PaginatedResult<OrderDto>> Handle(GetOrdersByCustomerQuery query, CancellationToken cancellationToken)
    {
        // 1. Get Current User Id
        // Nếu dùng ICurrentUserProvider custom
        var userId = currentUserProvider.UserId;

        // Hoặc parse từ Actor/Claims nếu truyền vào Query (nhưng thường Handler nên tự resolve context hoặc pass in query)
        // Practice tốt: Pass Actor vào Query hoặc Resolve trong Handler.
        // Giả sử lấy từ Claims thông qua service hạ tầng.
        if (userId == Guid.Empty) throw new UnauthorizedAccessException();

        // 2. Query Database
        // var totalItems = await unitOfWork.Orders.CountByCustomerAsync(userId);
        // var orders = await unitOfWork.Orders.GetByCustomerAsync(userId, query.PaginationRequest.PageNumber, query.PaginationRequest.PageSize);

        // Example implementation with EF Core queryable (pseudo-code)
        // var queryable = dbContext.Orders.AsNoTracking().Where(x => x.CustomerId == userId);
        // var totalItems = await queryable.CountAsync(cancellationToken);
        // var items = await queryable
        //     .Skip(query.PaginationRequest.Skip)
        //     .Take(query.PaginationRequest.Take)
        //     .OrderByDescending(x => x.CreatedOnUtc)
        //     .ToListAsync(cancellationToken);

        // 3. Map to DTOs
        // var orderDtos = mapper.Map<List<OrderDto>>(items);

        // 4. Return Paginated Result
        // return new PaginatedResult<OrderDto>(query.PaginationRequest.PageNumber, query.PaginationRequest.PageSize, totalItems, orderDtos);

        return null!; // Implement real logic here
    }
}
```

### Bước 3: Create GetOrdersByCustomer Endpoint (15 phút)

Tạo file `src/Services/Order/Api/Order.Api/Endpoints/GetOrdersByCustomer.cs`:

```csharp
using Common.Models;
using Order.Api.Constants;
using Order.Application.Dtos.Orders;
using Order.Application.Features.Order.Queries;
using Microsoft.AspNetCore.Mvc;

namespace Order.Api.Endpoints;

public sealed class GetOrdersByCustomer : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiRoutes.Order.GetOrdersByCurrentUser, HandleGetOrdersByCustomerAsync)
            .WithTags(ApiRoutes.Order.Tags)
            .WithName(nameof(GetOrdersByCustomer))
            .Produces<PaginatedResult<OrderDto>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
    }

    private async Task<IResult> HandleGetOrdersByCustomerAsync(
        ISender sender,
        [AsParameters] PaginationRequest paginationRequest)
    {
        var query = new GetOrdersByCustomerQuery(paginationRequest);

        var result = await sender.Send(query);

        return Results.Ok(result);
    }
}
```

### Bước 4: Test (10 phút)

1.  Chạy ứng dụng.
2.  Login để lấy Access Token (có thể giả lập hoặc dùng Identity Service).
3.  Gọi API `GET /orders/me` với Header `Authorization: Bearer <token>`.
4.  Verify response chứa danh sách order của user đó.

---

**Chúc bạn hoàn thành tốt Day 35! 🚀**
