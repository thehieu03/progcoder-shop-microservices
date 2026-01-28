# 📘 Day 49: Create Payment Webhook/IPN Endpoints

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Xử lý callback tự động từ Payment Gateways (Momo). Khi user thanh toán xong, Momo sẽ gọi API này để báo kết quả.

Bạn sẽ:

1.  **Endpoints**: Tạo 2 API: `GET /return` (cho user redirect về) và `POST /ipn` (cho Momo server gọi ngầm).
2.  **Logic**: Verify chữ ký (quan trọng!) -> Cập nhật trạng thái Payment.
3.  **Command**: Reuse hoặc tạo mới Command xử lý việc update DB.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Update `MomoModels.cs` (add IpnRequest)
- [ ] Create `HandlePaymentCallbackCommand`
- [ ] Implement `HandlePaymentCallbackCommandHandler`
- [ ] Create `MomoEndpoints.cs` (Carter module)
- [ ] Test local with Postman/Ngrok

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Update Models for IPN

Thêm class `MomoIpnRequest` vào `src/Services/Payment/Core/Payment.Infrastructure/Gateways/Momo/Models/MomoModels.cs`:

```csharp
public class MomoIpnRequest
{
    public string PartnerCode { get; set; } = default!;
    public string OrderId { get; set; } = default!;
    public string RequestId { get; set; } = default!;
    public long Amount { get; set; }
    public string OrderInfo { get; set; } = default!;
    public string OrderType { get; set; } = default!;
    public long TransId { get; set; }
    public int ResultCode { get; set; }
    public string Message { get; set; } = default!;
    public string PayType { get; set; } = default!;
    public long ResponseTime { get; set; }
    public string ExtraData { get; set; } = default!;
    public string Signature { get; set; } = default!;
}
```

### Bước 2: Create Handle Callback Command

Tạo file `src/Services/Payment/Core/Payment.Application/Features/Payment/Commands/HandlePaymentCallbackCommand.cs`:

```csharp
using BuildingBlocks.CQRS;
using Common.ValueObjects;

namespace Payment.Application.Features.Payment.Commands;

public record HandlePaymentCallbackCommand(
    Guid PaymentId,
    bool IsSuccess,
    string TransactionId,
    string RawResponse,
    Actor Actor
) : ICommand<bool>;
```

Tạo Handler `src/Services/Payment/Core/Payment.Application/Features/Payment/Commands/HandlePaymentCallbackCommandHandler.cs`:

```csharp
using BuildingBlocks.CQRS;
using BuildingBlocks.Exceptions;
using Microsoft.Extensions.Logging;
using Payment.Domain.Enums;
using Payment.Domain.Repositories;
using Payment.Infrastructure.Data; // For IUnitOfWork

namespace Payment.Application.Features.Payment.Commands;

public class HandlePaymentCallbackCommandHandler(
    IPaymentRepository paymentRepository,
    IUnitOfWork unitOfWork,
    ILogger<HandlePaymentCallbackCommandHandler> logger)
    : ICommandHandler<HandlePaymentCallbackCommand, bool>
{
    public async Task<bool> Handle(HandlePaymentCallbackCommand command, CancellationToken cancellationToken)
    {
        logger.LogInformation("Handling Payment Callback. Id: {PaymentId}, Success: {IsSuccess}", command.PaymentId, command.IsSuccess);

        var payment = await paymentRepository.GetByIdAsync(command.PaymentId, cancellationToken);
        if (payment == null)
        {
            throw new NotFoundException("Payment", command.PaymentId);
        }

        // Idempotency check simple (Status check)
        if (payment.Status == PaymentStatus.Completed)
        {
            logger.LogInformation("Payment {PaymentId} already completed.", command.PaymentId);
            return true;
        }

        if (command.IsSuccess)
        {
            payment.Complete(command.TransactionId, command.RawResponse);
        }
        else
        {
            payment.MarkAsFailed("GATEWAY_FAILED", "Gateway reported failure", command.RawResponse);
        }

        paymentRepository.Update(payment);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
```

### Bước 3: Create Momo Endpoints

Tạo file `src/Services/Payment/Api/Payment.Api/Endpoints/MomoEndpoints.cs`:

```csharp
using Carter;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Payment.Api.Constants;
using Payment.Application.Features.Payment.Commands;
using Payment.Infrastructure.Configurations;
using Payment.Infrastructure.Gateways.Momo;
using Payment.Infrastructure.Gateways.Momo.Models;
using Common.ValueObjects;

namespace Payment.Api.Endpoints;

public class MomoEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/payments/momo").WithTags("Momo");

        group.MapPost("/ipn", HandleIpn);
        group.MapGet("/return", HandleReturn);
    }

    // IPN: Server to Server (Quan trọng nhất)
    private async Task<IResult> HandleIpn(
        [FromBody] MomoIpnRequest request,
        ISender sender,
        IOptions<MomoSettings> options,
        ILogger<MomoEndpoints> logger)
    {
        logger.LogInformation("Received Momo IPN for OrderId: {OrderId}, ResultCode: {ResultCode}", request.OrderId, request.ResultCode);

        // 1. Verify Signature
        // Format signature IPN của Momo khác với CreateRequest
        // accessKey=$accessKey&amount=$amount&extraData=$extraData&message=$message&orderId=$orderId&orderInfo=$orderInfo&orderType=$orderType&partnerCode=$partnerCode&payType=$payType&requestId=$requestId&responseTime=$responseTime&resultCode=$resultCode&transId=$transId

        var rawSignature = $"accessKey={options.Value.AccessKey}&amount={request.Amount}&extraData={request.ExtraData}&message={request.Message}&orderId={request.OrderId}&orderInfo={request.OrderInfo}&orderType={request.OrderType}&partnerCode={request.PartnerCode}&payType={request.PayType}&requestId={request.RequestId}&responseTime={request.ResponseTime}&resultCode={request.ResultCode}&transId={request.TransId}";

        var signature = MomoHelper.ComputeHmacSha256(rawSignature, options.Value.SecretKey);

        if (signature != request.Signature)
        {
            logger.LogError("Invalid Signature in Momo IPN. Expected: {Exp}, Got: {Got}", signature, request.Signature);
            return Results.BadRequest(new { message = "Invalid Signature" });
        }

        // 2. Process Order
        var isSuccess = request.ResultCode == 0;
        var paymentId = Guid.Parse(request.OrderId); // Quy ước OrderId của Momo là PaymentId

        var command = new HandlePaymentCallbackCommand(
            PaymentId: paymentId,
            IsSuccess: isSuccess,
            TransactionId: request.TransId.ToString(),
            RawResponse: System.Text.Json.JsonSerializer.Serialize(request),
            Actor: Actor.System()
        );

        await sender.Send(command);

        // 3. Response to Momo (204 No Content is OK)
        return Results.NoContent();
    }

    // Return: User redirect back (Chỉ hiển thị UI kết quả)
    private async Task<IResult> HandleReturn(
        [AsParameters] MomoIpnRequest request, // Momo return GET params tương tự IPN model
        ISender sender,
        IOptions<MomoSettings> options)
    {
        // Tương tự IPN, nhưng đây là GET request.
        // Thực tế ReturnUrl chỉ nên dùng để check status và hiển thị "Thành công/Thất bại" cho user.
        // Logic update DB nên tin tưởng vào IPN hơn.

        // Demo đơn giản: trả về text info
        return Results.Ok(new {
            Message = "Payment Processed",
            Status = request.ResultCode == 0 ? "Success" : "Failed",
            OrderId = request.OrderId
        });
    }
}
```

### Bước 4: Test Local

1.  Dùng Postman Mock request POST vào `/api/payments/momo/ipn`.
2.  Lấy một PaymentID `Pending` trong DB.
3.  Để test Signature: Phải tự tính signature đúng bằng code C# hoặc tool online HMAC-SHA256 với SecretKey trong `appsettings.json`.
4.  Nếu khó quá -> tạm comment đoạn check signature để test luồng update DB trước.

---

**Chúc mừng! Bạn đã hoàn thiện vòng đời thanh toán cơ bản! 🔄**
