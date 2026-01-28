# 📘 Day 75: Gateway Hardening & CORS

## 🎯 Mục tiêu ngày hôm nay

**Feature**:

1.  **CORS**: Vì Gateway là điểm client gọi vào, nên CORS phải cấu hình ở đây (Services bên trong không cần quan tâm CORS nữa nếu đi qua Gateway).
2.  **Hardening**: HealthChecks, Request Timeout, Size Limit.

**Thời gian ước tính**: 60 phút.

---

## ✅ Checklist

- [ ] Configure Global CORS in Gateway.
- [ ] Setup HealthChecks (UI).
- [ ] Configure Timeouts & Payloads.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Configure CORS (30 phút)

`Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", b =>
    {
        b.WithOrigins("http://localhost:3000", "https://mydomain.com")
         .AllowAnyMethod()
         .AllowAnyHeader()
         .AllowCredentials();
    });
});

// ...

app.UseCors("CorsPolicy"); // Trước MapReverseProxy
app.MapReverseProxy();
```

### Bước 2: HealthChecks (Optional) (20 phút)

Nếu Gateway chết -> Cả hệ thống unreachable.
Cần endpoint `/health` để monitoring và Load Balancer (AWS/Azure) biết.

```csharp
builder.Services.AddHealthChecks();

// ...
app.MapHealthChecks("/health");
```

### Bước 3: Timeout (YARP Config) (10 phút)

`appsettings.json`:

```json
"Clusters": {
  "catalog-cluster": {
    "HttpRequest": {
      "Timeout": "00:00:15" // 15 seconds
    },
    ...
  }
}
```

---

**Chúc mừng bạn đã hoàn thành Phase Gateway & Integration (Day 71-75)! 🚀**

Gateway của bạn đã sẵn sàng:

- Routing thông minh.
- Authentication tập trung.
- Rate Limiting & CORS.
- Aggregation cơ bản.

Phase tiếp theo sẽ là **Integration Scenarios** nâng cao (Saga, Event consistency) từ Day 76.
