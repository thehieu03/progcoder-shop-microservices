# 📘 Day 59: Payment E2E Scenarios (Test Script)

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Kiểm thử toàn trình (End-to-End) flow thanh toán.
Đảm bảo các mảnh ghép (API, Worker, Job, Gateway) hoạt động trơn tru với nhau.

**Thời gian ước tính**: 60 phút.

---

## 2. Kịch bản Test (Scenario)

### Flow 1: Thanh toán thành công (Happy Path)

1.  **Create Order** -> Payment Pending sinh ra tự động (nhờ Consumer Day 56).
2.  **Process Payment** -> Lấy Link thanh toán (Mock/Momo).
3.  **User Pay** -> Simulate IPN callback Success.
4.  **Verify**:
    - Payment Status = Completed.
    - Order Status = Paid.

### Flow 2: Thanh toán thất bại

1.  **Process Payment**.
2.  **User Cancel** -> IPN callback Fail.
3.  **Verify**: Payment Status = Failed.

---

## 3. Test Script (HTTP Client)

Tạo file `tests/payment_e2e.http` (dùng Extension REST Client trong VS Code) để chạy.

```http
@baseUrl = https://localhost:5050
@orderId = 3fa85f64-5717-4562-b3fc-2c963f66afa6
@paymentId = <LẤY_TỪ_DB_SAU_KHI_TẠO_ORDER>

### 1. (Optional) Manual Create Payment (nếu không có Order Service chạy)
POST {{baseUrl}}/api/payments
Content-Type: application/json

{
  "orderId": "{{orderId}}",
  "amount": 50000,
  "method": 2
}

### 2. Process Payment (Lấy PayUrl)
POST {{baseUrl}}/api/payments/{{paymentId}}/process
Content-Type: application/json

{
    "returnUrl": "https://localhost:5050/return",
    "cancelUrl": "https://localhost:5050/cancel"
}

### 3. Simulate Momo IPN (Success)
POST {{baseUrl}}/api/payments/momo/ipn
Content-Type: application/json

{
    "partnerCode": "MOMO",
    "orderId": "{{paymentId}}",
    "requestId": "REQ_001",
    "amount": 50000,
    "resultCode": 0,
    "message": "Success",
    "transId": 123456789,
    "signature": "<TỰ_GEN_SIGNATURE_NẾU_CẦN>"
}
# Lưu ý: Nếu bật check signature, bạn phải tính đúng signature.
# Mẹo: Tạm tắt verify signature trong code Day 49 để test luồng logic trước.

### 4. Verify Payment Status
GET {{baseUrl}}/api/payments/{{paymentId}}

### 5. Verify Order Status (Query Order Service)
# GET https://localhost:5000/api/orders/{{orderId}}
```

---

**Chúc bạn hoàn thành tốt Test Day 59!**
