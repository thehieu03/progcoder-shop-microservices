# 📘 Day 73: Gateway Auth & Rate Limiting

## 🎯 Mục tiêu ngày hôm nay

**Feature**:

1.  **Auth**: Gateway đóng vai trò "người gác cổng". Xác thực Token hợp lệ TRƯỚC KHI request đi vào Service bên trong. (Giảm tải cho Service con).
2.  **Rate Limit**: Chặn request rác, DDos tấn công vào Gateway.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Setup JWT Auth in Gateway.
- [ ] Config Route có Authorization Policy.
- [ ] Configure Rate Limiter (YARP supports generic rate limiter).

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Setup Auth (30 phút)

YarpGateway `Program.cs`:

```csharp
// 1. Add Auth Services (giống Identity Service)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => ...); // Copy config từ Identity/Order

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Authenticated", policy => policy.RequireAuthenticatedUser());
});
```

Update `appsettings.json` Routes:

```json
"ordering-route": {
  "ClusterId": "ordering-cluster",
  "AuthorizationPolicy": "Authenticated", // <-- Thêm dòng này
  "Match": { "Path": "/api/orders/{**catch-all}" }
}
```

Bây giờ nếu gọi `/api/orders` không có Token -> Gateway trả về 401 ngay lập tức. Service Order không nhận được request.

### Bước 2: Rate Limiting (40 phút)

```csharp
using System.Threading.RateLimiting;

builder.Services.AddRateLimiting(options =>
{
    options.AddFixedWindowLimiter("customPolicy", opt =>
    {
        opt.PermitLimit = 100;
        opt.Window = TimeSpan.FromMinutes(1);
    });
});

// Yarp middleware
app.UseRateLimiter(); // Trước MapReverseProxy
app.MapReverseProxy();
```

Apply to Route:

```json
"catalog-route": {
  "ClusterId": "catalog-cluster",
  "RateLimiterPolicy": "customPolicy", // <-- Thêm dòng này
  "Match": { ... }
}
```

---

**Chúc bạn hoàn thành tốt Day 73!**
