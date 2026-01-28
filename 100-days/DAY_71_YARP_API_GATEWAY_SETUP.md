# 📘 Day 71: Setup YARP API Gateway

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Xây dựng **API Gateway** dùng YARP (Yet Another Reverse Proxy).
**Role**:

- Là điểm vào duy nhất (Single Entry Point) cho toàn bộ hệ thống.
- Client không cần biết IP/Port của từng service con (Catalog, Order, Identity...).

**Thời gian ước tính**: 60 phút.

---

## ✅ Checklist

- [ ] Create Project `YarpGateway` (ASP.NET Core Empty).
- [ ] Install `Yarp.ReverseProxy`.
- [ ] Configure `appsettings.json` (Basic).
- [ ] Run & Test Forwarding.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Create Project (15 phút)

```bash
# Tại root src/Services
mkdir src/Services/Gateway
dotnet new web -n YarpGateway -o src/Services/Gateway/YarpGateway

# Add to Solution
dotnet sln add src/Services/Gateway/YarpGateway/YarpGateway.csproj

# Add Package
cd src/Services/Gateway/YarpGateway
dotnet add package Yarp.ReverseProxy
```

### Bước 2: Configuration (Simple) (20 phút)

Update `appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  },
  "AllowedHosts": "*",
  "ReverseProxy": {
    "Routes": {
      "catalog-route": {
        "ClusterId": "catalog-cluster",
        "Match": {
          "Path": "/api/catalog/{**catch-all}"
        }
      }
    },
    "Clusters": {
      "catalog-cluster": {
        "Destinations": {
          "catalog-dest": {
            "Address": "https://localhost:5000"
          }
        }
      }
    }
  }
}
```

> _Lưu ý: Address phải trỏ đúng port mà Catalog Api đang chạy._

### Bước 3: Program.cs (15 phút)

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add Yarp
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

app.MapReverseProxy();

app.Run();
```

### Bước 4: Test (10 phút)

1.  Chạy Catalog Service (vd: Port 5000).
2.  Chạy YarpGateway (vd: Port 8080).
3.  Gọi `GET https://localhost:8080/api/catalog/products`.
4.  Nếu thấy data trả về -> Thành công! YARP đã forward request sang Catalog.

---

**Chúc bạn hoàn thành tốt Day 71!**
