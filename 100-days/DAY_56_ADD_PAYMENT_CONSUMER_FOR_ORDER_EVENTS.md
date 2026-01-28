# 📘 Day 56: Payment Consumer (OrderCreated)

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Tự động tạo Payment Request khi có Order mới được tạo.
Luồng: User đặt hàng (Order Service) -> Publish `OrderCreated` -> Payment Service nhận -> Tạo record `Status=Pending`.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Create `OrderCreatedConsumer` in Payment.Worker
- [ ] Register Consumer in `MassTransit` configuration
- [ ] Test: Order Created -> Payment Created DB

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Consumer Implementation (40 phút)

File: `src/Services/Payment/Worker/Payment.Worker/Consumers/OrderCreatedConsumer.cs`

```csharp
using MassTransit;
using EventSourcing.Events.Orders; // Từ Shared Project
using Payment.Infrastructure.Data;
using Payment.Domain.Entities;
using Payment.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Payment.Worker.Consumers;

public class OrderCreatedConsumer : IConsumer<OrderCreatedIntegrationEvent>
{
    private readonly PaymentDbContext _dbContext;
    private readonly ILogger<OrderCreatedConsumer> _logger;

    public OrderCreatedConsumer(PaymentDbContext dbContext, ILogger<OrderCreatedConsumer> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<OrderCreatedIntegrationEvent> context)
    {
        var message = context.Message;
        _logger.LogInformation("Processing OrderCreated event: {OrderId}", message.OrderId);

        // 1. Idempotency Check (Quan trọng)
        // Kiểm tra xem Payment cho Order này đã tồn tại chưa
        var existingPayment = await _dbContext.Payments
            .AnyAsync(p => p.OrderId == message.OrderId);

        if (existingPayment)
        {
            _logger.LogInformation("Payment for Order {OrderId} already exists. Skipping.", message.OrderId);
            return;
        }

        // 2. Create Payment Record (Logic giống Day 44)
        var payment = PaymentEntity.Create(
            orderId: message.OrderId,
            amount: message.FinalPrice, // Giả sử event có field này
            method: PaymentMethod.VnPay // Default, hoặc lấy từ message nếu có
        );

        _dbContext.Payments.Add(payment);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Created Payment pending for Order {OrderId}", message.OrderId);
    }
}
```

### Bước 2: Register Consumer (20 phút)

Trong `Payment.Worker/Program.cs`:

```csharp
builder.Services.AddMassTransit(bus =>
{
    bus.AddConsumer<OrderCreatedConsumer>(); // <-- Add this

    bus.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(...); // Config host

        // Config receive endpoint queue
        cfg.ReceiveEndpoint("payment-service-order-events", e =>
        {
            e.ConfigureConsumer<OrderCreatedConsumer>(context);
        });

        cfg.ConfigureEndpoints(context);
    });
});
```

### Bước 3: Test (15 phút)

1.  Chạy `Payment.Worker`.
2.  Chạy `Order.Api` (hoặc dùng Postman gửi message giả vào RabbitMQ queue `payment-service-order-events`).
3.  Tạo Order mới.
4.  Check `PaymentDb`: Có record mới được tạo ra với `OrderId` vừa tạo.

---

**Chúc bạn hoàn thành tốt Day 56!**
