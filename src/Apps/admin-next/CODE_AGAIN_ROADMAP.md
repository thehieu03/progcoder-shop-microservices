# 🗺️ ROADMAP CODE LẠI PROJECT (Giống 100%)

> **Tổng thờI gian ước tính:** 4-6 tuần (nếu code full-time)  
> **Độ phức tạp:** Cao - 10 modules, 24 UI components, nhiều integrations

---

## 📋 CHECKLIST TỔNG QUAN

- [ ] **Phase 1:** Foundation (1-2 ngày)
- [ ] **Phase 2:** Core Architecture (2-3 ngày)
- [ ] **Phase 3:** UI Components (5-7 ngày)
- [ ] **Phase 4:** Authentication (2-3 ngày)
- [ ] **Phase 5-11:** Business Modules (10-14 ngày)
- [ ] **Phase 12-16:** Advanced Features (5-7 ngày)

---

## 🚀 PHASE 1: PROJECT FOUNDATION

### Bước 1.1: Khởi tạo Project
```bash
npx create-next-app@latest admin-next --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm

# Cài dependencies core
npm install @reduxjs/toolkit react-redux axios
npm install @microsoft/signalr keycloak-js
npm install react-hook-form yup @hookform/resolvers
npm install react-toastify react-i18next i18next i18next-browser-languagedetector
npm install @iconify/react clsx
npm install @headlessui/react
npm install miragejs faker-js/faker --save-dev
```

### Bước 1.2: Cấu trúc Thư mục
Tạo đầy đủ cấu trúc thư mục như phân tích ở trên.

### Bước 1.3: Config Files
- `next.config.ts` với `output: 'standalone'`
- `tsconfig.json` (đã có sẵn khi create)
- `tailwind.config.ts` (Tailwind v4 dùng CSS config)
- `postcss.config.mjs`
- `.env.local` template

---

## 🏗️ PHASE 2: CORE ARCHITECTURE

### Bước 2.1: Type Definitions (src/types/)
Tạo đầy đủ 12 files types:
1. `api.ts` - ApiResponse, PaginatedResponse, ApiError
2. `common.types.ts` - BaseComponentProps, SelectOption
3. `auth.types.ts` - User, TokenPair, LoginRequest
4. `store.types.ts` - RootState, AppDispatch
5. `catalog.ts` - ProductDto, CategoryDto, BrandDto
6. `order.ts` - OrderDto, OrderItemDto, OrderStatus
7. `discount.ts` - CouponDto, DiscountType
8. `inventory.ts` - InventoryItemDto, LocationDto
9. `notification.ts` - NotificationDto, NotificationType
10. `report.ts` - DashboardStatisticsDto
11. `keycloak.ts` - KeycloakAppConfig
12. `signalr.ts` - ISignalRService

### Bước 2.2: API Layer (src/api/)
- `axiosInstance.ts` - Axios config + interceptors
- `endpoints.ts` - Tất cả API endpoints
- `index.ts` - Exports

### Bước 2.3: Redux Store (src/store/)
```typescript
// src/store/index.ts
- configureStore với RTK Query
- Setup Redux DevTools
- Export useAppDispatch, useAppSelector

// src/store/rootReducer.ts
- Combine layout, auth, cart, api slices

// src/store/layout.ts
- Layout state (sidebar, theme, etc.)

// src/store/api/apiSlice.ts
- RTK Query base API
- Axios base query adapter
```

### Bước 2.4: Providers (src/providers/)
- `ReduxProvider.tsx` - Redux store provider
- `AppProviders.tsx` - Tổng hợp tất cả providers

---

## 🎨 PHASE 3: UI COMPONENTS (24 components)

Code tuần tự từng component trong `src/components/ui/`:

| STT | Component | Props chính | Ghi chú |
|-----|-----------|-------------|---------|
| 1 | Button | variant, size, loading, disabled | Primary, secondary, danger |
| 2 | Card | title, children, className | Header + body |
| 3 | Textinput | label, error, ...props | Có label và error message |
| 4 | Textarea | label, error, rows | Multi-line |
| 5 | Select | options, value, onChange | Dropdown |
| 6 | Checkbox | label, checked, onChange | Form checkbox |
| 7 | Radio | label, checked, onChange | Radio button |
| 8 | Switch | checked, onChange | Toggle |
| 9 | Modal | active, onClose, title | Dialog |
| 10 | Tooltip | content, placement | Hover tooltip |
| 11 | Popover | content, trigger | Click popover |
| 12 | Badge | variant, children | Status badges |
| 13 | Alert | type, message | Success, error, warning |
| 14 | Breadcrumbs | items | Navigation |
| 15 | Dropdown | items, trigger | Menu dropdown |
| 16 | Fileinput | onChange, accept | File upload |
| 17 | FormGroup | label, error, children | Wrapper |
| 18 | Icon | icon, className | Iconify wrapper |
| 19 | Image | src, alt, fallback | Có fallback |
| 20 | InputGroup | prepend, append, input | Input addons |
| 21 | Pagination | page, total, onChange | Page navigation |
| 22 | ProgressBar | value, max, variant | Progress |
| 23 | Split-dropdown | items, mainAction | Split button |
| 24 | VideoPlayer | src, poster | Video embed |

---

## 🔐 PHASE 4: AUTHENTICATION (Keycloak)

### Bước 4.1: Keycloak Service (src/services/keycloakService.ts)
- Khởi tạo Keycloak instance
- Login/logout methods
- Token refresh logic
- Cookie storage

### Bước 4.2: Keycloak Context (src/contexts/KeycloakContext.tsx)
- React Context provider
- Auth state management
- Auto token refresh

### Bước 4.3: Auth Guard (src/shared/components/auth/AuthGuard.tsx)
- Route protection HOC
- Redirect nếu chưa login

### Bước 4.4: Auth Pages (src/app/(auth)/)
- `login/page.tsx` - Login form
- `register/page.tsx` - Register form
- `forgot-password/page.tsx` - Forgot password
- `layout.tsx` - Auth layout (không có sidebar)

### Bước 4.5: Middleware (src/middleware.ts)
- Cookie-based auth check
- Redirect logic

---

## 📦 PHASE 5: PRODUCTS MODULE

### Bước 5.1: Service Layer (src/services/catalogService.ts)
```typescript
- getProducts(params) - Paginated
- getProductById(id)
- createProduct(data)
- updateProduct(id, data)
- deleteProduct(id)
- publishProduct(id)
- unpublishProduct(id)
```

### Bước 5.2: Redux Slice (src/features/products/productSlice.ts)
- State: items, isLoading, error
- Async thunks: fetchProducts, createProduct, updateProduct

### Bước 5.3: Components
- `src/components/partials/product/product-list.tsx`
- `src/components/partials/product/create-product.tsx`
- `src/components/partials/product/edit-product.tsx`
- `src/components/partials/product/product-details.tsx`

### Bước 5.4: Pages
- `src/app/(dashboard)/products/page.tsx`
- `src/app/(dashboard)/products/[id]/page.tsx`
- `src/app/(dashboard)/create-product/page.tsx`
- `src/app/(dashboard)/edit-product/[id]/page.tsx`

---

## 📂 PHASE 6: CATEGORIES & BRANDS

Tương tự Products nhưng đơn giản hơn:
- Service: CRUD operations
- Components: List, Form (Create/Edit)
- Pages: /categories, /brands

---

## 📋 PHASE 7: ORDERS MODULE

### Bước 7.1: Service (src/services/orderService.ts)
- getOrders, getOrderById
- createOrder, updateOrder
- updateOrderStatus (quan trọng)

### Bước 7.2: Components
- `src/components/partials/orders/index.tsx` - Order list table
- `src/components/partials/orders/details.tsx` - Order detail
- `src/components/partials/orders/create.tsx` - Create order
- `src/components/partials/orders/edit.tsx` - Edit order

### Bước 7.3: Pages
- `/orders` - List
- `/orders/[id]` - Detail
- `/orders/[id]/edit` - Edit
- `/orders/create` - Create

---

## 🎟️ PHASE 8: COUPONS MODULE

### Bước 8.1: Service (src/services/discountService.ts)
- getCoupons, getCouponById
- createCoupon, updateCoupon, deleteCoupon
- approveCoupon, rejectCoupon
- updateValidityPeriod

### Bước 8.2: Components
- `src/components/partials/coupon/index.tsx`
- `src/components/partials/coupon/create-coupon.tsx`
- `src/components/partials/coupon/edit-coupon.tsx`

### Bước 8.3: Pages
- `/coupons`
- `/create-coupon`
- `/edit-coupon/[id]`

---

## 📦 PHASE 9: INVENTORY MODULE

### Bước 9.1: Service (src/services/inventoryService.ts)
- getInventoryItems
- getLocations
- increaseStock, decreaseStock
- getHistory, getReservations

### Bước 9.2: Components
- `src/components/partials/inventory/index.tsx`
- `src/components/partials/inventory/edit-inventory.tsx`

### Bước 9.3: Pages
- `/inventories`
- `/edit-inventory/[id]`

---

## 👥 PHASE 10: CUSTOMERS MODULE

- `src/app/(dashboard)/customers/page.tsx`
- `src/components/partials/product/customers.tsx`
- Service: Customer CRUD

---

## 📄 PHASE 11: INVOICES MODULE

### Components:
- `src/components/partials/invoice/index.tsx`
- `src/components/partials/invoice/invoice-add.tsx`
- `src/components/partials/invoice/invoice-edit.tsx`
- `src/components/partials/invoice/invoice-preview.tsx`
- `src/components/partials/invoice/Repeater.tsx`
- `src/components/partials/invoice/TotalTable.tsx`

### Pages:
- `/invoice`
- `/invoice-add`
- `/invoice-edit`
- `/invoice-preview`
- `/invoice-ecommerce`

---

## 🔔 PHASE 12: NOTIFICATIONS + SIGNALR

### Bước 12.1: SignalR Service (src/services/signalRService.ts)
- Connection management
- Auto-reconnect logic
- Callback registry

### Bước 12.2: Notification Service
- `src/services/notificationService.ts`
- getNotifications, markAsRead
- getUnreadCount, getTop10Unread

### Bước 12.3: Components
- `src/components/partials/header/Tools/Notification.tsx` - Bell icon + dropdown
- `src/app/(dashboard)/notifications/page.tsx` - Notification list page

### Bước 12.4: Integration
- Kết nối SignalR trong DashboardLayout
- Dispatch notification khi nhận message

---

## 📊 PHASE 13: DASHBOARD + CHARTS

### Bước 13.1: Report Service (src/services/reportService.ts)
- getDashboardStatistics
- getOrderGrowthStatistics
- getTopProductStatistics

### Bước 13.2: Chart Components (src/components/partials/widget/chart/)
Code 16+ chart components:
- BasicArea, donut-chart, earning-chart
- order-chart, profit-chart, revenue-bar-chart
- radar-chart, visitor-radar, etc.

### Bước 13.3: Dashboard Page
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/components/dashboard/ecommerce.tsx`

---

## 🎭 PHASE 14: MOCK SERVICES (MirageJS)

### Bước 14.1: Mock Server (src/api/mockServer.ts)
Setup MirageJS với:
- 8 models (product, order, customer, category, brand, inventory, coupon, notification)
- Full CRUD routes
- Seed data

### Bước 14.2: Mock Data Files
- `src/mock/services/catalog.mock.ts`
- `src/mock/services/order.mock.ts`
- `src/mock/services/inventory.mock.ts`
- `src/mock/services/discount.mock.ts`
- `src/mock/services/notification.mock.ts`
- `src/mock/services/report.mock.ts`

---

## 🌍 PHASE 15: I18N + THEME

### Bước 15.1: i18n Config (src/i18n/)
- `config.ts` - i18next setup
- `locales/en.json` - English
- `locales/vi.json` - Vietnamese

### Bước 15.2: Theme System
- `src/configs/themeConfig.ts`
- 14 custom hooks trong `src/hooks/`
- Dark mode, RTL, Skin, Layout configs

### Bước 15.3: Layout Components
- `src/components/layout/DashboardLayoutClient.tsx`
- `src/components/partials/sidebar/index.tsx`
- `src/components/partials/header/index.tsx`
- `src/components/partials/footer/index.tsx`

---

## ✅ PHASE 16: TESTING & POLISH

### Checklist cuối cùng:
- [ ] Tất cả routes hoạt động
- [ ] Auth flow đầy đủ
- [ ] CRUD tất cả modules
- [ ] Real-time notifications
- [ ] Responsive design
- [ ] Dark mode hoạt động
- [ ] i18n chuyển đổi ngôn ngữ
- [ ] Mock data hiển thị đúng
- [ ] Build thành công (`npm run build`)
- [ ] Không còn lỗi ESLint

---

## 💡 TIPS QUAN TRỌNG

1. **Code từng module một**, test kỹ trước khi sang module tiếp theo
2. **Dùng mock data ngay từ đầu**, không cần đợi backend
3. **Copy styles từ project cũ** để đảm bảo giống 100%
4. **Test responsive** trên mobile, tablet, desktop
5. **Viết types đầy đủ**, không dùng `any`
6. **Reuse components**, không copy-paste code

---

## 📚 THAM KHẢO CODE

Khi code, tham khảo trực tiếp từ project hiện tại:
- Copy logic từ `src/services/`
- Copy types từ `src/types/`
- Copy UI từ `src/components/ui/`
- Copy styles từ `src/app/globals.css`

---

**Sẵn sàng bắt đầu chưa?** 🚀
