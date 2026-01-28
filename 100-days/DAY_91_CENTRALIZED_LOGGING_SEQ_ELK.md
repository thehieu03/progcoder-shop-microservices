# 📘 Day 91: Centralized Logging (ELK/Seq)

## 🎯 Mục tiêu ngày hôm nay

**Problem**: Log nằm rải rác ở Console của từng container. Khi có lỗi, phải SSH vào từng server để đọc -> Khó khăn.
**Solution**: **Centralized Logging**. Gom log về 1 nơi duy nhất để search & filter.
**Tool**: `Seq` (Dễ dùng nhất cho .NET) hoặc `ELK Stack` (Elasticsearch, Logstash, Kibana - Enterprise).
Ở đây ta dùng **Seq** cho nhẹ và nhanh.

**Thời gian ước tính**: 60 phút.

---

## ✅ Checklist

- [ ] Add `Seq` to Docker Compose.
- [ ] Install `Serilog.AspNetCore` & `Serilog.Sinks.Seq`.
- [ ] Configure Serilog globally (BuildingBlocks).
- [ ] View Logs in Seq Dashboard.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Infrastructure (Seq) (15 phút)

Thêm vào `src/docker-compose.yml`:

```yaml
services:
  seq:
    image: datalust/seq:latest
    container_name: shop-seq
    environment:
      - ACCEPT_EULA=Y
    ports:
      - "5341:80"
      - "5342:5341"
    volumes:
      - seqdata:/data
```

Chạy `docker-compose up -d seq`.
Truy cập `http://localhost:5341`.

### Bước 2: Serilog Setup (Shared) (30 phút)

Thay vì config từng Service, ta làm trong `BuildingBlocks`.

`src/BuildingBlocks/BuildingBlocks/Logging/SerilogExtensions.cs` (Tạo mới):

```csharp
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Events;

namespace BuildingBlocks.Logging;

public static class SerilogExtensions
{
    public static WebApplicationBuilder AddCustomSerilog(this WebApplicationBuilder builder)
    {
        builder.Host.UseSerilog((context, services, configuration) =>
        {
            configuration
                .MinimumLevel.Information()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
                .MinimumLevel.Override("System", LogEventLevel.Warning)
                .Enrich.FromLogContext()
                .Enrich.WithProperty("ApplicationName", builder.Environment.ApplicationName)
                .WriteTo.Console()
                .WriteTo.Seq(context.Configuration["Seq:ServerUrl"] ?? "http://localhost:5341");
        });

        return builder;
    }
}
```

### Bước 3: Apply to Services (15 phút)

`Catalog.Api/Program.cs` (và các service khác):

```csharp
using BuildingBlocks.Logging;

var builder = WebApplication.CreateBuilder(args);

// Thay thế logging mặc định
builder.AddCustomSerilog();

// ...
```

`appsettings.json`:

```json
"Seq": {
    "ServerUrl": "http://localhost:5341"
}
```

### Bước 4: Test (10 phút)

1. Chạy `Seq` (Docker).
2. Chạy `Catalog.Api`.
3. Gọi vài API.
4. Mở Seq Dashboard (http://localhost:5341) -> Thấy Log realtime.
5. Filter thử: `ApplicationName = 'Catalog.Api' && @Level = 'Error'`.

---

**Chúc bạn hoàn thành tốt Day 91!**
