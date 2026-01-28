# 📘 Day 93: Distributed Tracing (OpenTelemetry/Jaeger)

## 🎯 Mục tiêu ngày hôm nay

**Problem**: User báo lỗi "Đặt hàng bị chậm".
Request đi qua: Gateway -> Order -> Catalog -> Payment.
Chỗ nào chậm? Service nào lỗi? Log và Metric khó nhìn ra flow.
**Solution**: **Distributed Tracing**.
Theo dõi 1 TraceId duy nhất xuyên suốt tất cả các service.

**Thời gian ước tính**: 60 phút.

---

## ✅ Checklist

- [ ] Add `Jaeger` to Docker Compose.
- [ ] Install `OpenTelemetry.Exporter.OpenTelemetryProtocol`.
- [ ] Configure Tracing in `BuildingBlocks`.
- [ ] View Trace in Jaeger UI.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Infrastructure (Jaeger) (15 phút)

`src/docker-compose.yml`:

```yaml
services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    container_name: shop-jaeger
    ports:
      - "16686:16686" # UI
      - "4317:4317" # OTLP gRPC Receive
```

Chạy `docker-compose up -d jaeger`. UI: `http://localhost:16686`.

### Bước 2: Configure Tracing (30 phút)

Trong `BuildingBlocks`:

```bash
dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
dotnet add package OpenTelemetry.Instrumentation.EntityFrameworkCore
dotnet add package OpenTelemetry.Instrumentation.MassTransit
```

`BuildingBlocks/Logging/TracingExtensions.cs`:

```csharp
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

public static IServiceCollection AddCustomTracing(this IServiceCollection services, IConfiguration config)
{
    services.AddOpenTelemetry()
        .WithTracing(tracing =>
        {
            tracing
                .AddSource("Catalog.Api", "Order.Api", "MassTransit") // Sources define tên trace
                .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService("ProgcoderShop"))
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddEntityFrameworkCoreInstrumentation() // Trace cả câu SQL
                .AddOtlpExporter(opts =>
                {
                    opts.Endpoint = new Uri(config["Otlp:Endpoint"] ?? "http://localhost:4317");
                });
        });

    return services;
}
```

### Bước 3: Apply (10 phút)

`Catalog.Api/Program.cs`:

```csharp
builder.Services.AddCustomTracing(builder.Configuration);
```

`appsettings.json`:

```json
"Otlp": {
    "Endpoint": "http://localhost:4317"
}
```

### Bước 4: Test (5 phút)

1. Gọi API `Get /api/products`.
2. Mở Jaeger UI.
3. Chọn Service `ProgcoderShop` -> Find Traces.
4. Bạn sẽ thấy biểu đồ thời gian (Waterfall) chi tiết từng bước:
   - Client -> API (50ms)
     - Auth (10ms)
     - DB Query (30ms)
     - ...

---

**Chúc bạn hoàn thành tốt Day 93!**
