# 📘 Day 88: Background Jobs (Hangfire)

## 🎯 Mục tiêu ngày hôm nay

**Problem**: Có những tác vụ cần chạy định kỳ (vd: Gửi email marketing mỗi sáng, Xóa logs cũ mỗi tuần) hoặc chạy ngầm tin cậy (Fire-and-forget).
**Solution**: **Hangfire** - Thư viện quản lý Background Job số 1 cho .NET.
**Features**: Dashboard UI, Retry tự động, Persistent Storage.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Create `TaskRunner` Service.
- [ ] Install `Hangfire` & `Hangfire.PostgreSql`.
- [ ] Configure Recurring Job (e.g., `LogCleanupJob`).
- [ ] Access Hangfire Dashboard.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Create Helper Project (15 phút)

Ta có thể cài Hangfire vào `Gateway` hoặc 1 service riêng. Để sạch sẽ, ta tạo project `TaskRunner.Worker`.

```bash
dotnet new web -n TaskRunner.Worker -o src/Services/TaskRunner/TaskRunner.Worker
# Add Package
cd src/Services/TaskRunner/TaskRunner.Worker
dotnet add package Hangfire
dotnet add package Hangfire.PostgreSql
dotnet add package Hangfire.AspNetCore
```

### Bước 2: Configuration (30 phút)

`Program.cs`:

```csharp
using Hangfire;
using Hangfire.PostgreSql;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Hangfire Services
builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UsePostgreSqlStorage(options =>
        options.UseNpgsqlConnection(builder.Configuration.GetConnectionString("HangfireDb"))));

// 2. Client & Server
builder.Services.AddHangfireServer();

var app = builder.Build();

// 3. Dashboard UI
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new [] { new HangfireAuthorizationFilter() } // Security Check (Day 99)
});

// 4. Register Recurring Jobs
RecurringJob.AddOrUpdate<LogCleanupJob>("cleanup-logs", x => x.Execute(), Cron.Daily);

app.Run();
```

`appsettings.json`:

```json
"ConnectionStrings": {
    "HangfireDb": "Host=localhost;Database=HangfireDb;Username=postgres;Password=postgres"
}
```

> _Lưu ý: Tạo Database `HangfireDb` trong Postgres trước khi chạy._

### Bước 3: Define Jobs (20 phút)

Tạo `Jobs/LogCleanupJob.cs`:

```csharp
public class LogCleanupJob
{
    private readonly ILogger<LogCleanupJob> _logger;

    public LogCleanupJob(ILogger<LogCleanupJob> logger)
    {
        _logger = logger;
    }

    public void Execute()
    {
        _logger.LogInformation("🧹 Cleaning up old logs at {Time}", DateTime.UtcNow);
        // Code delete logic DB...
    }
}
```

### Bước 4: Run & Monitor (15 phút)

1. Chạy `TaskRunner.Worker`.
2. Truy cập `http://localhost:XXXX/hangfire`.
3. Bạn sẽ thấy Dashboard quản lý jobs rất chuyên nghiệp.
4. Thử Trigger Manual job "cleanup-logs" và xem kết quả Success.

---

**Chúc bạn hoàn thành tốt Day 88!**
