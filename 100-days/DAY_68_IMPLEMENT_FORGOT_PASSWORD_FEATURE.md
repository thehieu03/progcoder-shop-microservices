# 📘 Day 68: Implement Forgot Password (Email Flow)

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Khi user quên mật khẩu:

1.  Gửi request kèm Email.
2.  Hệ thống gửi Email chứa Token (hoặc Link) reset.
3.  User dùng Token đó để đặt lại mật khẩu mới.

**Lưu ý**: Để đơn giản, ta sẽ chỉ Simulate việc gửi Email (Log ra console), tích hợp Email Sender thật sẽ làm ở Phase Integration nếu cần.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Create `ForgotPasswordCommand`.
- [ ] Generate Reset Token (Random string/Guid).
- [ ] Save Token & Expiry to User Entity.
- [ ] Mock `IEmailSender`.
- [ ] Create `ResetPasswordCommand`.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Update Entity (15 phút)

Thêm field vào `User.cs`:

```csharp
public string? PasswordResetToken { get; private set; }
public DateTime? PasswordResetExpiry { get; private set; }

public void SetPasswordResetToken(string token)
{
    PasswordResetToken = token;
    PasswordResetExpiry = DateTime.UtcNow.AddMinutes(15); // Hết hạn sau 15p
}

public void ClearPasswordResetToken()
{
    PasswordResetToken = null;
    PasswordResetExpiry = null;
}
```

Run Migration.

### Bước 2: Forgot Password Command (30 phút)

```csharp
public record ForgotPasswordCommand(string Email) : ICommand<bool>;

// Handler
public async Task<bool> Handle(ForgotPasswordCommand command, CancellationToken cancellationToken)
{
    var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Email == command.Email, cancellationToken);
    if (user == null)
    {
        // Security: Không được báo lỗi "Email không tồn tại" để tránh User Enumeration attack.
        // Luôn trả về Success.
        return true;
    }

    var token = Guid.NewGuid().ToString("N"); // Simple token
    user.SetPasswordResetToken(token);
    await dbContext.SaveChangesAsync(cancellationToken);

    // TODO: Send Email
    // emailSender.SendAsync(user.Email, "Reset Password", $"Your token is: {token}");
    Console.WriteLine($"[MOCK EMAIL] To: {user.Email}, Token: {token}");

    return true;
}
```

### Bước 3: Reset Password Command (30 phút)

```csharp
public record ResetPasswordCommand(string Email, string Token, string NewPassword) : ICommand<bool>;

// Handler
public async Task<bool> Handle(ResetPasswordCommand command, CancellationToken cancellationToken)
{
    var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Email == command.Email, cancellationToken);

    // Check Email & Token khớp & Hạn dùng
    if (user == null ||
        user.PasswordResetToken != command.Token ||
        user.PasswordResetExpiry <= DateTime.UtcNow)
    {
        throw new BadRequestException("Invalid or expired token");
    }

    // Change Password
    var hash = passwordHasher.HashPassword(command.NewPassword);
    user.ChangePassword(hash);
    user.ClearPasswordResetToken(); // Xóa token dùng rồi

    await dbContext.SaveChangesAsync(cancellationToken);
    return true;
}
```

### Bước 4: Endpoint (15 phút)

```csharp
app.MapPost("/auth/forgot-password", ...);
app.MapPost("/auth/reset-password", ...);
```

---

**Chúc bạn hoàn thành tốt Day 68!**
