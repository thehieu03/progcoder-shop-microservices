# Day 02: Configuration (Theme, Types, CSS)

## 🎯 Mục tiêu hôm nay
- Theme configuration
- TypeScript types
- Global CSS
- i18n config

## 1. Theme Config (src/configs/themeConfig.ts)

```typescript
export type SkinMode = "default" | "bordered";
export type ContentWidth = "full" | "boxed";
export type MenuLayoutType = "vertical" | "horizontal";
export type NavbarType = "sticky" | "static" | "floating" | "hidden";
export type FooterType = "sticky" | "static" | "hidden";

const themeConfig = {
  layout: {
    skin: "default" as SkinMode,
    contentWidth: "full" as ContentWidth,
    type: "vertical" as MenuLayoutType,
    navBarType: "sticky" as NavbarType,
    footerType: "static" as FooterType,
    menu: {
      isCollapsed: false,
      isHidden: false,
    },
    customizer: true,
    darkMode: false,
    semiDarkMode: false,
    isRTL: false,
    mobileMenu: false,
    isMonochrome: false,
  },
};

export default themeConfig;
```

## 2. TypeScript Types

### src/types/common.types.ts
```typescript
export type Guid = string;

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}
```

### src/types/api.ts
```typescript
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiError {
  message: string;
  errors?: Array<{
    errorMessage: string;
    details?: string;
  }>;
}

export interface PaginationParams {
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

### src/types/catalog.ts
```typescript
export type ProductStatus = 'draft' | 'published' | 'archived';

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  status: ProductStatus;
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  description?: string;
  imageUrl?: string;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  children?: Category[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}
```

### src/types/order.ts
```typescript
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  billingAddress: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  note?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}
```

### src/types/index.ts
```typescript
export * from './common.types';
export * from './api';
export * from './catalog';
export * from './order';
```

## 3. Global CSS (src/app/globals.css)

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
  --primary: #3b82f6;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --secondary: #64748b;
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #3b82f6;
}

.dark {
  --background: #0f172a;
  --foreground: #f8fafc;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: 'Inter', system-ui, sans-serif;
}

/* Form Controls */
.form-control {
  @apply w-full px-3 py-2 border border-slate-300 rounded-lg outline-none transition-all;
  @apply focus:border-primary-500 focus:ring-2 focus:ring-primary-200;
  @apply dark:bg-slate-700 dark:border-slate-600 dark:text-white;
}

.form-control.has-error {
  @apply border-red-500 focus:border-red-500 focus:ring-red-200;
}

/* Buttons */
.btn {
  @apply inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg transition-colors;
}

.btn-primary {
  @apply bg-primary-500 text-white hover:bg-primary-600;
}

.btn-dark {
  @apply bg-slate-800 text-white hover:bg-slate-900;
}

.btn-outline {
  @apply border border-slate-300 text-slate-700 hover:bg-slate-50;
  @apply dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700;
}

/* Card */
.card {
  @apply bg-white dark:bg-slate-800;
}

.card-header {
  @apply px-6 py-4 border-b border-slate-200 dark:border-slate-700;
}

.card-title {
  @apply text-lg font-semibold text-slate-900 dark:text-white;
}

.card-body {
  @apply p-6;
}

/* Table */
.table-th {
  @apply px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider;
  @apply dark:text-slate-400;
}

.table-td {
  @apply px-4 py-3 text-sm text-slate-700;
  @apply dark:text-slate-300;
}

/* Status Badges */
.badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

/* Skin classes */
.skin--default {
  --card-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.skin--bordered {
  --card-shadow: none;
}

/* RTL Support */
[dir="rtl"] .ltr\:mr-2 {
  margin-right: 0;
  margin-left: 0.5rem;
}

[dir="rtl"] .ltr\:ml-2 {
  margin-left: 0;
  margin-right: 0.5rem;
}
```

## 4. i18n Config (src/i18n/config.ts)

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import vi from './locales/vi.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### src/i18n/locales/en.json
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "search": "Search",
    "loading": "Loading...",
    "signIn": "Sign In",
    "signOut": "Sign Out"
  },
  "auth": {
    "signInToAccount": "Sign in to your account"
  },
  "products": {
    "title": "Products",
    "addProduct": "Add Product",
    "search": "Search products..."
  },
  "orders": {
    "title": "Orders",
    "pending": "Pending",
    "confirmed": "Confirmed",
    "processing": "Processing",
    "shipped": "Shipped",
    "delivered": "Delivered",
    "cancelled": "Cancelled",
    "refunded": "Refunded"
  }
}
```

### src/i18n/locales/vi.json
```json
{
  "common": {
    "save": "Lưu",
    "cancel": "Hủy",
    "delete": "Xóa",
    "edit": "Sửa",
    "create": "Tạo mới",
    "search": "Tìm kiếm",
    "loading": "Đang tải...",
    "signIn": "Đăng nhập",
    "signOut": "Đăng xuất"
  },
  "auth": {
    "signInToAccount": "Đăng nhập vào tài khoản của bạn"
  },
  "products": {
    "title": "Sản phẩm",
    "addProduct": "Thêm sản phẩm",
    "search": "Tìm kiếm sản phẩm..."
  },
  "orders": {
    "title": "Đơn hàng",
    "pending": "Chờ xác nhận",
    "confirmed": "Đã xác nhận",
    "processing": "Đang xử lý",
    "shipped": "Đang giao",
    "delivered": "Đã giao",
    "cancelled": "Đã hủy",
    "refunded": "Đã hoàn tiền"
  }
}
```

✅ **Kết quả Day 2:** 
- Theme config hoạt động
- Types đầy đủ
- CSS có dark mode
- i18n sẵn sàng

---

## 📋 Checklist Day 2

- [ ] themeConfig.ts đúng types
- [ ] Tất cả types định nghĩa xong
- [ ] globals.css có dark mode
- [ ] i18n config hoạt động
- [ ] Không lỗi TypeScript

**Sang Day 3 → Redux Store Core**
