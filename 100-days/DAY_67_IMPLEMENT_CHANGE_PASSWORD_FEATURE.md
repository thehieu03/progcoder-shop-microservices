# 📘 Day 67: Implement Change Password Feature

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Cho phép user đổi mật khẩu khi đang đăng nhập.
**Security**: Phải xác thực mật khẩu cũ trước khi đổi mật khẩu mới.

**Thời gian ước tính**: 60 phút.

---

## ✅ Checklist

- [ ] Create `ChangePasswordCommand`.
- [ ] Implement Validation (Old password required, New password strength).
- [ ] Implement Handler (Verify old -> Hash new -> Save).
- [ ] Create Endpoint.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Command (20 phút)

```csharp
public record ChangePasswordCommand(
    Guid UserId,
    string OldPassword,
    string NewPassword,
    string ConfirmNewPassword
) : ICommand<bool>;

public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.OldPassword).NotEmpty();
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(6);
        RuleFor(x => x.ConfirmNewPassword).Equal(x => x.NewPassword).WithMessage("Passwords do not match");
    }
}
```

### Bước 2: Handler (30 phút)

```csharp
public class ChangePasswordCommandHandler(
    IdentityDbContext dbContext,
    IPasswordHasher passwordHasher)
    : ICommandHandler<ChangePasswordCommand, bool>
{
    public async Task<bool> Handle(ChangePasswordCommand command, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.FindAsync(command.UserId);
        if (user == null) throw new NotFoundException("User", command.UserId);

        // 1. Verify Old Password
        if (!passwordHasher.VerifyPassword(command.OldPassword, user.PasswordHash))
        {
            throw new BadRequestException("Incorrect old password");
        }

        // 2. Hash New Password
        var newHash = passwordHasher.HashPassword(command.NewPassword);

        // 3. Update Domain (Cần thêm method ChangePassword vào Entity)
        // user.ChangePassword(newHash); <-- Method này nên nằm trong Domain Entity

        // Tạm thời set property (nhưng nên refactor vào Domain model)
        // Property PasswordHash nên là private set, cần method public để update.
        // Giả sử thêm method ChangePassword vào User.cs
        user.ChangePassword(newHash);

        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
```

Update `User.cs`:

```csharp
public void ChangePassword(string newPasswordHash)
{
    PasswordHash = newPasswordHash;
    LastModifiedOnUtc = DateTimeOffset.UtcNow;
}
```

````

File: `src/Services/Identity/Identity.Api/DTOs/ChangePasswordRequest.cs`

```csharp
public record ChangePasswordRequest(string OldPassword, string NewPassword, string ConfirmNewPassword);
````

### Bước 3: Endpoint (10 phút)

File `UserEndpoints.cs`:

```csharp
group.MapPost("/change-password", async ([FromBody] ChangePasswordRequest req, ISender sender, ClaimsPrincipal user) =>
{
    var userId = Guid.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    var command = new ChangePasswordCommand(userId, req.OldPassword, req.NewPassword, req.ConfirmNewPassword);
    await sender.Send(command);
    return Results.NoContent();
});
```

---

**Chúc bạn hoàn thành tốt Day 67!**
