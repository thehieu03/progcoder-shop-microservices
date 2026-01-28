# 📘 Day 86: Sync Data to Elasticsearch

## 🎯 Mục tiêu ngày hôm nay

**Problem**: Elasticsearch trống rỗng.
**Solution**: Cần cơ chế đồng bộ dữ liệu từ `Catalog` (SQL) sang `Search` (Elasticsearch).
**Architecture**: Event-Driven.

- Catalog: Publish `ProductCreated`, `ProductUpdated`.
- Search Service: Consume -> Index Document vào ES.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Define `ProductDocument` class (Model cho ES).
- [ ] Implement `ProductCreatedConsumer` in Search Service.
- [ ] Implement `ProductUpdatedConsumer` in Search Service.
- [ ] Register Consumers & MassTransit.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Create Document Model (15 phút)

`src/Services/Search/Search.Api/Models/ProductDocument.cs`:

```csharp
namespace Search.Api.Models;

public class ProductDocument
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string Description { get; set; } = default!;
    public decimal Price { get; set; }
    public string Category { get; set; } = default!; // Flatten category name
    public DateTime CreatedAt { get; set; }
}
```

### Bước 2: Create Consumers (45 phút)

`src/Services/Search/Search.Api/Consumers/ProductCreatedConsumer.cs`:

```csharp
using Elastic.Clients.Elasticsearch;
using EventSourcing.Events.Catalog; // Cần add reference tới Shared
using MassTransit;
using Search.Api.Models;

namespace Search.Api.Consumers;

public class ProductCreatedConsumer : IConsumer<ProductCreatedIntegrationEvent>
{
    private readonly ElasticsearchClient _client;
    private readonly ILogger<ProductCreatedConsumer> _logger;

    public ProductCreatedConsumer(ElasticsearchClient client, ILogger<ProductCreatedConsumer> logger)
    {
        _client = client;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ProductCreatedIntegrationEvent> context)
    {
        var msg = context.Message;
        _logger.LogInformation("Indexing Product: {Id} - {Name}", msg.Id, msg.Name);

        var doc = new ProductDocument
        {
            Id = msg.Id,
            Name = msg.Name,
            Description = msg.Description ?? "",
            Price = msg.Price,
            Category = "General", // Tạm thời, sau này lấy từ Event
            CreatedAt = DateTime.UtcNow
        };

        var response = await _client.IndexAsync(doc, idx => idx.Index("products"));

        if (!response.IsValidResponse)
        {
            _logger.LogError("Failed to index product: {Reason}", response.DebugInformation);
        }
    }
}
```

> **Lưu ý**: Tương tự cho `ProductUpdatedConsumer` -> Dùng `_client.UpdateAsync`.
> Và `ProductDeletedConsumer` -> Dùng `_client.DeleteAsync`.

### Bước 3: Register MassTransit (20 phút)

`Program.cs` của `Search.Api`:

```csharp
using MassTransit;
using Search.Api.Consumers;

// ...
builder.Services.AddMassTransit(bus =>
{
    bus.AddConsumer<ProductCreatedConsumer>();
    // bus.AddConsumer<ProductUpdatedConsumer>();

    bus.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });

        cfg.ReceiveEndpoint("search-service-product-sync", e =>
        {
            e.ConfigureConsumer<ProductCreatedConsumer>(context);
        });
    });
});
```

### Bước 4: Test Sync (10 phút)

1. Chạy `Search.Api`.
2. Chạy `Catalog.Api`.
3. Gọi API `POST /api/products` tạo sản phẩm mới bên Catalog.
4. Xem Log `Search.Api`: "Indexing Product...".
5. Vào Kibana `Dev Tools`:
   ```json
   GET /products/_search
   ```
   -> Thấy data xuất hiện là thành công!

---

**Chúc bạn hoàn thành tốt Day 86!**
