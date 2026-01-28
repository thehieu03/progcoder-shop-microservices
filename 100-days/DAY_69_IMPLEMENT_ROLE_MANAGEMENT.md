# 📘 Day 69: Implement Role Management (Admin Only)

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Quản lý Role (Quyền) của User. Chỉ có Admin mới được thực hiện.
**Concept**: Policy-based Authorization (`[Authorize(Roles = "Admin")]`).

**Thời gian ước tính**: 60 phút.

---

## ✅ Checklist

- [ ] Define Roles Constant (`Admin`, `Customer`, `Staff`).
- [ ] Create `AssignRoleCommand`.
- [ ] Create `RemoveRoleCommand`.
- [ ] Secure Endpoints with Admin Policy.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Constants (10 phút)

File: `src/Services/Identity/Core/Identity.Domain/Constants/Roles.cs`

```csharp
public static class Roles
{
    public const string Admin = "Admin";
    public const string Customer = "Customer";
    public const string Staff = "Staff";
}
```

### Bước 2: Commands (30 phút)

```csharp
// Assign Role
public record AssignRoleCommand(Guid UserId, string RoleName) : ICommand<bool>;

// Handler
public async Task<bool> Handle(AssignRoleCommand command, CancellationToken cancellationToken)
{
    var user = await dbContext.Users.FindAsync(command.UserId);
    if (user == null) throw new NotFoundException("User", command.UserId);

    // Validate Role exists if implementing Role Table, otherwise simple check
    user.AddRole(command.RoleName);

    await dbContext.SaveChangesAsync(cancellationToken);
    return true;
}
```

> Tương tự cho `RemoveRoleCommand`.

File: `src/Services/Identity/Identity.Api/DTOs/RoleRequest.cs`

```csharp
public record RoleRequest(string RoleName);
```

### Bước 3: Endpoints (20 phút)

```csharp
public class AdminEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin/users")
                       .WithTags("Admin")
                       .RequireAuthorization(policy => policy.RequireRole(Roles.Admin)); // Quan trọng!

        group.MapPost("/{userId}/roles", async (Guid userId, [FromBody] RoleRequest req, ISender sender) =>
        {
            await sender.Send(new AssignRoleCommand(userId, req.RoleName));
            return Results.NoContent();
        });
    }
}
```

> **Note**: Để test, bạn cần Manually update DB set 1 user thành role Admin (Seed data), hoặc tạo endpoint "Setup" bí mật.

---

**Chúc bạn hoàn thành tốt Day 69!**
