# 📘 Day 74: Backend For Frontend (BFF) / Aggregation

## 🎯 Mục tiêu ngày hôm nay

**Problem**: Client cần hiển thị trang "Dashboard" gồm User Info (Identity), Recent Orders (Order), Recommend Products (Catalog). Nếu Client gọi 3 API riêng lẻ -> Chậm, Tốn băng thông.

**Solution**: Tạo **BFF (Backend for Frontend)** hoặc **Aggregator Endpoint** tại Gateway (hoặc 1 service riêng là Web.Bff).
Ở đây ta sẽ làm simple Aggregation: Gateway định nghĩa route đặc biệt, call 3 service, gộp data trả về. (Tuy nhiên YARP native không hỗ trợ response aggregation mạnh, nên ta thường tạo 1 endpoint C# thường trong Gateway Project để làm việc này).

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Create `Shopping.Aggregator` Controller in Gateway.
- [ ] Inject HttpClients for Order, Catalyst, Identity.
- [ ] Create `GetDashboard` Endpoint.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Setup Clients (30 phút)

Trong `YarpGateway.csproj`:
Add References to DTOs/Models (hoặc tạo class DTO mỏng).

File: `src/Services/Gateway/YarpGateway/Models/AggregatorModels.cs`

```csharp
namespace YarpGateway.Models;

public record ProductDto(Guid Id, string Name, decimal Price, string ImageUrl);
public record OrderDto(Guid Id, DateTime CreatedAt, decimal TotalPrice, string Status);
```

`Program.cs`:

```csharp
builder.Services.AddHttpClient("CatalogClient", c => c.BaseAddress = new Uri("https://localhost:5000"));
builder.Services.AddHttpClient("OrderClient", c => c.BaseAddress = new Uri("https://localhost:5002"));
```

### Bước 2: Aggregator Endpoint (45 phút)

Tạo `Endpoints/DashboardEndpoints.cs` trong YarpGateway:
_(Gateway bản chất là ASP.NET Core nên có thể viết Controller/Minimal API bình thường)_

```csharp
app.MapGet("/api/dashboard/{userId}", async (Guid userId, IHttpClientFactory clientFactory) =>
{
    var catalogClient = clientFactory.CreateClient("CatalogClient");
    var orderClient = clientFactory.CreateClient("OrderClient");

    // Call Parallel
    var task1 = catalogClient.GetFromJsonAsync<List<ProductDto>>("/api/catalog/products/top");
    var task2 = orderClient.GetFromJsonAsync<List<OrderDto>>($"/api/orders/user/{userId}/recent");

    await Task.WhenAll(task1, task2);

    var response = new
    {
        TopProducts = task1.Result,
        RecentOrders = task2.Result
    };

    return Results.Ok(response);
}).RequireAuthorization();
```

> **Pattern này gọi là BFF**. Nó giúp Client chỉ cần gọi 1 request để lấy đủ data cho 1 Screen.

---

**Chúc bạn hoàn thành tốt Day 74!**
