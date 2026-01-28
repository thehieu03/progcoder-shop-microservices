# 📘 Day 61: Create Identity Service Structure

## 🎯 Mục tiêu ngày hôm nay

**Phase**: Identity Service - Dịch vụ quan trọng nhất quản lý xác thực và phân quyền.
Chúng ta sẽ xây dựng từ đầu theo Clean Architecture.

**Concept**:

- **Identity Service**: Quản lý User, Password (Hash), Roles.
- **Token Service**: Sinh JWT Access Token & Refresh Token.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Create Projects: `Identity.Api`, `Identity.Application`, `Identity.Domain`, `Identity.Infrastructure`.
- [ ] Define `User` Entity (Aggregate Root).
- [ ] Define `Role` Entity (optional for startup, can use Claims).
- [ ] Setup `IdentityDbContext` (EF Core).
- [ ] Register DI in `Program.cs`.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Create Projects (15 phút)

```powershell
# Tại thư mục src/Services/Identity
mkdir src/Services/Identity
cd src/Services/Identity

# 1. Api
dotnet new webapi -n Identity.Api -o Identity.Api
# 2. Core
dotnet new classlib -n Identity.Application -o Core/Identity.Application
dotnet new classlib -n Identity.Domain -o Core/Identity.Domain
# 3. Infrastructure
dotnet new classlib -n Identity.Infrastructure -o Infrastructure/Identity.Infrastructure

# 4. Add References
dotnet add Identity.Api/Identity.Api.csproj reference Core/Identity.Application/Identity.Application.csproj
dotnet add Identity.Api/Identity.Api.csproj reference Infrastructure/Identity.Infrastructure/Identity.Infrastructure.csproj
dotnet add Core/Identity.Application/Identity.Application.csproj reference Core/Identity.Domain/Identity.Domain.csproj
dotnet add Infrastructure/Identity.Infrastructure/Identity.Infrastructure.csproj reference Core/Identity.Application/Identity.Application.csproj

# 5. Add to Solution
cd ../../..
dotnet sln add src/Services/Identity/Identity.Api/Identity.Api.csproj
dotnet sln add src/Services/Identity/Core/Identity.Application/Identity.Application.csproj
dotnet sln add src/Services/Identity/Core/Identity.Domain/Identity.Domain.csproj
dotnet sln add src/Services/Identity/Infrastructure/Identity.Infrastructure/Identity.Infrastructure.csproj
```

### Bước 2: Define Domain Entities (30 phút)

File: `src/Services/Identity/Core/Identity.Domain/Entities/User.cs`

```csharp
using BuildingBlocks.Abstractions;

namespace Identity.Domain.Entities;

public class User : Aggregate<Guid>
{
    public string FirstName { get; private set; } = default!;
    public string LastName { get; private set; } = default!;
    public string Email { get; private set; } = default!;
    public string PasswordHash { get; private set; } = default!;
    public string? PhoneNumber { get; private set; }
    public bool IsActive { get; private set; }
    public List<string> Roles { get; private set; } = new();

    public static User Create(string firstName, string lastName, string email, string passwordHash)
    {
        return new User
        {
            Id = Guid.NewGuid(),
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            PasswordHash = passwordHash,
            IsActive = true,
            CreatedOnUtc = DateTimeOffset.UtcNow
        };
    }

    public void UpdateProfile(string firstName, string lastName, string phoneNumber)
    {
        FirstName = firstName;
        LastName = lastName;
        PhoneNumber = phoneNumber;
        LastModifiedOnUtc = DateTimeOffset.UtcNow;
    }

    // Simple Role Management
    public void AddRole(string role)
    {
        if (!Roles.Contains(role)) Roles.Add(role);
    }
}
```

### Bước 3: Infrastructure Setup (30 phút)

**Packages**: `Microsoft.EntityFrameworkCore.Design`, `Npgsql.EntityFrameworkCore.PostgreSQL`.

File: `src/Services/Identity/Infrastructure/Identity.Infrastructure/Data/IdentityDbContext.cs`

```csharp
using Identity.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace Identity.Infrastructure.Data;

public class IdentityDbContext : DbContext
{
    public IdentityDbContext(DbContextOptions<IdentityDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(builder);
    }
}
```

Configuration: `src/Services/Identity/Infrastructure/Identity.Infrastructure/Data/Configurations/UserConfiguration.cs`

```csharp
using Identity.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Identity.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.FirstName).HasMaxLength(50).IsRequired();
        builder.Property(x => x.LastName).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Email).HasMaxLength(150).IsRequired();
        builder.HasIndex(x => x.Email).IsUnique(); // Email must be unique
    }
}
```

### Bước 4: Migration (15 phút)

Thêm Connection string vào `Identity.Api/appsettings.json`.

```bash
dotnet ef migrations add InitialCreate -s src/Services/Identity/Identity.Api -p src/Services/Identity/Infrastructure/Identity.Infrastructure
dotnet ef database update -s src/Services/Identity/Identity.Api -p src/Services/Identity/Infrastructure/Identity.Infrastructure
```

---

**Chúc mừng bạn đã khởi tạo xong Identity Service!**
