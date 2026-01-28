# 📘 Day 96: CI/CD Pipeline (GitHub Actions)

## 🎯 Mục tiêu ngày hôm nay

**Problem**: Mỗi lần code xong phải tự chạy `dotnet build`, `dotnet test` bằng tay. Đã vậy còn hay quên.
**Solution**: **Automated Pipeline (CI/CD)**.

- **CI (Continuous Integration)**: Tự động Build & Test mỗi khi có commit mới.
- **CD (Continuous Deployment)**: Tự động Build Docker Image và Push lên Docker Hub (hoặc Deploy).
  **Tool**: **GitHub Actions**.

**Thời gian ước tính**: 60 phút.

---

## ✅ Checklist

- [ ] Create `.github/workflows/ci.yml`.
- [ ] Configure Build & Test Steps.
- [ ] Configure Docker Push Step.
- [ ] Push code and watch magic happen.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Setup Workflow File (15 phút)

Tạo file `.github/workflows/dotnet.yml` tại root repo.

```yaml
name: .NET Core CI/CD

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: 8.0.x

      - name: Restore dependencies
        run: dotnet restore src/ProgcoderShop.sln

      - name: Build
        run: dotnet build src/ProgcoderShop.sln --no-restore --configuration Release

    # Bỏ qua Test nếu chưa có DB thật trên CI, hoặc dùng Testcontainers
    # - name: Test
    #   run: dotnet test src/ProgcoderShop.sln --no-build --configuration Release

  docker-build:
    needs: build-and-test
    if: github.ref == 'refs/heads/main' # Chỉ chạy khi push main
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and Push Catalog
        uses: docker/build-push-action@v4
        with:
          context: ./src
          file: ./src/Services/Catalog/Catalog.Api/Dockerfile
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/catalog-api:latest
```

### Bước 2: Configure Secrets (15 phút)

1. Vào GitHub Repo -> **Settings** -> **Secrets and variables** -> **Actions**.
2. New Repository Secret:
   - `DOCKER_USERNAME`: ID Docker Hub của bạn.
   - `DOCKER_PASSWORD`: Password (hoặc Access Token).

### Bước 3: Trigger (10 phút)

1. Commit code: `git add . && git commit -m "Add CI pipeline"`.
2. Push lên GitHub: `git push origin main`.
3. Vào tab **Actions** trên GitHub để xem pipeline chạy xanh lè 🟢.

Nếu lỗi -> Click vào Log để fix.

---

**Chúc bạn hoàn thành tốt Day 96!**
