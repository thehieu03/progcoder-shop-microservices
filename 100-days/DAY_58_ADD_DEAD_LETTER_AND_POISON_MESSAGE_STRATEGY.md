# 📘 Day 58: Message Retry & Dead-letter Queue

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Xử lý lỗi khi Consume Message.
Nếu Consumer (vd: `PaymentCompletedConsumer`) bị lỗi (DB chết, Logic bug), hệ thống không được mất message.

1.  **Retry**: Thử lại N lần (Firstaid).
2.  **Dead-letter (DLQ)**: Nếu thử hết vẫn lỗi -> Chuyển vào hàng đợi lỗi (`_error`) để admin check sau.

**Thời gian ước tính**: 60 phút.

---

## ✅ Checklist

- [ ] Configure `UseMessageRetry` in MassTransit
- [ ] Understand `_error` and `_skipped` queues
- [ ] Test Poison Message (Throw Exception -> Move to DLQ)

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Configure Retry Policy (30 phút)

Cấu hình này áp dụng cho **tất cả** consumer hoặc riêng lẻ.
Sửa file `Program.cs` của `Payment.Worker` và `Order.Worker`.

```csharp
bus.UsingRabbitMq((context, cfg) =>
{
    cfg.Host(...);

    // Global Retry Policy: Retry 3 lần, cách nhau 2s, 5s, 10s
    cfg.UseMessageRetry(r => r.Intervals(2000, 5000, 10000));

    // Hoặc config riêng trong từng endpoint
    cfg.ReceiveEndpoint("payment-service-order-events", e =>
    {
        // Custom retry cho endpoint này
        e.UseMessageRetry(r => r.Immediate(5));
        e.ConfigureConsumer<OrderCreatedConsumer>(context);
    });
});
```

### Bước 2: Dead-letter Queue (Tự động)

Trong MassTransit + RabbitMQ, cơ chế DLQ là **tự động**.
Nếu message fail hết các lần retry:

1.  MassTransit sẽ move message đó sang queue tên: `payment-service-order-events_error`.
2.  Queue gốc sẽ trống để xử lý message tiếp theo.

Bạn không cần code thêm, chỉ cần biết cách check RabbitMQ Management UI.

### Bước 3: Test Poison Message (30 phút)

1.  Vào `OrderCreatedConsumer` (Day 56), thêm 1 dòng throw exception tạm thời:
    ```csharp
    throw new Exception("Simulated Crash!");
    ```
2.  Publish 1 message `OrderCreated`.
3.  Xem log Worker: Thấy báo lỗi, sau đó retry... retry...
4.  Sau 3 lần retry: Message biến mất khỏi queue chính.
5.  Mở RabbitMQ UI -> Queue `payment-service-order-events_error` -> Có 1 message.
6.  Thành công! Message không làm tắc hệ thống và đã được lưu lại để debug.

> **Khôi phục**: Sau khi fix bug, bạn có thể dùng RabbitMQ Shovel plugin hoặc MassTransit tool để move message từ `_error` về queue chính để chạy lại.

---

**Chúc bạn hoàn thành tốt Day 58!**
