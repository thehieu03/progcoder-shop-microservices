# 📘 Day 64: Setup Authentication Middleware (Validation)

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Sau khi đã phát được Token, giờ Identity Service (và các service khác sau này) phải biết cách **Validate** token đó để bảo vệ các endpoint.

**Thời gian ước tính**: 60 phút.

---

## ✅ Checklist

- [ ] Configure `AddAuthentication` & `AddJwtBearer` in Program.cs.
- [ ] Test Protected Endpoint (`[Authorize]`).
- [ ] Inspect Claims from Token.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Configure Auth (30 phút)

Trong `Identity.Api/Program.cs` (và sau này là Order.Api, Payment.Api).

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

// ...
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret))
    };
});

builder.Services.AddAuthorization();

// ...
var app = builder.Build();

app.UseAuthentication(); // Must be before Authorization
app.UseAuthorization();
```

### Bước 2: Test Protected Endpoint (15 phút)

Tạo thử endpoint `GET /auth/me` để test.

```csharp
app.MapGet("/auth/me", (ClaimsPrincipal user) =>
{
    var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var email = user.FindFirst(ClaimTypes.Email)?.Value;
    return Results.Ok(new { UserId = userId, Email = email });
})
.RequireAuthorization();
```

1.  Gọi `/auth/me` không có token -> 401 Unauthorized.
2.  Login lấy token.
3.  Gọi `/auth/me` với header `Authorization: Bearer <token>` -> 200 OK + Data.

---

**Chúc bạn hoàn thành tốt Day 64!**
