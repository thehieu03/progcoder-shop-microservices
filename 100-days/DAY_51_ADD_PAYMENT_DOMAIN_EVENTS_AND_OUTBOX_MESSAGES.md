# 📘 Day 51: Payment - Domain Events + Outbox Messages

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Khi Payment thay đổi trạng thái (Completed/Failed), hệ thống cần phát ra Integration Event để các service khác (Order, Notification) biết và phản ứng.

Bạn sẽ:

1.  **Domain Events**: Tạo `PaymentCompletedDomainEvent`, `PaymentFailedDomainEvent`.
2.  **Integration Events**: Tạo `PaymentCompletedIntegrationEvent` (chia sẻ qua Shared kernel).
3.  **Handlers**: Xử lý Domain Event -> Lưu Integration Event vào Outbox table.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Create `PaymentCompletedDomainEvent` & `PaymentFailedDomainEvent`
- [ ] Create `PaymentCompletedIntegrationEvent` (Shared)
- [ ] Create `PaymentCompletedDomainEventHandler`
- [ ] Register Handlers in DI
- [ ] Test flow: Complete Payment -> Check Outbox DB Table

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Create Domain Events (15 phút)

> **Lưu ý**: Đã làm sơ bộ ở Day 46, nay kiện toàn lại.

File: `src/Services/Payment/Core/Payment.Domain/Events/PaymentCompletedDomainEvent.cs`

```csharp
using BuildingBlocks.Abstractions;

namespace Payment.Domain.Events;

public sealed record PaymentCompletedDomainEvent(
    Guid PaymentId,
    Guid OrderId,
    string TransactionId,
    decimal Amount,
    DateTimeOffset OccurredOn
) : IDomainEvent;
```

File: `src/Services/Payment/Core/Payment.Domain/Events/PaymentFailedDomainEvent.cs`

```csharp
using BuildingBlocks.Abstractions;

namespace Payment.Domain.Events;

public sealed record PaymentFailedDomainEvent(
    Guid PaymentId,
    Guid OrderId,
    string ErrorCode,
    string ErrorMessage,
    DateTimeOffset OccurredOn
) : IDomainEvent;
```

### Bước 2: Create Integration Events (Shared Project) (15 phút)

Vì event này sẽ được Order Service consume, nên phải đặt ở Project Shared (ví dụ `EventSourcing` hoặc `Shared.Contracts`).

File: `src/Shared/EventSourcing/Events/Payments/PaymentCompletedIntegrationEvent.cs`

```csharp
namespace EventSourcing.Events.Payments;

public record PaymentCompletedIntegrationEvent(
    Guid Id,
    Guid PaymentId,
    Guid OrderId,
    string TransactionId,
    decimal Amount,
    DateTimeOffset OccurredOn
);
```

File: `src/Shared/EventSourcing/Events/Payments/PaymentFailedIntegrationEvent.cs`

```csharp
namespace EventSourcing.Events.Payments;

public record PaymentFailedIntegrationEvent(
    Guid Id,
    Guid PaymentId,
    Guid OrderId,
    string ErrorCode,
    string ErrorMessage,
    DateTimeOffset OccurredOn
);
```

````

### Bước 3: Create Outbox Entity (Quan trọng)

Trước khi tạo Handler lưu vào Outbox, ta cần định nghĩa Entity này trong Payment Domain.

File: `src/Services/Payment/Core/Payment.Domain/Entities/OutboxMessage.cs`

```csharp
using BuildingBlocks.Abstractions;

namespace Payment.Domain.Entities;

public class OutboxMessage : Entity<Guid>
{
    public string Type { get; set; } = default!;
    public string Content { get; set; } = default!;
    public DateTimeOffset OccurredOnUtc { get; set; }
    public DateTimeOffset? ProcessedOnUtc { get; set; }
    public string? Error { get; set; }
}
````

_Đừng quên đăng ký `DbSet<OutboxMessage>` vào `PaymentDbContext` nhé!_

### Bước 4: Create Domain Event Handlers (30 phút)

Handler này sẽ lắng nghe Domain Event (in-memory) và chuyển đổi thành Integration Event (lưu vào Outbox để gửi sau).

File: `src/Services/Payment/Core/Payment.Application/Features/Payment/EventHandlers/Domain/PaymentCompletedDomainEventHandler.cs`

```csharp
using BuildingBlocks.Abstractions;
using MediatR;
using Microsoft.Extensions.Logging;
using Payment.Domain.Events;
using EventSourcing.Events.Payments;
using Newtonsoft.Json;
using Payment.Infrastructure.Data; // Access to DbContext/Outbox

namespace Payment.Application.Features.Payment.EventHandlers.Domain;

public class PaymentCompletedDomainEventHandler(
    PaymentDbContext dbContext,
    ILogger<PaymentCompletedDomainEventHandler> logger)
    : INotificationHandler<PaymentCompletedDomainEvent>
{
    public async Task Handle(PaymentCompletedDomainEvent @event, CancellationToken cancellationToken)
    {
        logger.LogInformation("Domain Event handled: {DomainEvent}", @event.GetType().Name);

        // 1. Create Integration Event
        var integrationEvent = new PaymentCompletedIntegrationEvent(
            Id: Guid.NewGuid(),
            PaymentId: @event.PaymentId,
            OrderId: @event.OrderId,
            TransactionId: @event.TransactionId,
            Amount: @event.Amount,
            OccurredOn: @event.OccurredOn
        );

        // 2. Create Outbox Message
        var outboxMessage = new OutboxMessageEntity // Assumes you have OutboxMessageEntity defined similar to Order Service
        {
            Id = Guid.NewGuid(),
            OccurredOnUtc = DateTimeOffset.UtcNow,
            Type = integrationEvent.GetType().AssemblyQualifiedName!,
            Content = JsonConvert.SerializeObject(integrationEvent, new JsonSerializerSettings
            {
                TypeNameHandling = TypeNameHandling.All // Important for MassTransit polymorphism
            })
        };

        // 3. Save to DB (Transactional with Payment update because same DbContext)
        dbContext.OutboxMessages.Add(outboxMessage);

        // Note: SaveChangesAsync is usually called by the CommandHandler wrapping this,
        // OR if you use MediatR dispatch after save, you might need to save here.
        // In Clean Architecture with UnitOfWork, usually the UoW commits everything at the end of the Command.
        // So just adding to DbSet is enough.
    }
}
```

> **Tương tự cho `PaymentFailedDomainEventHandler`.**

### Bước 4: Verification (20 phút)

1.  Chạy lại endpoint `POST /api/payments/{id}/process` (Momo/Mock/VNPay).
2.  Sau khi thanh toán thành công, kiểm tra database `PaymentDb`, bảng `OutboxMessages`.
3.  Nếu thấy record mới -> Thành công! (Worker sẽ xử lý record này sau).

---

**Chúc bạn hoàn thành tốt Day 51!**
