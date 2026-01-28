# 📘 Day 55: Payment Reconciliation Job

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Tự động đối soát các giao dịch bị treo (Processing/Pending quá lâu).
Nhiều khi user thanh toán xong nhưng IPN bị lỗi mạng không đến được server ta -> Job này sẽ chủ động hỏi Gateway xem trạng thái thực sự là gì.

Bạn sẽ:

1.  **Job**: `ReconcilePaymentJob` dùng `Quartz` hoặc `BackgroundService`.
2.  **Logic**: Query `Pending` payments -> Call Gateway `VerifyPaymentAsync` -> Update DB.

**Thời gian ước tính**: 120 phút.

---

## ✅ Checklist

- [ ] Create `ReconcilePaymentJob`
- [ ] Implement `ProcessPendingPayments` logic
- [ ] Register Job in Program.cs
- [ ] Test with Mock Data

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Create Job Class (45 phút)

Tạo file `src/Services/Payment/Worker/Payment.Worker/Jobs/ReconcilePaymentJob.cs`
(Hoặc dùng project API nếu muốn chạy job trong API host, nhưng khuyến nghị Worker).

```csharp
using Microsoft.EntityFrameworkCore;
using Payment.Infrastructure.Data;
using Payment.Application.Gateways;
using Payment.Domain.Enums;
using Microsoft.Extensions.DependencyInjection;

namespace Payment.Worker.Jobs;

// Đơn giản dùng BackgroundService Loop. Nâng cao dùng Quartz.NET
public class ReconcilePaymentBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ReconcilePaymentBackgroundService> _logger;

    public ReconcilePaymentBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<ReconcilePaymentBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ReconcileAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Reconcile Job");
            }

            // Chạy 5 phút 1 lần
            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }
    }

    private async Task ReconcileAsync(CancellationToken token)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<PaymentDbContext>();
        var gatewayFactory = scope.ServiceProvider.GetRequiredService<IPaymentGatewayFactory>();

        // 1. Tìm các payment treo > 15 phút
        var cutOffTime = DateTimeOffset.UtcNow.AddMinutes(-15);
        var pendingPayments = await dbContext.Payments
            .Where(p => (p.Status == PaymentStatus.Processing || p.Status == PaymentStatus.Pending)
                        && p.CreatedOnUtc < cutOffTime)
            .Take(50) // Batch size
            .ToListAsync(token);

        if (!pendingPayments.Any()) return;

        _logger.LogInformation("Found {Count} pending payments to reconcile", pendingPayments.Count);

        foreach (var payment in pendingPayments)
        {
            try
            {
                // 2. Hỏi Gateway
                var gateway = gatewayFactory.GetGateway(payment.Method);

                // Nếu payment chưa có TransactionId (lỗi lúc tạo), có thể dùng OrderId để query tuỳ gateway
                var verifyResult = await gateway.VerifyPaymentAsync(payment.TransactionId ?? payment.Id.ToString(), token);

                if (verifyResult.IsSuccess)
                {
                    // Gateway báo thành công -> Update Completed
                    _logger.LogInformation("Payment {Id} found Success at Gateway. Updating...", payment.Id);
                    payment.Complete(verifyResult.TransactionId!, "Reconciled");
                }
                else
                {
                    // Gateway báo fail hoặc không tìm thấy -> Mark Failed (cần cẩn thận logic này tuỳ Biz)
                    _logger.LogWarning("Payment {Id} found Failed at Gateway. Updating...", payment.Id);
                    payment.MarkAsFailed("RECONCILE_FAILED", verifyResult.ErrorMessage ?? "Gateway not found transaction");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to reconcile payment {Id}", payment.Id);
            }
        }

        await dbContext.SaveChangesAsync(token);
    }
}
```

### Bước 2: Register & Run (10 phút)

Trong `Payment.Worker/Program.cs`:

```csharp
// Đăng ký Gateway Factory + DbContext (đã có từ Day 52)
// Đăng ký Job
builder.Services.AddHostedService<ReconcilePaymentBackgroundService>();
```

### Bước 3: Admin Endpoint (Optional) (20 phút)

Nếu muốn trigger tay, thêm Endpoint vào `Payment.Api`: `POST /api/admin/payments/reconcile`.
Endpoint này sẽ gửi 1 `ReconcileCommand` xuống để Worker xử lý ngay lập tức (hoặc xử lý trực tiếp).

---

**Chúc bạn hoàn thành tốt Day 55!**
