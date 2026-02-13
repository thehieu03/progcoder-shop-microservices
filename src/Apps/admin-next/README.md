# admin-next: Hướng dẫn Thực hành Code lại (Phiên bản Siêu Chi Tiết)

Tài liệu này là lộ trình học tập chuyên sâu. Bạn sẽ không chỉ code lại, mà còn hiểu sâu sắc *tại sao* chúng ta làm như vậy.

---

## 🚀 Mock API (Ready to Use)

Project đã được setup sẵn **Mock API** sử dụng Next.js API Routes. Data lưu trong memory (không cần database).

### Quick Start
```bash
npm run dev
```

### API Endpoints
| Resource | Endpoint | Methods |
|----------|----------|---------|
| Products | `/api/products` | GET, POST |
| Orders | `/api/orders` | GET, POST |
| Categories | `/api/categories` | GET, POST |
| Brands | `/api/brands` | GET, POST |
| Inventory | `/api/inventory` | GET, POST |
| Coupons | `/api/coupons` | GET, POST |
| Notifications | `/api/notifications` | GET, POST |
| Dashboard | `/api/dashboard/statistics` | GET |

### Gọi API từ Project Khác
```javascript
const API_URL = 'http://localhost:4001/api';

const response = await fetch(`${API_URL}/products`);
const data = await response.json();
```

### Tài liệu chi tiết
- 📚 [API Documentation](API.md) - Chi tiết tất cả endpoints
- 📖 [API Setup Guide](docs/API_SETUP_GUIDE.md) - Hướng dẫn setup và sử dụng
- 🧪 Test CORS: Mở `http://localhost:4001/api-test.html` sau khi chạy server

---

---

## 🎯 Mục tiêu Kiến thức
Sau bài Lab này, bạn sẽ làm chủ:
1.  **Next.js App Router:** Phân biệt layout lồng nhau, page server vs client.
2.  **Redux Toolkit:** Cách thiết kế state chuẩn chỉnh, tránh prop drilling.
3.  **TypeScript:** Định nghĩa kiểu dữ liệu chặt chẽ cho API response.
4.  **Mocking:** Kỹ thuật phát triển Frontend độc lập, không phụ thuộc Backend.

---

## Giai đoạn 1: Khởi tạo "Sân chơi" sạch sẽ

### Bước 1: Khởi tạo Project
**Hành động:**
Chạy lệnh tạo project với các tùy chọn tối ưu nhất hiện nay:
```bash
npx create-next-app@latest admin-rebuild
# Console sẽ hỏi -> Bạn chọn:
# TypeScript: Yes (Bắt buộc cho dự án lớn)
# ESLint: Yes (Để code sạch)
# Tailwind CSS: Yes (Style nhanh)
# src/ directory: Yes (Gom code gọn gàng)
# App Router: Yes (Công nghệ mới nhất)
# Import alias (@/*): Yes (Giúp import ngắn gọn)
```

**Tại sao?**
Việc dùng `src/` giúp tách biệt code nguồn với các file config ở root (như `next.config.js`, `.env`).

### Bước 2: Dọn dẹp rác (Clean Up)
Khi mới tạo, Next.js sinh ra rất nhiều code mẫu thừa thãi.
**Hành động:**
1.  Mở `src/app/page.tsx`: Xóa hết nội dung bên trong `return (...)`. Chỉ để lại `<h1>Admin Dashboard</h1>`.
2.  Mở `src/app/globals.css`: Xóa hết style CSS bên dưới 3 dòng `@tailwind`.
    *(Nếu không xóa, giao diện của bạn sẽ bị vỡ layout do CSS mặc định).*

---

## Giai đoạn 2: Xây dựng Core (Trái tim ứng dụng)

### Bước 3: Định nghĩa Type (Hợp đồng dữ liệu)
Trước khi code logic, phải biết dữ liệu trông như thế nào.
**Hành động:**
Tạo file `src/shared/types/product.ts`.
Viết interface mô tả sản phẩm:
```typescript
// Gợi ý:
export interface Product {
  id: string;
  name: string;
  price: number;
  status: 'active' | 'draft'; // Dùng Union Type cho an toàn
}
```

### Bước 4: Tạo Mock Data (Dữ liệu giả)
Chúng ta chưa có API thật, nên cần tự tạo dữ liệu để test UI.
**Hành động:**
Tạo file `src/mocks/productsMock.ts`.
Import interface `Product` ở trên và tạo mảng dữ liệu:
```typescript
export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'iPhone 15', price: 999, status: 'active' },
  // ... thêm 5-10 item nữa
];
```

### Bước 5: Viết Service giả lập API (Fake Service)
Component không nên import trực tiếp Mock Data. Nó phải gọi qua Service.
**Hành động:**
Tạo `src/core/services/productService.ts`.
Viết hàm giả lập độ trễ (delay) để giống mạng thật:
```typescript
// Hàm tiện ích delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const productService = {
  getProducts: async () => {
    await delay(1000); // Giả vờ mạng lag 1s -> Để test loading spinner
    return MOCK_PRODUCTS;
  }
};
```

---

## Giai đoạn 3: Quản lý State (Redux Toolkit)

Đây là phần khó nhất nhưng quan trọng nhất.

### Bước 6: Setup Redux Store
**Hành động 1 (Tạo Slice):** `src/features/products/productSlice.ts`
- Dùng `createAsyncThunk` để gọi `productService.getProducts()`.
- Dùng `createSlice` để quản lý 3 trạng thái: `items` (dữ liệu), `isLoading` (đang tải), `error` (lỗi).
- Trong `extraReducers`, xử lý 3 trường hợp của Thunk: `pending` (bật loading), `fulfilled` (lưu data), `rejected` (báo lỗi).

**Hành động 2 (Tạo Store):** `src/core/store/index.ts`
- Dùng `configureStore` để gộp `productSlice` vào.
- Export các hook `useAppDispatch` và `useAppSelector` (để dùng trong component mà không cần khai báo kiểu lại).

**Hành động 3 (Cung cấp Store cho React):** `src/providers/ReduxProvider.tsx`
- Tạo component `ReduxProvider` bọc `<Provider store={store}>`.
- **Lưu ý:** File này phải có dòng `'use client'` ở đầu (vì Redux cần context của React).

**Hành động 4 (Gắn vào Root):** `src/app/layout.tsx`
- Import `ReduxProvider` và bọc nó quanh `{children}`.

---

## Giai đoạn 4: Hiển thị lên UI

### Bước 7: Tạo trang Dashboard
**Hành động:**
Tạo file `src/app/(dashboard)/products/page.tsx`.
Logic trong component này:
1.  Lấy state từ kho: `const { items, isLoading } = useAppSelector(...)`.
2.  Gửi lệnh lấy hàng: `useEffect(() => { dispatch(fetchProducts()) }, [])`.
3.  **Render:**
    - Nếu `isLoading` -> Hiện chữ "Loading...".
    - Nếu có `items` -> Dùng `.map()` để in ra thẻ `<div>` hoặc `<table>`.

---

## ⚠️ Các lỗi thường gặp (Troubleshooting)

1.  **Lỗi:** `Error: Hooks can only be called inside of the body of a function component`.
    - **Nguyên nhân:** Bạn quên dòng `'use client'` ở đầu file Page hoặc Component dùng hook. Next.js mặc định là Server Component.

2.  **Lỗi:** Redux state không cập nhật.
    - **Kiểm tra:** Bạn đã bọc `ReduxProvider` trong `layout.tsx` chưa? Nếu chưa, component con không thể kết nối tới Store.

3.  **Lỗi:** Import path `../../` quá dài.
    - **Khắc phục:** Kiểm tra `tsconfig.json` đã cấu hình `paths: { "@/*": ["./src/*"] }` chưa. Dùng `@/features/...` cho gọn.
