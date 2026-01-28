# 📘 Day 52: Create Payment Outbox Worker

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Xây dựng Worker Service để quét bảng `OutboxMessages` và publish events lên Message Broker (RabbitMQ), đảm bảo "At-least-once delivery".

Bạn sẽ:

1.  **Project**: Tạo mới `Payment.Worker`.
2.  **Implementation**: Cấu hình MassTransit và Quartz (hoặc BackgroundService loop) để process outbox.
3.  **Deploy**: Chạy độc lập với API.

**Thời gian ước tính**: 120 phút.

---

## ✅ Checklist

- [ ] Create Project `Payment.Worker`
- [ ] Add Nuget Packages (MassTransit, RabbitMQ, PostgreSQL)
- [ ] Create `OutboxProcessor` (BackgroundService)
- [ ] Register MassTransit with RabbitMQ
- [ ] Run & Test: Event in DB -> Published to RabbitMQ

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Setup Project (15 phút)

```powershell
dotnet new worker -n Payment.Worker -o src/Services/Payment/Worker/Payment.Worker
dotnet sln add src/Services/Payment/Worker/Payment.Worker/Payment.Worker.csproj

# Reference
dotnet add src/Services/Payment/Worker/Payment.Worker/Payment.Worker.csproj reference src/Services/Payment/Core/Payment.Infrastructure/Payment.Infrastructure.csproj
dotnet add src/Services/Payment/Worker/Payment.Worker/Payment.Worker.csproj reference src/Shared/EventSourcing/EventSourcing.csproj
```

Packages cần thiết:

```xml
<PackageReference Include="MassTransit.RabbitMQ" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" />
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" />
<PackageReference Include="Newtonsoft.Json" />
```

### Bước 2: Implement Outbox Processor (40 phút)

Tạo file `src/Services/Payment/Worker/Payment.Worker/Workers/OutboxBackgroundService.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using MassTransit;
using Newtonsoft.Json;
using Payment.Infrastructure.Data;

namespace Payment.Worker.Workers;

public class OutboxBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<OutboxBackgroundService> _logger;
    private readonly IPublishEndpoint _publishEndpoint;

    public OutboxBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<OutboxBackgroundService> logger,
        IPublishEndpoint publishEndpoint)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _publishEndpoint = publishEndpoint;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessOutboxBatch(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing outbox");
            }

            await Task.Delay(2000, stoppingToken); // Wait 2s before next batch
        }
    }

    private async Task ProcessOutboxBatch(CancellationToken token)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<PaymentDbContext>();

        // 1. Get Unprocessed Messages
        var messages = await dbContext.OutboxMessages
            .Where(m => m.ProcessedOnUtc == null)
            .OrderBy(m => m.OccurredOnUtc)
            .Take(20)
            .ToListAsync(token);

        if (!messages.Any()) return;

        foreach (var message in messages)
        {
            try
            {
                // 2. Deserialize & Publish
                var type = Type.GetType(message.Type);
                if (type == null)
                {
                    _logger.LogWarning("Type not found: {Type}", message.Type);
                    message.Error = "Type not found";
                }
                else
                {
                    var eventData = JsonConvert.DeserializeObject(message.Content, type);
                    if (eventData != null)
                    {
                        await _publishEndpoint.Publish(eventData, token);
                        _logger.LogInformation("Published message: {Id} - {Type}", message.Id, message.Type);
                    }
                }

                // 3. Mark Processed
                message.ProcessedOnUtc = DateTimeOffset.UtcNow;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to publish message {Id}", message.Id);
                message.Error = ex.Message;
            }
        }

        await dbContext.SaveChangesAsync(token);
    }
}
```

### Bước 3: Configure Program.cs (30 phút)

File `src/Services/Payment/Worker/Payment.Worker/Program.cs`:

```csharp
using Payment.Infrastructure.Data;
using Payment.Worker.Workers;
using MassTransit;
using Microsoft.EntityFrameworkCore;

var builder = Host.CreateApplicationBuilder(args);

// 1. DbContext
builder.Services.AddDbContext<PaymentDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PaymentDb")));

// 2. MassTransit (RabbitMQ)
builder.Services.AddMassTransit(bus =>
{
    bus.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration["RabbitMq:Host"], "/", h =>
        {
            h.Username(builder.Configuration["RabbitMq:Username"]);
            h.Password(builder.Configuration["RabbitMq:Password"]);
        });

        cfg.ConfigureEndpoints(context);
    });
});

// 3. Worker
builder.Services.AddHostedService<OutboxBackgroundService>();

var host = builder.Build();
host.Run();
```

### Bước 4: Test (15 phút)

1.  Đảm bảo RabbitMQ & Postgres đang chạy.
2.  Chạy `Payment.Worker`.
3.  Trigger Action tạo Payment Success (qua API).
4.  Quan sát Log của `Payment.Worker`:
    - `Published message: ... PaymentCompletedIntegrationEvent`
5.  Kiểm tra DB: cột `ProcessedOnUtc` của bảng Outbox đã có giá trị.

---

**Chúc bạn hoàn thành tốt Day 52!**
