# Hướng Dẫn Setup Mock API

## Tổng Quan

Project đã được setup sẵn Mock API sử dụng Next.js API Routes. Data được lưu trong memory (không cần database).

## Cấu Trúc API

```
src/app/api/
├── _lib/
│   ├── mockStore.ts      # In-memory data store
│   ├── utils.ts          # API utilities (response helpers, pagination)
│   └── cors.ts           # CORS configuration
├── route.ts              # Root API info
├── products/
│   ├── route.ts          # GET /api/products, POST /api/products
│   └── [id]/route.ts     # GET/PUT/DELETE /api/products/{id}
├── orders/
│   ├── route.ts
│   └── [id]/route.ts
├── categories/
│   ├── route.ts
│   └── [id]/route.ts
├── brands/
│   ├── route.ts
│   └── [id]/route.ts
├── inventory/
│   ├── route.ts
│   └── [id]/route.ts
├── coupons/
│   ├── route.ts
│   └── [id]/route.ts
├── notifications/
│   └── route.ts
└── dashboard/
    └── statistics/
        └── route.ts
```

## Cách Sử Dụng

### 1. Khởi động server

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:4001`

### 2. Gọi API từ Project Khác

#### JavaScript/Fetch
```javascript
const API_URL = 'http://localhost:4001/api';

// Lấy danh sách sản phẩm
const response = await fetch(`${API_URL}/products?pageIndex=1&pageSize=10`);
const data = await response.json();

// Tạo sản phẩm mới
const newProduct = await fetch(`${API_URL}/products`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'New Product',
    sku: 'NEW-001',
    price: 99.99
  })
});
```

#### Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4001/api',
  headers: { 'Content-Type': 'application/json' }
});

const products = await api.get('/products');
const orders = await api.get('/orders');
```

#### Sử dụng mockApiService (khuyến nghị)

```typescript
import { mockApi } from '@/services/mockApiService';

// Products
const products = await mockApi.products.getList(1, 10);
const product = await mockApi.products.getById('...');
await mockApi.products.create({ name: '...', sku: '...', price: 99 });

// Orders
const orders = await mockApi.orders.getList();
await mockApi.orders.create({ customerName: '...', items: [...] });

// Dashboard
const stats = await mockApi.dashboard.getStatistics();
const growth = await mockApi.dashboard.getOrderGrowth();
```

## CORS Configuration

API đã được cấu hình CORS để cho phép gọi từ các domain khác:

```typescript
// next.config.ts
async headers() {
  return [
    {
      source: "/api/:path*",
      headers: [
        { key: "Access-Control-Allow-Origin", value: "*" },
        { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, PATCH, OPTIONS" },
        { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
      ],
    },
  ];
}
```

## Test CORS

Mở file `public/api-test.html` trực tiếp trong browser hoặc chạy trên port khác:

```bash
# Cách 1: Mở trực tiếp
code public/api-test.html

# Cách 2: Serve trên port khác
npx serve public/api-test.html -p 8080
```

Sau đó mở `http://localhost:8080/api-test.html` và click "Test Tất Cả".

## Danh Sách Endpoints

| Endpoint | Methods | Mô tả |
|----------|---------|-------|
| `/api` | GET | API info |
| `/api/products` | GET, POST | List/Create products |
| `/api/products/{id}` | GET, PUT, DELETE | Product operations |
| `/api/orders` | GET, POST | List/Create orders |
| `/api/orders/{id}` | GET, PUT, DELETE | Order operations |
| `/api/categories` | GET, POST | List/Create categories |
| `/api/categories/{id}` | GET, PUT, DELETE | Category operations |
| `/api/brands` | GET, POST | List/Create brands |
| `/api/brands/{id}` | GET, PUT, DELETE | Brand operations |
| `/api/inventory` | GET, POST | List/Create inventory |
| `/api/inventory/{id}` | GET, PUT, DELETE | Inventory operations |
| `/api/coupons` | GET, POST | List/Create coupons |
| `/api/coupons/{id}` | GET, PUT, DELETE | Coupon operations |
| `/api/notifications` | GET, POST | List/Create notifications |
| `/api/dashboard/statistics` | GET | Dashboard stats |

## Query Parameters

### Pagination
- `pageIndex`: Số trang (default: 1)
- `pageSize`: Số item mỗi trang (default: 10, max: 100)
- `all=true`: Lấy tất cả (không phân trang)

### Categories
- `tree=true`: Trả về dạng cây

### Notifications
- `unread=true`: Chỉ lấy chưa đọc
- `top10=true`: Lấy 10 cái đầu
- `countUnread=true`: Đếm số chưa đọc

### Dashboard
- `type=orderGrowth`: Data cho biểu đồ tăng trưởng
- `type=topProducts`: Data cho biểu đồ sản phẩm bán chạy

## Response Format

### Success (List)
```json
{
  "items": [...],
  "totalCount": 100,
  "pageIndex": 1,
  "pageSize": 10,
  "totalPages": 10,
  "hasPreviousPage": false,
  "hasNextPage": true
}
```

### Success (Single)
```json
{
  "product": { ... }
}
```

### Error
```json
{
  "error": "Error message"
}
```

## Mock Data

Data mẫu được định nghĩa trong:
- `src/mock/services/catalog.mock.ts` - Products, Categories, Brands
- `src/mock/services/order.mock.ts` - Orders
- `src/mock/services/inventory.mock.ts` - Inventory
- `src/mock/services/discount.mock.ts` - Coupons
- `src/mock/services/notification.mock.ts` - Notifications

## Lưu Ý

1. **Data Persistence**: Data lưu trong memory, sẽ mất khi restart server
2. **Delay**: API có delay giả lập (200-500ms)
3. **Validation**: Có validate required fields và duplicate checks
4. **IDs**: UUID v4 format

## Thêm API Mới

Ví dụ thêm `/api/customers`:

1. Tạo file `src/app/api/customers/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { mockStore, generateGuid } from "../_lib/mockStore";
import { successResponse, errorResponse, getPaginationParams, simulateDelay } from "../_lib/utils";

export async function GET(request: NextRequest) {
  await simulateDelay(300);
  try {
    const { searchParams } = new URL(request.url);
    const { pageIndex, pageSize } = getPaginationParams(searchParams);
    const result = mockStore.paginate(mockStore.customers || [], pageIndex, pageSize);
    return successResponse(result);
  } catch (error) {
    return errorResponse("Failed to fetch customers", 500);
  }
}

export async function POST(request: NextRequest) {
  await simulateDelay(400);
  try {
    const body = await request.json();
    if (!body.name || !body.email) {
      return errorResponse("Name and email are required");
    }
    const newCustomer = {
      id: generateGuid(),
      ...body,
      created: new Date().toISOString(),
    };
    if (!mockStore.customers) mockStore.customers = [];
    mockStore.customers.push(newCustomer);
    return successResponse({ customer: newCustomer }, 201);
  } catch (error) {
    return errorResponse("Failed to create customer", 500);
  }
}
```

2. Thêm vào `mockStore`:

```typescript
// src/app/api/_lib/mockStore.ts
class MockStore {
  // ... existing code
  customers: any[] = [];
}
```

3. Thêm vào `mockApiService.ts`:

```typescript
export const mockCustomerApi = {
  getList: (pageIndex = 1, pageSize = 10) => 
    apiClient.get(`/customers?pageIndex=${pageIndex}&pageSize=${pageSize}`),
  create: (data: any) => apiClient.post("/customers", data),
};
```

## Tài Liệu Tham Khảo

Xem thêm: `API.md` (đầy đủ chi tiết về tất cả endpoints)
