# 📘 Day 50: Payment Idempotency & Webhook Audit Log

## 🎯 Mục tiêu ngày hôm nay

**Feature**:

1.  **Audit Log**: Lưu lại mọi request IPN raw để đối soát (reconciliation) khi có tranh chấp.
2.  **Idempotency**: Đảm bảo nếu Momo/VNPay gọi IPN 2 lần (do mạng lag), hệ thống không xử lý sai (không cộng tiền 2 lần).

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Create `PaymentWebhookLog` Entity
- [ ] Create `PaymentWebhookLogConfiguration` (EF Core)
- [ ] Create migration & Update DB
- [ ] Update `MomoEndpoints` to save log
- [ ] Refine Idempotency Logic

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Create Entity (20 phút)

Tạo file `src/Services/Payment/Core/Payment.Domain/Entities/PaymentWebhookLog.cs`:

```csharp
using BuildingBlocks.Abstractions;

namespace Payment.Domain.Entities;

public class PaymentWebhookLog : Entity<Guid>
{
    public string Gateway { get; private set; } = default!; // "Momo", "VnPay"
    public string RequestId { get; private set; } = default!; // Unique ID from Gateway
    public string Content { get; private set; } = default!; // JSON payload
    public bool IsProcessed { get; private set; }
    public string? ErrorMessage { get; private set; }

    public static PaymentWebhookLog Create(string gateway, string requestId, string content)
    {
        return new PaymentWebhookLog
        {
            Id = Guid.NewGuid(),
            Gateway = gateway,
            RequestId = requestId,
            Content = content,
            IsProcessed = false,
            CreatedOnUtc = DateTimeOffset.UtcNow
        };
    }

    public void MarkProcessed()
    {
        IsProcessed = true;
        LastModifiedOnUtc = DateTimeOffset.UtcNow;
    }

    public void MarkFailed(string error)
    {
        IsProcessed = false;
        ErrorMessage = error;
        LastModifiedOnUtc = DateTimeOffset.UtcNow;
    }
}
```

### Bước 2: Infrastructure Configuration (15 phút)

Tạo file `src/Services/Payment/Core/Payment.Infrastructure/Data/Configurations/PaymentWebhookLogConfiguration.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Payment.Domain.Entities;

namespace Payment.Infrastructure.Data.Configurations;

public class PaymentWebhookLogConfiguration : IEntityTypeConfiguration<PaymentWebhookLog>
{
    public void Configure(EntityTypeBuilder<PaymentWebhookLog> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Gateway).HasMaxLength(50).IsRequired();
        builder.Property(x => x.RequestId).HasMaxLength(100).IsRequired();

        // Composite Index để tìm kiếm nhanh và đảm bảo tính duy nhất nếu cần
        builder.HasIndex(x => new { x.Gateway, x.RequestId });
    }
}
```

Thêm vào `PaymentDbContext`:

```csharp
public DbSet<PaymentWebhookLog> WebhookLogs => Set<PaymentWebhookLog>();

protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);
    modelBuilder.ApplyConfigurationsFromAssembly(typeof(PaymentDbContext).Assembly);
}
```

Tạo Migration:

```bash
dotnet ef migrations add AddWebhookLog -s src/Services/Payment/Api/Payment.Api -p src/Services/Payment/Core/Payment.Infrastructure
dotnet ef database update -s src/Services/Payment/Api/Payment.Api -p src/Services/Payment/Core/Payment.Infrastructure
```

### Bước 3: Update Endpoint with Idempotency (30 phút)

Cập nhật lại `MomoEndpoints.cs` (Day 49) để thêm logic Log và Idempotency.

Cần inject `PaymentDbContext` trực tiếp hoặc qua Repository mới (ở đây dùng DbContext cho nhanh log raw).

```csharp
private async Task<IResult> HandleIpn(
    [FromBody] MomoIpnRequest request,
    ISender sender,
    PaymentDbContext dbContext, // Inject DbContext
    IOptions<MomoSettings> options,
    ILogger<MomoEndpoints> logger)
{
    var requestId = request.RequestId;
    var gateway = "Momo";
    var payload = System.Text.Json.JsonSerializer.Serialize(request);

    // 1. Audit Log (Always save first)
    // Check if log exists to avoid PK duplicate if retry exactly same ID
    var existingLog = await dbContext.WebhookLogs
        .FirstOrDefaultAsync(x => x.Gateway == gateway && x.RequestId == requestId);

    if (existingLog == null)
    {
        existingLog = PaymentWebhookLog.Create(gateway, requestId, payload);
        dbContext.WebhookLogs.Add(existingLog);
        await dbContext.SaveChangesAsync();
    }
    else
    {
        if (existingLog.IsProcessed)
        {
            logger.LogInformation("IPN {RequestId} already processed.", requestId);
            return Results.NoContent();
        }
    }

    // 2. Process Logic (Verify & Command)
    // ... Copy logic verify signature từ Day 49 ...

    try
    {
        // 2.a Verify Signature code here
        // ...

        // 2.b Send Command
        var paymentId = Guid.Parse(request.OrderId);
        var command = new HandlePaymentCallbackCommand(...);
        await sender.Send(command);

        // 3. Mark Log Success
        existingLog.MarkProcessed();
        await dbContext.SaveChangesAsync();
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error processing IPN");
        existingLog.MarkFailed(ex.Message);
        await dbContext.SaveChangesAsync();
        // Return 204 to Momo to stop retrying if it's a logic error,
        // OR return 500 if you want Momo to retry.
        return Results.Problem(ex.Message);
    }

    return Results.NoContent();
}
```

---

**Kết quả**: Bạn đã có một hệ thống Payment Gateway cứng cáp, safety cao! 🛡️
