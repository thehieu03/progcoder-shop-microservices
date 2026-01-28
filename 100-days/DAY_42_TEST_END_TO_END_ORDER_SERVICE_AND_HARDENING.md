# 📘 Day 42: Test End-to-End Order Service & Hardening

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Chạy và test end-to-end toàn bộ Order Service (commands + queries), đồng thời hardening các phần dễ lỗi: validation, error handling, authorization, và performance.

Bạn sẽ:

1. **E2E**: Test đầy đủ các endpoints chính.
2. **Hardening**: Chuẩn hoá response, exception mapping, và validation errors.
3. **Perf**: Review query performance (AsNoTracking, includes, indexes cơ bản).
4. **Docs**: Review swagger.

**Thời gian ước tính**: 90-150 phút.

---

## ✅ Checklist - Đánh dấu khi hoàn thành

### Run & Smoke Test

- [ ] Start infrastructure (db + rabbitmq + redis nếu có)
- [ ] Run Order API
- [ ] Verify health endpoints (nếu có)
- [ ] Open Swagger và verify all endpoints loaded

### E2E Test Scenarios

- [ ] **Create order**: `POST /admin/orders`
- [ ] **Admin get order by id**: `GET /admin/orders/{orderId}`
- [ ] **Admin get orders (paging)**: `GET /admin/orders?pageNumber=1&pageSize=10`
- [ ] **Admin get all orders (no paging)**: `GET /admin/orders/all`
- [ ] **Update order**: `PUT /admin/orders/{orderId}`
- [ ] **Update order status (Cancel/Delivered/...)**: `PATCH /admin/orders/{orderId}/status`
- [ ] **Get my orders (paging)**: `GET /orders/me?pageNumber=1&pageSize=10`
- [ ] **Get all my orders (no paging)**: `GET /orders/me/all`
- [ ] **Get my order by id**: `GET /orders/me/{orderId}`
- [ ] **Get order by orderNo**: `GET /orders/by-order-no/{orderNo}`

### Authorization

- [ ] Owner không được gọi admin endpoints
- [ ] Admin gọi được admin endpoints
- [ ] User A không đọc được order của User B (nếu áp dụng)

### Validation & Error Handling

- [ ] Invalid payload -> 400 với error details rõ
- [ ] Not found -> 404
- [ ] Invalid state transition -> 400/409
- [ ] Unexpected error -> 500 với response chuẩn

### Performance & Observability

- [ ] Read queries dùng `AsNoTracking` (nếu EF Core)
- [ ] Pagination có `OrderBy` rõ ràng
- [ ] Logging có correlation id (nếu project có)
- [ ] Check logs không spam / không lộ data nhạy cảm

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Chuẩn bị dữ liệu test (10-20 phút)

- Tạo ít nhất 2 user: User A và User B
- Tạo ít nhất 5-20 orders để test paging/filter

Nếu chưa có User/Identity service chạy ổn:
- Có thể tạm dùng seed user hoặc mock token (tuỳ setup hiện tại)

### Bước 2: E2E flow chuẩn (30-45 phút)

Flow gợi ý:

1. Login -> lấy token (user/admin theo setup hiện tại)
2. **Admin tạo order**: `POST /admin/orders`
3. **Admin xem order**: `GET /admin/orders/{orderId}`
4. **Admin list (paging)**: `GET /admin/orders?pageNumber=1&pageSize=10&status=Pending`
5. **Admin update order**: `PUT /admin/orders/{orderId}`
6. **User xem orders của mình**:
    - `GET /orders/me?pageNumber=1&pageSize=10`
    - `GET /orders/me/{orderId}`
7. **Admin cancel order** (theo codebase hiện tại cancel là status update):
    - `PATCH /admin/orders/{orderId}/status` body: `{ "status": "Canceled", "reason": "customer requested" }`
8. **Admin verify cancel**: `GET /admin/orders/{orderId}`
9. (Tuỳ chọn) **Admin delivered**:
    - `PATCH /admin/orders/{orderId}/status` body: `{ "status": "Delivered" }`
10. **Search by orderNo**:
    - `GET /orders/by-order-no/{orderNo}`

### Bước 3: Test negative cases (15-25 phút)

- Cancel mà không có `reason` khi `status=Canceled` -> fail (`MessageCode.CancelReasonIsRequired`)
- Update status khi order đã `Delivered/Canceled/Refunded` -> fail (`MessageCode.OrderStatusCannotBeUpdated`)
- Update order khi order đã `Delivered/Canceled/Refunded` -> fail (`MessageCode.OrderCannotBeUpdated`)
- `GET /orders/me/{orderId}` với order không thuộc user -> 404 (`MessageCode.OrderNotFound`)
- Query invalid paging -> 400 theo model validation

### Bước 4: Hardening checklist (20-40 phút)

Nếu bạn thấy lỗi lặt vặt, hôm nay fix ngay:
- Mapping DTO thiếu field
- Validation chưa đủ
- Exception chưa map đúng http status
- Endpoint route chưa consistent

### Bước 5: Review swagger (10-15 phút)

- Name, tags, response codes
- Example request bodies (nếu bạn có)

---

**Chúc bạn hoàn thành tốt Day 42!**
