# 📘 Day 84: SignalR Real-time Updates

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Thông báo realtime. Khi đơn hàng được thanh toán thành công, UI người dùng (Web/Mobile) tự động hiện thông báo mà không cần F5.
**Tech**: `SignalR`.

**Lưu ý**: SignalR cần chạy trên HTTP Server (ASP.NET Core Web API). Nếu Day 81 bạn tạo `Notification.Worker` (Console App), ta cần điều chỉnh file `.csproj` để support Web.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Upgrade Project SDK (Worker -> Web).
- [ ] Create `NotificationHub`.
- [ ] Configure SignalR in `Program.cs`.
- [ ] Update Consumers to push Notification.
- [ ] Frontend Client Script (Sample).

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Upgrade Project to Web API (15 phút)

Mở `src/Services/Notification/Notification.Worker/Notification.Worker.csproj`.
Đổi `Sdk="Microsoft.NET.Sdk.Worker"` thành `Sdk="Microsoft.NET.Sdk.Web"`.

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <!-- ... -->
</Project>
```

Xóa package `Microsoft.Extensions.Hosting` (nếu có, vì Web SDK đã bao gồm).

### Bước 2: Create SignalR Hub (15 phút)

`src/Services/Notification/Notification.Worker/Hubs/NotificationHub.cs`:

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Notification.Worker.Hubs;

[Authorize] // Yêu cầu Token để connect
public class NotificationHub : Hub
{
    // Client gọi lên Server (nếu cần)
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }

    // Map UserID to ConnectionID (để server biết gửi cho ai)
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
        }
        await base.OnConnectedAsync();
    }
}
```

### Bước 3: Configure Program.cs (20 phút)

Update `Program.cs` để chạy Kestrel & SignalR:

```csharp
using Notification.Worker.Hubs;
// ... consumers imports

var builder = WebApplication.CreateBuilder(args);

// 1. Add SignalR
builder.Services.AddSignalR();

// 2. Auth (Copy from Identity/Gateway - Validate JWT)
builder.Services.AddAuthentication().AddJwtBearer(opt => { ... });

// 3. MassTransit (Giữ nguyên)
builder.Services.AddMassTransit(...);

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

// 4. Map Hub
app.MapHub<NotificationHub>("/hub/notifications");

app.Run();
```

### Bước 4: Update Consumer to Push Notification (30 phút)

Trong `OrderCreatedConsumer` (hoặc `PaymentCompletedConsumer`):

```csharp
using Microsoft.AspNetCore.SignalR;
using Notification.Worker.Hubs;

public class OrderCreatedConsumer : IConsumer<OrderCreatedIntegrationEvent>
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public OrderCreatedConsumer(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task Consume(ConsumeContext<OrderCreatedIntegrationEvent> context)
    {
        var msg = context.Message;
        var userId = msg.CustomerId.ToString(); // Đảm bảo Event có CustomerId

        // Gửi msg tới Group User cụ thể
        await _hubContext.Clients.Group($"User_{userId}")
            .SendAsync("ReceiveNotification", new
            {
                Type = "OrderCreated",
                OrderId = msg.OrderId,
                Message = $"Đơn hàng {msg.OrderId} đã được tạo thành công!"
            });
    }
}
```

### Bước 5: Client Side (Sample JS) (10 phút)

Tạo file `html` test thử:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/microsoft-signalr/6.0.1/signalr.js"></script>
<script>
  const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:5080/hub/notifications", {
      accessTokenFactory: () => "YOUR_JWT_TOKEN_HERE",
    })
    .build();

  connection.on("ReceiveNotification", (data) => {
    console.log("New Notification:", data);
    alert(data.Message);
  });

  connection.start().catch((err) => console.error(err));
</script>
```

---

**Chúc bạn hoàn thành tốt Day 84!**
