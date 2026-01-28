# 📘 Day 48: Integrate Momo Payment Gateway

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Tích hợp **Momo** - ví điện tử phổ biến nhật tại Việt Nam vào Payment Service.

Bạn sẽ:

1.  **Configuration**: Setup Momo configuration class và đăng ký DI.
2.  **Implementation**: Implement `MomoPaymentGateway` class (kế thừa `IPaymentGateway` từ Day 46).
3.  **Signature**: Tạo và verify chữ ký HMAC-SHA256 chuẩn của Momo.
4.  **Testing**: Test tạo link thanh toán với Momo Sandbox.

**Thời gian ước tính**: 90-120 phút.

---

## 📚 Momo Sandbox Info

Sử dụng thông tin Sandbox này để test:

```text
Partner Code: MOMOBKUN20180529
Access Key: klm05TvNBzhg7h7j
Secret Key: at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa
API Endpoint: https://test-payment.momo.vn/v2/gateway/api
```

---

## ✅ Checklist

- [ ] Create `MomoSettings.cs` & Register DI
- [ ] Create `MomoModels.cs` (Request/Response)
- [ ] Create `MomoHelper.cs` (Signature utils)
- [ ] Create `MomoPaymentGateway.cs` implementation
- [ ] Update `DependencyInjection.cs` to register gateway
- [ ] Test flow Create Payment

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Configuration (15 phút)

#### 1.1. Create MomoSettings

Tạo file `src/Services/Payment/Core/Payment.Infrastructure/Configurations/MomoSettings.cs`:

```csharp
namespace Payment.Infrastructure.Configurations;

public class MomoSettings
{
    public const string SectionName = "Momo";

    public string PartnerCode { get; set; } = default!;
    public string AccessKey { get; set; } = default!;
    public string SecretKey { get; set; } = default!;
    public string ApiEndpoint { get; set; } = default!;
    public string ReturnUrl { get; set; } = default!;
    public string NotifyUrl { get; set; } = default!;
    public string RequestType { get; set; } = "captureWallet";
    public string PartnerName { get; set; } = "Progcoder Shop";
}
```

#### 1.2. Update appsettings.json

Thêm config vào `src/Services/Payment/Api/Payment.Api/appsettings.json` (dưới node `ConnectionStrings`):

```json
"Momo": {
  "PartnerCode": "MOMOBKUN20180529",
  "AccessKey": "klm05TvNBzhg7h7j",
  "SecretKey": "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa",
  "ApiEndpoint": "https://test-payment.momo.vn/v2/gateway/api",
  "ReturnUrl": "https://localhost:5050/api/payments/momo/return",
  "NotifyUrl": "https://abcd-1234.ngrok-free.app/api/payments/momo/ipn",
  "RequestType": "captureWallet",
  "PartnerName": "Progcoder Shop"
}
```

> **Lưu ý**: `NotifyUrl` cần là public URL (dùng ngrok để test local).

### Bước 2: Create Models (15 phút)

Tạo file `src/Services/Payment/Core/Payment.Infrastructure/Gateways/Momo/Models/MomoModels.cs`:

```csharp
using System.Text.Json.Serialization;

namespace Payment.Infrastructure.Gateways.Momo.Models;

public class MomoCreatePaymentRequest
{
    [JsonPropertyName("partnerCode")]
    public string PartnerCode { get; set; } = default!;

    [JsonPropertyName("partnerName")]
    public string? PartnerName { get; set; }

    [JsonPropertyName("storeId")]
    public string? StoreId { get; set; }

    [JsonPropertyName("requestId")]
    public string RequestId { get; set; } = default!;

    [JsonPropertyName("amount")]
    public long Amount { get; set; }

    [JsonPropertyName("orderId")]
    public string OrderId { get; set; } = default!;

    [JsonPropertyName("orderInfo")]
    public string OrderInfo { get; set; } = default!;

    [JsonPropertyName("redirectUrl")]
    public string RedirectUrl { get; set; } = default!;

    [JsonPropertyName("ipnUrl")]
    public string IpnUrl { get; set; } = default!;

    [JsonPropertyName("requestType")]
    public string RequestType { get; set; } = default!;

    [JsonPropertyName("extraData")]
    public string ExtraData { get; set; } = "";

    [JsonPropertyName("lang")]
    public string Lang { get; set; } = "vi";

    [JsonPropertyName("signature")]
    public string Signature { get; set; } = default!;
}

public class MomoCreatePaymentResponse
{
    [JsonPropertyName("partnerCode")]
    public string PartnerCode { get; set; } = default!;

    [JsonPropertyName("orderId")]
    public string OrderId { get; set; } = default!;

    [JsonPropertyName("requestId")]
    public string RequestId { get; set; } = default!;

    [JsonPropertyName("amount")]
    public long Amount { get; set; }

    [JsonPropertyName("responseTime")]
    public long ResponseTime { get; set; }

    [JsonPropertyName("message")]
    public string Message { get; set; } = default!;

    [JsonPropertyName("resultCode")]
    public int ResultCode { get; set; }

    [JsonPropertyName("payUrl")]
    public string? PayUrl { get; set; }
}

public class MomoQueryRequest
{
    [JsonPropertyName("partnerCode")]
    public string PartnerCode { get; set; } = default!;

    [JsonPropertyName("requestId")]
    public string RequestId { get; set; } = default!;

    [JsonPropertyName("orderId")]
    public string OrderId { get; set; } = default!;

    [JsonPropertyName("signature")]
    public string Signature { get; set; } = default!;

    [JsonPropertyName("lang")]
    public string Lang { get; set; } = "vi";
}

public class MomoQueryResponse
{
    [JsonPropertyName("partnerCode")]
    public string PartnerCode { get; set; } = default!;

    [JsonPropertyName("orderId")]
    public string OrderId { get; set; } = default!;

    [JsonPropertyName("requestId")]
    public string RequestId { get; set; } = default!;

    [JsonPropertyName("extraData")]
    public string ExtraData { get; set; } = default!;

    [JsonPropertyName("amount")]
    public long Amount { get; set; }

    [JsonPropertyName("transId")]
    public long TransId { get; set; }

    [JsonPropertyName("payType")]
    public string PayType { get; set; } = default!;

    [JsonPropertyName("resultCode")]
    public int ResultCode { get; set; }

    [JsonPropertyName("message")]
    public string Message { get; set; } = default!;
}
```

### Bước 3: Create Helper (Signature Logic) (20 phút)

Tạo file `src/Services/Payment/Core/Payment.Infrastructure/Gateways/Momo/MomoHelper.cs`:

```csharp
using System.Security.Cryptography;
using System.Text;

namespace Payment.Infrastructure.Gateways.Momo;

public static class MomoHelper
{
    public static string ComputeHmacSha256(string message, string secretKey)
    {
        var keyBytes = Encoding.UTF8.GetBytes(secretKey);
        var messageBytes = Encoding.UTF8.GetBytes(message);

        byte[] hashBytes;

        using (var hmac = new HMACSHA256(keyBytes))
        {
            hashBytes = hmac.ComputeHash(messageBytes);
        }

        var hashString = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
        return hashString;
    }

    /// <summary>
    /// sort theo alphabet key và nối chuỗi key=value&...
    /// Momo quy định thứ tự params cụ thể cho từng API, nên dùng hàm build riêng an toàn hơn.
    /// </summary>
    public static string BuildRawSignature(string accessKey, string amount, string extraData, string ipnUrl,
        string orderId, string orderInfo, string partnerCode, string redirectUrl, string requestId, string requestType)
    {
        // Format chuẩn của Momo Create Payment:
        // accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType

        return $"accessKey={accessKey}&amount={amount}&extraData={extraData}&ipnUrl={ipnUrl}&orderId={orderId}&orderInfo={orderInfo}&partnerCode={partnerCode}&redirectUrl={redirectUrl}&requestId={requestId}&requestType={requestType}";
    }
}
```

### Bước 4: Implement MomoPaymentGateway (30 phút)

Tạo file `src/Services/Payment/Core/Payment.Infrastructure/Gateways/Momo/MomoPaymentGateway.cs`:

```csharp
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Payment.Application.Gateways;
using Payment.Application.Gateways.Models;
using Payment.Domain.Enums;
using Payment.Infrastructure.Configurations;
using Payment.Infrastructure.Gateways.Momo.Models;

namespace Payment.Infrastructure.Gateways.Momo;

public class MomoPaymentGateway : IPaymentGateway
{
    private readonly HttpClient _httpClient;
    private readonly MomoSettings _settings;
    private readonly ILogger<MomoPaymentGateway> _logger;

    public MomoPaymentGateway(HttpClient httpClient, IOptions<MomoSettings> settings, ILogger<MomoPaymentGateway> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public PaymentMethod SupportedMethod => PaymentMethod.Momo;

    public async Task<PaymentGatewayResult> ProcessPaymentAsync(PaymentGatewayRequest request, CancellationToken cancellationToken = default)
    {
        // 1. Prepare data
        var requestId = Guid.NewGuid().ToString();
        var orderId = request.PaymentId.ToString(); // Momo orderId phải unique, dùng PaymentId là hợp lý
        var amount = ((long)request.Amount).ToString();
        var orderInfo = request.Description ?? $"Pay for Order {request.OrderId}";

        // 2. Build Signature
        var rawSignature = MomoHelper.BuildRawSignature(
            _settings.AccessKey,
            amount,
            "", // extraData
            _settings.NotifyUrl,
            orderId,
            orderInfo,
            _settings.PartnerCode,
            _settings.ReturnUrl,
            requestId,
            _settings.RequestType
        );

        var signature = MomoHelper.ComputeHmacSha256(rawSignature, _settings.SecretKey);

        // 3. Create Request Object
        var momoRequest = new MomoCreatePaymentRequest
        {
            PartnerCode = _settings.PartnerCode,
            PartnerName = _settings.PartnerName,
            StoreId = "MomoTestStore",
            RequestId = requestId,
            Amount = (long)request.Amount,
            OrderId = orderId,
            OrderInfo = orderInfo,
            RedirectUrl = _settings.ReturnUrl,
            IpnUrl = _settings.NotifyUrl,
            RequestType = _settings.RequestType,
            ExtraData = "",
            Lang = "vi",
            Signature = signature
        };

        // 4. Send to Momo
        try
        {
            var response = await _httpClient.PostAsJsonAsync($"{_settings.ApiEndpoint}/create", momoRequest, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            _logger.LogInformation("Momo Response: {Response}", responseContent);

            if (!response.IsSuccessStatusCode)
            {
                return PaymentGatewayResult.Failure("HTTP_ERROR", $"Momo returned {response.StatusCode}", responseContent);
            }

            var momoResponse = JsonSerializer.Deserialize<MomoCreatePaymentResponse>(responseContent);

            if (momoResponse != null && momoResponse.ResultCode == 0)
            {
                // Success -> trả về PayUrl để redirect user
                return PaymentGatewayResult.Success(
                    transactionId: momoResponse.OrderId,
                    redirectUrl: momoResponse.PayUrl,
                    rawResponse: responseContent
                );
            }

            return PaymentGatewayResult.Failure(momoResponse?.ResultCode.ToString() ?? "UNKNOWN", momoResponse?.Message ?? "Unknown Error", responseContent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Momo API");
            return PaymentGatewayResult.Failure("EXCEPTION", ex.Message);
        }
    }

    public async Task<PaymentGatewayResult> VerifyPaymentAsync(string transactionId, CancellationToken cancellationToken = default)
    {
        // Implement Query Transaction Status (Optional for Day 48, but good structure)
        return await Task.FromResult(PaymentGatewayResult.Failure("NOT_IMPLEMENTED", "Verify not needed for redirect flow yet"));
    }

    public Task<PaymentGatewayResult> RefundPaymentAsync(string transactionId, decimal amount, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }
}
```

### Bước 5: Dependency Injection (10 phút)

Update file `src/Services/Payment/Core/Payment.Infrastructure/DependencyInjection.cs`:

```csharp
// Thêm namespace
using Payment.Infrastructure.Configurations;
using Payment.Infrastructure.Gateways.Momo;

// Trong method AddInfrastructure:

// 1. Bind Settings
services.Configure<MomoSettings>(configuration.GetSection(MomoSettings.SectionName));

// 2. Register HttpClient & Gateway
services.AddHttpClient<MomoPaymentGateway>();
services.AddScoped<IPaymentGateway, MomoPaymentGateway>();
```

### Bước 6: Test (10 phút)

1.  Chạy Payment.Api.
2.  Dùng Swagger gọi `POST /api/payments/{paymentId}/process` (Đảm bảo Payment đó có Method = Momo (2)).
3.  Xem response, bạn sẽ nhận được `redirectUrl`.
4.  Copy URL đó ra trình duyệt -> Sẽ thấy giao diện thanh toán Momo Sandbox.

---

**Chúc mừng! Bạn đã tích hợp thành công luồng Create Payment của Momo! 🚀**
