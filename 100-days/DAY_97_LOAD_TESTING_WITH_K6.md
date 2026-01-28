# 📘 Day 97: Load Testing (k6)

## 🎯 Mục tiêu ngày hôm nay

**Problem**: Hệ thống chạy OK với 1 user. Nhưng liệu có chịu nổi 1000 user cùng lúc?
**Solution**: **Load Testing**. Giả lập lượng truy cập lớn để tìm điểm nghẽn (bottleneck).
**Tool**: **k6** (Open source, viết script bằng JS).

**Thời gian ước tính**: 60 phút.

---

## ✅ Checklist

- [ ] Install k6.
- [ ] Write Load Test Script (`script.js`).
- [ ] Run Test & Analyze Metrics (RPS, Latency, Error Rate).

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Installation (10 phút)

**Windows (Winget)**:

```bash
winget install k6
```

Hoặc download file `.msi` từ [k6.io](https://k6.io).

### Bước 2: Write Script (30 phút)

Tạo file `k6-scripts/load-test.js`:

```javascript
import http from "k6/http";
import { check, sleep } from "k6";

// Config: 50 Users (VU) trong 30s
export const options = {
  stages: [
    { duration: "30s", target: 50 }, // Ramp up to 50 users
    { duration: "1m", target: 50 }, // Stay at 50 users
    { duration: "10s", target: 0 }, // Ramp down
  ],
};

export default function () {
  // Test 1: Get Products (Public)
  const res = http.get("http://localhost:5000/api/catalog/products");

  check(res, {
    "status is 200": (r) => r.status === 200,
    "duration < 500ms": (r) => r.timings.duration < 500,
  });

  sleep(1); // Nghỉ 1s giữa click
}
```

### Bước 3: Run Test (20 phút)

Chạy Console:

```bash
k6 run k6-scripts/load-test.js
```

### Bước 4: Analyze Result (Phân tích kết quả)

Nhìn Console Output:

- **http_reqs**: Tổng số requests.
- **http_req_duration**: Thời gian phản hồi (Avg, P95).
  - P95 = 450ms -> 95% request nhanh hơn 450ms. Tốt!
  - Nếu P95 > 2s -> Hệ thống chậm -> Cần Optimize (Database Index, Caching Redis...).

> _Bài tập nâng cao: Thử tắt Redis và chạy lại k6 để xem hiệu năng tụt thê thảm thế nào!_ 😈

---

**Chúc bạn hoàn thành tốt Day 97!**
