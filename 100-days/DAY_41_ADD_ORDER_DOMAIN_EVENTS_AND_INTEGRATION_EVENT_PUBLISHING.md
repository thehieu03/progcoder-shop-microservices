# 📘 Day 41: Add Order Domain Events & Integration Event Publishing

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Bổ sung domain events cho Order và chuẩn bị (hoặc implement) publish integration events để các service khác có thể subscribe.

Bạn sẽ:

1. **Domain Events**: Tạo domain event cho các hành động quan trọng.
2. **Handlers**: Tạo domain event handlers (nếu bạn dùng MediatR notifications).
3. **Integration Events**: Map domain event -> integration event.
4. **Publishing**: Publish qua message broker (RabbitMQ) hoặc outbox pattern (nếu dự án có).
5. **Testing**: Verify event được publish/log.

**Thời gian ước tính**: 90-150 phút.

---

## ✅ Checklist - Đánh dấu khi hoàn thành

### Domain Layer

- [ ] Tạo domain events:
  - [ ] `OrderCreatedDomainEvent`
  - [ ] `OrderUpdatedDomainEvent` (tuỳ chọn)
  - [ ] `OrderCancelledDomainEvent`
  - [ ] `OrderStatusChangedDomainEvent` (Confirm/Ship/Complete)
- [ ] Raise domain event trong các method domain tương ứng

### Application/Infrastructure Layer

- [ ] Tạo handlers cho domain events (MediatR INotificationHandler)
- [ ] Map domain event -> integration event contract
- [ ] Publish integration event (RabbitMQ) hoặc enqueue outbox
- [ ] Đảm bảo retry/error handling cơ bản

### Testing

- [ ] Tạo/cancel/update/status change -> verify event handler chạy
- [ ] Verify message publish (log/queue)

---

## 📋 Hướng dẫn chi tiết từng bước

## 🧩 Code chi tiết (đúng theo codebase hiện tại)

Trong project của bạn, cơ chế Event-Driven đã có sẵn theo flow:

1. Domain raise `IDomainEvent` vào `Aggregate.DomainEvents`
2. EF Core interceptor `DispatchDomainEventsInterceptor` tự `mediator.Publish(domainEvent)` khi SaveChanges
3. `INotificationHandler<...>` nhận domain event và **push integration event vào Outbox table**
4. Worker `Order.Worker.Outbox` đọc Outbox table và publish qua **MassTransit**

### 0) Các file liên quan

- Domain events:
  - `src/Services/Order/Core/Order.Domain/Events/OrderCreatedDomainEvent.cs`
  - `src/Services/Order/Core/Order.Domain/Events/OrderCancelledDomainEvent.cs`
  - `src/Services/Order/Core/Order.Domain/Events/OrderDeliveredDomainEvent.cs`
- Domain raise events:
  - `src/Services/Order/Core/Order.Domain/Entities/OrderEntity.cs`
- Dispatch interceptor:
  - `src/Services/Order/Core/Order.Infrastructure/Data/Interceptors/DispatchDomainEventsInterceptor.cs`
- Domain event handlers -> Outbox:
  - `src/Services/Order/Core/Order.Application/Features/Order/EventHandlers/Domain/OrderCreatedDomainEventHandler.cs`
  - `src/Services/Order/Core/Order.Application/Features/Order/EventHandlers/Domain/OrderCancelledDomainEventHandler.cs`
  - `src/Services/Order/Core/Order.Application/Features/Order/EventHandlers/Domain/OrderDeliveredDomainEventHandler.cs`
- Outbox entity:
  - `src/Services/Order/Core/Order.Domain/Entities/OutboxMessageEntity.cs`
- Outbox worker:
  - `src/Services/Order/Worker/Order.Woker.Outbox/Program.cs`
  - `src/Services/Order/Worker/Order.Woker.Outbox/BackgroundServices/OutboxBackgroundService.cs`
  - `src/Services/Order/Worker/Order.Woker.Outbox/Processors/OutboxProcessor.cs`

### 1) Domain events (đã có)

File: `src/Services/Order/Core/Order.Domain/Events/OrderCreatedDomainEvent.cs`

```csharp
public sealed record OrderCreatedDomainEvent(OrderEntity Order) : IDomainEvent;
```

File: `src/Services/Order/Core/Order.Domain/Events/OrderCancelledDomainEvent.cs`

```csharp
public sealed record OrderCancelledDomainEvent(OrderEntity Order) : IDomainEvent;
```

File: `src/Services/Order/Core/Order.Domain/Events/OrderDeliveredDomainEvent.cs`

```csharp
public sealed record OrderDeliveredDomainEvent(OrderEntity Order) : IDomainEvent;
```

### 2) Domain raise events (đã có)

File: `src/Services/Order/Core/Order.Domain/Entities/OrderEntity.cs`

```csharp
public void OrderCreated()
{
    AddDomainEvent(new OrderCreatedDomainEvent(this));
}

public void CancelOrder(string reason, string performBy)
{
    UpdateStatus(OrderStatus.Canceled, performBy);
    CancelReason = reason;
    LastModifiedBy = performBy;
    LastModifiedOnUtc = DateTimeOffset.UtcNow;

    AddDomainEvent(new OrderCancelledDomainEvent(this));
}

public void OrderDelivered(string performBy)
{
    UpdateStatus(OrderStatus.Delivered, performBy!);
    AddDomainEvent(new OrderDeliveredDomainEvent(this));
}
```

### 3) DispatchDomainEventsInterceptor (đã có)

File: `src/Services/Order/Core/Order.Infrastructure/Data/Interceptors/DispatchDomainEventsInterceptor.cs`

```csharp
public class DispatchDomainEventsInterceptor(IMediator mediator) : SaveChangesInterceptor
{
    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        await DispatchDomainEvents(eventData.Context);
        return await base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public async Task DispatchDomainEvents(DbContext? context)
    {
        if (context == null) return;

        var aggregates = context.ChangeTracker
            .Entries<IAggregate>()
            .Where(a => a.Entity.DomainEvents.Any())
            .Select(a => a.Entity);

        var domainEvents = aggregates
            .SelectMany(a => a.DomainEvents)
            .ToList();

        aggregates.ToList().ForEach(a => a.ClearDomainEvents());

        foreach (var domainEvent in domainEvents)
            await mediator.Publish(domainEvent);
    }
}
```

### 4) Domain event handler -> push Outbox (đã có)

Ví dụ với `OrderCreatedDomainEvent`:

File: `src/Services/Order/Core/Order.Application/Features/Order/EventHandlers/Domain/OrderCreatedDomainEventHandler.cs`

```csharp
public sealed class OrderCreatedDomainEventHandler(
    IUnitOfWork unitOfWork,
    ILogger<OrderCreatedDomainEventHandler> logger) : INotificationHandler<OrderCreatedDomainEvent>
{
    public async Task Handle(OrderCreatedDomainEvent @event, CancellationToken cancellationToken)
    {
        logger.LogInformation(
            "Domain Event handled: {DomainEvent} for OrderId: {OrderId}, OrderNo: {OrderNo}",
            @event.GetType().Name, @event.Order.Id, @event.Order.OrderNo);

        await PushToOutboxAsync(@event, cancellationToken);
    }

    private async Task PushToOutboxAsync(OrderCreatedDomainEvent @event, CancellationToken cancellationToken)
    {
        var message = new OrderCreatedIntegrationEvent()
        {
            Id = Guid.NewGuid().ToString(),
            OrderId = @event.Order.Id,
            OrderNo = @event.Order.OrderNo.ToString(),
            TotalPrice = @event.Order.TotalPrice,
            FinalPrice = @event.Order.FinalPrice,
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

### 5) Outbox Worker publish qua MassTransit (đã có)

Worker entry:

File: `src/Services/Order/Worker/Order.Woker.Outbox/Program.cs`

```csharp
builder.Services
    .AddApplicationServices()
    .AddInfrastructureServices(builder.Configuration)
    .AddWorkerServices(builder.Configuration)
    .AddHostedService<OutboxBackgroundService>();
```

Outbox processor publish:

File: `src/Services/Order/Worker/Order.Woker.Outbox/Processors/OutboxProcessor.cs`

```csharp
var messageType = GetOrAddMessageType(message.Type);
var deserializedMessage = JsonSerializer.Deserialize(message.Content, messageType)!;
await _publish.Publish(deserializedMessage, cancellationToken);
```

### 6) Test (10-20 phút)

- Run Order API + RabbitMQ
- Trigger:
  - `POST /admin/orders` (expect Outbox created)
  - `PATCH /admin/orders/{orderId}/status` với `Canceled/Delivered`
- Run `Order.Worker.Outbox` và verify log publish + queue nhận message

---

**Chúc bạn hoàn thành tốt Day 41!**
