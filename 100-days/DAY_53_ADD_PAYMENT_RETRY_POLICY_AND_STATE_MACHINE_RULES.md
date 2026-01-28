# 📘 Day 53: Payment Retry Policy & State Machine

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Tăng độ ổn định cho hệ thống thanh toán.

1.  **State Machine**: Đảm bảo Payment không chuyển trạng thái lung tung (vd: đang Failed không được Complete).
2.  **Retry Policy**: Khi gọi Gateway lỗi (mạng, timeout), cần tự động retry thông minh (Exponential Backoff).

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Update `PaymentEntity` methods (State Guard)
- [ ] Update `Status` Enum (if needed)
- [ ] Add `Polly` Retry Policy to `ProcessPaymentCommandHandler`
- [ ] Test State Transition Exceptions

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Enforce State Machine (30 phút)

Update `src/Services/Payment/Core/Payment.Domain/Entities/PaymentEntity.cs`.

Đảm bảo các method `Complete`, `MarkAsFailed` có kiểm tra trạng thái hiện tại.

```csharp
public void MarkAsProcessing()
{
    // Chỉ được chuyển sang Processing từ Pending (hoặc Failed nếu cho phép retry)
    if (Status != PaymentStatus.Pending && Status != PaymentStatus.Failed)
    {
        throw new DomainException($"Invalid transition: Cannot switch to Processing from {Status}");
    }
    Status = PaymentStatus.Processing;
    LastModifiedOnUtc = DateTimeOffset.UtcNow;
}

public void Complete(string transactionId, string rawResponse)
{
    // Có thể Complete từ Pending hoặc Processing
    if (Status == PaymentStatus.Completed) return; // Idempotent

    if (Status != PaymentStatus.Processing && Status != PaymentStatus.Pending)
    {
        throw new DomainException($"Invalid transition: Cannot Complete payment from {Status}");
    }

    Status = PaymentStatus.Completed;
    TransactionId = transactionId;
    GatewayResponse = rawResponse;
    LastModifiedOnUtc = DateTimeOffset.UtcNow;

    // Add Event...
}

public void MarkAsFailed(string errorCode, string errorMsg, string rawResponse = null)
{
    if (Status == PaymentStatus.Completed)
    {
        throw new DomainException("Cannot mark as Fail because Payment is already Completed.");
    }

    Status = PaymentStatus.Failed;
    ErrorCode = errorCode;
    ErrorMessage = errorMsg;
    GatewayResponse = rawResponse;
    LastModifiedOnUtc = DateTimeOffset.UtcNow;

    // Add Event...
}
```

### Bước 2: Implement Retry Policy (45 phút)

Sử dụng thư viện `Polly` (đã có sẵn trong .NET ecosystem hoặc cài thêm). Chúng ta sẽ áp dụng retry trong `ProcessPaymentCommandHandler`.

File: `src/Services/Payment/Core/Payment.Application/Features/Payment/Commands/ProcessPaymentCommandHandler.cs`

```csharp
using Polly;
using Polly.Retry;

// Trong method Handle:
public async Task<ProcessPaymentResult> Handle(...)
{
    // Define Policy: Retry 3 times, wait 1s, 2s, 4s
    var retryPolicy = Policy
        .Handle<HttpRequestException>() // Chỉ retry lỗi mạng/http
        .Or<TimeoutException>()
        .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
            (exception, timeSpan, retryCount, context) =>
            {
                _logger.LogWarning("Retry {Count} due to {Error}. Waiting {Time}s", retryCount, exception.Message, timeSpan.TotalSeconds);
            });

    // Execute with Policy
    try
    {
        var gatewayResult = await retryPolicy.ExecuteAsync(async () =>
        {
            return await _gateway.ProcessPaymentAsync(request, cancellationToken);
        });

        // ... Process result as before ...
    }
    catch (Exception ex)
    {
        // Final failure after retries
        payment.MarkAsFailed("MAX_RETRY_EXCEEDED", ex.Message);
        // Save DB ...
    }
}
```

> **Nâng cao**: Có thể cấu hình Policy ở `DependencyInjection` bằng `Microsoft.Extensions.Http.Polly` nếu dùng HttpClientFactory.

### Bước 3: Test (15 phút)

1.  Mock Gateway để throw Exception random.
2.  Gọi API Process.
3.  Xem log, thấy dòng "Retry 1...", "Retry 2...".
4.  Nếu fail hết -> Payment status = Failed.

---

**Chúc bạn hoàn thành tốt Day 53!**
