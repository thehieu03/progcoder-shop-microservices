# 📘 Day 78: Implement Saga Steps (Inventory & Payment)

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Hoàn thiện logic Saga.

1.  Saga gửi Command `ReserveStock` sang Catalog.
2.  Catalog trả lời `StockReserved` hoặc `StockFailed`.
3.  Nếu Reserved -> Saga gửi `ProcessPayment`.
4.  Nếu Payment OK -> Complete.

**Thời gian ước tính**: 120 phút.

---

## ✅ Checklist

- [ ] Define Commands: `ReserveStockCommand` (Shared), `ProcessPaymentCommand` (Shared).
- [ ] Implement Consumers for these commands in Catalog/Payment service.
- [ ] Update `OrderStateMachine` to Send/Listen.

---

## 📋 Hướng dẫn chi tiết từng bước

### **Missing Shared Contracts**

Trước khi làm tiếp, hãy đảm bảo bạn đã định nghĩa các class sau trong project `Shared` (Contracts/Events):

**1. Commands** (`src/Shared/EventSourcing/Commands/CatalogCommands.cs` & `PaymentCommands.cs`)

```csharp
namespace EventSourcing.Commands;
public record ReserveStockCommand(Guid OrderId, Guid ProductId, int Quantity);
public record ReleaseStockCommand(Guid OrderId, Guid ProductId, int Quantity); // For Compensation
public record ProcessPaymentCommand(Guid OrderId, Guid CustomerId, decimal Amount);
```

**2. Events** (`src/Shared/EventSourcing/Events/...`)

```csharp
namespace EventSourcing.Events.Inventory;
public record InventoryReservedEvent(Guid OrderId);
public record InventoryReservedFailedEvent(Guid OrderId, string Reason);

namespace EventSourcing.Events.Payments;
public record PaymentProcessedEvent(Guid OrderId, Guid PaymentId);
public record PaymentFailedEvent(Guid OrderId, string Reason);
```

### Bước 1: Routing Slip vs Orchestration (Giải thích)

Chúng ta dùng **Orchestration** thuần. Saga sẽ `Publish` command hoặc `Send` command.
Để tiện, ta dùng `Send` tới Endpoint queue cụ thể của Service đích.

### Bước 2: Update State Machine (Sending Commands) (45 phút)

```csharp
// Trong OrderStateMachine

// Define Events phản hồi
public Event<InventoryReservedEvent> InventoryReserved { get; private set; }
public Event<PaymentProcessedEvent> PaymentProcessed { get; private set; }

public OrderStateMachine()
{
    // ... Correlate config ...
    Event(() => InventoryReserved, x => x.CorrelateById(m => m.Message.OrderId));

    Initially(
        When(OrderCreated)
            .Then(ctx => { ... Init Data ... })
            .TransitionTo(Reserved)
            .Send(new Uri("queue:catalog-stock-reserve"), ctx => new ReserveStockCommand(ctx.Message.OrderId, ...))
            // Gửi lệnh giữ hàng tới queue của Catalog Service
    );

    During(Reserved,
        When(InventoryReserved)
            .TransitionTo(Paid)
            .Send(new Uri("queue:payment-process"), ctx => new ProcessPaymentCommand(ctx.Message.OrderId, ...))
            // Nhận tin đã giữ hàng -> Gửi lệnh trừ tiền
    );

    // ... Handle Failures (Compensate) ...
}
```

### Bước 3: Implement Consumers in Services (45 phút)

**Tại Catalog Service**:

- Tạo `ReserveStockConsumer`.
- Nhận `ReserveStockCommand`.
- Logic: Check kho -> Trừ kho.
- Reply: `context.Publish(new InventoryReservedEvent(...))` nếu thành công.

**Tại Payment Service**:

- Re-use hoặc tạo Consumer cho `ProcessPaymentCommand` (khác với API call, đây là message consumer).
- Logic: Gọi Momo/VnPay (hoặc trừ ví).
- Reply: `context.Publish(new PaymentProcessedEvent(...))`.

### Bước 4: Chạy thử (30 phút)

1.  Start RabbitMQ, Postgres.
2.  Start Ordering.Saga, Catalog.Worker, Payment.Worker.
3.  Create Order.
4.  Check Table `OrderState` -> Thấy trạng thái nhảy từ `Initial` -> `Reserved` -> `Paid` (nếu code xong hết).

---

**Chúc bạn hoàn thành tốt Day 78!**
