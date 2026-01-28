# 📘 Day 76: Distributed Transaction Concept (Saga)

## 🎯 Mục tiêu ngày hôm nay

**Concept**: Hiểu và thiết kế **Saga Pattern**.
Trong Microservices:

- Order Service muốn tạo đơn hàng.
- Catalog Service muốn trừ kho.
- Payment Service muốn trừ tiền.

Nếu Database của 3 ông này riêng biệt, ta không thể `BeginTransaction` chung được.
-> Giải pháp: Saga (Choreography hoặc Orchestration).
Chúng ta sẽ dùng **Orchestration** (có nhạc trưởng điều phối) với thư viện **MassTransit State Machine**.

**Thời gian ước tính**: 60 phút (Chủ yếu là đọc & thiết kế).

---

## ✅ Checklist

- [ ] Hiểu States: `Initial`, `OrderCreated`, `InventoryReserved`, `PaymentProcessed`, `Completed`, `Failed`.
- [ ] Hiểu Events: `OrderSubmitted`, `StockReserved`, `PaymentSuccess`, `PaymentFailed`.
- [ ] Design State Machine Diagram.

---

## 📋 Hướng dẫn chi tiết từng bước

### 1. Luồng thành công (Happy Path)

1.  **Client** -> `CreateOrder` -> Order Service (Status: `Submitted`).
2.  **OrderSaga** detect `OrderSubmitted` -> Gửi lệnh `ReserveStock` sang Catalog.
3.  **Catalog** lock kho -> Reply `StockReserved`.
4.  **OrderSaga** nhận `StockReserved` -> Gửi lệnh `ProcessPayment` sang Payment.
5.  **Payment** trừ tiền -> Reply `PaymentSuccess`.
6.  **OrderSaga** nhận `PaymentSuccess` -> Transition state thành `Completed`.

### 2. Luồng thất bại (Compensation Path)

Giả sử hết hàng:

1.  **OrderSaga** gửi `ReserveStock`.
2.  **Catalog** báo `StockOutOfInventory` (hoặc lỗi).
3.  **OrderSaga** nhận lỗi -> Transition state `Failed` -> Gửi lệnh `CancelOrder` (để update status Order gốc).

Giả sử lỗi thanh toán:

1.  **OrderSaga** gửi `ProcessPayment`.
2.  **Payment** báo `PaymentFailed`.
3.  **OrderSaga** nhận lỗi -> Transition `PaymentFailed` -> Gửi lệnh `ReleaseStock (Compensate)` sang Catalog để trả hàng lại kho.
4.  Catalog trả kho xong -> OrderSaga End.

### 3. Setup Project (Chuẩn bị cho Day 77)

Tạo project `src/Services/Ordering/Ordering.Saga` (Class Library hoặc Worker, tốt nhất là Worker để chạy riêng).

```bash
dotnet new worker -n Ordering.Saga -o src/Services/Ordering/Ordering.Saga
dotnet add src/Services/Ordering/Ordering.Saga/Ordering.Saga.csproj package MassTransit.EntityFrameworkCore
dotnet add src/Services/Ordering/Ordering.Saga/Ordering.Saga.csproj package MassTransit.RabbitMQ
```

---

**Chúc bạn hoàn thành tốt Day 76!**
