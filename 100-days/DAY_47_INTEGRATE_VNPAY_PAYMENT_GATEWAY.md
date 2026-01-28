# 📘 Day 47: Integrate VNPay Payment Gateway

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Tích hợp **VNPay** - cổng thanh toán phổ biến nhất tại Việt Nam vào Payment Service.

Bạn sẽ:

1.  **Configuration**: Setup VNPay configuration và credentials.
2.  **Implementation**: Implement `VnPayPaymentGateway` class.
3.  **Signature**: Tạo và verify chữ ký bảo mật.
4.  **Callback**: Xử lý VNPay IPN (Instant Payment Notification).
5.  **Testing**: Test với VNPay Sandbox.

**Thời gian ước tính**: 90-120 phút.

---

## 📚 VNPay Overview

### VNPay Payment Flow

```
┌─────────┐      ┌─────────────┐      ┌─────────┐      ┌─────────┐
│  User   │ ──→  │  Your App   │ ──→  │  VNPay  │ ──→  │  Bank   │
└─────────┘      └─────────────┘      └─────────┘      └─────────┘
     │                  │                   │               │
     │  1. Checkout     │                   │               │
     │ ─────────────→   │                   │               │
     │                  │  2. Create URL    │               │
     │                  │ ─────────────→    │               │
     │                  │                   │               │
     │  3. Redirect to VNPay               │               │
     │ ←─────────────────────────────────── │               │
     │                                      │               │
     │  4. Select Bank & Pay               │               │
     │ ─────────────────────────────────→  │               │
     │                                      │  5. Process   │
     │                                      │ ─────────────→│
     │                                      │               │
     │                                      │  6. Result    │
     │                                      │ ←─────────────│
     │  7. Redirect back with result        │               │
     │ ←─────────────────────────────────── │               │
     │                  │                   │               │
     │                  │  8. IPN Callback  │               │
     │                  │ ←───────────────  │               │
└─────────┘      └─────────────┘      └─────────┘      └─────────┘
```

### VNPay Sandbox Credentials

```
Terminal ID (vnp_TmnCode): CGXZLS0Z
Secret Key (vnp_HashSecret): XNBCJFAKAZQSGTARRLGCHVZWCIOIGSHN
Payment URL: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
API URL: https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
```

---

## ✅ Checklist - Đánh dấu khi hoàn thành

### Configuration (Bước 1)

- [ ] Create `VnPaySettings.cs` configuration class
- [ ] Add VNPay settings to `appsettings.json`
- [ ] Register configuration in DI

### Implementation (Bước 2-4)

- [ ] Create `VnPayHelper.cs` utility class
- [ ] Create `VnPayPaymentGateway.cs`
- [ ] Implement URL generation với signature
- [ ] Implement payment verification

### Callback Handling (Bước 5)

- [ ] Create `VnPayCallback.cs` endpoint
- [ ] Create `VnPayIpn.cs` endpoint (server-to-server)
- [ ] Implement signature verification

### Testing (Bước 6)

- [ ] Test create payment URL
- [ ] Test with VNPay Sandbox
- [ ] Verify callback handling

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Create VNPay Configuration (15 phút)

#### 1.1. Create VnPaySettings

Tạo file `src/Services/Payment/Core/Payment.Infrastructure/Configurations/VnPaySettings.cs`:

```csharp
namespace Payment.Infrastructure.Configurations;

public class VnPaySettings
{
    public const string SectionName = "VnPay";

    /// <summary>
    /// Terminal ID provided by VNPay
    /// </summary>
    public string TmnCode { get; set; } = string.Empty;

    /// <summary>
    /// Secret key for signature generation
    /// </summary>
    public string HashSecret { get; set; } = string.Empty;

    /// <summary>
    /// VNPay payment URL
    /// </summary>
    public string PaymentUrl { get; set; } = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

    /// <summary>
    /// VNPay API URL for queries
    /// </summary>
    public string ApiUrl { get; set; } = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";

    /// <summary>
    /// Your return URL after payment
    /// </summary>
    public string ReturnUrl { get; set; } = string.Empty;

    /// <summary>
    /// API version
    /// </summary>
    public string Version { get; set; } = "2.1.0";

    /// <summary>
    /// Locale (vn or en)
    /// </summary>
    public string Locale { get; set; } = "vn";

    /// <summary>
    /// Currency code
    /// </summary>
    public string CurrencyCode { get; set; } = "VND";
}
```

#### 1.2. Update appsettings.json

Thêm vào `src/Services/Payment/Api/Payment.Api/appsettings.json`:

```json
{
  "VnPay": {
    "TmnCode": "CGXZLS0Z",
    "HashSecret": "XNBCJFAKAZQSGTARRLGCHVZWCIOIGSHN",
    "PaymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    "ApiUrl": "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
    "ReturnUrl": "https://localhost:5010/api/payments/vnpay/callback",
    "Version": "2.1.0",
    "Locale": "vn",
    "CurrencyCode": "VND"
  }
}
```

### Bước 2: Create VNPay Helper (25 phút)

Tạo file `src/Services/Payment/Core/Payment.Infrastructure/Gateways/VnPay/VnPayHelper.cs`:

```csharp
using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace Payment.Infrastructure.Gateways.VnPay;

public static class VnPayHelper
{
    /// <summary>
    /// Build VNPay payment URL with all required parameters
    /// </summary>
    public static string BuildPaymentUrl(
        string baseUrl,
        string tmnCode,
        string hashSecret,
        string txnRef,
        decimal amount,
        string orderInfo,
        string returnUrl,
        string ipAddress,
        string locale = "vn",
        string currencyCode = "VND",
        string version = "2.1.0",
        string? bankCode = null)
    {
        var vnpParams = new SortedDictionary<string, string>
        {
            { "vnp_Version", version },
            { "vnp_Command", "pay" },
            { "vnp_TmnCode", tmnCode },
            { "vnp_Amount", ((long)(amount * 100)).ToString() }, // VNPay requires amount in smallest unit
            { "vnp_CurrCode", currencyCode },
            { "vnp_TxnRef", txnRef },
            { "vnp_OrderInfo", orderInfo },
            { "vnp_OrderType", "other" },
            { "vnp_Locale", locale },
            { "vnp_ReturnUrl", returnUrl },
            { "vnp_IpAddr", ipAddress },
            { "vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss") },
            { "vnp_ExpireDate", DateTime.Now.AddMinutes(15).ToString("yyyyMMddHHmmss") }
        };

        if (!string.IsNullOrEmpty(bankCode))
        {
            vnpParams.Add("vnp_BankCode", bankCode);
        }

        // Build query string
        var queryString = BuildQueryString(vnpParams);

        // Generate signature
        var signData = queryString;
        var signature = HmacSha512(hashSecret, signData);

        // Build final URL
        return $"{baseUrl}?{queryString}&vnp_SecureHash={signature}";
    }

    /// <summary>
    /// Verify VNPay response signature
    /// </summary>
    public static bool ValidateSignature(
        IDictionary<string, string> vnpParams,
        string inputHash,
        string hashSecret)
    {
        // Remove hash params from validation
        var validationParams = new SortedDictionary<string, string>(
            vnpParams.Where(x => 
                !x.Key.Equals("vnp_SecureHash", StringComparison.OrdinalIgnoreCase) &&
                !x.Key.Equals("vnp_SecureHashType", StringComparison.OrdinalIgnoreCase))
            .ToDictionary(x => x.Key, x => x.Value));

        var signData = BuildQueryString(validationParams);
        var checkSum = HmacSha512(hashSecret, signData);

        return checkSum.Equals(inputHash, StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Parse VNPay callback query string to dictionary
    /// </summary>
    public static Dictionary<string, string> ParseQueryString(string queryString)
    {
        var result = new Dictionary<string, string>();

        if (string.IsNullOrEmpty(queryString))
            return result;

        // Remove leading '?' if present
        if (queryString.StartsWith("?"))
            queryString = queryString.Substring(1);

        var pairs = queryString.Split('&');
        foreach (var pair in pairs)
        {
            var keyValue = pair.Split('=');
            if (keyValue.Length == 2)
            {
                var key = WebUtility.UrlDecode(keyValue[0]);
                var value = WebUtility.UrlDecode(keyValue[1]);
                result[key] = value;
            }
        }

        return result;
    }

    /// <summary>
    /// Get VNPay response code message
    /// </summary>
    public static string GetResponseMessage(string responseCode)
    {
        return responseCode switch
        {
            "00" => "Giao dịch thành công",
            "07" => "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)",
            "09" => "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking",
            "10" => "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
            "11" => "Đã hết hạn chờ thanh toán",
            "12" => "Thẻ/Tài khoản bị khóa",
            "13" => "Nhập sai mật khẩu xác thực giao dịch (OTP)",
            "24" => "Khách hàng hủy giao dịch",
            "51" => "Tài khoản không đủ số dư",
            "65" => "Tài khoản đã vượt quá hạn mức giao dịch trong ngày",
            "75" => "Ngân hàng thanh toán đang bảo trì",
            "79" => "Nhập sai mật khẩu thanh toán quá số lần quy định",
            "99" => "Lỗi không xác định",
            _ => $"Lỗi không xác định: {responseCode}"
        };
    }

    /// <summary>
    /// Check if transaction is successful
    /// </summary>
    public static bool IsSuccessTransaction(string responseCode, string transactionStatus)
    {
        return responseCode == "00" && transactionStatus == "00";
    }

    #region Private Methods

    private static string BuildQueryString(SortedDictionary<string, string> parameters)
    {
        var sb = new StringBuilder();
        foreach (var kvp in parameters)
        {
            if (!string.IsNullOrEmpty(kvp.Value))
            {
                if (sb.Length > 0)
                    sb.Append('&');
                sb.Append(WebUtility.UrlEncode(kvp.Key));
                sb.Append('=');
                sb.Append(WebUtility.UrlEncode(kvp.Value));
            }
        }
        return sb.ToString();
    }

    private static string HmacSha512(string key, string data)
    {
        using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(key));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return BitConverter.ToString(hash).Replace("-", "").ToLower();
    }

    #endregion
}
```

### Bước 3: Create VNPay Gateway Implementation (30 phút)

Tạo file `src/Services/Payment/Core/Payment.Infrastructure/Gateways/VnPay/VnPayPaymentGateway.cs`:

```csharp
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Payment.Application.Gateways;
using Payment.Application.Gateways.Models;
using Payment.Domain.Enums;
using Payment.Infrastructure.Configurations;
using System.Text.Json;

namespace Payment.Infrastructure.Gateways.VnPay;

public class VnPayPaymentGateway : IPaymentGateway
{
    private readonly VnPaySettings _settings;
    private readonly ILogger<VnPayPaymentGateway> _logger;
    private readonly HttpClient _httpClient;

    public VnPayPaymentGateway(
        IOptions<VnPaySettings> settings,
        ILogger<VnPayPaymentGateway> logger,
        HttpClient httpClient)
    {
        _settings = settings.Value;
        _logger = logger;
        _httpClient = httpClient;
    }

    public PaymentMethod SupportedMethod => PaymentMethod.VnPay;

    public Task<PaymentGatewayResult> ProcessPaymentAsync(
        PaymentGatewayRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation(
                "[VNPay] Creating payment URL for PaymentId: {PaymentId}, Amount: {Amount}",
                request.PaymentId,
                request.Amount);

            // Generate unique transaction reference
            var txnRef = $"{request.PaymentId:N}".Substring(0, 20);

            // Get client IP (should be passed from request in production)
            var ipAddress = request.Metadata.GetValueOrDefault("IpAddress", "127.0.0.1");

            // Determine return URL
            var returnUrl = !string.IsNullOrEmpty(request.ReturnUrl) 
                ? request.ReturnUrl 
                : _settings.ReturnUrl;

            // Build payment URL
            var paymentUrl = VnPayHelper.BuildPaymentUrl(
                baseUrl: _settings.PaymentUrl,
                tmnCode: _settings.TmnCode,
                hashSecret: _settings.HashSecret,
                txnRef: txnRef,
                amount: request.Amount,
                orderInfo: request.Description ?? $"Thanh toan don hang {request.OrderId}",
                returnUrl: returnUrl,
                ipAddress: ipAddress,
                locale: _settings.Locale,
                currencyCode: _settings.CurrencyCode,
                version: _settings.Version,
                bankCode: request.Metadata.GetValueOrDefault("BankCode")
            );

            _logger.LogInformation(
                "[VNPay] Payment URL created for PaymentId: {PaymentId}, TxnRef: {TxnRef}",
                request.PaymentId,
                txnRef);

            // Return redirect URL - payment will be completed via callback
            return Task.FromResult(PaymentGatewayResult.Success(
                transactionId: txnRef,
                redirectUrl: paymentUrl,
                rawResponse: JsonSerializer.Serialize(new { txnRef, paymentUrl })
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[VNPay] Error creating payment URL for PaymentId: {PaymentId}", request.PaymentId);

            return Task.FromResult(PaymentGatewayResult.Failure(
                errorCode: "VNPAY_ERROR",
                errorMessage: ex.Message
            ));
        }
    }

    public async Task<PaymentGatewayResult> VerifyPaymentAsync(
        string transactionId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("[VNPay] Verifying transaction: {TransactionId}", transactionId);

            // Build query request to VNPay API
            var queryParams = new Dictionary<string, string>
            {
                { "vnp_RequestId", Guid.NewGuid().ToString("N") },
                { "vnp_Version", _settings.Version },
                { "vnp_Command", "querydr" },
                { "vnp_TmnCode", _settings.TmnCode },
                { "vnp_TxnRef", transactionId },
                { "vnp_OrderInfo", $"Query transaction {transactionId}" },
                { "vnp_TransactionDate", DateTime.Now.ToString("yyyyMMddHHmmss") },
                { "vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss") },
                { "vnp_IpAddr", "127.0.0.1" }
            };

            // This is a simplified version - actual implementation would call VNPay query API
            // For now, we'll rely on the callback mechanism
            
            _logger.LogWarning("[VNPay] Query API not fully implemented. Use callback for verification.");

            return PaymentGatewayResult.Success(transactionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[VNPay] Error verifying transaction: {TransactionId}", transactionId);
            return PaymentGatewayResult.Failure("VERIFY_ERROR", ex.Message);
        }
    }

    public async Task<PaymentGatewayResult> RefundPaymentAsync(
        string transactionId,
        decimal amount,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation(
                "[VNPay] Refunding transaction: {TransactionId}, Amount: {Amount}",
                transactionId,
                amount);

            // VNPay refund requires calling their refund API
            // This is a simplified placeholder
            
            var refundTxnRef = $"RF{transactionId}";

            _logger.LogWarning("[VNPay] Refund API implementation is simplified. Manual refund may be required.");

            return PaymentGatewayResult.Success(refundTxnRef);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[VNPay] Error refunding transaction: {TransactionId}", transactionId);
            return PaymentGatewayResult.Failure("REFUND_ERROR", ex.Message);
        }
    }
}
```

### Bước 4: Create VNPay Callback Models (10 phút)

Tạo file `src/Services/Payment/Core/Payment.Application/Gateways/Models/VnPayCallbackResult.cs`:

```csharp
namespace Payment.Application.Gateways.Models;

public record VnPayCallbackResult
{
    public bool IsValid { get; init; }
    public bool IsSuccess { get; init; }
    public string? TransactionId { get; init; }
    public string? VnPayTransactionNo { get; init; }
    public string? ResponseCode { get; init; }
    public string? TransactionStatus { get; init; }
    public decimal Amount { get; init; }
    public string? BankCode { get; init; }
    public string? BankTransactionNo { get; init; }
    public string? PayDate { get; init; }
    public string? Message { get; init; }
    public string? RawData { get; init; }

    public static VnPayCallbackResult Invalid(string message)
        => new() { IsValid = false, Message = message };

    public static VnPayCallbackResult FromVnPayResponse(
        Dictionary<string, string> vnpParams,
        bool isValidSignature)
    {
        if (!isValidSignature)
            return Invalid("Invalid signature");

        var responseCode = vnpParams.GetValueOrDefault("vnp_ResponseCode", "");
        var transactionStatus = vnpParams.GetValueOrDefault("vnp_TransactionStatus", "");
        var amountStr = vnpParams.GetValueOrDefault("vnp_Amount", "0");

        return new VnPayCallbackResult
        {
            IsValid = true,
            IsSuccess = responseCode == "00" && transactionStatus == "00",
            TransactionId = vnpParams.GetValueOrDefault("vnp_TxnRef"),
            VnPayTransactionNo = vnpParams.GetValueOrDefault("vnp_TransactionNo"),
            ResponseCode = responseCode,
            TransactionStatus = transactionStatus,
            Amount = decimal.Parse(amountStr) / 100, // Convert from smallest unit
            BankCode = vnpParams.GetValueOrDefault("vnp_BankCode"),
            BankTransactionNo = vnpParams.GetValueOrDefault("vnp_BankTranNo"),
            PayDate = vnpParams.GetValueOrDefault("vnp_PayDate"),
            RawData = string.Join("&", vnpParams.Select(x => $"{x.Key}={x.Value}"))
        };
    }
}
```

### Bước 5: Create VNPay Callback Endpoints (25 phút)

#### 5.1. Create VnPayCallback Endpoint (User Return URL)

Tạo file `src/Services/Payment/Api/Payment.Api/Endpoints/VnPayCallback.cs`:

```csharp
using Carter;
using MediatR;
using Microsoft.Extensions.Options;
using Payment.Api.Constants;
using Payment.Application.Features.Payment.Commands;
using Payment.Application.Gateways.Models;
using Payment.Infrastructure.Configurations;
using Payment.Infrastructure.Gateways.VnPay;

namespace Payment.Api.Endpoints;

/// <summary>
/// Handle VNPay return URL callback (user is redirected here after payment)
/// </summary>
public sealed class VnPayCallback : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiRoutes.Payment.VnPayCallback, HandleVnPayCallbackAsync)
            .WithTags("VNPay")
            .WithName(nameof(VnPayCallback))
            .Produces(StatusCodes.Status302Found)
            .WithDescription("VNPay callback URL - redirects user after payment")
            .AllowAnonymous(); // VNPay redirects without auth
    }

    private async Task<IResult> HandleVnPayCallbackAsync(
        HttpContext httpContext,
        ISender sender,
        IOptions<VnPaySettings> vnpaySettings,
        ILogger<VnPayCallback> logger)
    {
        try
        {
            // Parse query string
            var queryString = httpContext.Request.QueryString.Value ?? "";
            var vnpParams = VnPayHelper.ParseQueryString(queryString);

            logger.LogInformation("[VNPay Callback] Received callback: {Query}", queryString);

            // Get secure hash from params
            var secureHash = vnpParams.GetValueOrDefault("vnp_SecureHash", "");

            // Validate signature
            var isValidSignature = VnPayHelper.ValidateSignature(
                vnpParams,
                secureHash,
                vnpaySettings.Value.HashSecret);

            // Parse result
            var callbackResult = VnPayCallbackResult.FromVnPayResponse(vnpParams, isValidSignature);

            if (!callbackResult.IsValid)
            {
                logger.LogWarning("[VNPay Callback] Invalid signature for TxnRef: {TxnRef}",
                    callbackResult.TransactionId);
                return Results.Redirect("/payment/failed?error=invalid_signature");
            }

            // Process the callback
            var command = new HandleVnPayCallbackCommand(callbackResult);
            var result = await sender.Send(command);

            // Redirect based on result
            if (callbackResult.IsSuccess)
            {
                logger.LogInformation("[VNPay Callback] Payment successful for TxnRef: {TxnRef}",
                    callbackResult.TransactionId);
                return Results.Redirect($"/payment/success?txnRef={callbackResult.TransactionId}");
            }
            else
            {
                var message = VnPayHelper.GetResponseMessage(callbackResult.ResponseCode ?? "99");
                logger.LogWarning("[VNPay Callback] Payment failed for TxnRef: {TxnRef}, Code: {Code}",
                    callbackResult.TransactionId, callbackResult.ResponseCode);
                return Results.Redirect($"/payment/failed?txnRef={callbackResult.TransactionId}&message={Uri.EscapeDataString(message)}");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[VNPay Callback] Error processing callback");
            return Results.Redirect("/payment/error");
        }
    }
}
```

#### 5.2. Create VnPayIpn Endpoint (Server-to-Server)

Tạo file `src/Services/Payment/Api/Payment.Api/Endpoints/VnPayIpn.cs`:

```csharp
using Carter;
using MediatR;
using Microsoft.Extensions.Options;
using Payment.Api.Constants;
using Payment.Application.Features.Payment.Commands;
using Payment.Application.Gateways.Models;
using Payment.Infrastructure.Configurations;
using Payment.Infrastructure.Gateways.VnPay;

namespace Payment.Api.Endpoints;

/// <summary>
/// Handle VNPay IPN (Instant Payment Notification) - server-to-server callback
/// </summary>
public sealed class VnPayIpn : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiRoutes.Payment.VnPayIpn, HandleVnPayIpnAsync)
            .WithTags("VNPay")
            .WithName(nameof(VnPayIpn))
            .Produces<VnPayIpnResponse>(StatusCodes.Status200OK)
            .WithDescription("VNPay IPN endpoint - server-to-server notification")
            .AllowAnonymous(); // VNPay calls without auth
    }

    private async Task<IResult> HandleVnPayIpnAsync(
        HttpContext httpContext,
        ISender sender,
        IOptions<VnPaySettings> vnpaySettings,
        ILogger<VnPayIpn> logger)
    {
        try
        {
            // Parse query string
            var queryString = httpContext.Request.QueryString.Value ?? "";
            var vnpParams = VnPayHelper.ParseQueryString(queryString);

            logger.LogInformation("[VNPay IPN] Received IPN: {Query}", queryString);

            // Get secure hash from params
            var secureHash = vnpParams.GetValueOrDefault("vnp_SecureHash", "");

            // Validate signature
            var isValidSignature = VnPayHelper.ValidateSignature(
                vnpParams,
                secureHash,
                vnpaySettings.Value.HashSecret);

            if (!isValidSignature)
            {
                logger.LogWarning("[VNPay IPN] Invalid signature");
                return Results.Ok(new VnPayIpnResponse("97", "Invalid signature"));
            }

            // Parse result
            var callbackResult = VnPayCallbackResult.FromVnPayResponse(vnpParams, true);
            var txnRef = callbackResult.TransactionId;

            // Check if payment exists
            // In production, query payment by txnRef

            // Process the IPN
            var command = new HandleVnPayCallbackCommand(callbackResult);
            var result = await sender.Send(command);

            if (result.IsSuccess)
            {
                logger.LogInformation("[VNPay IPN] IPN processed successfully for TxnRef: {TxnRef}", txnRef);
                return Results.Ok(new VnPayIpnResponse("00", "Confirm Success"));
            }
            else
            {
                logger.LogWarning("[VNPay IPN] IPN processing failed for TxnRef: {TxnRef}", txnRef);
                return Results.Ok(new VnPayIpnResponse("99", result.Message ?? "Unknown error"));
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[VNPay IPN] Error processing IPN");
            return Results.Ok(new VnPayIpnResponse("99", "Error processing IPN"));
        }
    }
}

public record VnPayIpnResponse(string RspCode, string Message);
```

#### 5.3. Update ApiRoutes

Cập nhật file `src/Services/Payment/Api/Payment.Api/Constants/ApiRoutes.cs`:

```csharp
namespace Payment.Api.Constants;

public static class ApiRoutes
{
    public static class Payment
    {
        public const string Tags = "Payments";
        private const string Base = "/api/payments";
        private const string AdminBase = "/api/admin/payments";

        // User endpoints
        public const string Create = Base;
        public const string GetById = Base + "/{paymentId:guid}";
        public const string GetByOrderId = Base + "/order/{orderId:guid}";
        public const string Process = Base + "/{paymentId:guid}/process";
        public const string Refund = Base + "/{paymentId:guid}/refund";

        // VNPay endpoints
        public const string VnPayCallback = Base + "/vnpay/callback";
        public const string VnPayIpn = Base + "/vnpay/ipn";

        // Admin endpoints
        public const string AdminGetAll = AdminBase;
        public const string AdminGetById = AdminBase + "/{paymentId:guid}";
    }
}
```

### Bước 6: Create HandleVnPayCallback Command (20 phút)

#### 6.1. Create Command

Tạo file `src/Services/Payment/Core/Payment.Application/Features/Payment/Commands/HandleVnPayCallbackCommand.cs`:

```csharp
using BuildingBlocks.CQRS;
using Payment.Application.Gateways.Models;

namespace Payment.Application.Features.Payment.Commands;

public record HandleVnPayCallbackCommand(VnPayCallbackResult CallbackResult) 
    : ICommand<HandleVnPayCallbackResult>;

public record HandleVnPayCallbackResult(
    bool IsSuccess,
    Guid PaymentId,
    string? Message = null
);
```

#### 6.2. Create Handler

Tạo file `src/Services/Payment/Core/Payment.Application/Features/Payment/Commands/HandleVnPayCallbackCommandHandler.cs`:

```csharp
using BuildingBlocks.CQRS;
using Microsoft.Extensions.Logging;
using Payment.Domain.Repositories;

namespace Payment.Application.Features.Payment.Commands;

public class HandleVnPayCallbackCommandHandler(
    IPaymentRepository paymentRepository,
    IUnitOfWork unitOfWork,
    ILogger<HandleVnPayCallbackCommandHandler> logger)
    : ICommandHandler<HandleVnPayCallbackCommand, HandleVnPayCallbackResult>
{
    public async Task<HandleVnPayCallbackResult> Handle(
        HandleVnPayCallbackCommand command,
        CancellationToken cancellationToken)
    {
        var callback = command.CallbackResult;

        logger.LogInformation(
            "[VNPay Handler] Processing callback for TxnRef: {TxnRef}, ResponseCode: {ResponseCode}",
            callback.TransactionId,
            callback.ResponseCode);

        // Find payment by transaction reference
        // TxnRef format: first 20 chars of PaymentId GUID
        if (string.IsNullOrEmpty(callback.TransactionId))
        {
            return new HandleVnPayCallbackResult(false, Guid.Empty, "Missing transaction reference");
        }

        // In production, you would store TxnRef mapping to PaymentId
        // For now, we'll search by VNPay transaction number or implement a lookup table
        
        var payment = await paymentRepository.GetByTransactionIdAsync(
            callback.TransactionId, 
            cancellationToken);

        if (payment is null)
        {
            logger.LogWarning("[VNPay Handler] Payment not found for TxnRef: {TxnRef}", callback.TransactionId);
            return new HandleVnPayCallbackResult(false, Guid.Empty, "Payment not found");
        }

        // Check if already processed
        if (payment.Status == Domain.Enums.PaymentStatus.Completed)
        {
            logger.LogInformation("[VNPay Handler] Payment already completed: {PaymentId}", payment.Id);
            return new HandleVnPayCallbackResult(true, payment.Id, "Already processed");
        }

        // Update payment based on callback result
        if (callback.IsSuccess)
        {
            payment.Complete(
                transactionId: callback.VnPayTransactionNo ?? callback.TransactionId!,
                gatewayResponse: callback.RawData
            );

            logger.LogInformation(
                "[VNPay Handler] Payment completed: {PaymentId}, VnPayTxnNo: {VnPayTxnNo}",
                payment.Id,
                callback.VnPayTransactionNo);
        }
        else
        {
            payment.MarkAsFailed(
                errorCode: callback.ResponseCode ?? "UNKNOWN",
                errorMessage: callback.Message ?? "Payment failed",
                gatewayResponse: callback.RawData
            );

            logger.LogWarning(
                "[VNPay Handler] Payment failed: {PaymentId}, Code: {Code}, Message: {Message}",
                payment.Id,
                callback.ResponseCode,
                callback.Message);
        }

        // Save changes
        paymentRepository.Update(payment);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new HandleVnPayCallbackResult(
            callback.IsSuccess,
            payment.Id,
            callback.Message
        );
    }
}
```

### Bước 7: Update Repository & DI (10 phút)

#### 7.1. Update IPaymentRepository

Thêm method vào `IPaymentRepository.cs`:

```csharp
Task<PaymentEntity?> GetByTransactionIdAsync(string transactionId, CancellationToken cancellationToken = default);
```

#### 7.2. Update PaymentRepository

```csharp
public async Task<PaymentEntity?> GetByTransactionIdAsync(
    string transactionId, 
    CancellationToken cancellationToken = default)
{
    return await dbContext.Payments
        .FirstOrDefaultAsync(p => 
            p.TransactionId == transactionId || 
            p.Id.ToString().StartsWith(transactionId),
            cancellationToken);
}
```

#### 7.3. Update DependencyInjection

```csharp
public static IServiceCollection AddInfrastructure(
    this IServiceCollection services,
    IConfiguration configuration)
{
    // ... existing code ...

    // VNPay Settings
    services.Configure<VnPaySettings>(configuration.GetSection(VnPaySettings.SectionName));

    // Payment Gateways
    services.AddHttpClient<VnPayPaymentGateway>();
    services.AddScoped<IPaymentGateway, VnPayPaymentGateway>();
    services.AddScoped<IPaymentGateway, CodPaymentGateway>();
    services.AddScoped<IPaymentGateway, MockPaymentGateway>();

    // Gateway Factory
    services.AddScoped<IPaymentGatewayFactory, PaymentGatewayFactory>();

    return services;
}
```

### Bước 8: Test với VNPay Sandbox (15 phút)

#### 8.1. Test Create Payment URL

```http
POST /api/payments
Content-Type: application/json

{
  "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "amount": 100000,
  "method": 1
}
```

#### 8.2. Test Process Payment

```http
POST /api/payments/{paymentId}/process
Content-Type: application/json

{
  "returnUrl": "https://yourapp.com/payment/result"
}
```

**Response:**

```json
{
  "data": {
    "isSuccess": true,
    "payment": { ... },
    "redirectUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=10000000&vnp_Command=pay&..."
  }
}
```

#### 8.3. Test Cards (VNPay Sandbox)

| Card Number | Bank | Result |
|-------------|------|--------|
| 9704198526191432198 | NCB | Success |
| 9704195798459170488 | NCB | Failed (Insufficient funds) |

**OTP:** 123456

---

## 📝 Ghi chú cho Day 47

### Security Considerations

1. **Always validate signature** từ VNPay callback
2. **Store TxnRef mapping** để tránh duplicate processing
3. **Use HTTPS** cho tất cả endpoints
4. **Log all callbacks** để debug và audit

### Production Checklist

- [ ] Replace sandbox credentials với production
- [ ] Setup proper Return URL và IPN URL
- [ ] Implement refund API đầy đủ
- [ ] Add retry logic cho IPN
- [ ] Setup monitoring và alerting

---

## 🔗 Summary - Files Created/Modified

| File | Description |
|------|-------------|
| `Configurations/VnPaySettings.cs` | VNPay config class |
| `Gateways/VnPay/VnPayHelper.cs` | Utility functions |
| `Gateways/VnPay/VnPayPaymentGateway.cs` | Gateway implementation |
| `Models/VnPayCallbackResult.cs` | Callback result model |
| `Endpoints/VnPayCallback.cs` | User return URL handler |
| `Endpoints/VnPayIpn.cs` | IPN handler |
| `Commands/HandleVnPayCallbackCommand.cs` | Callback command |

---

## 🚀 Next Steps

- **Day 48**: Integrate Momo Payment Gateway
- **Day 49**: Create RefundPayment Command
- **Day 50**: Test End-to-End Payment Service

---

**Chúc bạn tích hợp VNPay thành công! 💳🇻🇳**
