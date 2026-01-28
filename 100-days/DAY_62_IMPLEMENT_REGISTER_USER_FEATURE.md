# 📘 Day 62: Implement Register User Feature

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Cho phép người dùng đăng ký tài khoản mới.
**Security**: Mật khẩu KHÔNG ĐƯỢC lưu plain text. Phải dùng Hash (BCrypt).

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Create `RegisterUserCommand` & Validator.
- [ ] Implement `RegisterUserCommandHandler`.
- [ ] Implement `PasswordHasher` service (BCrypt).
- [ ] Create `RegisterUser` Endpoint.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Command & Validator (20 phút)

File: `src/Services/Identity/Core/Identity.Application/Features/Auth/Commands/RegisterUser/RegisterUserCommand.cs`

```csharp
using BuildingBlocks.CQRS;
using FluentValidation;

namespace Identity.Application.Features.Auth.Commands.RegisterUser;

public record RegisterUserResult(Guid Id);

public record RegisterUserCommand(
    string FirstName,
    string LastName,
    string Email,
    string Password
) : ICommand<RegisterUserResult>;

public class RegisterUserCommandValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserCommandValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty();
        RuleFor(x => x.LastName).NotEmpty();
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
    }
}
```

### Bước 2: Password Hasher (15 phút)

Bạn có thể dùng `BCrypt.Net-Next` package.

`src/Services/Identity/Core/Identity.Application/Common/Interfaces/IPasswordHasher.cs`

```csharp
public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hashedPassword);
}
```

Implementation: `src/Services/Identity/Infrastructure/Identity.Infrastructure/Services/PasswordHasher.cs`

```csharp
using Identity.Application.Common.Interfaces;

namespace Identity.Infrastructure.Services;

public class PasswordHasher : IPasswordHasher
{
    public string HashPassword(string password) => BCrypt.Net.BCrypt.HashPassword(password);

    public bool VerifyPassword(string password, string hashedPassword) => BCrypt.Net.BCrypt.Verify(password, hashedPassword);
}
```

> **Note**: Nhớ đăng ký DI `services.AddScoped<IPasswordHasher, PasswordHasher>();` trong `DependencyInjection.cs`.

### Bước 3: Handler (30 phút)

```csharp
using BuildingBlocks.CQRS;
using BuildingBlocks.Exceptions; // Assume you have custom exceptions like AlreadyExistsException
using Identity.Application.Common.Interfaces;
using Identity.Domain.Entities;
using Identity.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Identity.Application.Features.Auth.Commands.RegisterUser;

public class RegisterUserCommandHandler(
    IdentityDbContext dbContext,
    IPasswordHasher passwordHasher)
    : ICommandHandler<RegisterUserCommand, RegisterUserResult>
{
    public async Task<RegisterUserResult> Handle(RegisterUserCommand command, CancellationToken cancellationToken)
    {
        // 1. Check Email Exists
        var exists = await dbContext.Users.AnyAsync(x => x.Email == command.Email, cancellationToken);
        if (exists)
        {
            throw new AlreadyExistsException("User", command.Email);
        }

        // 2. Hash Password
        var passwordHash = passwordHasher.HashPassword(command.Password);

        // 3. Create User
        var user = User.Create(command.FirstName, command.LastName, command.Email, passwordHash);

        // Default Role
        user.AddRole("Customer");

        // 4. Save
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new RegisterUserResult(user.Id);
    }
}
```

### Bước 4: Endpoint (15 phút)

File: `src/Services/Identity/Identity.Api/Endpoints/RegisterUser.cs`

```csharp
using Carter;
using Identity.Application.Features.Auth.Commands.RegisterUser;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Identity.Api.Endpoints;

public class RegisterUser : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/auth/register", async ([FromBody] RegisterUserCommand command, ISender sender) =>
        {
            var result = await sender.Send(command);
            return Results.Ok(result);
        })
        .WithTags("Auth")
        .AllowAnonymous();
    }
}
```

---

**Chúc bạn hoàn thành tốt Day 62!**
