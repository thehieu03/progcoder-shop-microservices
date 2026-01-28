# 📘 Day 44: Create Payment Command & API Endpoint

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Tiếp tục xây dựng Payment Service với việc tạo **CreatePayment Command**, Handler, DTOs và API Endpoint để khởi tạo thanh toán cho đơn hàng.

Bạn sẽ:

1.  **DTOs**: Tạo `PaymentDto` và `CreatePaymentDto`.
2.  **Command**: Định nghĩa `CreatePaymentCommand` với validation.
3.  **Handler**: Implement `CreatePaymentCommandHandler` để tạo Payment record.
4.  **Endpoint**: Expose API endpoint `POST /api/payments`.
5.  **Testing**: Verify qua Swagger.

**Thời gian ước tính**: 60-90 phút.

---

## ✅ Checklist - Đánh dấu khi hoàn thành

### Application Layer - DTOs (Bước 1)

- [ ] Create `PaymentDto.cs` (response DTO)
- [ ] Create `CreatePaymentDto.cs` (request DTO)
- [ ] Create `PaymentMappingProfile.cs` (AutoMapper profile)

### Application Layer - Command (Bước 2-3)

- [ ] Create `CreatePaymentCommand.cs` record
- [ ] Create `CreatePaymentCommandValidator.cs` (FluentValidation)
- [ ] Create `CreatePaymentCommandHandler.cs`
- [ ] Implement logic tạo Payment và lưu DB

### Infrastructure Layer (Bước 4)

- [ ] Create `PaymentDbContext.cs`
- [ ] Create `PaymentRepository.cs` implementation
- [ ] Setup EF Core configuration
- [ ] Register DI services

### API Layer - Endpoint (Bước 5)

- [ ] Create `ApiRoutes.cs` constants
- [ ] Create `CreatePayment.cs` endpoint
- [ ] Setup Swagger documentation

### Testing (Bước 6)

- [ ] Build & Run Project
- [ ] Test endpoint với valid data
- [ ] Test endpoint với invalid data (validation errors)

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Create DTOs (15 phút)

#### 1.1. Create PaymentDto

Tạo file `src/Services/Payment/Core/Payment.Application/Dtos/PaymentDto.cs`:

```csharp
using Payment.Domain.Enums;

namespace Payment.Application.Dtos;

public record PaymentDto
{
    public Guid Id { get; init; }
    public Guid OrderId { get; init; }
    public string? TransactionId { get; init; }
    public decimal Amount { get; init; }
    public PaymentStatus Status { get; init; }
    public string StatusName => Status.ToString();
    public PaymentMethod Method { get; init; }
    public string MethodName => Method.ToString();
    public string? ErrorMessage { get; init; }
    public DateTimeOffset CreatedOnUtc { get; init; }
    public DateTimeOffset? LastModifiedOnUtc { get; init; }
}
```

#### 1.2. Create CreatePaymentDto

Tạo file `src/Services/Payment/Core/Payment.Application/Dtos/CreatePaymentDto.cs`:

```csharp
using Payment.Domain.Enums;

namespace Payment.Application.Dtos;

public record CreatePaymentDto(
    Guid OrderId,
    decimal Amount,
    PaymentMethod Method
);
```

#### 1.3. Create Mapping Profile

Tạo file `src/Services/Payment/Core/Payment.Application/Mappings/PaymentMappingProfile.cs`:

```csharp
using AutoMapper;
using Payment.Application.Dtos;
using Payment.Domain.Entities;

namespace Payment.Application.Mappings;

public class PaymentMappingProfile : Profile
{
    public PaymentMappingProfile()
    {
        CreateMap<PaymentEntity, PaymentDto>();
    }
}
```

### Bước 2: Create Command & Validator (15 phút)

#### 2.1. Create CreatePaymentCommand

Tạo file `src/Services/Payment/Core/Payment.Application/Features/Payment/Commands/CreatePaymentCommand.cs`:

```csharp
using BuildingBlocks.CQRS;
using Common.ValueObjects;
using Payment.Application.Dtos;
using Payment.Domain.Enums;

namespace Payment.Application.Features.Payment.Commands;

public record CreatePaymentCommand(
    Guid OrderId,
    decimal Amount,
    PaymentMethod Method,
    Actor Actor
) : ICommand<PaymentDto>;
```

#### 2.2. Create Validator

Tạo file `src/Services/Payment/Core/Payment.Application/Features/Payment/Commands/CreatePaymentCommandValidator.cs`:

```csharp
using Common.Constants;
using FluentValidation;

namespace Payment.Application.Features.Payment.Commands;

public class CreatePaymentCommandValidator : AbstractValidator<CreatePaymentCommand>
{
    public CreatePaymentCommandValidator()
    {
        RuleFor(x => x.OrderId)
            .NotEmpty()
            .WithMessage(MessageCode.OrderIdIsRequired);

        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .WithMessage(MessageCode.AmountMustBeGreaterThanZero);

        RuleFor(x => x.Method)
            .IsInEnum()
            .WithMessage(MessageCode.PaymentMethodInvalid);

        RuleFor(x => x.Actor)
            .NotNull()
            .WithMessage(MessageCode.ActorIsRequired);
    }
}
```

### Bước 3: Create Command Handler (20 phút)

Tạo file `src/Services/Payment/Core/Payment.Application/Features/Payment/Commands/CreatePaymentCommandHandler.cs`:

```csharp
using AutoMapper;
using BuildingBlocks.CQRS;
using Microsoft.Extensions.Logging;
using Payment.Application.Dtos;
using Payment.Domain.Entities;
using Payment.Domain.Repositories;

namespace Payment.Application.Features.Payment.Commands;

public class CreatePaymentCommandHandler(
    IPaymentRepository paymentRepository,
    IUnitOfWork unitOfWork,
    IMapper mapper,
    ILogger<CreatePaymentCommandHandler> logger)
    : ICommandHandler<CreatePaymentCommand, PaymentDto>
{
    public async Task<PaymentDto> Handle(CreatePaymentCommand command, CancellationToken cancellationToken)
    {
        logger.LogInformation(
            "Creating payment for OrderId: {OrderId}, Amount: {Amount}, Method: {Method}",
            command.OrderId,
            command.Amount,
            command.Method);

        // 1. Check if payment already exists for this order
        var existingPayment = await paymentRepository.GetByOrderIdAsync(command.OrderId, cancellationToken);
        if (existingPayment != null && existingPayment.Status == Domain.Enums.PaymentStatus.Pending)
        {
            logger.LogWarning("Payment already exists for OrderId: {OrderId}", command.OrderId);
            return mapper.Map<PaymentDto>(existingPayment);
        }

        // 2. Create new Payment entity
        var payment = PaymentEntity.Create(
            orderId: command.OrderId,
            amount: command.Amount,
            method: command.Method
        );

        // 3. Add audit info
        payment.SetCreatedBy(command.Actor.Value);

        // 4. Save to database
        paymentRepository.Add(payment);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "Payment created successfully. PaymentId: {PaymentId}, OrderId: {OrderId}",
            payment.Id,
            command.OrderId);

        // 5. Map and return
        return mapper.Map<PaymentDto>(payment);
    }
}
```

### Bước 4: Setup Infrastructure (25 phút)

#### 4.1. Create PaymentDbContext

Tạo file `src/Services/Payment/Core/Payment.Infrastructure/Data/PaymentDbContext.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using Payment.Domain.Entities;

namespace Payment.Infrastructure.Data;

public class PaymentDbContext : DbContext
{
    public PaymentDbContext(DbContextOptions<PaymentDbContext> options) : base(options)
    {
    }

    public DbSet<PaymentEntity> Payments => Set<PaymentEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Payment configuration
        modelBuilder.Entity<PaymentEntity>(entity =>
        {
            entity.ToTable("Payments");
            
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.OrderId)
                .IsRequired();
            
            entity.Property(e => e.TransactionId)
                .HasMaxLength(100);
            
            entity.Property(e => e.Amount)
                .HasPrecision(18, 2)
                .IsRequired();
            
            entity.Property(e => e.Status)
                .IsRequired();
            
            entity.Property(e => e.Method)
                .IsRequired();
            
            entity.Property(e => e.ErrorMessage)
                .HasMaxLength(500);

            // Index for faster queries
            entity.HasIndex(e => e.OrderId);
            entity.HasIndex(e => e.TransactionId);
            entity.HasIndex(e => e.Status);
        });
    }
}
```

#### 4.2. Create PaymentRepository

Tạo file `src/Services/Payment/Core/Payment.Infrastructure/Repositories/PaymentRepository.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using Payment.Domain.Entities;
using Payment.Domain.Repositories;
using Payment.Infrastructure.Data;

namespace Payment.Infrastructure.Repositories;

public class PaymentRepository(PaymentDbContext dbContext) : IPaymentRepository
{
    public async Task<PaymentEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Payments
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<PaymentEntity?> GetByOrderIdAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Payments
            .AsNoTracking()
            .OrderByDescending(p => p.CreatedOnUtc)
            .FirstOrDefaultAsync(p => p.OrderId == orderId, cancellationToken);
    }

    public void Add(PaymentEntity payment)
    {
        dbContext.Payments.Add(payment);
    }

    public void Update(PaymentEntity payment)
    {
        dbContext.Payments.Update(payment);
    }
}
```

#### 4.3. Create UnitOfWork

Tạo file `src/Services/Payment/Core/Payment.Infrastructure/Data/UnitOfWork.cs`:

```csharp
using Payment.Domain.Repositories;
using Payment.Infrastructure.Repositories;

namespace Payment.Infrastructure.Data;

public interface IUnitOfWork
{
    IPaymentRepository Payments { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

public class UnitOfWork(PaymentDbContext dbContext) : IUnitOfWork
{
    private IPaymentRepository? _payments;

    public IPaymentRepository Payments => _payments ??= new PaymentRepository(dbContext);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.SaveChangesAsync(cancellationToken);
    }
}
```

#### 4.4. Create DependencyInjection

Tạo file `src/Services/Payment/Core/Payment.Infrastructure/DependencyInjection.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Payment.Domain.Repositories;
using Payment.Infrastructure.Data;
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

        return services;
    }
}
```

### Bước 5: Create API Endpoint (20 phút)

#### 5.1. Create ApiRoutes

Tạo file `src/Services/Payment/Api/Payment.Api/Constants/ApiRoutes.cs`:

```csharp
namespace Payment.Api.Constants;

public static class ApiRoutes
{
    public static class Payment
    {
        public const string Tags = "Payments";
        private const string Base = "/api/payments";

        public const string Create = Base;
        public const string GetById = Base + "/{paymentId:guid}";
        public const string GetByOrderId = Base + "/order/{orderId:guid}";
        public const string Process = Base + "/{paymentId:guid}/process";
        public const string Refund = Base + "/{paymentId:guid}/refund";
    }
}
```

#### 5.2. Create CreatePayment Endpoint

Tạo file `src/Services/Payment/Api/Payment.Api/Endpoints/CreatePayment.cs`:

```csharp
using Carter;
using Common.Models.Responses;
using Common.ValueObjects;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Payment.Api.Constants;
using Payment.Application.Dtos;
using Payment.Application.Features.Payment.Commands;
using Payment.Domain.Enums;

namespace Payment.Api.Endpoints;

public sealed class CreatePayment : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost(ApiRoutes.Payment.Create, HandleCreatePaymentAsync)
            .WithTags(ApiRoutes.Payment.Tags)
            .WithName(nameof(CreatePayment))
            .Produces<ApiCreatedResponse<PaymentDto>>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .WithDescription("Create a new payment for an order")
            .RequireAuthorization();
    }

    private async Task<IResult> HandleCreatePaymentAsync(
        ISender sender,
        [FromBody] CreatePaymentRequest request,
        HttpContext httpContext)
    {
        // Get current user from claims
        var userId = httpContext.User.FindFirst("sub")?.Value 
            ?? httpContext.User.FindFirst("userId")?.Value 
            ?? "anonymous";
        
        var actor = Actor.User(userId);

        var command = new CreatePaymentCommand(
            OrderId: request.OrderId,
            Amount: request.Amount,
            Method: request.Method,
            Actor: actor
        );

        var result = await sender.Send(command);

        return Results.Created(
            $"{ApiRoutes.Payment.Create}/{result.Id}",
            new ApiCreatedResponse<PaymentDto>(result)
        );
    }
}

public record CreatePaymentRequest(
    Guid OrderId,
    decimal Amount,
    PaymentMethod Method
);
```

#### 5.3. Update Program.cs

Cập nhật file `src/Services/Payment/Api/Payment.Api/Program.cs`:

```csharp
using Carter;
using Payment.Application;
using Payment.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCarter();

// Add Application layer
builder.Services.AddApplication();

// Add Infrastructure layer
builder.Services.AddInfrastructure(builder.Configuration);

// Add Authentication/Authorization (configure based on your setup)
builder.Services.AddAuthentication();
builder.Services.AddAuthorization();

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapCarter();

app.Run();
```

#### 5.4. Create Application DependencyInjection

Tạo file `src/Services/Payment/Core/Payment.Application/DependencyInjection.cs`:

```csharp
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Payment.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = typeof(DependencyInjection).Assembly;

        // MediatR
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(assembly));

        // FluentValidation
        services.AddValidatorsFromAssembly(assembly);

        // AutoMapper
        services.AddAutoMapper(assembly);

        return services;
    }
}
```

### Bước 6: Test (15 phút)

#### 6.1. Add Connection String

Thêm vào `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "PaymentDb": "Host=localhost;Port=5433;Database=PaymentDb;Username=postgres;Password=123456789Aa"
  }
}
```

#### 6.2. Create Migration

```bash
cd src/Services/Payment/Core/Payment.Infrastructure
dotnet ef migrations add InitialCreate -s ../../Api/Payment.Api
dotnet ef database update -s ../../Api/Payment.Api
```

#### 6.3. Run and Test

```bash
# Build
dotnet build src/Services/Payment

# Run
dotnet run --project src/Services/Payment/Api/Payment.Api
```

Mở Swagger UI và test:

**Request:**
```json
POST /api/payments
{
  "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "amount": 299.99,
  "method": 1
}
```

**Expected Response (201 Created):**
```json
{
  "data": {
    "id": "...",
    "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "transactionId": null,
    "amount": 299.99,
    "status": 1,
    "statusName": "Pending",
    "method": 1,
    "methodName": "VnPay",
    "errorMessage": null,
    "createdOnUtc": "2024-01-01T00:00:00Z"
  }
}
```

---

## 📝 Ghi chú cho Day 44

### MessageCode Constants cần thêm

Thêm vào `src/Shared/Common/Constants/MessageCode.cs`:

```csharp
// Payment validation
public const string OrderIdIsRequired = "ORDER_ID_IS_REQUIRED";
public const string AmountMustBeGreaterThanZero = "AMOUNT_MUST_BE_GREATER_THAN_ZERO";
public const string PaymentMethodInvalid = "PAYMENT_METHOD_INVALID";
public const string PaymentNotFound = "PAYMENT_NOT_FOUND";
public const string PaymentAlreadyCompleted = "PAYMENT_ALREADY_COMPLETED";
public const string PaymentAlreadyFailed = "PAYMENT_ALREADY_FAILED";
```

### Next Steps

- **Day 45**: Create GetPaymentById Query & API Endpoint
- **Day 46**: Create ProcessPayment Command (integrate với Payment Gateway)
- **Day 47**: Create Payment Gateway Integration (VNPay/Momo/Stripe)
- **Day 48**: Create Payment Webhook Handler

---

## 🔗 Dependencies cần thêm vào .csproj

### Payment.Application.csproj

```xml
<ItemGroup>
  <PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" />
  <PackageReference Include="FluentValidation.DependencyInjectionExtensions" />
  <PackageReference Include="MediatR" />
</ItemGroup>
```

### Payment.Infrastructure.csproj

```xml
<ItemGroup>
  <PackageReference Include="Microsoft.EntityFrameworkCore" />
  <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" />
  <PackageReference Include="Microsoft.EntityFrameworkCore.Design" />
</ItemGroup>
```

### Payment.Api.csproj

```xml
<ItemGroup>
  <PackageReference Include="Carter" />
  <PackageReference Include="Swashbuckle.AspNetCore" />
</ItemGroup>
```

---

**Chúc bạn hoàn thành tốt Day 44! 💳🚀**
