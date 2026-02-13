# COMPLETE CODE GUIDE - 100% GIỐNG CODE THỰC TẾ

> File này chứa toàn bộ code cần thiết để replicate project giống 100%

---

## 📁 CẤU TRÚC THƯ MỤC (579 FILES)

```
src/
├── api/                          # API Layer
│   ├── axiosInstance.ts         # 448 lines - Axios với interceptors
│   ├── endpoints.ts             # 185 lines - API endpoints
│   ├── index.ts
│   └── mockServer.ts            # 895 lines - MirageJS mock
│
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth route group
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   ├── (dashboard)/             # Dashboard route group
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── create-product/
│   │   │   └── page.tsx
│   │   ├── edit-product/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   ├── brands/
│   │   │   └── page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx
│   │   │   └── create/
│   │   │       └── page.tsx
│   │   ├── coupons/
│   │   │   └── page.tsx
│   │   ├── create-coupon/
│   │   │   └── page.tsx
│   │   ├── edit-coupon/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── inventories/
│   │   │   └── page.tsx
│   │   ├── edit-inventory/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── customers/
│   │   │   └── page.tsx
│   │   ├── notifications/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   ├── invoice/
│   │   │   └── page.tsx
│   │   ├── invoice-add/
│   │   │   └── page.tsx
│   │   ├── invoice-edit/
│   │   │   └── page.tsx
│   │   ├── invoice-preview/
│   │   │   └── page.tsx
│   │   └── utility/
│   │       ├── blog/
│   │       ├── faq/
│   │       └── pricing/
│   ├── globals.css              # Global CSS
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Root redirect
│   └── not-found.tsx
│
├── assets/
│   ├── css/
│   │   └── app.css              # App styles (external file)
│   └── images/                  # All images
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx        # 75 lines
│   │   └── RootRedirect.tsx
│   ├── dashboard/
│   │   ├── ecommerce.tsx
│   │   └── HomeBreadcrumbs.tsx
│   ├── layout/
│   │   └── DashboardLayoutClient.tsx
│   ├── partials/                # 76+ components
│   │   ├── auth/
│   │   ├── brand/
│   │   ├── cart/
│   │   ├── category/
│   │   ├── chart/
│   │   ├── coupon/
│   │   ├── ecommerce/
│   │   ├── footer/
│   │   ├── header/
│   │   ├── inventory/
│   │   ├── invoice/
│   │   ├── orders/
│   │   ├── product/
│   │   ├── settings/
│   │   ├── sidebar/
│   │   ├── Table/
│   │   ├── utility/
│   │   └── widget/
│   ├── skeleton/
│   │   ├── Grid.tsx
│   │   ├── ListLoading.tsx
│   │   └── Table.tsx
│   └── ui/                      # 25 UI Components
│       ├── Accordion.tsx
│       ├── Alert.tsx
│       ├── Badge.tsx
│       ├── Breadcrumbs.tsx
│       ├── Button.tsx           # 208 lines
│       ├── Card.tsx             # 54 lines
│       ├── Checkbox.tsx
│       ├── Dropdown.tsx
│       ├── Fileinput.tsx
│       ├── FormGroup.tsx
│       ├── Icon.tsx
│       ├── Image.tsx
│       ├── InputGroup.tsx
│       ├── Modal.tsx
│       ├── Pagination.tsx
│       ├── Popover.tsx
│       ├── ProgressBar/
│       ├── Radio.tsx
│       ├── Select.tsx
│       ├── Split-dropdown.tsx
│       ├── Switch.tsx
│       ├── Textarea.tsx
│       ├── Textinput.tsx        # 183 lines
│       ├── Tooltip.tsx
│       └── VideoPlayer.tsx
│
├── configs/
│   └── themeConfig.ts           # Theme configuration
│
├── constant/
│   ├── apex-chart.ts
│   ├── data.ts
│   └── table-data.ts
│
├── contexts/
│   └── KeycloakContext.tsx      # 320 lines
│
├── core/
│   ├── api/
│   ├── services/
│   │   ├── keycloakService.ts   # 379 lines
│   │   └── productService.ts
│   └── store/
│       └── index.ts
│
├── features/
│   ├── auth/
│   │   └── authSlice.ts
│   └── products/
│       └── productSlice.ts      # 50 lines
│
├── hooks/                       # 14 Hooks
│   ├── useContentWidth.ts
│   ├── useDarkMode.ts
│   ├── useFooterType.ts
│   ├── useMenuHidden.ts
│   ├── useMenulayout.ts
│   ├── useMenuTranslation.ts
│   ├── useMobileMenu.ts
│   ├── useMonoChrome.ts
│   ├── useNavbarType.ts
│   ├── useRtl.ts
│   ├── useSemiDark.ts
│   ├── useSidebar.ts
│   ├── useSkin.ts               # 34 lines
│   └── useWidth.ts
│
├── i18n/                        # Internationalization
│   ├── config.ts
│   └── locales/
│       ├── en.json
│       └── vi.json
│
├── mock/                        # Mock data
│   ├── brands.ts
│   ├── categories.ts
│   ├── products.ts
│   └── services/
│       ├── catalog.mock.ts
│       ├── discount.mock.ts
│       ├── inventory.mock.ts
│       ├── notification.mock.ts
│       ├── order.mock.ts
│       └── report.mock.ts
│
├── providers/
│   ├── AppProviders.tsx
│   ├── ReduxProvider.tsx
│   └── StoreProvider.tsx
│
├── services/                    # 8 Services
│   ├── catalogService.ts
│   ├── discountService.ts
│   ├── inventoryService.ts
│   ├── keycloakService.ts
│   ├── notificationService.ts
│   ├── orderService.ts
│   ├── reportService.ts
│   └── signalRService.ts        # 292 lines
│
├── shared/
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthGuard.tsx
│   │   └── layout/
│   │       └── Sidebar.tsx
│   └── types/
│       └── product.ts
│
├── store/                       # Redux Store
│   ├── index.ts                 # 17 lines
│   ├── rootReducer.ts           # 11 lines
│   ├── layout.ts                # 159 lines
│   ├── api/
│   │   ├── apiSlice.ts          # 22 lines
│   │   ├── auth/
│   │   │   ├── authApiSlice.ts
│   │   │   └── authSlice.ts
│   │   ├── shop/
│   │   │   ├── action.ts
│   │   │   ├── cartSlice.ts
│   │   │   └── shopApiSlice.ts
│   │   └── app/
│   │       └── calendarSlice.ts
│   └── types/
│       └── store.types.ts
│
├── types/                       # TypeScript Types
│   ├── index.ts
│   ├── api.ts
│   ├── auth.types.ts
│   ├── catalog.ts
│   ├── common.types.ts
│   ├── discount.ts
│   ├── inventory.ts
│   ├── keycloak.ts
│   ├── notification.ts
│   ├── order.ts
│   ├── report.ts
│   ├── signalr.ts
│   └── store.types.ts
│
├── utils/
│   ├── cookies.ts               # Cookie utilities
│   ├── format.ts                # Format utilities
│   └── http-client.ts
│
└── middleware.ts                # Next.js middleware
```

---

## 🚀 CÁCH SỬ DỤNG FILE NÀY

**KHÔNG THỂ** copy từng file từ docs vì quá nhiều (579 files).

**GIẢI PHÁP:**
1. Sử dụng code trong `src/` của project hiện tại làm reference
2. Các file docs days/ chỉ là hướng dẫn cơ bản
3. Để có 100% giống, **COPY TRỰC TIẾP** từ `D:\progcoder-shop-microservices\src\Apps\admin-next\src`

---

## 📋 CÁC FILES QUAN TRỌNG NHẤT (Copy trước)

### 1. Core Configuration
- `package.json` - Dependencies
- `next.config.ts` - Next.js config
- `tsconfig.json` - TypeScript config
- `tailwind.config.ts` - Tailwind config

### 2. Global Styles
- `src/app/globals.css`
- `src/assets/css/app.css`

### 3. Core Components
- `src/components/ui/Button.tsx` (208 lines)
- `src/components/ui/Card.tsx` (54 lines)
- `src/components/ui/Textinput.tsx` (183 lines)

### 4. Store
- `src/store/index.ts`
- `src/store/layout.ts` (159 lines)
- `src/store/api/apiSlice.ts`

### 5. Services
- `src/services/signalRService.ts` (292 lines)
- `src/contexts/KeycloakContext.tsx` (320 lines)
- `src/api/mockServer.ts` (895 lines)

---

## ⚠️ LƯU Ý QUAN TRỌNG

Docs chỉ có thể chứa **~10-20%** codebase. Để replicate 100%:

```bash
# Cách tốt nhất: Copy trực tiếp từ source
cp -r D:\progcoder-shop-microservices\src\Apps\admin-next\src new-project\src
cp D:\progcoder-shop-microservices\src\Apps\admin-next\package.json new-project\
cp D:\progcoder-shop-microservices\src\Apps\admin-next\next.config.ts new-project\
```

---

**KẾT LUẬN:**
- Docs days/ chỉ là **hướng dẫn cơ bản**
- Để giống 100%, cần **reference đến source code gốc**
- File này là **index** cho toàn bộ project structure
