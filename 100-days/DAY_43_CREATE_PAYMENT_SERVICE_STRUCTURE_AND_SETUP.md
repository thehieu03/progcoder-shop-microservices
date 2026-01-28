# 📘 Day 43: Payment Service - Initialize Structure & Domain

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Sau khi hoàn tất Order Service, chúng ta bắt đầu xây dựng **Payment Service**. Bước đầu tiên là khởi tạo cấu trúc dự án (Clean Architecture) và định nghĩa lớp Domain lõi.

Bạn sẽ:

1.  **Project Setup**: Tạo 4 dự án con (Api, Application, Domain, Infrastructure).
2.  **Domain Enums**: Định nghĩa `PaymentStatus` và `PaymentMethod`.
3.  **Domain Entity**: Tạo `PaymentEntity` kế thừa từ `Aggregate`.
4.  **Repository Interface**: Định nghĩa `IPaymentRepository`.

**Thời gian ước tính**: 60-90 phút.

---

## ✅ Checklist - Đánh dấu khi hoàn thành

### Infrastructure & Setup (Bước 1)

- [ ] Tạo thư mục `src/Services/Payment` với 2 thư mục con `Api` và `Core`.
- [ ] Tạo 4 dự án .NET (Class Library cho Domain/App/Infra, Web API cho Api).
- [ ] Add các project vào Solution `.sln`.
- [ ] Setup Project References theo Clean Architecture.

### Domain Layer (Bước 2-3)

- [ ] Tạo `PaymentStatus` và `PaymentMethod` enums.
- [ ] Tạo `PaymentEntity.cs` với các thuộc tính: OrderId, TransactionId, Amount, Status, Method.
- [ ] Tạo `IPaymentRepository.cs` trong Domain.

### Application Layer (Bước 4)

- [ ] Register `Payment.Domain` reference trong `Payment.Application`.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Khởi tạo cấu trúc dự án (20 phút)

Sử dụng terminal (PowerShell hoặc Bash) tại thư mục gốc của project:

```powershell
# Tạo thư mục
mkdir -p src/Services/Payment/Api
mkdir -p src/Services/Payment/Core

# Tạo các dự án
dotnet new classlib -n Payment.Domain -o src/Services/Payment/Core/Payment.Domain
dotnet new classlib -n Payment.Application -o src/Services/Payment/Core/Payment.Application
dotnet new classlib -n Payment.Infrastructure -o src/Services/Payment/Core/Payment.Infrastructure
dotnet new web -n Payment.Api -o src/Services/Payment/Api/Payment.Api

# Thêm vào Solution
dotnet sln add (ls -r src/Services/Payment/**/*.csproj)

# Setup References
dotnet add src/Services/Payment/Core/Payment.Application reference src/Services/Payment/Core/Payment.Domain
dotnet add src/Services/Payment/Core/Payment.Infrastructure reference src/Services/Payment/Core/Payment.Application
dotnet add src/Services/Payment/Api/Payment.Api reference src/Services/Payment/Core/Payment.Infrastructure

# Add Shared References (Ví dụ BuildingBlocks)
dotnet add src/Services/Payment/Core/Payment.Domain reference src/Shared/BuildingBlocks
dotnet add src/Services/Payment/Core/Payment.Application reference src/Shared/Common
```

### Bước 2: Định nghĩa Enums & Value Objects (15 phút)

Tạo file `src/Services/Payment/Core/Payment.Domain/Enums/PaymentStatus.cs`:

```csharp
namespace Payment.Domain.Enums;

public enum PaymentStatus
{
    Pending = 1,
    Completed = 2,
    Failed = 3,
    Refunded = 4
}
```

Tạo file `src/Services/Payment/Core/Payment.Domain/Enums/PaymentMethod.cs`:

```csharp
namespace Payment.Domain.Enums;

public enum PaymentMethod
{
    VnPay = 1,
    Momo = 2,
    Paypal = 3,
    Stripe = 4,
    Cod = 5
}
```

### Bước 3: Tạo PaymentEntity (20 phút)

Tạo file `src/Services/Payment/Core/Payment.Domain/Entities/PaymentEntity.cs`:

```csharp
using BuildingBlocks.Abstractions; // Hoặc Aggregate base class của bạn
using Payment.Domain.Enums;

namespace Payment.Domain.Entities;

public sealed class PaymentEntity : Aggregate<Guid>
{
    public Guid OrderId { get; private set; }
    public string? TransactionId { get; private set; }
    public decimal Amount { get; private set; }
    public PaymentStatus Status { get; private set; }
    public PaymentMethod Method { get; private set; }
    public string? ErrorMessage { get; private set; }

    private PaymentEntity() { } // For EF Core

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

    public void Complete(string transactionId)
    {
        Status = PaymentStatus.Completed;
        TransactionId = transactionId;
        LastModifiedOnUtc = DateTimeOffset.UtcNow;
    }

    public void MarkAsFailed(string errorMessage)
    {
        Status = PaymentStatus.Failed;
        ErrorMessage = errorMessage;
        LastModifiedOnUtc = DateTimeOffset.UtcNow;
    }
}
```

### Bước 4: Payment Repository Interface (10 phút)

Tạo file `src/Services/Payment/Core/Payment.Domain/Repositories/IPaymentRepository.cs`:

```csharp
using Payment.Domain.Entities;

namespace Payment.Domain.Repositories;

public interface IPaymentRepository
{
    Task<PaymentEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PaymentEntity?> GetByOrderIdAsync(Guid orderId, CancellationToken cancellationToken = default);
    void Add(PaymentEntity payment);
    void Update(PaymentEntity payment);
}
```

---

## 📝 Ghi chú cho Day 43

- Đừng quên check các base class như `Aggregate<T>` trong `Shared/BuildingBlocks` để kế thừa đúng namespace.
- Nếu project sử dụng Implicit Usings, bạn có thể rút gọn các dòng `using`.
- Hãy build solution sau khi setup project để đảm bảo references chính xác: `dotnet build src/Services/Payment`.

---

**Chúc bạn khởi đầu thuận lợi với Payment Service! 💳**
