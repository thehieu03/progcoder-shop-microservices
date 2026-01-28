# 📘 Day 90: Advanced Resilience (Polly)

## 🎯 Mục tiêu ngày hôm nay

**Problem**: Khi Catalog Service bị sập hoặc quá tải (chậm), Gateway vẫn cứ gửi request dồn dập -> Gây sập toàn bộ hệ thống (Cascading Failure).
**Solution**: **Resilience Patterns**.

- **Retry**: Thử lại nếu lỗi tạm thời (mạng lag).
- **Circuit Breaker**: Ngắt cầu dao nếu lỗi liên tục, chờ Service hồi phục mới mở lại.
- **Timeout**: Không chờ mãi mãi.

**Tech**: `Microsoft.Extensions.Http.Resilience` (.NET 8 Standard Resilience).

**Thời gian ước tính**: 60 phút.

---

## ✅ Checklist

- [ ] Install `Microsoft.Extensions.Http.Resilience`.
- [ ] Configure `AddStandardResilienceHandler` for HttpClients.
- [ ] Test Circuit Breaker (Cố tình tắt service con).

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Gateway Configuration (30 phút)

Chúng ta cấu hình cho Gateway khi gọi xuống các Service (Day 74 Aggregator đã dùng HttpClient).

Tại `YarpGateway`:

```bash
dotnet add package Microsoft.Extensions.Http.Resilience
```

`Program.cs`:

```csharp
// Config cho Aggregator Clients
builder.Services.AddHttpClient("CatalogClient", c => c.BaseAddress = new Uri("..."))
    .AddStandardResilienceHandler(); // <-- Magic Line

builder.Services.AddHttpClient("OrderClient", c => c.BaseAddress = new Uri("..."))
    .AddStandardResilienceHandler(options =>
    {
        // Custimize nếu muốn
        options.Retry.MaxRetryAttempts = 3;
        options.CircuitBreaker.SamplingDuration = TimeSpan.FromSeconds(10);
        options.CircuitBreaker.FailureRatio = 0.5; // Fail 50% -> Open Circuit
    });
```

### Bước 2: YARP Resilience (15 phút)

YARP cũng tích hợp sẵn Passive/Active Health Checks, nhưng ta có thể add Policy cho Cluster.
(Tuy nhiên `AddStandardResilienceHandler` chủ yếu dùng cho `HttpClient` direct Call).

Với YARP Routes, ta config trong configuration file (Day 75 đã làm TimeOut, hôm nay check lại).

### Bước 3: Database Resilience (EF Core) (15 phút)

Trong các Microservices (`Catalog`, `Order`...), EF Core có sẵn `EnableRetryOnFailure`.

`appsettings.json` connection string không đổi.
`Program.cs` / `DependencyInjection.cs`:

```csharp
services.AddDbContext<CatalogDbContext>(opts =>
    opts.UseNpgsql(connectionString, sqlOpts =>
    {
        sqlOpts.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorCodesToAdd: null);
    }));
```

### Bước 4: Test Circuit Breaker (Test mù) (15 phút)

1. Gateway gọi Service A liên tục (Viết script loop 100 lần).
2. Tắt Service A.
3. Gateway báo lỗi 500 (hoặc timeout).
4. Bật lại Service A.
5. Circuit Breaker vẫn đang **OPEN** (Ngắt) nên Gateway trả lỗi ngay lập tức mà không chờ (Fail Fast).
6. Sau vài giây (SamplingDuration), Circuit chuyển sang **HALF-OPEN**, cho thử 1 request đi qua.
7. Nếu OK -> **CLOSED** (Bình thường lại).

=> Hệ thống "tự chữa lành" và không bị treo cứng.

---

**Chúc mừng bạn đã hoàn thành Phase 5: Advanced Integration (Day 81-90)! 🛡️**

Hệ thống của bạn giờ đã rất "xịn xò":

- Có Email.
- Có Search Engine.
- Có Background Job.
- Có Caching Redis.
- Có Cơ chế bảo vệ (Resilience).

Phase cuối cùng (Day 91-100) sẽ là đưa mọi thứ "ra ánh sáng": **Logging, Monitoring, CI/CD và Kubernetes!**
