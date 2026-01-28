# 📘 Day 65: Implement User Profile & Update Feature

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Cho phép user xem thông tin cá nhân và cập nhật (tên, sđt) sau khi đã đăng nhập.
**Concept**: Sử dụng `IHttpContextAccessor` hoặc `CurrentUserService` để lấy ID user đang login.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Create `GetUserProfileQuery`.
- [ ] Create `UpdateUserProfileCommand`.
- [ ] Create Endpoints.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Get Profile Query (30 phút)

Truyền vào Id (hoặc lấy từ Token).

```csharp
public record UserProfileDto(Guid Id, string FirstName, string LastName, string Email, List<string> Roles);

public record GetUserProfileQuery(Guid UserId) : IQuery<UserProfileDto>;

// Handler
public async Task<UserProfileDto> Handle(GetUserProfileQuery query, CancellationToken cancellationToken)
{
    var user = await dbContext.Users.FindAsync(query.UserId);
    if (user == null) throw new NotFoundException("User", query.UserId);

    return new UserProfileDto(user.Id, user.FirstName, user.LastName, user.Email, user.Roles);
}
```

### Bước 2: Update Profile Command (30 phút)

```csharp
public record UpdateUserProfileCommand(
    Guid UserId,
    string FirstName,
    string LastName,
    string PhoneNumber
) : ICommand<bool>;

// Handler
public async Task<bool> Handle(UpdateUserProfileCommand command, CancellationToken cancellationToken)
{
    var user = await dbContext.Users.FindAsync(command.UserId);
    if (user == null) throw new NotFoundException("User", command.UserId);

    // Domain Method (Day 61)
    user.UpdateProfile(command.FirstName, command.LastName, command.PhoneNumber);

    await dbContext.SaveChangesAsync(cancellationToken);
    return true;
}
```

````

File: `src/Services/Identity/Identity.Api/DTOs/UpdateProfileRequest.cs` (hoặc để chung file Endpoint)

```csharp
public record UpdateProfileRequest(string FirstName, string LastName, string PhoneNumber);
````

### Bước 3: Endpoints (20 phút)

File: `src/Services/Identity/Identity.Api/Endpoints/UserEndpoints.cs`

```csharp
public class UserEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/users").WithTags("Users").RequireAuthorization();

        group.MapGet("/profile", async (ISender sender, ClaimsPrincipal user) =>
        {
            var userId = Guid.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var query = new GetUserProfileQuery(userId);
            var result = await sender.Send(query);
            return Results.Ok(result);
        });

        group.MapPut("/profile", async ([FromBody] UpdateProfileRequest req, ISender sender, ClaimsPrincipal user) =>
        {
            var userId = Guid.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var command = new UpdateUserProfileCommand(userId, req.FirstName, req.LastName, req.PhoneNumber);
            await sender.Send(command);
            return Results.NoContent();
        });
    }
}
```

---

**Chúc bạn hoàn thành tốt Day 65!**
