# 📘 Day 92: Monitoring (Prometheus/Grafana)

## 🎯 Mục tiêu ngày hôm nay

**Problem**: Không biết server đang chịu tải bao nhiêu? RAM/CPU có bị leak không? Request/s là bao nhiêu?
**Solution**: **Monitoring Stack**.

- **Prometheus**: Thu thập Metrics (Time-series DB).
- **Grafana**: Vẽ biểu đồ Dashboard đẹp mắt.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Add `Prometheus` & `Grafana` to Docker Compose.
- [ ] Install `OpenTelemetry.Metrics` packages.
- [ ] Expose `/metrics` endpoint in .NET Apps.
- [ ] Import Grafana Dashboard.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Infrastructure (30 phút)

`src/docker-compose.yml`:

```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: shop-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    container_name: shop-grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

Tạo file `src/prometheus.yml`:

```yaml
global:
  scrape_interval: 5s

scrape_configs:
  - job_name: "catalog-service"
    static_configs:
      - targets: ["host.docker.internal:5000"] # IP máy Host
    metrics_path: /metrics
```

### Bước 2: .NET Metrics (30 phút)

Trong `BuildingBlocks` (Shared):

```bash
dotnet add package OpenTelemetry.Extensions.Hosting
dotnet add package OpenTelemetry.Exporter.Prometheus.AspNetCore
```

`BuildingBlocks/Monitoring/MonitoringExtensions.cs`:

```csharp
using OpenTelemetry.Metrics;

public static IServiceCollection AddCustomMetrics(this IServiceCollection services)
{
    services.AddOpenTelemetry()
        .WithMetrics(metrics => metrics
            .AddAspNetCoreInstrumentation()
            .AddRuntimeInstrumentation() // Memory, CPU, GC
            .AddPrometheusExporter());

    return services;
}

public static WebApplication UseCustomMetrics(this WebApplication app)
{
    app.MapPrometheusScrapingEndpoint();
    return app;
}
```

### Bước 3: Apply to Services (15 phút)

`Catalog.Api/Program.cs`:

```csharp
builder.Services.AddCustomMetrics();
// ...
app.UseCustomMetrics();
```

### Bước 4: Test (15 phút)

1. Chạy `Catalog.Api`.
2. Truy cập `http://localhost:5000/metrics` -> Thấy text metrics loằng ngoằng -> OK.
3. Chạy Docker Compose.
4. Mở Grafana (http://localhost:3000) -> Login (admin/admin).
5. Add Data Source -> Prometheus -> URL: `http://prometheus:9090`.
6. Import Dashboard ID `19924` (Example ASP.NET Core Dashboard) -> Chọn Source Prometheus.
7. Thưởng thức biểu đồ nhảy múa! 📈

---

**Chúc bạn hoàn thành tốt Day 92!**
