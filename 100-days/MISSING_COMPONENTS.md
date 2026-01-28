# 📋 Danh sách các Component bị thiếu trong hướng dẫn

File này liệt kê tất cả các class, config, extension methods, và constants bị thiếu hoặc chưa được hướng dẫn tạo trong các file hướng dẫn từ Day 1-19.

---

## 🔴 CRITICAL - Thiếu hoàn toàn (Code sẽ không compile)

### 1. ValidationBehavior và LoggingBehavior

**Vấn đề:**
- Day 10 và Day 11 reference `ValidationBehavior<,>` và `LoggingBehavior<,>` nhưng chưa có hướng dẫn tạo
- Code trong `MediatRExtensions.cs` sẽ không compile được

**Vị trí cần tạo:**
- `src/Shared/BuildingBlocks/Behaviors/ValidationBehavior.cs`
- `src/Shared/BuildingBlocks/Behaviors/LoggingBehavior.cs`

**Được reference ở:**
- Day 10: `DAY_10_SETUP_MEDIATR.md` (dòng 101-102, 118-119)
- Day 11: `DAY_11_CREATE_CATALOG_SERVICE_STRUCTURE.md` (dòng 293-294)

**Cần tạo trước Day:** Day 10 hoặc Day 11

**Hướng dẫn tạo:**

#### Bước 1: Tạo thư mục Behaviors (nếu chưa có)

```bash
cd src/Shared/BuildingBlocks
mkdir -p Behaviors

# Windows PowerShell
New-Item -ItemType Directory -Path "Behaviors" -Force
```

#### Bước 2: Tạo ValidationBehavior.cs

Tạo file `src/Shared/BuildingBlocks/Behaviors/ValidationBehavior.cs`:

```csharp
#region using

using FluentValidation;
using MediatR;

#endregion

namespace BuildingBlocks.Behaviors;

public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    #region Fields

    private readonly IEnumerable<IValidator<TRequest>> _validators;

    #endregion

    #region Ctors

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    #endregion

    #region Implementations

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
        {
            return await next();
        }

        var context = new ValidationContext<TRequest>(request);

        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = validationResults
            .Where(r => r.Errors.Any())
            .SelectMany(r => r.Errors)
            .ToList();

        if (failures.Any())
        {
            throw new ValidationException(failures);
        }

        return await next();
    }

    #endregion
}
```

#### Bước 3: Tạo LoggingBehavior.cs

Tạo file `src/Shared/BuildingBlocks/Behaviors/LoggingBehavior.cs`:

```csharp
#region using

using MediatR;
using Microsoft.Extensions.Logging;

#endregion

namespace BuildingBlocks.Behaviors;

public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    #region Fields

    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    #endregion

    #region Ctors

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    #endregion

    #region Implementations

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;

        _logger.LogInformation(
            "[START] {RequestName} - Request: {@Request}",
            requestName,
            request);

        var response = await next();

        _logger.LogInformation(
            "[END] {RequestName} - Response: {@Response}",
            requestName,
            response);

        return response;
    }

    #endregion
}
```

#### Bước 4: Verify

```bash
cd src/Shared/BuildingBlocks
dotnet build
```

**Kết quả mong đợi:** `Build succeeded`

---

## 🟡 HIGH PRIORITY - Thiếu một phần (Code có thể compile nhưng thiếu chức năng)

### 2. MessageCode Constants - Thiếu nhiều constants

**Vấn đề:**
- Day 5 chỉ tạo một số constants cơ bản
- Day 15 cần nhiều constants nhưng không có hướng dẫn tạo đầy đủ

**Vị trí:** `src/Shared/Common/Constants/MessageCode.cs`

**Được reference ở:**
- Day 15: `DAY_15_CREATE_CREATE_PRODUCT_COMMAND.md` (dòng 167-215)

**Cần tạo trước Day:** Day 15

**Hướng dẫn tạo:**

#### Bước 1: Mở file MessageCode.cs

Mở file `src/Shared/Common/Constants/MessageCode.cs` (đã được tạo trong Day 5)

#### Bước 2: Thêm các constants còn thiếu

Thêm các constants sau vào class `MessageCode` (sau các constants đã có):

```csharp
// Product validation constants
public const string ProductNameIsRequired = "PRODUCT_NAME_IS_REQUIRED";
public const string ProductNameMaxLength = "PRODUCT_NAME_MAX_LENGTH";
public const string ProductNameMinLength = "PRODUCT_NAME_MIN_LENGTH";

public const string SkuIsRequired = "SKU_IS_REQUIRED";
public const string SkuMaxLength = "SKU_MAX_LENGTH";
public const string SkuMinLength = "SKU_MIN_LENGTH";
public const string SkuAlreadyExists = "SKU_ALREADY_EXISTS";

public const string ShortDescriptionIsRequired = "SHORT_DESCRIPTION_IS_REQUIRED";
public const string ShortDescriptionMaxLength = "SHORT_DESCRIPTION_MAX_LENGTH";
public const string ShortDescriptionMinLength = "SHORT_DESCRIPTION_MIN_LENGTH";

public const string LongDescriptionIsRequired = "LONG_DESCRIPTION_IS_REQUIRED";
public const string LongDescriptionMaxLength = "LONG_DESCRIPTION_MAX_LENGTH";
public const string LongDescriptionMinLength = "LONG_DESCRIPTION_MIN_LENGTH";

public const string PriceIsRequired = "PRICE_IS_REQUIRED";
public const string PriceMustBeGreaterThanZero = "PRICE_MUST_BE_GREATER_THAN_ZERO";
public const string PriceInvalidRange = "PRICE_INVALID_RANGE";

public const string SalePriceMustBeGreaterThanZero = "SALE_PRICE_MUST_BE_GREATER_THAN_ZERO";
public const string SalePriceInvalidRange = "SALE_PRICE_INVALID_RANGE";
public const string SalePriceMustBeLessThanPrice = "SALE_PRICE_MUST_BE_LESS_THAN_PRICE";

// Actor validation
public const string ActorIsRequired = "ACTOR_IS_REQUIRED";
public const string ActorInvalid = "ACTOR_INVALID";

// Product not found
public const string ProductIsNotFound = "PRODUCT_IS_NOT_FOUND";
public const string ProductNotFoundById = "PRODUCT_NOT_FOUND_BY_ID";
public const string ProductNotFoundBySlug = "PRODUCT_NOT_FOUND_BY_SLUG";
```

#### Bước 3: Verify

```bash
cd src/Shared/Common
dotnet build
```

**Kết quả mong đợi:** `Build succeeded`

---

### 3. Filters và PaginationRequest

**Vấn đề:**
- Day 19 reference các filter classes nhưng không có hướng dẫn tạo:
  - `GetProductsFilter`
  - `GetAllProductsFilter`
  - `GetPublishProductsFilter`
- `PaginationRequest` có thể đã có trong Common.Models nhưng cần verify

**Vị trí cần tạo:**
- `src/Services/Catalog/Core/Catalog.Application/Models/Filters/GetProductsFilter.cs`
- `src/Services/Catalog/Core/Catalog.Application/Models/Filters/GetAllProductsFilter.cs`
- `src/Services/Catalog/Core/Catalog.Application/Models/Filters/GetPublishProductsFilter.cs`
- `src/Shared/Common/Models/PaginationRequest.cs` (verify xem đã có chưa)

**Được reference ở:**
- Day 19: `DAY_19_CREATE_PRODUCT_REPOSITORY_INTERFACE.md` (dòng 26, 59-69)

**Cần tạo trước Day:** Day 19

**Hướng dẫn tạo:**

#### Bước 1: Tạo thư mục Filters (nếu chưa có)

```bash
cd src/Services/Catalog/Core/Catalog.Application
mkdir -p Models/Filters

# Windows PowerShell
New-Item -ItemType Directory -Path "Models\Filters" -Force
```

#### Bước 2: Tạo GetProductsFilter.cs

Tạo file `src/Services/Catalog/Core/Catalog.Application/Models/Filters/GetProductsFilter.cs`:

```csharp
namespace Catalog.Application.Models.Filters;

public class GetProductsFilter
{
    public string? SearchText { get; set; }
    public Guid? BrandId { get; set; }
    public List<Guid>? CategoryIds { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? Published { get; set; }
    public bool? Featured { get; set; }
}
```

#### Bước 3: Tạo GetAllProductsFilter.cs

Tạo file `src/Services/Catalog/Core/Catalog.Application/Models/Filters/GetAllProductsFilter.cs`:

```csharp
namespace Catalog.Application.Models.Filters;

public class GetAllProductsFilter
{
    public string? SearchText { get; set; }
    public Guid? BrandId { get; set; }
    public List<Guid>? CategoryIds { get; set; }
    public bool? Published { get; set; }
    public bool? Featured { get; set; }
}
```

#### Bước 4: Tạo GetPublishProductsFilter.cs

Tạo file `src/Services/Catalog/Core/Catalog.Application/Models/Filters/GetPublishProductsFilter.cs`:

```csharp
namespace Catalog.Application.Models.Filters;

public class GetPublishProductsFilter
{
    public string? SearchText { get; set; }
    public Guid? BrandId { get; set; }
    public List<Guid>? CategoryIds { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? Featured { get; set; }
}
```

#### Bước 5: Verify PaginationRequest đã có chưa

```bash
ls src/Shared/Common/Models/PaginationRequest.cs
```

Nếu chưa có, tạo file `src/Shared/Common/Models/PaginationRequest.cs`:

```csharp
namespace Common.Models;

public class PaginationRequest
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;

    public int Skip => (PageNumber - 1) * PageSize;
    public int Take => PageSize;
}
```

#### Bước 6: Verify

```bash
cd src/Services/Catalog/Core/Catalog.Application
dotnet build
```

**Kết quả mong đợi:** `Build succeeded`

---

### 4. Slugify Extension Method

**Vấn đề:**
- Day 17 sử dụng `Slugify()` extension method nhưng không có hướng dẫn tạo

**Vị trí cần tạo:**
- `src/Shared/Common/Extensions/StringExtensions.cs`

**Được reference ở:**
- Day 17: `DAY_17_CREATE_CREATE_PRODUCT_COMMAND_HANDLER_PART2.md` (dòng 56)

**Cần tạo trước Day:** Day 17

**Hướng dẫn tạo:**

#### Bước 1: Tạo thư mục Extensions (nếu chưa có)

```bash
cd src/Shared/Common
mkdir -p Extensions

# Windows PowerShell
New-Item -ItemType Directory -Path "Extensions" -Force
```

#### Bước 2: Tạo StringExtensions.cs

Tạo file `src/Shared/Common/Extensions/StringExtensions.cs`:

```csharp
namespace Common.Extensions;

public static class StringExtensions
{
    public static string Slugify(this string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        // Convert to lowercase
        var slug = input.ToLowerInvariant();

        // Replace spaces and special characters with hyphens
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"\s+", " ").Trim();
        slug = slug.Replace(" ", "-");

        // Remove multiple consecutive hyphens
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"-+", "-");

        return slug;
    }
}
```

#### Bước 3: Verify

```bash
cd src/Shared/Common
dotnet build
```

**Kết quả mong đợi:** `Build succeeded`

#### Bước 4: Test (tùy chọn)

Tạo test đơn giản để verify:

```csharp
using Common.Extensions;

var test = "iPhone 15 Pro Max";
var slug = test.Slugify();
Console.WriteLine($"Original: {test}");
Console.WriteLine($"Slug: {slug}");
// Output: Original: iPhone 15 Pro Max
//         Slug: iphone-15-pro-max
```

---

### 5. Actor Value Object

**Vấn đề:**
- Day 15 và các days sau sử dụng `Actor` nhưng không có hướng dẫn tạo

**Vị trí cần tạo:**
- `src/Shared/Common/ValueObjects/Actor.cs`

**Được reference ở:**
- Day 15: `DAY_15_CREATE_CREATE_PRODUCT_COMMAND.md` (dòng 110)
- Day 16: `DAY_16_CREATE_CREATE_PRODUCT_COMMAND_HANDLER_PART1.md`
- Day 17: `DAY_17_CREATE_CREATE_PRODUCT_COMMAND_HANDLER_PART2.md`

**Cần tạo trước Day:** Day 15

**Hướng dẫn tạo:**

#### Bước 1: Tạo thư mục ValueObjects (nếu chưa có)

```bash
cd src/Shared/Common
mkdir -p ValueObjects

# Windows PowerShell
New-Item -ItemType Directory -Path "ValueObjects" -Force
```

#### Bước 2: Tạo Actor.cs

Tạo file `src/Shared/Common/ValueObjects/Actor.cs`:

```csharp
namespace Common.ValueObjects;

public readonly record struct Actor(string Value, ActorType Type)
{
    public static Actor User(string userId) => new(userId, ActorType.User);
    public static Actor System() => new("SYSTEM", ActorType.System);
    public static Actor Job(string jobName) => new(jobName, ActorType.Job);
    public static Actor Worker(string workerName) => new(workerName, ActorType.Worker);
    public static Actor Consumer(string consumerName) => new(consumerName, ActorType.Consumer);

    public override string ToString() => Value;
}

public enum ActorType
{
    User = 1,
    System = 2,
    Job = 3,
    Worker = 4,
    Consumer = 5
}
```

#### Bước 3: Verify

```bash
cd src/Shared/Common
dotnet build
```

**Kết quả mong đợi:** `Build succeeded`

#### Bước 4: Test (tùy chọn)

Tạo test đơn giản để verify:

```csharp
using Common.ValueObjects;

var userActor = Actor.User("admin@example.com");
var systemActor = Actor.System();

Console.WriteLine($"User Actor: {userActor.Value}, Type: {userActor.Type}");
Console.WriteLine($"System Actor: {systemActor.Value}, Type: {systemActor.Type}");
```

---

## 🟢 MEDIUM PRIORITY - Đã có nhưng chưa được document

### 6. MinIoCfg Configuration Class

**Vấn đề:**
- Day 18 reference `MinIoCfg` nhưng không có hướng dẫn tạo trong các days trước
- File này có thể đã tồn tại trong codebase nhưng không được document

**Vị trí:** `src/Shared/Common/Configurations/MinIoCfg.cs`

**Được reference ở:**
- Day 18: `DAY_18_SETUP_EF_CORE_FOR_CATALOG.md` (dòng 551-554)

**Cần tạo trước Day:** Day 18 (hoặc đã có sẵn trong codebase)

**Hướng dẫn tạo:**

#### Bước 1: Kiểm tra file đã có chưa

```bash
ls src/Shared/Common/Configurations/MinIoCfg.cs
```

Nếu chưa có, tiếp tục bước 2.

#### Bước 2: Tạo MinIoCfg.cs

Tạo file `src/Shared/Common/Configurations/MinIoCfg.cs`:

```csharp
namespace Common.Configurations;

public sealed class MinIoCfg
{
    public const string Section = "MinIO";
    public const string Endpoint = "Endpoint";
    public const string AccessKey = "AccessKey";
    public const string SecretKey = "SecretKey";
    public const string Secure = "Secure";
    public const string BucketName = "BucketName";
}
```

#### Bước 3: Verify

```bash
cd src/Shared/Common
dotnet build
```

**Kết quả mong đợi:** `Build succeeded`

---

### 7. PaginationRequest Model

**Vấn đề:**
- Day 19 reference `PaginationRequest` từ `Common.Models` nhưng không có hướng dẫn tạo

**Vị trí:** `src/Shared/Common/Models/PaginationRequest.cs`

**Được reference ở:**
- Day 19: `DAY_19_CREATE_PRODUCT_REPOSITORY_INTERFACE.md` (dòng 26, 60)

**Cần tạo trước Day:** Day 19

**Hướng dẫn tạo:**

#### Bước 1: Kiểm tra file đã có chưa

```bash
ls src/Shared/Common/Models/PaginationRequest.cs
```

Nếu chưa có, tiếp tục bước 2.

#### Bước 2: Tạo thư mục Models (nếu chưa có)

```bash
cd src/Shared/Common
mkdir -p Models

# Windows PowerShell
New-Item -ItemType Directory -Path "Models" -Force
```

#### Bước 3: Tạo PaginationRequest.cs

Tạo file `src/Shared/Common/Models/PaginationRequest.cs`:

```csharp
namespace Common.Models;

public class PaginationRequest
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;

    public int Skip => (PageNumber - 1) * PageSize;
    public int Take => PageSize;
}
```

#### Bước 4: Verify

```bash
cd src/Shared/Common
dotnet build
```

**Kết quả mong đợi:** `Build succeeded`

---

## 📝 Tổng hợp theo thứ tự ưu tiên

### Cần tạo NGAY (Critical - Code không compile):

1. ✅ **ValidationBehavior** - Trước Day 10
2. ✅ **LoggingBehavior** - Trước Day 10

### Cần tạo sớm (High Priority):

3. ✅ **Actor Value Object** - Trước Day 15
4. ✅ **MessageCode Constants** (bổ sung) - Trước Day 15
5. ✅ **Slugify Extension Method** - Trước Day 17
6. ✅ **Filters Classes** - Trước Day 19
7. ✅ **PaginationRequest** - Trước Day 19

### Cần verify/document:

8. ✅ **MinIoCfg** - Verify xem đã có chưa, nếu chưa thì tạo trước Day 18

---

## 🔧 Hướng dẫn sử dụng file này

1. **Kiểm tra từng component:**
   - Mở file tương ứng trong codebase
   - Nếu chưa có, tạo theo code mẫu trong file này

2. **Thứ tự tạo:**
   - Tạo theo thứ tự ưu tiên (Critical → High → Medium)
   - Đảm bảo tạo trước ngày được reference

3. **Verify sau khi tạo:**
   - Build project để đảm bảo không có lỗi compile
   - Test các chức năng liên quan

---

## 📚 Tham khảo

- **Day 5**: `DAY_05_CREATE_SHARED_COMMON_CONSTANTS.md` - MessageCode cơ bản
- **Day 10**: `DAY_10_SETUP_MEDIATR.md` - Reference ValidationBehavior và LoggingBehavior
- **Day 15**: `DAY_15_CREATE_CREATE_PRODUCT_COMMAND.md` - Reference Actor và MessageCode
- **Day 17**: `DAY_17_CREATE_CREATE_PRODUCT_COMMAND_HANDLER_PART2.md` - Reference Slugify
- **Day 18**: `DAY_18_SETUP_EF_CORE_FOR_CATALOG.md` - Reference MinIoCfg
- **Day 19**: `DAY_19_CREATE_PRODUCT_REPOSITORY_INTERFACE.md` - Reference Filters và PaginationRequest
- **Day 20**: `DAY_20_CREATE_PRODUCT_REPOSITORY_IMPLEMENTATION.md` - Implement ProductRepository với Marten, verify tất cả dependencies từ Day 1-19

---

**Cập nhật lần cuối:** Ngày kiểm tra các file hướng dẫn Day 1-20
