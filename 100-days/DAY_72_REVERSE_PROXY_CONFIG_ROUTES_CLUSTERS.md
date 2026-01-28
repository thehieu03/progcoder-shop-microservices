# 📘 Day 72: Configure Routes & Clusters (Full Microservices)

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Mở rộng cấu hình Gateway cho toàn bộ các Service: Catalog, Basket, Ordering, Payment, Identity.
**Routing**: Ánh xạ logic path `/api/xxx` sang đúng service đích.

**Thời gian ước tính**: 60 phút.

---

## ✅ Checklist

- [ ] Define Clusters for all services.
- [ ] Define Routes configuration.
- [ ] Test routing to all services.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Update appsettings.json (45 phút)

```json
"ReverseProxy": {
  "Routes": {
    "catalog-route": {
      "ClusterId": "catalog-cluster",
      "Match": { "Path": "/api/catalog/{**catch-all}" }
    },
    "basket-route": {
      "ClusterId": "basket-cluster",
      "Match": { "Path": "/api/basket/{**catch-all}" }
    },
    "ordering-route": {
      "ClusterId": "ordering-cluster",
      "Match": { "Path": "/api/orders/{**catch-all}" }
    },
    "payment-route": {
      "ClusterId": "payment-cluster",
      "Match": { "Path": "/api/payments/{**catch-all}" }
    },
    "identity-route": {
      "ClusterId": "identity-cluster",
      "Match": { "Path": "/auth/{**catch-all}" }
    },
    "identity-user-route": {
      "ClusterId": "identity-cluster",
      "Match": { "Path": "/api/users/{**catch-all}" }
    }
  },
  "Clusters": {
    "catalog-cluster": {
      "Destinations": { "d1": { "Address": "https://localhost:5000" } }
    },
    "basket-cluster": {
      "Destinations": { "d1": { "Address": "https://localhost:5001" } }
    },
    "ordering-cluster": {
      "Destinations": { "d1": { "Address": "https://localhost:5002" } }
    },
    "payment-cluster": {
      "Destinations": { "d1": { "Address": "https://localhost:5050" } }
    },
    "identity-cluster": {
      "Destinations": { "d1": { "Address": "https://localhost:5060" } }
    }
  }
}
```

> **Lưu ý**: Cần check kỹ Port của từng service trong `launchSettings.json` của service đó để điền vào `Address` cho đúng.

### Bước 2: Transforms (Optional) (15 phút)

Đôi khi cần sửa path trước khi forward.
Ví dụ: Client gọi `/api/v1/catalog/...` nhưng Service chỉ hiểu `/api/catalog/...`.

```json
"catalog-route": {
  "ClusterId": "catalog-cluster",
  "Match": { "Path": "/api/v1/catalog/{**catch-all}" },
  "Transforms": [
    { "PathPattern": "/api/catalog/{catch-all}" }
  ]
}
```

---

**Chúc bạn hoàn thành tốt Day 72!**
