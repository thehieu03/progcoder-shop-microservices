# 📘 Day 70: Identity Security Hardening

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Tăng cường bảo mật cho Identity Service trước khi public.
Identity là cửa ngõ, nếu lỏng lẻo sẽ bị Brute Force hoặc DDoS.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] **Rate Limiting**: Giới hạn số lần Login sai (ví dụ 5 lần/phút) để chống Brute Force.
- [ ] **Strong Password Policy**: Bắt buộc Pass 8 ký tự, có số, chữ hoa.
- [ ] **Secure Headers**: HSTS, no-sniff.
- [ ] **Review Logs**: Không log Password/Token.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Rate Limiting (AspNetCore.RateLimiting) (30 phút)

Trong `Program.cs`:

```csharp
using System.Threading.RateLimiting;

// ...
builder.Services.AddRateLimiting(options =>
{
    options.AddFixedWindowLimiter("auth-policy", opt =>
    {
        opt.PermitLimit = 5; // 5 request
        opt.Window = TimeSpan.FromMinutes(1); // trong 1 phút
        opt.QueueLimit = 0;
    });
});

// Apply to Login/Register endpoints
app.MapPost("/auth/login", ...).RequireRateLimiting("auth-policy");
```

### Bước 2: Password Policy (15 phút)

Update `RegisterUserCommandValidator` và `ChangePasswordCommandValidator` với RegEx mạnh hơn.

```csharp
RuleFor(x => x.Password)
    .NotEmpty()
    .MinimumLength(8)
    .Matches("[A-Z]").WithMessage("Password must contain uppercase")
    .Matches("[0-9]").WithMessage("Password must contain digit")
    .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain special char");
```

### Bước 3: Lockout Mechanism (Nâng cao - Optional)

Nếu User login sai 5 lần liên tiếp -> Khóa tài khoản 15 phút.
Cần thêm field `AccessFailedCount` và `LockoutEnd` vào `User` entity.
Logic trong `LoginUserCommandHandler`:

1. Check Lockout -> throw.
2. Wrong Pass -> Count++. If Count >= 5 -> Set LockoutEnd.
3. Correct Pass -> Reset Count.

---

**Chúc mừng bạn đã hoàn thành Phase Identity Service (Day 61-70)! 🛡️**
Hệ thống Authentication/Authorization cơ bản đã hoạt động.

Phase tiếp theo: **Integration (Day 76+)**, chúng ta sẽ kết nối tất cả các service lại với nhau.
_(Lưu ý: Day 71-75 dành cho E2E Testing Identity và Setup Gateway API, mình sẽ gộp vào Integration Phase)_
