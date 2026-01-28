# 📘 Day 46: Create ProcessPayment Command & Payment Gateway Abstraction

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Xây dựng **ProcessPayment Command** và thiết kế **Payment Gateway Abstraction** để có thể tích hợp nhiều cổng thanh toán khác nhau (VNPay, Momo, Stripe, PayPal).

Bạn sẽ:

1.  **Abstraction**: Tạo `IPaymentGateway` interface và factory pattern.
2.  **Command**: Định nghĩa `ProcessPaymentCommand` để xử lý thanh toán.
3.  **Domain Events**: Tạo `PaymentCompletedDomainEvent` và `PaymentFailedDomainEvent`.
4.  **Mock Gateway**: Implement mock gateway để test.
5.  **Endpoint**: Expose API endpoint `POST /api/payments/{paymentId}/process`.

**Thời gian ước tính**: 90-120 phút.

---

## ✅ Checklist - Đánh dấu khi hoàn thành

### Domain Layer - Events (Bước 1)

- [ ] Create `PaymentCompletedDomainEvent.cs`
- [ ] Create `PaymentFailedDomainEvent.cs`
- [ ] Update `PaymentEntity` với domain event methods

### Application Layer - Gateway Abstraction (Bước 2-3)

- [ ] Create `IPaymentGateway.cs` interface
- [ ] Create `PaymentGatewayFactory.cs`
- [ ] Create `PaymentGatewayResult.cs` model
- [ ] Create `PaymentGatewayRequest.cs` model

### Application Layer - Command (Bước 4-5)

- [ ] Create `ProcessPaymentCommand.cs`
- [ ] Create `ProcessPaymentCommandValidator.cs`
- [ ] Create `ProcessPaymentCommandHandler.cs`

### Infrastructure Layer - Mock Gateway (Bước 6)

- [ ] Create `MockPaymentGateway.cs` (for testing)
- [ ] Register gateway in DI

### API Layer - Endpoint (Bước 7)

- [ ] Create `ProcessPayment.cs` endpoint
- [ ] Setup Swagger documentation

### Testing (Bước 8)

- [ ] Test ProcessPayment với mock gateway
- [ ] Verify domain events được raise

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Create Domain Events (15 phút)

#### 1.1. Create PaymentCompletedDomainEvent

Tạo file `src/Services/Payment/Core/Payment.Domain/Events/PaymentCompletedDomainEvent.cs`:

```csharp
using BuildingBlocks.Abstractions;

namespace Payment.Domain.Events;

public record PaymentCompletedDomainEvent(
    Guid PaymentId,
    Guid OrderId,
    string TransactionId,
    decimal Amount,
    DateTimeOffset CompletedAt
) : IDomainEvent;
```

#### 1.2. Create PaymentFailedDomainEvent

Tạo file `src/Services/Payment/Core/Payment.Domain/Events/PaymentFailedDomainEvent.cs`:

```csharp
using BuildingBlocks.Abstractions;

namespace Payment.Domain.Events;

public record PaymentFailedDomainEvent(
    Guid PaymentId,
    Guid OrderId,
    string ErrorCode,
    string ErrorMessage,
    DateTimeOffset FailedAt
) : IDomainEvent;
```

#### 1.3. Update PaymentEntity

Cập nhật file `src/Services/Payment/Core/Payment.Domain/Entities/PaymentEntity.cs`:

```csharp
using BuildingBlocks.Abstractions;
using Payment.Domain.Enums;
using Payment.Domain.Events;

namespace Payment.Domain.Entities;

public sealed class PaymentEntity : Aggregate<Guid>
{
    public Guid OrderId { get; private set; }
    public string? TransactionId { get; private set; }
    public decimal Amount { get; private set; }
    public PaymentStatus Status { get; private set; }
    public PaymentMethod Method { get; private set; }
    public string? ErrorCode { get; private set; }
    public string? ErrorMessage { get; private set; }
    public string? GatewayResponse { get; private set; }
    public DateTimeOffset? ProcessedAt { get; private set; }

    private PaymentEntity() { }

    public static PaymentEntity Create(Guid orderId, decimal amount, PaymentMethod method)
    {
        return new PaymentEntity
        {
            Id = Guid.NewGuid(),
            OrderId = orderId,
            Amount = amount,
            Method = method,
            Status = PaymentStatus.Pending,
            CreatedOnUtc = DateTimeOffset.UtcNow
        };
    }

    public void MarkAsProcessing()
    {
        if (Status != PaymentStatus.Pending)
            throw new InvalidOperationException($"Cannot process payment in {Status} status");

        Status = PaymentStatus.Processing;
        LastModifiedOnUtc = DateTimeOffset.UtcNow;
    }

    public void Complete(string transactionId, string? gatewayResponse = null)
    {
        if (Status != PaymentStatus.Processing && Status != PaymentStatus.Pending)
            throw new InvalidOperationException($"Cannot complete payment in {Status} status");

        Status = PaymentStatus.Completed;
        TransactionId = transactionId;
        GatewayResponse = gatewayResponse;
        ProcessedAt = DateTimeOffset.UtcNow;
        LastModifiedOnUtc = DateTimeOffset.UtcNow;

        // Raise domain event
        AddDomainEvent(new PaymentCompletedDomainEvent(
            PaymentId: Id,
            OrderId: OrderId,
            TransactionId: transactionId,
            Amount: Amount,
            CompletedAt: ProcessedAt.Value
        ));
    }

    public void MarkAsFailed(string errorCode, string errorMessage, string? gatewayResponse = null)
    {
        Status = PaymentStatus.Failed;
        ErrorCode = errorCode;
        ErrorMessage = errorMessage;
        GatewayResponse = gatewayResponse;
        ProcessedAt = DateTimeOffset.UtcNow;
        LastModifiedOnUtc = DateTimeOffset.UtcNow;

        // Raise domain event
        AddDomainEvent(new PaymentFailedDomainEvent(
            PaymentId: Id,
            OrderId: OrderId,
            ErrorCode: errorCode,
            ErrorMessage: errorMessage,
            FailedAt: ProcessedAt.Value
        ));
    }

    public void Refund()
    {
        if (Status != PaymentStatus.Completed)
            throw new InvalidOperationException($"Cannot refund payment in {Status} status");

        Status = PaymentStatus.Refunded;
        LastModifiedOnUtc = DateTimeOffset.UtcNow;
    }
}
```

#### 1.4. Update PaymentStatus Enum

Cập nhật file `src/Services/Payment/Core/Payment.Domain/Enums/PaymentStatus.cs`:

```csharp
namespace Payment.Domain.Enums;

public enum PaymentStatus
{
    Pending = 1,
    Processing = 2,
    Completed = 3,
    Failed = 4,
    Refunded = 5,
    Cancelled = 6
}
```

### Bước 2: Create Payment Gateway Models (15 phút)

#### 2.1. Create PaymentGatewayRequest

Tạo file `src/Services/Payment/Core/Payment.Application/Gateways/Models/PaymentGatewayRequest.cs`:

```csharp
using Payment.Domain.Enums;

namespace Payment.Application.Gateways.Models;

public record PaymentGatewayRequest
{
    public Guid PaymentId { get; init; }
    public Guid OrderId { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "VND";
    public PaymentMethod Method { get; init; }
    public string? Description { get; init; }
    public string? ReturnUrl { get; init; }
    public string? CancelUrl { get; init; }
    public Dictionary<string, string> Metadata { get; init; } = new();
}
```

#### 2.2. Create PaymentGatewayResult

Tạo file `src/Services/Payment/Core/Payment.Application/Gateways/Models/PaymentGatewayResult.cs`:

```csharp
namespace Payment.Application.Gateways.Models;

public record PaymentGatewayResult
{
    public bool IsSuccess { get; init; }
    public string? TransactionId { get; init; }
    public string? ErrorCode { get; init; }
    public string? ErrorMessage { get; init; }
    public string? RedirectUrl { get; init; }
    public string? RawResponse { get; init; }
    public Dictionary<string, string> Metadata { get; init; } = new();

    public static PaymentGatewayResult Success(string transactionId, string? redirectUrl = null, string? rawResponse = null)
        => new()
        {
            IsSuccess = true,
            TransactionId = transactionId,
            RedirectUrl = redirectUrl,
            RawResponse = rawResponse
        };

    public static PaymentGatewayResult Failure(string errorCode, string errorMessage, string? rawResponse = null)
        => new()
        {
            IsSuccess = false,
            ErrorCode = errorCode,
            ErrorMessage = errorMessage,
            RawResponse = rawResponse
        };
}
```

### Bước 3: Create Payment Gateway Interface & Factory (20 phút)

#### 3.1. Create IPaymentGateway Interface

Tạo file `src/Services/Payment/Core/Payment.Application/Gateways/IPaymentGateway.cs`:

```csharp
using Payment.Application.Gateways.Models;
using Payment.Domain.Enums;

namespace Payment.Application.Gateways;

public interface IPaymentGateway
{
    PaymentMethod SupportedMethod { get; }
    
    Task<PaymentGatewayResult> ProcessPaymentAsync(
        PaymentGatewayRequest request,
        CancellationToken cancellationToken = default);

    Task<PaymentGatewayResult> VerifyPaymentAsync(
        string transactionId,
        CancellationToken cancellationToken = default);

    Task<PaymentGatewayResult> RefundPaymentAsync(
        string transactionId,
        decimal amount,
        CancellationToken cancellationToken = default);
}
```

#### 3.2. Create IPaymentGatewayFactory Interface

Tạo file `src/Services/Payment/Core/Payment.Application/Gateways/IPaymentGatewayFactory.cs`:

```csharp
using Payment.Domain.Enums;

namespace Payment.Application.Gateways;

public interface IPaymentGatewayFactory
{
    IPaymentGateway GetGateway(PaymentMethod method);
    bool IsSupported(PaymentMethod method);
}
```

#### 3.3. Create PaymentGatewayFactory

Tạo file `src/Services/Payment/Core/Payment.Infrastructure/Gateways/PaymentGatewayFactory.cs`:

```csharp
using Payment.Application.Gateways;
using Payment.Domain.Enums;

namespace Payment.Infrastructure.Gateways;

public class PaymentGatewayFactory : IPaymentGatewayFactory
{
    private readonly IEnumerable<IPaymentGateway> _gateways;

    public PaymentGatewayFactory(IEnumerable<IPaymentGateway> gateways)
    {
        _gateways = gateways;
    }

    public IPaymentGateway GetGateway(PaymentMethod method)
    {
        var gateway = _gateways.FirstOrDefault(g => g.SupportedMethod == method);

        if (gateway is null)
        {
            throw new NotSupportedException($"Payment method {method} is not supported");
        }

        return gateway;
    }

    public bool IsSupported(PaymentMethod method)
    {
        return _gateways.Any(g => g.SupportedMethod == method);
    }
}
```

### Bước 4: Create ProcessPayment Command (15 phút)

#### 4.1. Create ProcessPaymentResult

Tạo file `src/Services/Payment/Core/Payment.Application/Models/Results/ProcessPaymentResult.cs`:

```csharp
using Payment.Application.Dtos;

namespace Payment.Application.Models.Results;

public record ProcessPaymentResult
{
    public bool IsSuccess { get; init; }
    public PaymentDto Payment { get; init; } = null!;
    public string? RedirectUrl { get; init; }
    public string? ErrorMessage { get; init; }

    public static ProcessPaymentResult Success(PaymentDto payment, string? redirectUrl = null)
        => new() { IsSuccess = true, Payment = payment, RedirectUrl = redirectUrl };

    public static ProcessPaymentResult Failure(PaymentDto payment, string errorMessage)
        => new() { IsSuccess = false, Payment = payment, ErrorMessage = errorMessage };
}
```

#### 4.2. Create ProcessPaymentCommand

Tạo file `src/Services/Payment/Core/Payment.Application/Features/Payment/Commands/ProcessPaymentCommand.cs`:

```csharp
using BuildingBlocks.CQRS;
using Common.ValueObjects;
using Payment.Application.Models.Results;

namespace Payment.Application.Features.Payment.Commands;

public record ProcessPaymentCommand(
    Guid PaymentId,
    string? ReturnUrl,
    string? CancelUrl,
    Actor Actor
) : ICommand<ProcessPaymentResult>;
```

#### 4.3. Create Validator

Tạo file `src/Services/Payment/Core/Payment.Application/Features/Payment/Commands/ProcessPaymentCommandValidator.cs`:

```csharp
using Common.Constants;
using FluentValidation;

namespace Payment.Application.Features.Payment.Commands;

public class ProcessPaymentCommandValidator : AbstractValidator<ProcessPaymentCommand>
{
    public ProcessPaymentCommandValidator()
    {
        RuleFor(x => x.PaymentId)
            .NotEmpty()
            .WithMessage(MessageCode.PaymentIdIsRequired);

        RuleFor(x => x.Actor)
            .NotNull()
            .WithMessage(MessageCode.ActorIsRequired);
    }
}
```

### Bước 5: Create ProcessPayment Handler (25 phút)

Tạo file `src/Services/Payment/Core/Payment.Application/Features/Payment/Commands/ProcessPaymentCommandHandler.cs`:

```csharp
using AutoMapper;
using BuildingBlocks.CQRS;
using BuildingBlocks.Exceptions;
using Common.Constants;
using Microsoft.Extensions.Logging;
using Payment.Application.Dtos;
using Payment.Application.Gateways;
using Payment.Application.Gateways.Models;
using Payment.Application.Models.Results;
using Payment.Domain.Enums;
using Payment.Domain.Repositories;

namespace Payment.Application.Features.Payment.Commands;

public class ProcessPaymentCommandHandler(
    IPaymentRepository paymentRepository,
    IUnitOfWork unitOfWork,
    IPaymentGatewayFactory gatewayFactory,
    IMapper mapper,
    ILogger<ProcessPaymentCommandHandler> logger)
    : ICommandHandler<ProcessPaymentCommand, ProcessPaymentResult>
{
    public async Task<ProcessPaymentResult> Handle(
        ProcessPaymentCommand command,
        CancellationToken cancellationToken)
    {
        logger.LogInformation("Processing payment: {PaymentId}", command.PaymentId);

        // 1. Get payment from database
        var payment = await paymentRepository.GetByIdAsync(command.PaymentId, cancellationToken);

        if (payment is null)
        {
            throw new NotFoundException(MessageCode.PaymentNotFound, command.PaymentId);
        }

        // 2. Validate payment status
        if (payment.Status == PaymentStatus.Completed)
        {
            logger.LogWarning("Payment {PaymentId} is already completed", command.PaymentId);
            return ProcessPaymentResult.Success(mapper.Map<PaymentDto>(payment));
        }

        if (payment.Status != PaymentStatus.Pending)
        {
            throw new InvalidOperationException($"Cannot process payment in {payment.Status} status");
        }

        // 3. Mark as processing
        payment.MarkAsProcessing();
        paymentRepository.Update(payment);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        try
        {
            // 4. Get appropriate gateway
            var gateway = gatewayFactory.GetGateway(payment.Method);

            // 5. Build gateway request
            var gatewayRequest = new PaymentGatewayRequest
            {
                PaymentId = payment.Id,
                OrderId = payment.OrderId,
                Amount = payment.Amount,
                Method = payment.Method,
                Description = $"Payment for Order {payment.OrderId}",
                ReturnUrl = command.ReturnUrl,
                CancelUrl = command.CancelUrl
            };

            // 6. Process payment through gateway
            logger.LogInformation(
                "Calling payment gateway {Method} for payment {PaymentId}",
                payment.Method,
                payment.Id);

            var gatewayResult = await gateway.ProcessPaymentAsync(gatewayRequest, cancellationToken);

            // 7. Handle result
            if (gatewayResult.IsSuccess)
            {
                payment.Complete(gatewayResult.TransactionId!, gatewayResult.RawResponse);
                
                logger.LogInformation(
                    "Payment {PaymentId} completed successfully. TransactionId: {TransactionId}",
                    payment.Id,
                    gatewayResult.TransactionId);
            }
            else
            {
                payment.MarkAsFailed(
                    gatewayResult.ErrorCode ?? "UNKNOWN",
                    gatewayResult.ErrorMessage ?? "Unknown error",
                    gatewayResult.RawResponse);
                
                logger.LogWarning(
                    "Payment {PaymentId} failed. Error: {ErrorCode} - {ErrorMessage}",
                    payment.Id,
                    gatewayResult.ErrorCode,
                    gatewayResult.ErrorMessage);
            }

            // 8. Save changes and dispatch domain events
            paymentRepository.Update(payment);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            // 9. Return result
            var paymentDto = mapper.Map<PaymentDto>(payment);

            return gatewayResult.IsSuccess
                ? ProcessPaymentResult.Success(paymentDto, gatewayResult.RedirectUrl)
                : ProcessPaymentResult.Failure(paymentDto, gatewayResult.ErrorMessage!);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error processing payment {PaymentId}", payment.Id);

            // Mark as failed
            payment.MarkAsFailed("SYSTEM_ERROR", ex.Message);
            paymentRepository.Update(payment);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            var paymentDto = mapper.Map<PaymentDto>(payment);
            return ProcessPaymentResult.Failure(paymentDto, ex.Message);
        }
    }
}
```

### Bước 6: Create Mock Payment Gateway (20 phút)

#### 6.1. Create MockPaymentGateway

Tạo file `src/Services/Payment/Core/Payment.Infrastructure/Gateways/MockPaymentGateway.cs`:

```csharp
using Microsoft.Extensions.Logging;
using Payment.Application.Gateways;
using Payment.Application.Gateways.Models;
using Payment.Domain.Enums;

namespace Payment.Infrastructure.Gateways;

/// <summary>
/// Mock payment gateway for testing purposes.
/// Simulates payment processing with configurable success rate.
/// </summary>
public class MockPaymentGateway : IPaymentGateway
{
    private readonly ILogger<MockPaymentGateway> _logger;
    private readonly Random _random = new();

    // Configure success rate (0.0 to 1.0)
    private const double SuccessRate = 0.9;

    public MockPaymentGateway(ILogger<MockPaymentGateway> logger)
    {
        _logger = logger;
    }

    public PaymentMethod SupportedMethod => PaymentMethod.VnPay;

    public async Task<PaymentGatewayResult> ProcessPaymentAsync(
        PaymentGatewayRequest request,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "[MockGateway] Processing payment {PaymentId} for amount {Amount}",
            request.PaymentId,
            request.Amount);

        // Simulate network delay
        await Task.Delay(TimeSpan.FromMilliseconds(500), cancellationToken);

        // Simulate random success/failure based on success rate
        var isSuccess = _random.NextDouble() < SuccessRate;

        if (isSuccess)
        {
            var transactionId = $"MOCK_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}".Substring(0, 32);
            
            _logger.LogInformation(
                "[MockGateway] Payment {PaymentId} processed successfully. TransactionId: {TransactionId}",
                request.PaymentId,
                transactionId);

            return PaymentGatewayResult.Success(
                transactionId: transactionId,
                redirectUrl: request.ReturnUrl,
                rawResponse: $"{{\"status\":\"success\",\"transaction_id\":\"{transactionId}\"}}"
            );
        }
        else
        {
            var errorCode = GetRandomErrorCode();
            var errorMessage = GetErrorMessage(errorCode);

            _logger.LogWarning(
                "[MockGateway] Payment {PaymentId} failed. Error: {ErrorCode}",
                request.PaymentId,
                errorCode);

            return PaymentGatewayResult.Failure(
                errorCode: errorCode,
                errorMessage: errorMessage,
                rawResponse: $"{{\"status\":\"failed\",\"error_code\":\"{errorCode}\",\"message\":\"{errorMessage}\"}}"
            );
        }
    }

    public async Task<PaymentGatewayResult> VerifyPaymentAsync(
        string transactionId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[MockGateway] Verifying transaction {TransactionId}", transactionId);

        await Task.Delay(TimeSpan.FromMilliseconds(200), cancellationToken);

        // Always return success for mock
        return PaymentGatewayResult.Success(transactionId);
    }

    public async Task<PaymentGatewayResult> RefundPaymentAsync(
        string transactionId,
        decimal amount,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "[MockGateway] Refunding {Amount} for transaction {TransactionId}",
            amount,
            transactionId);

        await Task.Delay(TimeSpan.FromMilliseconds(300), cancellationToken);

        var refundId = $"REFUND_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}".Substring(0, 32);
        return PaymentGatewayResult.Success(refundId);
    }

    private string GetRandomErrorCode()
    {
        var errorCodes = new[] { "INSUFFICIENT_FUNDS", "CARD_DECLINED", "EXPIRED_CARD", "NETWORK_ERROR" };
        return errorCodes[_random.Next(errorCodes.Length)];
    }

    private string GetErrorMessage(string errorCode) => errorCode switch
    {
        "INSUFFICIENT_FUNDS" => "Insufficient funds in account",
        "CARD_DECLINED" => "Card was declined by issuer",
        "EXPIRED_CARD" => "Card has expired",
        "NETWORK_ERROR" => "Network error occurred during processing",
        _ => "Unknown error occurred"
    };
}
```

#### 6.2. Create COD Gateway (No processing needed)

Tạo file `src/Services/Payment/Core/Payment.Infrastructure/Gateways/CodPaymentGateway.cs`:

```csharp
using Microsoft.Extensions.Logging;
using Payment.Application.Gateways;
using Payment.Application.Gateways.Models;
using Payment.Domain.Enums;

namespace Payment.Infrastructure.Gateways;

/// <summary>
/// Cash On Delivery gateway - marks payment as pending until delivery.
/// </summary>
public class CodPaymentGateway : IPaymentGateway
{
    private readonly ILogger<CodPaymentGateway> _logger;

    public CodPaymentGateway(ILogger<CodPaymentGateway> logger)
    {
        _logger = logger;
    }

    public PaymentMethod SupportedMethod => PaymentMethod.Cod;

    public Task<PaymentGatewayResult> ProcessPaymentAsync(
        PaymentGatewayRequest request,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "[COD] Payment {PaymentId} created for COD. Amount: {Amount}",
            request.PaymentId,
            request.Amount);

        // COD payments are always "successful" - they complete on delivery
        var transactionId = $"COD_{request.OrderId:N}".Substring(0, 32);

        return Task.FromResult(PaymentGatewayResult.Success(
            transactionId: transactionId,
            rawResponse: "{\"status\":\"cod_pending\",\"message\":\"Payment will be collected on delivery\"}"
        ));
    }

    public Task<PaymentGatewayResult> VerifyPaymentAsync(
        string transactionId,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(PaymentGatewayResult.Success(transactionId));
    }

    public Task<PaymentGatewayResult> RefundPaymentAsync(
        string transactionId,
        decimal amount,
        CancellationToken cancellationToken = default)
    {
        // COD refunds are handled manually
        return Task.FromResult(PaymentGatewayResult.Success($"REFUND_{transactionId}"));
    }
}
```

#### 6.3. Update DependencyInjection

Cập nhật file `src/Services/Payment/Core/Payment.Infrastructure/DependencyInjection.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Payment.Application.Gateways;
using Payment.Domain.Repositories;
using Payment.Infrastructure.Data;
using Payment.Infrastructure.Gateways;
using Payment.Infrastructure.Repositories;

namespace Payment.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Database
        var connectionString = configuration.GetConnectionString("PaymentDb");
        services.AddDbContext<PaymentDbContext>(options =>
            options.UseNpgsql(connectionString));

        // Repositories
        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Payment Gateways
        services.AddScoped<IPaymentGateway, MockPaymentGateway>();
        services.AddScoped<IPaymentGateway, CodPaymentGateway>();
        // TODO: Add real gateways (VNPay, Momo, Stripe) in Day 47

        // Gateway Factory
        services.AddScoped<IPaymentGatewayFactory, PaymentGatewayFactory>();

        return services;
    }
}
```

### Bước 7: Create ProcessPayment Endpoint (15 phút)

Tạo file `src/Services/Payment/Api/Payment.Api/Endpoints/ProcessPayment.cs`:

```csharp
using Carter;
using Common.Models.Responses;
using Common.ValueObjects;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Payment.Api.Constants;
using Payment.Application.Features.Payment.Commands;
using Payment.Application.Models.Results;

namespace Payment.Api.Endpoints;

public sealed class ProcessPayment : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost(ApiRoutes.Payment.Process, HandleProcessPaymentAsync)
            .WithTags(ApiRoutes.Payment.Tags)
            .WithName(nameof(ProcessPayment))
            .Produces<ApiPerformedResponse<ProcessPaymentResult>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .WithDescription("Process a pending payment through the payment gateway")
            .RequireAuthorization();
    }

    private async Task<IResult> HandleProcessPaymentAsync(
        ISender sender,
        Guid paymentId,
        [FromBody] ProcessPaymentRequest? request,
        HttpContext httpContext)
    {
        var userId = httpContext.User.FindFirst("sub")?.Value
            ?? httpContext.User.FindFirst("userId")?.Value
            ?? "anonymous";

        var actor = Actor.User(userId);

        var command = new ProcessPaymentCommand(
            PaymentId: paymentId,
            ReturnUrl: request?.ReturnUrl,
            CancelUrl: request?.CancelUrl,
            Actor: actor
        );

        var result = await sender.Send(command);

        if (result.IsSuccess)
        {
            return Results.Ok(new ApiPerformedResponse<ProcessPaymentResult>(
                result,
                "Payment processed successfully"
            ));
        }
        else
        {
            return Results.Ok(new ApiPerformedResponse<ProcessPaymentResult>(
                result,
                result.ErrorMessage ?? "Payment processing failed"
            ));
        }
    }
}

public record ProcessPaymentRequest(
    string? ReturnUrl = null,
    string? CancelUrl = null
);
```

### Bước 8: Test (15 phút)

#### 8.1. Build and Run

```bash
dotnet build src/Services/Payment
dotnet run --project src/Services/Payment/Api/Payment.Api
```

#### 8.2. Test Flow

**Step 1: Create Payment**

```http
POST /api/payments
Content-Type: application/json
Authorization: Bearer <token>

{
  "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "amount": 299.99,
  "method": 1
}
```

**Step 2: Process Payment**

```http
POST /api/payments/{paymentId}/process
Content-Type: application/json
Authorization: Bearer <token>

{
  "returnUrl": "https://myapp.com/payment/success",
  "cancelUrl": "https://myapp.com/payment/cancel"
}
```

**Expected Success Response:**

```json
{
  "data": {
    "isSuccess": true,
    "payment": {
      "id": "...",
      "orderId": "...",
      "transactionId": "MOCK_20240101120000_abc123",
      "amount": 299.99,
      "status": 3,
      "statusName": "Completed",
      "method": 1,
      "methodName": "VnPay",
      "processedAt": "2024-01-01T12:00:00Z"
    },
    "redirectUrl": "https://myapp.com/payment/success"
  },
  "message": "Payment processed successfully"
}
```

**Expected Failure Response (10% chance with mock):**

```json
{
  "data": {
    "isSuccess": false,
    "payment": {
      "id": "...",
      "status": 4,
      "statusName": "Failed",
      "errorCode": "INSUFFICIENT_FUNDS",
      "errorMessage": "Insufficient funds in account"
    },
    "errorMessage": "Insufficient funds in account"
  },
  "message": "Insufficient funds in account"
}
```

---

## 📝 Ghi chú cho Day 46

### MessageCode Constants cần thêm

```csharp
public const string PaymentIdIsRequired = "PAYMENT_ID_IS_REQUIRED";
public const string PaymentMethodNotSupported = "PAYMENT_METHOD_NOT_SUPPORTED";
public const string PaymentProcessingFailed = "PAYMENT_PROCESSING_FAILED";
public const string PaymentAlreadyProcessed = "PAYMENT_ALREADY_PROCESSED";
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Payment Service                       │
├─────────────────────────────────────────────────────────┤
│  API Layer                                               │
│  └── ProcessPayment Endpoint                            │
│       ↓                                                  │
│  Application Layer                                       │
│  └── ProcessPaymentCommandHandler                       │
│       ↓                                                  │
│  ┌─────────────────────────────────────────────────┐    │
│  │        IPaymentGatewayFactory                    │    │
│  │  ┌─────────┬─────────┬─────────┬─────────┐      │    │
│  │  │  VNPay  │  Momo   │ Stripe  │   COD   │      │    │
│  │  └─────────┴─────────┴─────────┴─────────┘      │    │
│  └─────────────────────────────────────────────────┘    │
│       ↓                                                  │
│  Domain Layer                                            │
│  └── PaymentEntity (Domain Events)                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🔗 Summary - Files Created/Modified

### New Files

| File | Description |
|------|-------------|
| `Events/PaymentCompletedDomainEvent.cs` | Domain event |
| `Events/PaymentFailedDomainEvent.cs` | Domain event |
| `Gateways/IPaymentGateway.cs` | Gateway interface |
| `Gateways/IPaymentGatewayFactory.cs` | Factory interface |
| `Gateways/Models/PaymentGatewayRequest.cs` | Request model |
| `Gateways/Models/PaymentGatewayResult.cs` | Result model |
| `Commands/ProcessPaymentCommand.cs` | Command |
| `Commands/ProcessPaymentCommandHandler.cs` | Handler |
| `Gateways/MockPaymentGateway.cs` | Mock implementation |
| `Gateways/CodPaymentGateway.cs` | COD implementation |
| `Endpoints/ProcessPayment.cs` | API endpoint |

### Modified Files

| File | Changes |
|------|---------|
| `PaymentEntity.cs` | Added domain event methods |
| `PaymentStatus.cs` | Added Processing, Cancelled |
| `DependencyInjection.cs` | Registered gateways |

---

## 🚀 Next Steps

- **Day 47**: Integrate VNPay Payment Gateway
- **Day 48**: Integrate Momo Payment Gateway
- **Day 49**: Create Payment Webhook Handler
- **Day 50**: Test End-to-End Payment Service

---

**Chúc bạn hoàn thành tốt Day 46! 💳🔧**
