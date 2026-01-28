# 📘 Day 79: Testing Saga & Compensation Logic

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Xử lý tình huống lỗi (Compensation).
Nếu Payment thất bại, Saga phải quay lại bảo Catalog "Trả hàng lại kho đi" (`ReleaseStock`). Đây là **Critical** để data không bị lệch.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Handle `InventoryFailed` event in Saga -> Transition `Failed` -> Update Order Status = Cancelled.
- [ ] Handle `PaymentFailed` event in Saga -> Send `ReleaseStockCommand` -> Transition `Failed`.
- [ ] Test scenarios using `Scenarios.http` with bad data.

---

## 📋 Hướng dẫn chi tiết từng bước

### **Shared Contracts for Compensation**

Cần đảm bảo đã có các class này (nếu chưa tạo ở Day 78):

```csharp
namespace EventSourcing.Commands;
// Dùng để trả hàng lại kho khi Payment Fail
public record ReleaseStockCommand(Guid OrderId, Guid ProductId, int Quantity);
```

```csharp
namespace EventSourcing.Events.Inventory;
// Catalog báo hết hàng
public record InventoryReservedFailedEvent(Guid OrderId, string Reason);
```

```csharp
namespace EventSourcing.Events.Payments;
// Payment báo lỗi/hết tiền
public record PaymentFailedEvent(Guid OrderId, string Reason);
```

### Bước 1: Handle Payment Failure (Compensation) (45 phút)

Trong `OrderStateMachine.cs`:

```csharp
public Event<PaymentFailedEvent> PaymentFailed { get; private set; }

// During Reserved State (Đang chờ Payment)
During(Reserved,
    When(PaymentFailed)
        .Then(ctx => _logger.LogWarning("Payment failed for Order {Id}", ctx.Saga.OrderId))
        .Send(new Uri("queue:catalog-stock-release"), ctx => new ReleaseStockCommand(ctx.Saga.OrderId)) // Bù trừ
        .TransitionTo(PaymentFailedState)
);
```

### Bước 2: Handle Inventory Failure (30 phút)

```csharp
public Event<InventoryReservedFailedEvent> InventoryReservedFailed { get; private set; }

During(Initial,
    When(InventoryReservedFailed)
        .Then(ctx => _logger.LogWarning("Stock failed for Order {Id}", ctx.Saga.OrderId))
        .TransitionTo(InventoryFailedState)
        // Không cần compensate gì vì chưa trừ kho
        // Nhưng cần gửi UpdateOrderStatusCommand về Order Service để báo Cancel
);
```

### Bước 3: Test Scenarios (15 phút)

**Scenario 1: Hết tiền**

1.  Cố tạo Order với số tiền > Hạn mức ví (nếu có logic này) hoặc Mock Payment luôn fail.
2.  Observe:
    - Saga start.
    - Catalog: Stock reserved (Trừ kho).
    - Payment: Fail.
    - Saga nhận Fail -> Gửi Release Stock.
    - Catalog: Release Stock (Kho hồi phục).
    - **Kết quả**: Kho không mất, Order Cancelled. Đúng!

**Scenario 2: Hết hàng**

1.  Tạo Order món hàng Quantity > Stock.
2.  Observe:
    - Saga start.
    - Catalog: Fail (InventoryReservedFailed).
    - Saga End (Failed).
    - **Kết quả**: Payment chưa kịp chạy. Đúng!

---

**Chúc bạn hoàn thành tốt Day 79!**
