# 📘 Day 83: Integration Testing with Docker (Testcontainers)

## 🎯 Mục tiêu ngày hôm nay

**Problem**: Unit Test (Mocking) không đảm bảo query SQL chạy đúng hay message gửi đi RabbitMQ ok.
**Solution**: **Integration Test** với Database/Broker thật.
**Tool**: `Testcontainers` - Thư viện .NET giúp tự động spin-up Docker container (Postgres, Redis, RabbitMQ) khi chạy test và kill khi test xong. Không cần cài đặt thủ công.

**Thời gian ước tính**: 120 phút.

---

## ✅ Checklist

- [ ] Install `Testcontainers.PostgreSql` & `Testcontainers.RabbitMq`.
- [ ] Create `IntegrationTestWebAppFactory`.
- [ ] Implement `OrderIntegrationTests` (Create Order -> Save DB).
- [ ] Run Tests & Observe Docker.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Packages (15 phút)

Tại `Order.Api.IntegrationTests` (đã tạo ở Day 28, nếu chưa thì tạo mới xUnit Project).

```bash
cd tests/Order.Api.IntegrationTests
dotnet add package Testcontainers.PostgreSql
dotnet add package Testcontainers.RabbitMq
```

### Bước 2: WebAppFactory with Containers (45 phút)

Tạo `src/Services/Order/tests/Order.Api.IntegrationTests/IntegrationTestWebAppFactory.cs`:

```csharp
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Order.Infrastructure.Data;
using Testcontainers.PostgreSql;
using Testcontainers.RabbitMq;

namespace Order.Api.IntegrationTests;

public class IntegrationTestWebAppFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    // 1. Define Containers
    private readonly PostgreSqlContainer _dbContainer = new PostgreSqlBuilder()
        .WithImage("postgres:latest")
        .WithDatabase("OrderDb_Test")
        .WithUsername("postgres")
        .WithPassword("postgres")
        .Build();

    private readonly RabbitMqContainer _rabbitContainer = new RabbitMqBuilder()
        .WithImage("rabbitmq:3-management")
        .WithUsername("guest")
        .WithPassword("guest")
        .Build();

    // 2. Configure Services (Swap Real DB with Container DB)
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            // Remove existing DbContext registration
            services.RemoveAll(typeof(DbContextOptions<OrderDbContext>));

            // Add DbContext pointing to Container
            services.AddDbContext<OrderDbContext>(options =>
            {
                options.UseNpgsql(_dbContainer.GetConnectionString());
            });

            // Config MassTransit to use Container RabbitMQ
            // (Setting này phức tạp hơn chút, thường ta override config appsettings)
            builder.UseSetting("ConnectionStrings:OrderDb", _dbContainer.GetConnectionString());
            builder.UseSetting("RabbitMq:Host", _rabbitContainer.Hostname);
            builder.UseSetting("RabbitMq:Port", _rabbitContainer.GetMappedPublicPort(5672).ToString());
        });
    }

    // 3. Lifecycle
    public async Task InitializeAsync()
    {
        await _dbContainer.StartAsync();
        await _rabbitContainer.StartAsync();
    }

    public async Task DisposeAsync()
    {
        await _dbContainer.StopAsync();
        await _rabbitContainer.StopAsync();
    }
}
```

### Bước 3: Test Implementation (45 phút)

`src/Services/Order/tests/Order.Api.IntegrationTests/Features/CreateOrderTests.cs`:

```csharp
using System.Net.Http.Json;
using FluentAssertions;
using Order.Application.UseCases.Orders.Commands.CreateOrder;
using Xunit;

namespace Order.Api.IntegrationTests.Features;

public class CreateOrderTests : IClassFixture<IntegrationTestWebAppFactory>
{
    private readonly HttpClient _client;

    public CreateOrderTests(IntegrationTestWebAppFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateOrder_Should_ReturnCreated_And_SaveToDb()
    {
        // Arrange
        var command = new CreateOrderCommand(
            CustomerId: Guid.NewGuid(),
            Items: new List<OrderItemDto>
            {
                new(Guid.NewGuid(), 2, 50000)
            }
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/orders", command);

        // Assert
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<CreateOrderResult>();

        result.Should().NotBeNull();
        result!.Id.Should().NotBeEmpty();
    }
}
```

> **Lưu ý Authentication**: Nếu API yêu cầu Auth (Bearer Token), bạn cần Mock `AuthenticationHandler` hoặc sinh 1 Fake Token trong test để inject vào Header (Xem lại Day 28-30).

### Bước 4: Run (15 phút)

1. Mở Docker Desktop.
2. Run Test:
   ```bash
   dotnet test tests/Order.Api.IntegrationTests
   ```
3. Quan sát Docker: Bạn sẽ thấy container `testcontainers-postgres` và `rabbitmq` bật lên rồi tắt đi.

**Lợi ích**: Code test chạy trên môi trường y hệt production (Real Integration), không sợ sai khác cú pháp SQL hay behavior của Broker.

---

**Chúc bạn hoàn thành tốt Day 83!**
