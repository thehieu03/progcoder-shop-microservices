# 📘 Day 85: Search Service Setup (Elasticsearch)

## 🎯 Mục tiêu ngày hôm nay

**Problem**: `Catalog Service` dùng PostgreSQL search `LIKE %keyword%` rất chậm khi dữ liệu lớn, và không hỗ trợ Full-text search tốt (như tìm "iphone 13" ra cả "iphone 13 pro").
**Solution**: **Elasticsearch** (Search Engine).
**Component**: `Search.Api`.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Add `elasticsearch` & `kibana` to Docker Compose.
- [ ] Create Project `Search.Api`.
- [ ] Install Client (`Elastic.Clients.Elasticsearch`).
- [ ] Register Client to DI.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Infrastructure (Docker Compose) (30 phút)

Thêm vào `src/docker-compose.yml` (hoặc tạo mới `docker-compose.override.yml`):

```yaml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.1
    container_name: shop-elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false # Dev only
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - esdata:/usr/share/elasticsearch/data

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.1
    container_name: shop-kibana
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

volumes:
  esdata:
```

Chạy `docker-compose up -d`. Truy cập `http://localhost:5601` (Kibana) để kiểm tra.

### Bước 2: Create Project (15 phút)

```bash
cd src/Services
mkdir Search
dotnet new webapi -n Search.Api -o Search/Search.Api
dotnet sln ../../ProgcoderShop.sln add Search/Search.Api/Search.Api.csproj
```

### Bước 3: Install Packages (10 phút)

```bash
cd Search/Search.Api
dotnet add package Elastic.Clients.Elasticsearch
```

### Bước 4: Configure Client (30 phút)

Update `appsettings.json`:

```json
"ElasticSettings": {
    "Uri": "http://localhost:9200",
    "DefaultIndex": "products"
}
```

Update `Program.cs`:

```csharp
using Elastic.Clients.Elasticsearch;

var builder = WebApplication.CreateBuilder(args);

// Config ES
var esUri = new Uri(builder.Configuration["ElasticSettings:Uri"]!);
var esSettings = new ElasticsearchClientSettings(esUri)
    .DefaultIndex(builder.Configuration["ElasticSettings:DefaultIndex"]!);

var client = new ElasticsearchClient(esSettings);

builder.Services.AddSingleton(client);

// Test Endpoint
var app = builder.Build();

app.MapGet("/api/search/health", async (ElasticsearchClient es) =>
{
    var response = await es.PingAsync();
    return response.IsValidResponse ? Results.Ok("Elasticsearch is Good!") : Results.Problem("ES Unreachable");
});

app.Run();
```

### Bước 5: Run & Test (5 phút)

1. Chạy `Search.Api`.
2. Gọi `GET /api/search/health`.
3. Nhận `200 OK` -> Kết nối thành công.

---

**Chúc bạn hoàn thành tốt Day 85!**
