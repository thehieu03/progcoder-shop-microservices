# 📘 Day 57: Order Consumes Payment Events

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Tự động cập nhật trạng thái Order khi Payment thành công.
Luồng: Payment Completed -> Publish `PaymentCompleted` -> Order Service nhận -> Update Order Status = `Paid/Processing`.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Create `PaymentCompletedConsumer` in **Order.Worker** (hoặc Order.Api)
- [ ] Register Consumer in Order Service
- [ ] Test: Payment Complete -> Order Status Update

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Consumer Implementation (Order Service) (40 phút)

Vào project **Order Service** (ví dụ `src/Services/Order/Worker/Order.Worker`).

Tạo Consumer `src/Services/Order/Worker/Order.Worker/Consumers/PaymentCompletedConsumer.cs`:

```csharp
using MassTransit;
using EventSourcing.Events.Payments; // Từ Shared Project
using Order.Application.UseCases.Orders.Commands.UpdateOrder;
using MediatR;

namespace Order.Worker.Consumers;

public class PaymentCompletedConsumer : IConsumer<PaymentCompletedIntegrationEvent>
{
    private readonly ISender _sender;
    private readonly ILogger<PaymentCompletedConsumer> _logger;

    public PaymentCompletedConsumer(ISender sender, ILogger<PaymentCompletedConsumer> logger)
    {
        _sender = sender;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<PaymentCompletedIntegrationEvent> context)
    {
        var message = context.Message;
        _logger.LogInformation("Order Service received PaymentCompleted for Order {OrderId}", message.OrderId);

        // Gửi Command update Order (Logic Reuse của Order)
        // Giả sử bạn đã có UpdateOrderCommand
        var command = new UpdateOrderStatusCommand(
            OrderId: message.OrderId,
            Status: OrderStatus.Paid, // Hoặc Processing/Confirmed
            Reason: $"Payment {message.TransactionId} success"
        );

        try
        {
            await _sender.Send(command);
            _logger.LogInformation("Order {OrderId} updated to Paid", message.OrderId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update Order {OrderId}", message.OrderId);
            throw; // Throw để MassTransit retry
        }
    }
}
```

### Bước 2: Register Consumer (Order Service) (20 phút)

Trong `Order.Worker/Program.cs` (hoặc nơi cấu hình MassTransit của Order):

```csharp
builder.Services.AddMassTransit(bus =>
{
    bus.AddConsumer<PaymentCompletedConsumer>();

    bus.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(...);

        // Queue name riêng cho Order Service nhận Payment Event
        cfg.ReceiveEndpoint("order-service-payment-events", e =>
        {
            e.ConfigureConsumer<PaymentCompletedConsumer>(context);
        });
    });
});
```

### Bước 3: Test Integration (20 phút)

1.  Chạy **cả hai** hệ thống Order và Payment (Api + Workers).
2.  Tạo Payment và Process cho thành công (Complete).
3.  Check log `Order.Worker`: Nhận được event.
4.  Check DB `OrderDb`: Order Status chuyển sang `Paid`.

---

**Chúc bạn hoàn thành tốt Day 57!**
