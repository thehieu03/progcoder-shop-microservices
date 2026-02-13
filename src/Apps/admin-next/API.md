# Mock E-Commerce API Documentation

API giả lập cho phát triển e-commerce admin dashboard. Không cần database, data lưu trong memory.

## Base URL

```
http://localhost:3000/api
```

## CORS

API đã được cấu hình CORS, cho phép gọi từ các domain khác nhau:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:5173` (Vite)
- `http://localhost:8080`
- Và tất cả các domain khác (`*`)

## Response Format

### Success Response (Single Item)
```json
{
  "product": { ... }
}
```

### Success Response (List)
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

### Error Response
```json
{
  "error": "Error message"
}
```

## Endpoints

### 1. Products

#### List Products
```http
GET /api/products?pageIndex=1&pageSize=10
```

**Query Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| pageIndex | number | 1 | Page number |
| pageSize | number | 10 | Items per page (max 100) |
| all | boolean | false | Return all items without pagination |

#### Get Product by ID
```http
GET /api/products/{id}
```

#### Create Product
```http
POST /api/products
Content-Type: application/json

{
  "name": "iPhone 15 Pro Max",
  "sku": "IP15PM-256",
  "price": 1199,
  "salePrice": 1099,
  "shortDescription": "...",
  "longDescription": "...",
  "published": true,
  "featured": true,
  "status": 1,
  "displayStatus": "In Stock",
  "brandId": "...",
  "colors": ["Natural Titanium", "Blue Titanium"]
}
```

#### Update Product
```http
PUT /api/products/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 999
}
```

#### Delete Product
```http
DELETE /api/products/{id}
```

---

### 2. Orders

#### List Orders
```http
GET /api/orders?pageIndex=1&pageSize=10
```

#### Get Order by ID
```http
GET /api/orders/{id}
```

#### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "customerName": "Nguyen Van A",
  "customerEmail": "nguyenvana@example.com",
  "customerPhone": "0901234567",
  "shippingAddress": "123 Le Loi, District 1, Ho Chi Minh City",
  "billingAddress": "123 Le Loi, District 1, Ho Chi Minh City",
  "items": [
    {
      "productId": "...",
      "productName": "iPhone 15 Pro Max",
      "sku": "IP15PM-256",
      "quantity": 1,
      "unitPrice": 1199,
      "subtotal": 1199,
      "total": 1199
    }
  ],
  "subtotal": 1199,
  "tax": 119.9,
  "shippingFee": 10,
  "total": 1328.9,
  "paymentMethod": "Credit Card"
}
```

#### Update Order
```http
PUT /api/orders/{id}
Content-Type: application/json

{
  "status": 2,
  "paymentStatus": 1
}
```

#### Delete Order
```http
DELETE /api/orders/{id}
```

**Order Status:**
| Value | Status |
|-------|--------|
| 0 | Pending |
| 1 | Processing |
| 2 | Shipped |
| 3 | Delivered |
| 4 | Cancelled |

**Payment Status:**
| Value | Status |
|-------|--------|
| 0 | Pending |
| 1 | Paid |
| 2 | Failed |
| 3 | Refunded |

---

### 3. Categories

#### List Categories
```http
GET /api/categories
```

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| tree | boolean | Return tree structure |

#### Get Category by ID
```http
GET /api/categories/{id}
```

#### Create Category
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Electronics",
  "slug": "electronics",
  "description": "Electronic devices and accessories",
  "parentId": null
}
```

#### Update Category
```http
PUT /api/categories/{id}
Content-Type: application/json

{
  "name": "Updated Category"
}
```

#### Delete Category
```http
DELETE /api/categories/{id}
```

---

### 4. Brands

#### List Brands
```http
GET /api/brands?pageIndex=1&pageSize=10
```

#### Get Brand by ID
```http
GET /api/brands/{id}
```

#### Create Brand
```http
POST /api/brands
Content-Type: application/json

{
  "name": "Apple",
  "slug": "apple"
}
```

#### Update Brand
```http
PUT /api/brands/{id}
```

#### Delete Brand
```http
DELETE /api/brands/{id}
```

---

### 5. Inventory

#### List Inventory Items
```http
GET /api/inventory?pageIndex=1&pageSize=10
```

#### Get Inventory Item by ID
```http
GET /api/inventory/{id}
```

#### Create Inventory Item
```http
POST /api/inventory
Content-Type: application/json

{
  "productId": "...",
  "productName": "iPhone 15 Pro Max",
  "sku": "IP15PM-256",
  "quantity": 100,
  "reservedQuantity": 5,
  "availableQuantity": 95,
  "locationId": "...",
  "locationName": "Main Warehouse",
  "reorderPoint": 10,
  "reorderQuantity": 50
}
```

**Inventory Status:**
| Value | Status |
|-------|--------|
| 0 | In Stock |
| 1 | Low Stock |
| 2 | Out of Stock |

---

### 6. Coupons

#### List Coupons
```http
GET /api/coupons?pageIndex=1&pageSize=10
```

#### Get Coupon by ID
```http
GET /api/coupons/{id}
```

#### Create Coupon
```http
POST /api/coupons
Content-Type: application/json

{
  "code": "WELCOME2024",
  "name": "Welcome Discount",
  "description": "20% off for new customers",
  "discountType": 0,
  "discountValue": 20,
  "minOrderAmount": 50,
  "maxDiscountAmount": 100,
  "usageLimit": 100,
  "validFrom": "2024-01-01T00:00:00Z",
  "validTo": "2024-12-31T23:59:59Z",
  "active": true
}
```

**Discount Type:**
| Value | Type |
|-------|------|
| 0 | Percentage |
| 1 | Fixed Amount |

---

### 7. Notifications

#### List Notifications
```http
GET /api/notifications?pageIndex=1&pageSize=10
```

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| all | boolean | Return all notifications |
| unread | boolean | Filter unread only |
| top10 | boolean | Return top 10 |
| countUnread | boolean | Return unread count only |

#### Create Notification
```http
POST /api/notifications
Content-Type: application/json

{
  "title": "New Order",
  "message": "You have a new order #ORD-2024-0001",
  "type": "order"
}
```

#### Mark as Read
```http
POST /api/notifications
Content-Type: application/json

{
  "id": "...",
  "action": "markAsRead"
}
```

---

### 8. Dashboard

#### Get Dashboard Statistics
```http
GET /api/dashboard/statistics
```

**Response:**
```json
{
  "totalRevenue": 15423.50,
  "totalOrders": 150,
  "totalProducts": 50,
  "totalCustomers": 25,
  "growthRate": 15.5
}
```

#### Get Order Growth Data (Chart)
```http
GET /api/dashboard/statistics?type=orderGrowth
```

**Response:**
```json
{
  "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  "data": [65, 78, 90, 81, 96, 105]
}
```

#### Get Top Products Data (Chart)
```http
GET /api/dashboard/statistics?type=topProducts
```

**Response:**
```json
{
  "labels": ["iPhone 15 Pro Max", "MacBook Pro M3", "Samsung Galaxy S24 Ultra"],
  "data": [35, 25, 20]
}
```

---

## Usage Examples

### JavaScript/Fetch

```javascript
// Get all products
const response = await fetch('http://localhost:3000/api/products');
const data = await response.json();

// Create new product
const newProduct = await fetch('http://localhost:3000/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'New Product',
    sku: 'NEW-001',
    price: 99.99
  })
});
```

### Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Get products
const { data } = await api.get('/products?pageIndex=1&pageSize=10');

// Create order
const order = await api.post('/orders', {
  customerName: 'John Doe',
  items: [...]
});
```

### React Query

```javascript
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetch products
const { data: products } = useQuery({
  queryKey: ['products'],
  queryFn: () => fetch('http://localhost:3000/api/products').then(r => r.json())
});

// Create product mutation
const createProduct = useMutation({
  mutationFn: (product) => 
    fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    })
});
```

---

## Notes

1. **Data Persistence**: All data is stored in-memory and will reset when the server restarts.

2. **Delay Simulation**: API responses include realistic delay (200-500ms) to simulate real network conditions.

3. **ID Format**: All IDs are UUID v4 format (e.g., `f47ac10b-58cc-4372-a567-0e02b2c3d479`).

4. **Timestamps**: All timestamps are in ISO 8601 format.

5. **Error Handling**: Errors return appropriate HTTP status codes (400, 404, 500) with error message.

6. **Validation**: Basic validation is implemented (required fields, duplicate checks).

---

## Development

### Start Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

### External Access

To allow external devices to access the API:

```bash
# Get your local IP address
# Windows: ipconfig
# Mac/Linux: ifconfig

# Start Next.js on specific host
npm run dev -- -H 0.0.0.0

# Now other devices can access via:
# http://YOUR_IP:3000/api
```

---

## API Client Service

Project đã có sẵn `mockApiService.ts` để sử dụng:

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
```
