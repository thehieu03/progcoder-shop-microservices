# 📘 Day 63: Implement Login & JWT Token Generation

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Đăng nhập và nhận về JWT Token để truy cập các Resource bảo mật.
**Tech**: `System.IdentityModel.Tokens.Jwt`.

**Thời gian ước tính**: 120 phút.

---

## ✅ Checklist

- [ ] Configure `JwtSettings` in `appsettings.json`.
- [ ] Implement `ITokenService` (Generate Access Token).
- [ ] Implement `LoginUserCommand`.
- [ ] Create `Login` Endpoint.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: JwtSettings (15 phút)

Thêm vào `appsettings.json`:

```json
"JwtSettings": {
    "Secret": "this-is-a-very-secure-secret-key-at-least-32-chars",
    "Issuer": "IdentityService",
    "Audience": "ProgcoderShop",
    "ExpiryMinutes": 60
}
```

Tạo class `JwtSettings.cs` để bind config.

File: `src/Services/Identity/Core/Identity.Application/Common/Settings/JwtSettings.cs`

```csharp
namespace Identity.Application.Common.Settings;

public class JwtSettings
{
    public string Secret { get; set; } = default!;
    public string Issuer { get; set; } = default!;
    public string Audience { get; set; } = default!;
    public int ExpiryMinutes { get; set; }
}
```

### Bước 2: Token Service (40 phút)

Interface: `ITokenService`
Impl: `TokenService`.

```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Identity.Application.Common.Interfaces;
using Identity.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Identity.Infrastructure.Services;

public class TokenService(IOptions<JwtSettings> jwtOptions) : ITokenService
{
    private readonly JwtSettings _settings = jwtOptions.Value;

    public string GenerateAccessToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new("FirstName", user.FirstName), // Custom claim
            new("LastName", user.LastName)
        };

        // Add Roles
        foreach (var role in user.Roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_settings.ExpiryMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

### Bước 3: Login Command (30 phút)

```csharp
public record LoginUserResult(string AccessToken);
public record LoginUserCommand(string Email, string Password) : ICommand<LoginUserResult>;

// Handler
public async Task<LoginUserResult> Handle(LoginUserCommand command, CancellationToken cancellationToken)
{
    var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Email == command.Email, cancellationToken);

    if (user == null || !passwordHasher.VerifyPassword(command.Password, user.PasswordHash))
    {
        throw new BadRequestException("Invalid credentials");
    }

    var token = tokenService.GenerateAccessToken(user);

    return new LoginUserResult(token);
}
```

### Bước 4: Endpoint (15 phút)

Create `LoginUser.cs` endpoint tương tự `RegisterUser.cs`.

```csharp
app.MapPost("/auth/login", async ([FromBody] LoginUserCommand command, ISender sender) =>
{
    var result = await sender.Send(command);
    return Results.Ok(result);
});
```

---

**Chúc bạn hoàn thành tốt Day 63!**
