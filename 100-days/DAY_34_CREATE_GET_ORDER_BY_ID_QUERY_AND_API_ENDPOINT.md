# 📘 Day 34: Create GetOrderById Query & API Endpoint

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Tạo query và API endpoint để lấy thông tin chi tiết đơn hàng theo ID.

Bạn sẽ:

1.  **Definitions**: Định nghĩa Query record.
2.  **Implementation**: Implement Query Handler để đọc dữ liệu.
3.  **Endpoint**: Expose API endpoint sử dụng Carter.
4.  **Testing**: Verify qua Swagger.

**Thời gian ước tính**: 45-60 phút.

---

## ✅ Checklist - Đánh dấu khi hoàn thành

### Application Layer - Query (Bước 1-2)

- [ ] Create `GetOrderByIdQuery` record
- [ ] Create `GetOrderByIdQueryHandler` class
- [ ] Implement logic retrieval từ Database
- [ ] Implement mapping Entity -> DTO

### API Layer - Endpoint (Bước 3)

- [ ] Verify route `GetById` trong `ApiRoutes`
- [ ] Create `GetOrderById` endpoint class
- [ ] Setup Swagger documentation

### Testing (Bước 4)

- [ ] Build & Run Project
- [ ] Test endpoint với valid OrderId
- [ ] Test endpoint với invalid OrderId (NotFound)

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Create GetOrderByIdQuery (10 phút)

Tạo file `src/Services/Order/Core/Order.Application/Features/Order/Queries/GetOrderByIdQuery.cs`:

```csharp
using BuildingBlocks.CQRS;
using Order.Application.Dtos.Orders;

namespace Order.Application.Features.Order.Queries;

public record GetOrderByIdQuery(Guid OrderId) : IQuery<OrderDto>;
```

### Bước 2: Create GetOrderByIdQueryHandler (20 phút)

Trong cùng file hoặc file tách biệt `src/Services/Order/Core/Order.Application/Features/Order/Queries/GetOrderByIdQueryHandler.cs`:

```csharp
using AutoMapper;
using BuildingBlocks.CQRS;
using BuildingBlocks.Exceptions;
using Common.Constants;
using Order.Application.Dtos.Orders;
using Order.Domain.Abstractions; // Assuming IUnitOfWork or Repository here
// OR using Microsoft.EntityFrameworkCore; if using direct DbContext

namespace Order.Application.Features.Order.Queries;

public class GetOrderByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    : IQueryHandler<GetOrderByIdQuery, OrderDto>
{
    public async Task<OrderDto> Handle(GetOrderByIdQuery query, CancellationToken cancellationToken)
    {
        // 1. Get Order from Repository/Db
        // Note: Use AsNoTracking() for read-only query if using EF Core directly
        // var order = await dbContext.Orders.AsNoTracking().FirstOrDefaultAsync(x => x.Id == query.OrderId, cancellationToken);

        // Assuming UnitOfWork/Repository pattern:
        var order = await unitOfWork.Orders.GetByIdAsync(query.OrderId, cancellationToken);

        // 2. Validate existence
        if (order == null)
        {
            throw new NotFoundException(MessageCode.OrderNotFound, query.OrderId);
        }

        // 3. Map to DTO
        var orderDto = mapper.Map<OrderDto>(order);

        return orderDto;
    }
}
```

**Lưu ý**: Tùy thuộc vào implementation của `IUnitOfWork` và `Repository` trong project của bạn, hãy điều chỉnh cách gọi dữ liệu cho phù hợp. Nếu bạn dùng EF Core thuần, hãy inject `IApplicationDbContext` hoặc `OrderDbContext`.

### Bước 3: Create GetOrderById Endpoint (15 phút)

Tạo file `src/Services/Order/Api/Order.Api/Endpoints/GetOrderById.cs`:

```csharp
using Order.Api.Constants;
using Order.Application.Dtos.Orders;
using Order.Application.Features.Order.Queries;
using Microsoft.AspNetCore.Mvc;

namespace Order.Api.Endpoints;

public sealed class GetOrderById : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiRoutes.Order.GetById, HandleGetOrderByIdAsync)
            .WithTags(ApiRoutes.Order.Tags)
            .WithName(nameof(GetOrderById))
            .Produces<OrderDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .RequireAuthorization(); // Admin or Owner policy
    }

    private async Task<IResult> HandleGetOrderByIdAsync(
        ISender sender,
        Guid orderId)
    {
        var query = new GetOrderByIdQuery(orderId);

        var result = await sender.Send(query);

        return Results.Ok(result);
    }
}
```

Check lại `ApiRoutes.cs` để đảm bảo `GetById` đã được định nghĩa đúng (VD: `/admin/orders/{orderId}`).

### Bước 4: Test (10 phút)

1.  Chạy ứng dụng: `dotnet run --project src/Services/Order/Api/Order.Api/Order.Api.csproj`
2.  Mở Swagger UI.
3.  Lấy một GUID từ database hoặc tạo order mới để có ID.
4.  Gọi API `GET /admin/orders/{id}`.
5.  Kiểm tra kết quả trả về JSON đầy đủ thông tin Order, Customer, Shipping Address, và Order Items.

---

**Chúc bạn hoàn thành tốt Day 34! 🚀**
