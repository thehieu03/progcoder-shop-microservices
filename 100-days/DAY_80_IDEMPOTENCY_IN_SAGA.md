# 📘 Day 80: Idempotency in Distributed Systems

## 🎯 Mục tiêu ngày hôm nay

**Problem**: Mạng lag, RabbitMQ gửi duplicate message.
-> `ReserveStock` bị gọi 2 lần cho cùng 1 Order -> Kho bị trừ 2 lần -> **SAI LỆCH**.

**Solution**: Idempotency (Tính lũy đẳng). Gọi 1 lần hay n lần thì kết quả vẫn y nguyên.

**Thời gian ước tính**: 60 phút.

---

## ✅ Checklist

- [ ] Concept: Identify Unique Key (OrderId / RequestId).
- [ ] Implementation: Inbox Pattern (Lưu messageId đã xử lý).
- [ ] Apply to Consumers (`ReserveStockConsumer`).

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Inbox Pattern (45 phút)

Ta có thể dùng `MassTransit` built-in feature: `UseMessageRetry` kết hợp `EntityFrameworkOutbox`.
Khi bật `UseEntityFrameworkOutbox`:

- MassTransit sẽ lưu `InboxState` vào DB.
- Nếu MessageId đã có trong `InboxState` -> Skip processing (hoặc trả lại kết quả cũ).

Trong `Catalog.Worker/Program.cs`:

```csharp
services.AddMassTransit(x =>
{
    x.AddEntityFrameworkOutbox<CatalogDbContext>(o =>
    {
        o.UsePostgres();
        o.UseBusOutbox(); // Enable Inbox/Outbox
    });

    x.AddConsumer<ReserveStockConsumer>();
});
```

Chỉ cần config này, MassTransit tự động handle Deduplication dựa trên `MessageId`.

### Bước 2: Business Logic Idempotency (15 phút)

Ngoài tầng framework, tầng Business cũng nên check.
Trong `ReserveStockConsumer`:

```csharp
var existingReservation = await dbContext.Reservations
    .AnyAsync(r => r.OrderId == message.OrderId);

if (existingReservation)
{
    _logger.LogInformation("Stock already reserved for Order {Id}", message.OrderId);
    // Vẫn phải publish event success để Saga nhận được (nếu lần trước Saga chưa nhận được)
    await context.Publish(new InventoryReservedEvent(...));
    return;
}
```

Việc kết hợp cả Framework Inbox và Business Check giúp hệ thống **Cực kỳ bền vững (Robust)**.

---

**Chúc mừng bạn đã hoàn thành Phase Integration & Saga (Day 76-80)! 🧩**

Hệ thống giờ đã đúng chuẩn Distributed System:

- **Gateway** điều hướng.
- **Identity** bảo vệ.
- **Saga** đảm bảo tính toàn vẹn dữ liệu (ACID-like).

Phase tiếp theo (Day 81-100) sẽ là **Advanced Integration** (gửi Email, Notification, Search ElasticSearch) và **DevOps** (Logging, Monitoring).
