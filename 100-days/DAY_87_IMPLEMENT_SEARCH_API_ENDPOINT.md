# 📘 Day 87: Implement Search API

## 🎯 Mục tiêu ngày hôm nay

**Feature**: API tìm kiếm sản phẩm mạnh mẽ.
**Spec**:

- Tìm theo Keywords (Name, Description).
- Filter theo Price (Min, Max).
- Pagination (Page, Size).

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Define `SearchProductRequest` DTO.
- [ ] Define `SearchDocumentResponse` DTO.
- [ ] Create `SearchEndpoint`.
- [ ] Write Complex Query DSL using Elastic Client.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Request DTO (15 phút)

```csharp
namespace Search.Api.DTOs;

public record SearchProductRequest(
    string? Keyword,
    decimal? MinPrice,
    decimal? MaxPrice,
    int Page = 1,
    int PageSize = 10
);
```

### Bước 2: Endpoint Implementation (60 phút)

`src/Services/Search/Search.Api/Endpoints/SearchEndpoints.cs`:

```csharp
using Elastic.Clients.Elasticsearch;
using Microsoft.AspNetCore.Mvc;
using Search.Api.DTOs;
using Search.Api.Models;

public static class SearchEndpoints
{
    public static void MapSearchEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/search/products", async ([FromBody] SearchProductRequest request, ElasticsearchClient client) =>
        {
            var response = await client.SearchAsync<ProductDocument>(s => s
                .Index("products")
                .From((request.Page - 1) * request.PageSize)
                .Size(request.PageSize)
                .Query(q => q
                    .Bool(b => b
                        .Must(m =>
                        {
                            if (!string.IsNullOrEmpty(request.Keyword))
                            {
                                m.MultiMatch(mm => mm
                                    .Fields(f => f.Field(p => p.Name).Field(p => p.Description))
                                    .Query(request.Keyword)
                                    .Fuzziness(new Fuzziness("AUTO")) // Cho phép gõ sai nhẹ
                                );
                            }
                        })
                        .Filter(f =>
                        {
                            if (request.MinPrice.HasValue || request.MaxPrice.HasValue)
                            {
                                f.Range(r => r
                                    .NumberRange(nr => nr
                                        .Field(p => p.Price)
                                        .Gte((double?)request.MinPrice)
                                        .Lte((double?)request.MaxPrice)
                                    )
                                );
                            }
                        })
                    )
                )
            );

            if (!response.IsValidResponse)
            {
                return Results.Problem("Search engine error");
            }

            var result = new
            {
                Total = response.Total,
                Items = response.Documents
            };

            return Results.Ok(result);
        });
    }
}
```

> **Giải thích DSL**:
>
> - `MultiMatch`: Tìm keyword trên nhiều trường (tên, mô tả).
> - `Fuzziness`: Hỗ trợ tìm gần đúng (vd: "iphoen" -> "iphone").
> - `Filter (Range)`: Lọc giá, hiệu năng cao hơn Query vì không tính điểm Relevance Score.

### Bước 3: Register Endpoint (15 phút)

`Program.cs`:

```csharp
// ...
app.MapSearchEndpoints();
app.Run();
```

### Bước 4: Test (10 phút)

Gửi request:

```json
POST /api/search/products
{
  "keyword": "iphone",
  "minPrice": 1000,
  "page": 1,
  "pageSize": 5
}
```

Kết quả trả về danh sách sản phẩm khớp.

---

**Chúc bạn hoàn thành tốt Day 87!**
