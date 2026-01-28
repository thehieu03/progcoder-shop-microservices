# 📘 Day 98: Security Review (OWASP)

## 🎯 Mục tiêu ngày hôm nay

**Problem**: Code chạy ngon nhưng có thể đầy lỗ hổng (SQL Injection, XSS, Broken Auth...).
**Solution**: **Security Audit**. Rà soát lại code theo tiêu chuẩn **OWASP Top 10**.

**Thời gian ước tính**: 90 phút (Review code & Fix nhẹ).

---

## ✅ Checklist

- [ ] Check SQL Injection (EF Core safe?).
- [ ] Check Broken Auth (JWT Validation, Expiry).
- [ ] Check Sensitive Data Exposure (Connection String, Secrets).
- [ ] Enable HTTPS Enforcement.

---

## 📋 Hướng dẫn chi tiết từng bước

### 1. SQL Injection

- **Check**: Có dùng `FromSqlRaw` nối chuỗi không?
  - ❌ `_context.Database.ExecuteSqlRaw("SELECT * FROM Users WHERE Name = '" + name + "'")` -> **LỖI**.
  - ✅ `_context.Users.Where(x => x.Name == name)` -> **An toàn** (EF Core lo).
  - ✅ `_context.Database.ExecuteSqlRaw("SELECT * FROM Users WHERE Name = {0}", name)` -> **An toàn** (Parameterization).

### 2. Broken Authentication

- **Check**: JWT Secret Key có đủ dài (> 32 ký tự) và random ko?
- **Check**: Access Token có `Expiry Time` ngắn (15-60p) ko?
- **Action**: Đảm bảo dùng `User Secrets` hoặc Environment Variable cho Secret Key, **KHÔNG** hardcode trong git source.

### 3. Sensitive Data Exposure

- **Check**: `appsettings.json` có chứa Password DB thật ko?
- **Action**: Xóa password thật. Dùng `local.settings.json` (git ignore) hoặc Environment Variable khi chạy Docker.

### 4. Security Headers (Best Practice)

Cài thêm package `NWebsec.AspNetCore.Middleware` (Optional) hoặc config tay.
Thêm vào `Program.cs`:

```csharp
app.UseHsts(); // Force HTTPS Strict Transport Security
app.UseHttpsRedirection();
// app.UseXContentTypeOptions();
// app.UseReferrerPolicy(opts => opts.NoReferrer());
```

---

**Chúc bạn hoàn thành tốt Day 98!**
