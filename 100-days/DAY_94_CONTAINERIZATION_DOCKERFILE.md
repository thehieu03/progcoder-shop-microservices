# 📘 Day 94: Containerization (Dockerfile Optimization)

## 🎯 Mục tiêu ngày hôm nay

**Problem**: Build project bằng tay. Deploy bằng file `.exe` copy paste -> Lỗi môi trường ("Works on my machine").
**Solution**: **Docker Image**. Đóng gói tất cả vào 1 image duy nhất.
**Goal**: Tạo `Dockerfile` chuẩn cho Production (nhẹ, bảo mật).

**Thời gian ước tính**: 60 phút.

---

## ✅ Checklist

- [ ] Write Multi-stage Dockerfile.
- [ ] Optimize Image size (Alpine/Chiseled).
- [ ] Build & Run.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Multi-stage Build (Giải thích)

Không copy cả source code + SDK vào image cuối cùng.

1. Stage Build: Dùng SDK (nặng) để compile.
2. Stage Runtime: Dùng Runtime (nhẹ) để chạy DLL.

### Bước 2: Create Dockerfile (30 phút)

Tạo file `src/Services/Catalog/Catalog.Api/Dockerfile`:

```dockerfile
# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers (Cache Optimization)
COPY ["Services/Catalog/Catalog.Api/Catalog.Api.csproj", "Services/Catalog/Catalog.Api/"]
COPY ["BuildingBlocks/BuildingBlocks/BuildingBlocks.csproj", "BuildingBlocks/BuildingBlocks/"]
RUN dotnet restore "Services/Catalog/Catalog.Api/Catalog.Api.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/Services/Catalog/Catalog.Api"
RUN dotnet build "Catalog.Api.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "Catalog.Api.csproj" -c Release -o /app/publish

# Stage 3: Final Image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Catalog.Api.dll"]
```

> **Lưu ý**: File này giả định context là thư mục `src` (Root của solution) để copy được `BuildingBlocks`.

### Bước 3: Build Script (15 phút)

Vì Dockerfile nằm sâu, lệnh build phải chạy từ root `src`:

```bash
cd src
docker build -t progcoder/catalog-api:latest -f Services/Catalog/Catalog.Api/Dockerfile .
```

### Bước 4: Test Image (15 phút)

```bash
docker run -p 5005:8080 -e "ConnectionStrings__CatalogDb=..." progcoder/catalog-api:latest
```

Truy cập `http://localhost:5005/weatherforecast` (hoặc api).

---

**Chúc bạn hoàn thành tốt Day 94!**
