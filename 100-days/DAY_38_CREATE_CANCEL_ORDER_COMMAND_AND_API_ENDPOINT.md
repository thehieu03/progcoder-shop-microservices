# 📘 Day 38: Create CancelOrder Command & API Endpoint

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Cho phép người dùng huỷ đơn hàng (Cancel Order) theo CQRS Command.

Bạn sẽ:

1. **Domain**: Xác định rule huỷ đơn (trạng thái nào được phép huỷ).
2. **Definitions**: Tạo `CancelOrderCommand`.
3. **Validation**: Tạo validator.
4. **Implementation**: Implement `CancelOrderCommandHandler`.
5. **Endpoint**: Expose API endpoint bằng Carter.
6. **Testing**: Verify qua Swagger.

**Thời gian ước tính**: 45-75 phút.

---

## ✅ Checklist - Đánh dấu khi hoàn thành

### Domain Layer

- [ ] Xác định trạng thái nào được phép cancel (ví dụ: `Pending`)
- [ ] Thêm method domain `Cancel(...)`
- [ ] Set `CancelledAt` (nếu có) và update `OrderStatus = Cancelled`
- [ ] (Tuỳ chọn) Raise domain event `OrderCancelledDomainEvent`

### Application Layer

- [ ] Create `CancelOrderCommand`
- [ ] Create `CancelOrderCommandValidator`
- [ ] Create `CancelOrderCommandHandler`
- [ ] NotFound -> throw `NotFoundException(MessageCode.OrderNotFound, ...)`
- [ ] Unauthorized -> return 401/403 theo convention
- [ ] Save changes

### API Layer

- [ ] Verify route `Cancel` trong `ApiRoutes`
- [ ] Create `CancelOrder` endpoint
- [ ] RequireAuthorization (Owner/Admin)
- [ ] Swagger responses (200/204/400/401/403/404)

### Testing

- [ ] Cancel order hợp lệ -> 200/204
- [ ] Cancel order sai trạng thái -> 400/409
- [ ] Cancel order không tồn tại -> 404

---

## 📋 Hướng dẫn chi tiết từng bước

## 🧩 Code chi tiết (đúng theo codebase hiện tại)

Trong project hiện tại của bạn, luồng **Cancel** đang được implement thông qua feature chung **UpdateOrderStatus**:
- Command: `UpdateOrderStatusCommand` (set `Status = OrderStatus.Canceled` + `Reason`)
- Domain: `OrderEntity.CancelOrder(reason, performedBy)`
- Domain Event: `OrderCancelledDomainEvent`
- Domain Event Handler: `OrderCancelledDomainEventHandler` (push ra outbox)
- Endpoint: `PATCH /admin/orders/{orderId}/status`

### 0) Các file liên quan

- `src/Services/Order/Core/Order.Domain/Entities/OrderEntity.cs`
- `src/Services/Order/Core/Order.Domain/Events/OrderCancelledDomainEvent.cs`
- `src/Services/Order/Core/Order.Application/Features/Order/Commands/UpdateOrderStatusCommand.cs`
- `src/Services/Order/Api/Order.Api/Models/UpdateOrderStatusRequest.cs`
- `src/Services/Order/Api/Order.Api/Endpoints/UpdateOrderStatus.cs`
- `src/Services/Order/Api/Order.Api/Constants/ApiRoutes.cs`
- `src/Services/Order/Core/Order.Application/Features/Order/EventHandlers/Domain/OrderCancelledDomainEventHandler.cs`

### 1) Domain: CancelOrder (đã có)

File: `src/Services/Order/Core/Order.Domain/Entities/OrderEntity.cs`

```csharp
public void CancelOrder(string reason, string performBy)
{
    UpdateStatus(OrderStatus.Canceled, performBy);

    CancelReason = reason;
    LastModifiedBy = performBy;
    LastModifiedOnUtc = DateTimeOffset.UtcNow;

    AddDomainEvent(new OrderCancelledDomainEvent(this));
}
```

### 2) Domain Event record (đã có)

File: `src/Services/Order/Core/Order.Domain/Events/OrderCancelledDomainEvent.cs`

```csharp
public sealed record OrderCancelledDomainEvent(OrderEntity Order) : IDomainEvent;
```

### 3) Command + Validator + Handler (đã có)

File: `src/Services/Order/Core/Order.Application/Features/Order/Commands/UpdateOrderStatusCommand.cs`

```csharp
public sealed record UpdateOrderStatusCommand(
    Guid OrderId,
    OrderStatus Status,
    string? Reason,
    Actor Actor) : ICommand<Guid>;

public sealed class UpdateOrderStatusCommandValidator : AbstractValidator<UpdateOrderStatusCommand>
{
    public UpdateOrderStatusCommandValidator()
    {
        RuleFor(x => x.OrderId)
            .NotEmpty()
            .WithMessage(MessageCode.OrderIdIsRequired);

        RuleFor(x => x.Status)
            .Must(status => Enum.IsDefined(typeof(OrderStatus), status))
            .WithMessage(MessageCode.InvalidOrderStatus);

        When(x => x.Status == OrderStatus.Canceled, () =>
        {
            RuleFor(x => x.Reason)
                .NotEmpty()
                .WithMessage(MessageCode.CancelReasonIsRequired)
                .MaximumLength(255)
                .WithMessage(MessageCode.Max255Characters);
        });

        When(x => x.Status == OrderStatus.Refunded, () =>
        {
            RuleFor(x => x.Reason)
                .NotEmpty()
                .WithMessage(MessageCode.RefundReasonIsRequired)
                .MaximumLength(255)
                .WithMessage(MessageCode.Max255Characters);
        });
    }
}

public sealed class UpdateOrderStatusCommandHandler(IUnitOfWork unitOfWork)
    : ICommandHandler<UpdateOrderStatusCommand, Guid>
{
    public async Task<Guid> Handle(UpdateOrderStatusCommand command, CancellationToken cancellationToken)
    {
        var order = await unitOfWork.Orders.FirstOrDefaultAsync(x => x.Id == command.OrderId, cancellationToken)
            ?? throw new NotFoundException(MessageCode.ResourceNotFound, command.OrderId);

        if (order.Status == OrderStatus.Delivered ||
            order.Status == OrderStatus.Canceled ||
            order.Status == OrderStatus.Refunded)
        {
            throw new ClientValidationException(MessageCode.OrderStatusCannotBeUpdated);
        }

        if (order.Status == command.Status)
        {
            throw new ClientValidationException(MessageCode.OrderStatusSameAsCurrent);
        }

        var performedBy = command.Actor.ToString();

        switch (command.Status)
        {
            case OrderStatus.Canceled:
                if (string.IsNullOrWhiteSpace(command.Reason))
                {
                    throw new ClientValidationException(MessageCode.CancelReasonIsRequired);
                }
                order.CancelOrder(command.Reason!, performedBy);
                break;

            case OrderStatus.Refunded:
                if (string.IsNullOrWhiteSpace(command.Reason))
                {
                    throw new ClientValidationException(MessageCode.RefundReasonIsRequired);
                }
                order.RefundOrder(command.Reason!, performedBy);
                break;

            case OrderStatus.Delivered:
                order.OrderDelivered(performedBy);
                break;

            default:
                order.UpdateStatus(command.Status, performedBy);
                break;
        }

        unitOfWork.Orders.Update(order);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return order.Id;
    }
}
```

### 4) API: Request model + Endpoint + Route

File: `src/Services/Order/Api/Order.Api/Models/UpdateOrderStatusRequest.cs`

```csharp
public sealed class UpdateOrderStatusRequest
{
    public OrderStatus Status { get; set; }
    public string? Reason { get; set; }
}
```

File: `src/Services/Order/Api/Order.Api/Constants/ApiRoutes.cs`

```csharp
public const string UpdateOrderStatus = $"{BaseAdmin}/{{orderId}}/status";
```

File: `src/Services/Order/Api/Order.Api/Endpoints/UpdateOrderStatus.cs`

```csharp
public sealed class UpdateOrderStatus : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPatch(ApiRoutes.Order.UpdateOrderStatus, HandleUpdateOrderStatusAsync)
            .WithTags(ApiRoutes.Order.Tags)
            .WithName(nameof(UpdateOrderStatus))
            .Produces<ApiUpdatedResponse<Guid>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .RequireAuthorization();
    }

    private async Task<ApiUpdatedResponse<Guid>> HandleUpdateOrderStatusAsync(
        ISender sender,
        IHttpContextAccessor httpContext,
        [FromRoute] Guid orderId,
        [FromBody] UpdateOrderStatusRequest request)
    {
        var currentUser = httpContext.GetCurrentUser();
        var command = new UpdateOrderStatusCommand(
            orderId,
            request.Status,
            request.Reason,
            Actor.User(currentUser.Email));

        var result = await sender.Send(command);

        return new ApiUpdatedResponse<Guid>(result);
    }
}
```

### 5) Domain event handler: push Outbox (đã có)

File: `src/Services/Order/Core/Order.Application/Features/Order/EventHandlers/Domain/OrderCancelledDomainEventHandler.cs`

```csharp
public sealed class OrderCancelledDomainEventHandler(
    IUnitOfWork unitOfWork,
    ILogger<OrderCancelledDomainEventHandler> logger) : INotificationHandler<OrderCancelledDomainEvent>
{
    public async Task Handle(OrderCancelledDomainEvent @event, CancellationToken cancellationToken)
    {
        logger.LogInformation("Domain Event handled: {DomainEvent}", @event.GetType().Name);
        await PushToOutboxAsync(@event, cancellationToken);
    }

    private async Task PushToOutboxAsync(OrderCancelledDomainEvent @event, CancellationToken cancellationToken)
    {
        var reason = string.IsNullOrEmpty(@event.Order.RefundReason) ? @event.Order.CancelReason : @event.Order.RefundReason;
        var message = new OrderCancelledIntegrationEvent()
        {
            Id = Guid.NewGuid().ToString(),
            OrderId = @event.Order.Id,
            OrderNo = @event.Order.OrderNo.ToString(),
            Reason = reason!,
            OrderItems = @event.Order.OrderItems.Select(oi => new OrderItemIntegrationEvent
            {
                ProductId = oi.Product.Id,
                Quantity = oi.Quantity,
                UnitPrice = oi.Product.Price,
                LineTotal = oi.LineTotal
            }).ToList(),
        };

        var outboxMessage = OutboxMessageEntity.Create(
            id: Guid.NewGuid(),
            eventType: message.EventType!,
            content: JsonConvert.SerializeObject(message),
            occurredOnUtc: DateTimeOffset.UtcNow);

        await unitOfWork.OutboxMessages.AddAsync(outboxMessage, cancellationToken);
    }
}
```

## 🧪 Test qua Swagger (10-15 phút)

- **Cancel** (admin-style hiện tại):
  - `PATCH /admin/orders/{orderId}/status`
  - Body:
    - `status`: `Canceled`
    - `reason`: "customer requested"

Verify:
- `GET /admin/orders/{orderId}` -> `Status = Canceled` và `CancelReason` được set.
