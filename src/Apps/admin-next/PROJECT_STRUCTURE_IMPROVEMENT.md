# admin-next: Hướng dẫn Cải thiện & Học tập (Mock-First)

Tài liệu này hướng dẫn chi tiết cách tái cấu trúc (refactor) dự án để học kiến trúc Next.js App Router + Redux Toolkit thông qua việc sử dụng **Mock Data** (dữ liệu giả).

## 1. Mục tiêu Học tập
- Hiểu luồng dữ liệu: UI -> Service -> Mock Data -> Redux -> UI.
- Biết cách tổ chức thư mục theo Feature (tính năng).
- Làm quen với TailwindCSS v4 và Next.js 16.

## 2. Kế hoạch Hành động (Step-by-Step)

### Giai đoạn 1: Chuẩn bị "Sân chơi" (Mocking)
- [x] Tạo thư mục `src/mocks` để chứa dữ liệu mẫu.
- [ ] Tạo các file mock:
    - `productsMock.ts` (Đã có)
    - `usersMock.ts` (Cần tạo: id, name, role, email)
    - `ordersMock.ts` (Cần tạo: id, customer, total, status)
- [ ] Tạo `core/services/mockAdapter.ts`: Hàm giả lập độ trễ mạng (`delay(ms)`).

### Giai đoạn 2: Xây dựng Core & Shared
- [ ] **Redux Store:** Setup lại `src/core/store` với `configureStore`.
- [ ] **Auth Slice:** Tạo `features/auth/authSlice.ts` để quản lý trạng thái đăng nhập (isAuthenticated, user).
- [ ] **UI Components:** Tạo các component tái sử dụng trong `shared/components/ui`:
    - `Button.tsx` (Primary, Secondary, Danger)
    - `Input.tsx` (Text, Password)
    - `Table.tsx` (Hiển thị danh sách dữ liệu)

### Giai đoạn 3: Thực hiện từng Feature (Logic)

#### 3.1. Auth Feature (Đăng nhập giả)
1.  Tạo trang `app/(auth)/login/page.tsx`.
2.  Tạo form nhập username/password.
3.  Khi submit -> Gọi `authService.loginMock(username, password)`.
4.  Nếu đúng -> Dispatch action `loginSuccess` -> Chuyển hướng vào Dashboard.

#### 3.2. Products Feature (Quản lý sản phẩm)
1.  Tạo trang `app/(dashboard)/products/page.tsx`.
2.  Trong `useEffect` (hoặc Server Component), gọi `productService.getMockProducts()`.
3.  Lưu data vào Redux `productSlice`.
4.  Render danh sách ra `Table` component.

#### 3.3. Orders Feature (Tương tự Products)

### Giai đoạn 4: Đánh giá & Tối ưu
- [ ] Kiểm tra xem code có dễ đọc không?
- [ ] Tách nhỏ component nếu file quá dài (> 200 dòng).
- [ ] Đặt tên biến/hàm đã chuẩn tiếng Anh chưa?

## 3. Quy tắc "Bất di bất dịch" (Trong quá trình học)
1.  **KHÔNG gọi API thật:** Tất cả service phải trả về data từ `src/mocks`.
2.  **KHÔNG dùng `any`:** Phải định nghĩa Interface cho mọi dữ liệu (Product, User...).
3.  **Clean Code:** Xóa hết `console.log` thừa, comment code rác.

---
*Tài liệu này sẽ được cập nhật sau mỗi lần Review.*
