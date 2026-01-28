# 📘 Day 81: Create Notification Service Structure

## 🎯 Mục tiêu ngày hôm nay

**Phase**: Notification Service - Chịu trách nhiệm gửi Email, SMS, Push Notification cho người dùng.
**Architecture**: Service này hoạt động chủ yếu dưới dạng **Consumer** (lắng nghe sự kiện từ RabbitMQ) thay vì nhận Direct HTTP Request.

**Concept**:

- **OrderCreated** -> Gửi email "Xác nhận đơn hàng".
- **PaymentCompleted** -> Gửi email "Thanh toán thành công".

**Thời gian ước tính**: 60 phút.

---

## ✅ Checklist

- [ ] Create Project `Notification.Worker` (hoặc `.Api`).
- [ ] Install Packages (`MassTransit`, `MailKit`).
- [ ] Implement `OrderCreatedConsumer` (Initial shell).
- [ ] Register MassTransit in `Program.cs`.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Create Project (15 phút)

Ta sẽ tạo dạng **Worker Service** vì nó chủ yếu chạy ngầm.

```bash
# Tại src/Services
mkdir src/Services/Notification
cd src/Services/Notification

dotnet new worker -n Notification.Worker
dotnet sln ../../../ProgcoderShop.sln add Notification.Worker/Notification.Worker.csproj

# Add References
dotnet add Notification.Worker/Notification.Worker.csproj reference ../../../Shared/EventSourcing/EventSourcing.csproj
```

### Bước 2: Install Packages (10 phút)

```bash
cd Notification.Worker
dotnet add package MassTransit.RabbitMQ
dotnet add package MailKit
dotnet add package MimeKit
```

### Bước 3: Implement Consumer (20 phút)

Tạo thư mục `Consumers`.
Tạo file `src/Services/Notification/Notification.Worker/Consumers/OrderCreatedConsumer.cs`:

```csharp
using MassTransit;
using EventSourcing.Events.Orders;
using Microsoft.Extensions.Logging;

namespace Notification.Worker.Consumers;

public class OrderCreatedConsumer : IConsumer<OrderCreatedIntegrationEvent>
{
    private readonly ILogger<OrderCreatedConsumer> _logger;

    public OrderCreatedConsumer(ILogger<OrderCreatedConsumer> logger)
    {
        _logger = logger;
    }

    public Task Consume(ConsumeContext<OrderCreatedIntegrationEvent> context)
    {
        var message = context.Message;
        _logger.LogInformation("🔔 [Notification] Received OrderCreated: {OrderId}. Sending email to Customer...", message.OrderId);

        // TODO: Send Email logic (Day 82)

        return Task.CompletedTask;
    }
}
```

### Bước 4: Configuration (15 phút)

`src/Services/Notification/Notification.Worker/Program.cs`:

```csharp
using MassTransit;
using Notification.Worker.Consumers;

var builder = Host.CreateApplicationBuilder(args);

// 1. MassTransit
builder.Services.AddMassTransit(bus =>
{
    bus.AddConsumer<OrderCreatedConsumer>();

    bus.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration["RabbitMq:Host"] ?? "localhost", "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });

        cfg.ReceiveEndpoint("notification-service-order-events", e =>
        {
            e.ConfigureConsumer<OrderCreatedConsumer>(context);
        });
    });
});

var host = builder.Build();
host.Run();
```

`appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "MassTransit": "Information"
    }
  },
  "RabbitMq": {
    "Host": "localhost"
  }
}
```

### Bước 5: Test (10 phút)

1. Chạy `Notification.Worker`.
2. Chạy `Order.Api` (hoặc gửi message giả).
3. Tạo Order.
4. Check log Notification: Thấy dòng "🔔 [Notification] Received OrderCreated..." là thành công.

---

**Chúc bạn hoàn thành tốt Day 81!**
