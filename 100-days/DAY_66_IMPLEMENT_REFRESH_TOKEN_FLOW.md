# 📘 Day 66: Implement Refresh Token Flow

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Access Token (JWT) thường có hạn ngắn (ví dụ 15-60 phút). Để User không phải đăng nhập lại liên tục, ta cần cơ chế **Refresh Token** (hạn dài, vd 7-30 ngày).
**Concept**:

1.  Login -> Trả về `AccessToken` + `RefreshToken`.
2.  AccessToken hết hạn -> Client gọi endpoint `/refresh` gửi kèm `RefreshToken` -> Server cấp AccessToken mới.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Update `User` Entity (Add RefreshToken fields).
- [ ] Migration database.
- [ ] Update `ITokenService` (Generate RefreshToken).
- [ ] Update `Login` Command (Return RefreshToken).
- [ ] Implement `RefreshTokenCommand` & Endpoint.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Update Domain Entity (20 phút)

Update `src/Services/Identity/Core/Identity.Domain/Entities/User.cs`:

```csharp
public class User : Aggregate<Guid>
{
    // ... Existing properties ...
    public string? RefreshToken { get; private set; }
    public DateTime? RefreshTokenExpiryTime { get; private set; }

    public void SetRefreshToken(string token, DateTime expiry)
    {
        RefreshToken = token;
        RefreshTokenExpiryTime = expiry;
    }
}
```

Tạo Migration mới:

```bash
dotnet ef migrations add AddRefreshToken
dotnet ef database update
```

### Bước 2: Token Service Update (20 phút)

Update `ITokenService.cs`:

```csharp
public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken(); // New
    ClaimsPrincipal GetPrincipalFromExpiredToken(string token); // New (để validate access token cũ)
}
```

Implement `TokenService.cs`:

```csharp
public string GenerateRefreshToken()
{
    var randomNumber = new byte[32];
    using var rng = RandomNumberGenerator.Create();
    rng.GetBytes(randomNumber);
    return Convert.ToBase64String(randomNumber);
}

public ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
{
    var tokenValidationParameters = new TokenValidationParameters
    {
        ValidateAudience = false,
        ValidateIssuer = false,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Secret)),
        ValidateLifetime = false // Quan trọng: Bỏ qua lỗi hết hạn để đọc claim
    };

    var tokenHandler = new JwtSecurityTokenHandler();
    var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);

    // Check thuật toán hash
    if (securityToken is not JwtSecurityToken jwtSecurityToken ||
        !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
    {
        throw new SecurityTokenException("Invalid token");
    }

    return principal;
}
```

### Bước 3: Update Login Command (15 phút)

```csharp
// LoginUserCommandHandler.cs
public async Task<LoginUserResult> Handle(...)
{
    // ... verify password ...

    var accessToken = tokenService.GenerateAccessToken(user);
    var refreshToken = tokenService.GenerateRefreshToken();

    // Lưu RefreshToken vào DB
    user.SetRefreshToken(refreshToken, DateTime.UtcNow.AddDays(7));
    await dbContext.SaveChangesAsync(cancellationToken);

    return new LoginUserResult(accessToken, refreshToken);
}
```

### Bước 4: Refresh Token Command (25 phút)

```csharp
public record RefreshTokenCommand(string AccessToken, string RefreshToken) : ICommand<LoginUserResult>;

// Handler
public async Task<LoginUserResult> Handle(RefreshTokenCommand command, CancellationToken cancellationToken)
{
    var principal = tokenService.GetPrincipalFromExpiredToken(command.AccessToken);
    var email = principal.FindFirst(ClaimTypes.Email)?.Value;

    var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Email == email, cancellationToken);

    if (user == null || user.RefreshToken != command.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
    {
        throw new BadRequestException("Invalid refresh token");
    }

    var newAccessToken = tokenService.GenerateAccessToken(user);
    var newRefreshToken = tokenService.GenerateRefreshToken();

    user.SetRefreshToken(newRefreshToken, DateTime.UtcNow.AddDays(7));
    await dbContext.SaveChangesAsync(cancellationToken);

    return new LoginUserResult(newAccessToken, newRefreshToken);
}
```

### Bước 5: Endpoint (10 phút)

```csharp
app.MapPost("/auth/refresh", async ([FromBody] RefreshTokenCommand command, ISender sender) =>
{
    var result = await sender.Send(command);
    return Results.Ok(result);
});
```

---

**Chúc bạn hoàn thành tốt Day 66!**
