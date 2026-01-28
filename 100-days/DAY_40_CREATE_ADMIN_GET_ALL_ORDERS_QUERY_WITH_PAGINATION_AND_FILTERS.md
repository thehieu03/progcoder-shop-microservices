# 📘 Day 40: Create Admin GetAllOrders Query (Pagination + Filters)

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Admin lấy danh sách tất cả đơn hàng với phân trang + filter cơ bản.

Bạn sẽ:

1. **Definitions**: Định nghĩa `GetAllOrdersQuery` (pagination + optional filters).
2. **Implementation**: Implement Query Handler query database.
3. **Endpoint**: Expose admin API endpoint.
4. **Testing**: Verify qua Swagger.

**Thời gian ước tính**: 60-90 phút.

---

## ✅ Checklist - Đánh dấu khi hoàn thành

### Application Layer

- [ ] Create `GetAllOrdersQuery` record
- [ ] Add filter fields (optional):
  - [ ] `OrderStatus? Status`
  - [ ] `Guid? CustomerId`
  - [ ] `DateTime? FromUtc`, `DateTime? ToUtc`
- [ ] Create `GetAllOrdersQueryHandler`
- [ ] Implement query + pagination + sorting
- [ ] Map entity list -> `OrderDto`
- [ ] Return `PaginatedResult<OrderDto>`

### API Layer

- [ ] Verify route `AdminGetAll` trong `ApiRoutes`
- [ ] Create endpoint `GetAllOrders`
- [ ] RequireAuthorization (Admin)
- [ ] Swagger responses (200/401/403)

### Testing

- [ ] Test pagination (page 1/2)
- [ ] Test filter by status
- [ ] Test filter by customerId
- [ ] Test filter by date range

---

## 📋 Hướng dẫn chi tiết từng bước

## 🧩 Code chi tiết (đúng theo codebase hiện tại)

Trong project Order service hiện tại bạn đang có **2 API admin list orders**:

 - **Có phân trang**: `GET /admin/orders`
   - Endpoint: `Order.Api/Endpoints/GetOrders.cs`
   - Query: `GetOrdersQuery` (nhận `GetOrdersFilter` + `PaginationRequest`)
   - Result: `GetOrdersResult` (có `PagingResult`)

 - **Không phân trang**: `GET /admin/orders/all`
   - Endpoint: `Order.Api/Endpoints/GetAllOrders.cs`
   - Query: `GetAllOrdersQuery` (nhận `GetAllOrdersFilter`)
   - Result: `GetAllOrdersResult` (chỉ có list items)

### 0) ApiRoutes (đã có)

File: `src/Services/Order/Api/Order.Api/Constants/ApiRoutes.cs`

```csharp
public const string GetOrders = $"{BaseAdmin}";
public const string GetAllOrders = $"{BaseAdmin}/all";
```

### 1) List Orders có phân trang: GET `/admin/orders`

#### 1.1) Filter model

File: `src/Services/Order/Core/Order.Application/Models/Filters/GetOrdersFilter.cs`

```csharp
public class GetOrdersFilter
{
    public string? SearchText { get; set; }
    public Guid[]? Ids { get; set; }
    public Guid? CustomerId { get; set; }
    public OrderStatus? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}
```

#### 1.2) Query + Handler

File: `src/Services/Order/Core/Order.Application/Features/Order/Queries/GetOrdersQuery.cs`

```csharp
public sealed record GetOrdersQuery(
    GetOrdersFilter Filter,
    PaginationRequest Paging) : IQuery<GetOrdersResult>;

public sealed class GetOrdersQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    : IQueryHandler<GetOrdersQuery, GetOrdersResult>
{
    public async Task<GetOrdersResult> Handle(GetOrdersQuery query, CancellationToken cancellationToken)
    {
        var filter = query.Filter;
        var paging = query.Paging;
        var predicate = BuildFilterPredicate(filter);

        var orders = await unitOfWork.Orders
            .SearchWithRelationshipAsync(predicate, paging, cancellationToken);

        var totalCount = await unitOfWork.Orders.CountAsync(predicate, cancellationToken);

        var items = mapper.Map<List<OrderDto>>(orders);
        var response = new GetOrdersResult(items, totalCount, paging);

        return response;
    }

    private static Expression<Func<OrderEntity, bool>> BuildFilterPredicate(GetOrdersFilter filter)
    {
        return x =>
            (filter.Ids == null || filter.Ids.Length == 0 || filter.Ids.Contains(x.Id)) &&
            (!filter.CustomerId.HasValue || x.Customer.Id == filter.CustomerId.Value) &&
            (!filter.Status.HasValue || x.Status == filter.Status.Value) &&
            (filter.SearchText.IsNullOrWhiteSpace() || x.OrderNo.Value.ToLower().Contains(filter.SearchText.Trim().ToLower())) &&
            (!filter.FromDate.HasValue || x.CreatedOnUtc >= filter.FromDate.Value) &&
            (!filter.ToDate.HasValue || x.CreatedOnUtc <= filter.ToDate.Value);
    }
}
```

#### 1.3) Result model

File: `src/Services/Order/Core/Order.Application/Models/Results/GetOrdersResult.cs`

```csharp
public sealed class GetOrdersResult
{
    public List<OrderDto> Items { get; init; }
    public PagingResult Paging { get; init; }

    public GetOrdersResult(List<OrderDto> items, long totalCount, PaginationRequest pagination)
    {
        Items = items;
        Paging = PagingResult.Of(totalCount, pagination);
    }
}
```

#### 1.4) Endpoint

File: `src/Services/Order/Api/Order.Api/Endpoints/GetOrders.cs`

```csharp
public sealed class GetOrders : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiRoutes.Order.GetOrders, HandleGetOrdersAsync)
            .WithTags(ApiRoutes.Order.Tags)
            .WithName(nameof(GetOrders))
            .Produces<ApiGetResponse<GetOrdersResult>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
    }

    private async Task<ApiGetResponse<GetOrdersResult>> HandleGetOrdersAsync(
        ISender sender,
        [AsParameters] GetOrdersFilter filter,
        [AsParameters] PaginationRequest paging)
    {
        var query = new GetOrdersQuery(filter, paging);
        var result = await sender.Send(query);
        return new ApiGetResponse<GetOrdersResult>(result);
    }
}
```

### 2) List Orders không phân trang: GET `/admin/orders/all`

#### 2.1) Filter model

File: `src/Services/Order/Core/Order.Application/Models/Filters/GetAllOrdersFilter.cs`

```csharp
public class GetAllOrdersFilter
{
    public string? SearchText { get; set; }
    public Guid[]? Ids { get; set; }
    public Guid? CustomerId { get; set; }
    public OrderStatus? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}
```

#### 2.2) Query + Handler

File: `src/Services/Order/Core/Order.Application/Features/Order/Queries/GetAllOrdersQuery.cs`

```csharp
public sealed record GetAllOrdersQuery(GetAllOrdersFilter Filter) : IQuery<GetAllOrdersResult>;

public sealed class GetAllOrdersQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    : IQueryHandler<GetAllOrdersQuery, GetAllOrdersResult>
{
    public async Task<GetAllOrdersResult> Handle(GetAllOrdersQuery query, CancellationToken cancellationToken)
    {
        var filter = query.Filter;

        var orders = await unitOfWork.Orders
            .SearchWithRelationshipAsync(x =>
                (filter.Ids == null || filter.Ids.Length > 0 || filter.Ids.Contains(x.Id)) &&
                (!filter.CustomerId.HasValue || x.Customer.Id == filter.CustomerId.Value) &&
                (!filter.Status.HasValue || x.Status == filter.Status.Value) &&
                (filter.SearchText.IsNullOrWhiteSpace() || x.OrderNo.Value.ToLower().Contains(filter.SearchText!)) &&
                (!filter.FromDate.HasValue || x.CreatedOnUtc >= filter.FromDate.Value) &&
                (!filter.ToDate.HasValue || x.CreatedOnUtc <= filter.ToDate.Value),
                cancellationToken);

        var items = mapper.Map<List<OrderDto>>(orders);
        var response = new GetAllOrdersResult(items);

        return response;
    }
}
```

Lưu ý: đoạn check `filter.Ids.Length > 0` ở trên có thể là typo (thường phải là `== 0`). Nếu bạn thấy filter theo `Ids` chạy sai, đây là chỗ cần fix.

#### 2.3) Endpoint

File: `src/Services/Order/Api/Order.Api/Endpoints/GetAllOrders.cs`

```csharp
public sealed class GetAllOrders : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiRoutes.Order.GetAllOrders, HandleGetAllOrdersAsync)
            .WithTags(ApiRoutes.Order.Tags)
            .WithName(nameof(GetAllOrders))
            .Produces<ApiGetResponse<GetAllOrdersResult>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
    }

    private async Task<ApiGetResponse<GetAllOrdersResult>> HandleGetAllOrdersAsync(
        ISender sender,
        [AsParameters] GetAllOrdersFilter filter)
    {
        var query = new GetAllOrdersQuery(filter);
        var result = await sender.Send(query);
        return new ApiGetResponse<GetAllOrdersResult>(result);
    }
}
```

## 🧪 Test nhanh (10-15 phút)

 - `GET /admin/orders?pageNumber=1&pageSize=10&status=Pending`
 - `GET /admin/orders/all?customerId=<guid>`

---

**Chúc bạn hoàn thành tốt Day 40!**
