# 📘 Day 39: Create Order Status Management & Business Rules

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Chuẩn hoá quản lý trạng thái đơn hàng (Order Status) và các rule chuyển trạng thái (state machine).

Bạn sẽ:

1. **Domain**: Define `OrderStatus` + transition rules.
2. **Domain Methods**: Thêm methods để chuyển trạng thái (Confirm/Ship/Complete/Cancel).
3. **Consistency**: Ensure Update/Cancel (Day 37-38) tuân thủ rule trạng thái.
4. **API**: (Tuỳ chọn) tạo endpoint admin để chuyển trạng thái.
5. **Testing**: Test các case hợp lệ/không hợp lệ.

**Thời gian ước tính**: 60-120 phút.

---

## ✅ Checklist - Đánh dấu khi hoàn thành

### Domain Layer

- [ ] Tạo `OrderStatus` (enum hoặc smart enum)
- [ ] Define state transitions (Pending -> Confirmed -> Shipped -> Completed)
- [ ] Define forbidden transitions (Completed không thể Cancel, ...)
- [ ] Thêm các method domain:
  - [ ] `Confirm()`
  - [ ] `Ship()`
  - [ ] `Complete()`
  - [ ] `Cancel()`
- [ ] Set timestamps (ví dụ: `ConfirmedAt`, `ShippedAt`, `CompletedAt`, `CancelledAt`) nếu domain có

### Application Layer

- [ ] Update `UpdateOrderCommandHandler` để chỉ update khi trạng thái cho phép
- [ ] Update `CancelOrderCommandHandler` để chỉ cancel khi trạng thái cho phép
- [ ] (Tuỳ chọn) Tạo `UpdateOrderStatusCommand` cho admin

### API Layer

- [ ] (Tuỳ chọn) Expose endpoint admin:
  - [ ] `POST /admin/orders/{orderId}/confirm`
  - [ ] `POST /admin/orders/{orderId}/ship`
  - [ ] `POST /admin/orders/{orderId}/complete`

### Testing

- [ ] Verify transitions hợp lệ
- [ ] Verify transitions sai -> trả lỗi đúng (400/409)

---

## 📋 Hướng dẫn chi tiết từng bước

## 🧩 Code chi tiết (đúng theo codebase hiện tại)

Trong project của bạn, quản lý trạng thái Order đã được implement theo kiểu:
- Domain có `OrderStatus` enum
- Domain có `UpdateStatus(...)`, `CancelOrder(...)`, `RefundOrder(...)`, `OrderDelivered(...)` 
- Application dùng **1 command chung** `UpdateOrderStatusCommand` để đổi trạng thái
- API expose endpoint `PATCH /admin/orders/{orderId}/status`

### 0) Các file liên quan

- `src/Services/Order/Core/Order.Domain/Enums/OrderStatus.cs`
- `src/Services/Order/Core/Order.Domain/Entities/OrderEntity.cs`
- `src/Services/Order/Core/Order.Application/Features/Order/Commands/UpdateOrderStatusCommand.cs`
- `src/Services/Order/Api/Order.Api/Models/UpdateOrderStatusRequest.cs`
- `src/Services/Order/Api/Order.Api/Endpoints/UpdateOrderStatus.cs`
- `src/Services/Order/Api/Order.Api/Constants/ApiRoutes.cs`

### 1) OrderStatus enum (đã có)

File: `src/Services/Order/Core/Order.Domain/Enums/OrderStatus.cs`

```csharp
public enum OrderStatus
{
    [Description("Pending")]
    Pending = 1,
 
    [Description("Confirmed")]
    Confirmed = 2,
 
    [Description("Processing")]
    Processing = 3,
 
    [Description("Shipped")]
    Shipped = 4,
 
    [Description("Delivered")]
    Delivered = 5,
 
    [Description("Canceled")]
    Canceled = 6,
 
    [Description("Refunded")]
    Refunded = 7
}
```

### 2) Domain methods đổi trạng thái (đã có)

File: `src/Services/Order/Core/Order.Domain/Entities/OrderEntity.cs`

```csharp
public void UpdateStatus(OrderStatus status, string performBy)
{
    if (!Enum.IsDefined(typeof(OrderStatus), status))
    {
        throw new ArgumentException(MessageCode.InvalidOrderStatus, nameof(status));
    }
 
    Status = status;
    LastModifiedBy = performBy;
    LastModifiedOnUtc = DateTimeOffset.UtcNow;
}
 
public void CancelOrder(string reason, string performBy)
{
    UpdateStatus(OrderStatus.Canceled, performBy);
 
    CancelReason = reason;
    LastModifiedBy = performBy;
    LastModifiedOnUtc = DateTimeOffset.UtcNow;
 
    AddDomainEvent(new OrderCancelledDomainEvent(this));
}
 
public void RefundOrder(string reason, string performBy)
{
    UpdateStatus(OrderStatus.Refunded, performBy);
 
    RefundReason = reason;
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

### 3) Command + Endpoint đổi trạng thái (đã có)

File: `src/Services/Order/Core/Order.Application/Features/Order/Commands/UpdateOrderStatusCommand.cs`

- Validator bắt buộc `Reason` khi `Canceled/Refunded`
- Handler chặn update status nếu order đang `Delivered/Canceled/Refunded`
- Handler gọi đúng domain methods theo `Status`

API route:
 
File: `src/Services/Order/Api/Order.Api/Constants/ApiRoutes.cs`
 
```csharp
public const string UpdateOrderStatus = $"{BaseAdmin}/{{orderId}}/status";
```

Endpoint:

File: `src/Services/Order/Api/Order.Api/Endpoints/UpdateOrderStatus.cs`

- `PATCH /admin/orders/{orderId}/status`
- Body: `{ "status": "Delivered", "reason": null }` (reason tuỳ status)

### 4) Rule state machine hiện tại (đang implement ở handler)

Hiện tại rule state machine đang ở `UpdateOrderStatusCommandHandler`:

- Không cho đổi status nếu order đang:
  - `Delivered`
  - `Canceled`
  - `Refunded`
- Không cho set status trùng status hiện tại

Nếu bạn muốn rule chặt hơn (VD: `Pending -> Confirmed -> Processing -> Shipped -> Delivered`), bạn có thể:
- **Option A**: implement trong `OrderEntity.UpdateStatus` (domain-driven)
- **Option B**: implement trong `UpdateOrderStatusCommandHandler` (application-driven)

## 🧪 Test nhanh (10-15 phút)

- Tạo order: `POST /admin/orders`
- Set status: `PATCH /admin/orders/{orderId}/status`
  - Delivered
- Thử set tiếp status khác sau Delivered -> phải fail (`MessageCode.OrderStatusCannotBeUpdated`)

---

**Chúc bạn hoàn thành tốt Day 39!**
