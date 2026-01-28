# 📘 Day 89: Caching Strategy (Redis)

## 🎯 Mục tiêu ngày hôm nay

**Problem**: API `GetProductById` được gọi rất nhiều. Mỗi lần gọi đều query Postgres -> Chậm & Tải cao.
**Solution**: **Caching**. Lưu data vào Redis (RAM Storage).
**Strategy**: **Cache-Aside Pattern**.

1. App check Cache -> Có -> Return.
2. Không -> Query DB -> Lưu Cache -> Return.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Add Redis to Docker Compose.
- [ ] Install `Microsoft.Extensions.Caching.StackExchangeRedis`.
- [ ] Implement Cached Repository Decorator or Direct Service Cache.
- [ ] Test Performance improvements.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Infrastructure (15 phút)

Thêm Redis vào `src/docker-compose.yml`:

```yaml
services:
  redis:
    image: redis:alpine
    container_name: shop-redis
    ports:
      - "6379:6379"
```

Chạy `docker-compose up -d redis`.

### Bước 2: Install Package (10 phút)

Tại `Catalog.Api` (hoặc `Catalog.Infrastructure`):

```bash
dotnet add package Microsoft.Extensions.Caching.StackExchangeRedis
```

### Bước 3: Configuration (15 phút)

`Program.cs`:

```csharp
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "Catalog_";
});
```

`appsettings.json`:

```json
"ConnectionStrings": {
    "Redis": "localhost:6379"
}
```

### Bước 4: Implement Cache Logic (40 phút)

Sửa `GetProductByIdQueryHandler.cs` (Hoặc dùng Decorator Pattern nếu muốn Clean Arch chuẩn hơn, ở đây ta sửa trực tiếp cho đơn giản).

```csharp
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

public class GetProductByIdQueryHandler : IQueryHandler<GetProductByIdQuery, GetProductResult>
{
    private readonly IDbContext _dbContext;
    private readonly IDistributedCache _cache; // Inject Cache

    public GetProductByIdQueryHandler(IDbContext dbContext, IDistributedCache cache)
    {
        _dbContext = dbContext;
        _cache = cache;
    }

    public async Task<GetProductResult> Handle(GetProductByIdQuery query, CancellationToken cancellationToken)
    {
        string cacheKey = $"product:{query.Id}";

        // 1. Check Cache
        var cachedData = await _cache.GetStringAsync(cacheKey);
        if (!string.IsNullOrEmpty(cachedData))
        {
            var productDto = JsonSerializer.Deserialize<ProductDto>(cachedData);
            return new GetProductResult(productDto!);
        }

        // 2. Query DB
        var product = await _dbContext.Products.FindAsync(query.Id);
        if (product == null) throw new NotFoundException("Product", query.Id);

        var resultDto = product.Adapt<ProductDto>(); // Mapster

        // 3. Save Cache (Set Expiry)
        var options = new DistributedCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(10)) // Hết hạn sau 10p
            .SetSlidingExpiration(TimeSpan.FromMinutes(2));  // Gia hạn nếu có truy cập

        await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(resultDto), options);

        return new GetProductResult(resultDto);
    }
}
```

### Bước 5: Invalidate Cache (Quan trọng) (10 phút)

Khi Update/Delete Product -> Phải xóa Cache cũ.
Trong `UpdateProductCommandHandler`:

```csharp
// Sau khi SaveChanges
await _cache.RemoveAsync($"product:{command.Id}");
```

---

**Chúc bạn hoàn thành tốt Day 89!**
