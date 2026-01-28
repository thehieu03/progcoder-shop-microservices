# 📘 Day 60: Payment Hardening & Config Security

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Rà soát bảo mật và tối ưu code trước khi "Go Live" (hoặc chuyển sang Phase sau).
Payment là module nhạy cảm về tiền bạc, cần kỹ lưỡng.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] **Secrets**: Move AccessKey/SecretKey ra khỏi `appsettings.json` (dùng User Secrets hoặc Env Vars).
- [ ] **Log Sanitize**: Đảm bảo không log request body chứa thẻ tín dụng hay Secret.
- [ ] **Transaction Lock**: Kiểm tra lại Idempotency.
- [ ] **Validation**: Review Error Codes.

---

## 📋 Hướng dẫn chi tiết từng bước

### 1. User Secrets (Local Dev) (30 phút)

Không commit key lên Git!
Chạy lệnh tại folder `Payment.Api`:

```bash
dotnet user-secrets init
dotnet user-secrets set "Momo:AccessKey" "REAL_ACCESS_KEY"
dotnet user-secrets set "Momo:SecretKey" "REAL_SECRET_KEY"
```

Xóa key thật trong `appsettings.json`, chỉ để dummy data.

### 2. Log Sanitization (30 phút)

Trong `MomoPaymentGateway.cs` hoặc `MomoEndpoints.cs`, khi log `RawResponse` hoặc `Request`, hãy cẩn thận.

```csharp
// BAD
_logger.LogInformation("Request: {Json}", JsonSerializer.Serialize(request));

// GOOD: Log đối tượng đã che data
var safeRequest = new
{
    request.OrderId,
    request.Amount,
    Signature = "***HIDDEN***" // Che signature/key
};
_logger.LogInformation("Request: {@SafeRequest}", safeRequest);
```

Nếu log DB (`PaymentWebhookLog`), hãy cân nhắc mã hóa cột `Content` nếu chứa thông tin nhạy cảm (PII), mặc dù với Momo/VNPay thường chỉ là ID giao dịch public.

### 3. Review Validation (30 phút)

Đảm bảo `Amount` luôn > 0.
Đảm bảo `Currency` khớp (VND).
Trong `ProcessPaymentCommandHandler`:

```csharp
if (payment.Amount <= 0)
    throw new DomainException("Invalid Amount");

// So sánh Amount IPN trả về với DB, nếu lệch -> Cảnh báo Hack
if (ipnRequest.Amount != payment.Amount)
{
    _logger.LogCritical("Fraud Warning! Order {Id} amount mismatch. DB: {A1}, IPN: {A2}", payment.Id, payment.Amount, ipnRequest.Amount);
    return; // Không update success
}
```

---

**Chúc mừng bạn đã hoàn thành Phase Payment Service (Day 43-60)! 🎉**
Hệ thống thanh toán của bạn giờ đã có đủ: CRUD, Gateway Integration (Momo), Webhook, Retry, Outbox, và Security cơ bản.
