# 📘 Day 54: Implements Payment Refund

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Cho phép hoàn tiền (Refund) cho các giao dịch đã thành công.
Đây là tính năng quan trọng cho Admin hoặc hệ thống tự động khi user hủy đơn hàng.

Bạn sẽ:

1.  **Command**: `RefundPaymentCommand`.
2.  **Logic**: Gọi Gateway `RefundPaymentAsync`.
3.  **API**: `POST /api/payments/{id}/refund`.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Create `RefundPaymentCommand` & `Validator`
- [ ] Implement `RefundPaymentCommandHandler`
- [ ] Create `RefundPayment` Endpoint
- [ ] Update `MomoPaymentGateway` (Optional - throw NotImplemented is ok for now)

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Command & Validator (15 phút)

File: `src/Services/Payment/Core/Payment.Application/Features/Payment/Commands/RefundPaymentCommand.cs`

```csharp
using BuildingBlocks.CQRS;
using Common.ValueObjects;

namespace Payment.Application.Features.Payment.Commands;

public record RefundPaymentResult(bool IsSuccess, string Message);

public record RefundPaymentCommand(
    Guid PaymentId,
    string Reason,
    Actor Actor
) : ICommand<RefundPaymentResult>;
```

File: `src/Services/Payment/Core/Payment.Application/Features/Payment/Commands/RefundPaymentCommandValidator.cs`

```csharp
using FluentValidation;

namespace Payment.Application.Features.Payment.Commands;

public class RefundPaymentCommandValidator : AbstractValidator<RefundPaymentCommand>
{
    public RefundPaymentCommandValidator()
    {
        RuleFor(x => x.PaymentId).NotEmpty();
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(255);
    }
}
```

### Bước 2: Handler (40 phút)

File: `src/Services/Payment/Core/Payment.Application/Features/Payment/Commands/RefundPaymentCommandHandler.cs`

```csharp
using BuildingBlocks.CQRS;
using BuildingBlocks.Exceptions;
using Payment.Application.Gateways;
using Payment.Domain.Enums;
using Payment.Domain.Repositories;
using Payment.Infrastructure.Data;

namespace Payment.Application.Features.Payment.Commands;

public class RefundPaymentCommandHandler(
    IPaymentRepository paymentRepository,
    IPaymentGatewayFactory gatewayFactory,
    IUnitOfWork unitOfWork)
    : ICommandHandler<RefundPaymentCommand, RefundPaymentResult>
{
    public async Task<RefundPaymentResult> Handle(RefundPaymentCommand command, CancellationToken cancellationToken)
    {
        // 1. Load Payment
        var payment = await paymentRepository.GetByIdAsync(command.PaymentId, cancellationToken);
        if (payment == null) throw new NotFoundException("Payment", command.PaymentId);

        // 2. Validate State
        if (payment.Status != PaymentStatus.Completed)
        {
            return new RefundPaymentResult(false, $"Cannot refund payment in status {payment.Status}");
        }

        // 3. Call Gateway
        var gateway = gatewayFactory.GetGateway(payment.Method);
        var refundResult = await gateway.RefundPaymentAsync(payment.TransactionId!, payment.Amount, cancellationToken);

        if (!refundResult.IsSuccess)
        {
            return new RefundPaymentResult(false, $"Gateway Refund Failed: {refundResult.ErrorMessage}");
        }

        // 4. Update DB
        payment.Refund(); // Method defined in Day 53/46
        paymentRepository.Update(payment);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new RefundPaymentResult(true, "Refund Successful");
    }
}
```

### Bước 3: Endpoint (20 phút)

File: `src/Services/Payment/Api/Payment.Api/Endpoints/RefundPayment.cs`

```csharp
using Carter;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Payment.Api.Constants;
using Payment.Application.Features.Payment.Commands;
using Common.ValueObjects;

namespace Payment.Api.Endpoints;

public class RefundPayment : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/payments/{paymentId}/refund", HandleAsync)
            .WithTags("Payments")
            .RequireAuthorization("Admin"); // Giả sử có policy Admin
    }

    private async Task<IResult> HandleAsync(
        Guid paymentId,
        [FromBody] RefundRequest req,
        ISender sender)
    {
        var command = new RefundPaymentCommand(
            PaymentId: paymentId,
            Reason: req.Reason,
            Actor: Actor.System() // Hoặc lấy user từ claim
        );

        var result = await sender.Send(command);

        return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
    }
}

public record RefundRequest(string Reason);
```

---

**Chúc bạn hoàn thành tốt Day 54!**
