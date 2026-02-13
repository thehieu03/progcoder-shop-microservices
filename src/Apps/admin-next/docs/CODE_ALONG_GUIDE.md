# HƯỚNG DẪN CODE LẠI TỪNG BƯỚC (ĐỂ HỌC)

> Code theo thứ tự này để không bị sai và hiểu rõ cấu trúc

---

## 🎯 NGUYÊN TẮC

1. **Code từng bước**, test sau mỗi bước
2. **Không copy paste**, gõ tay để nhớ
3. Nếu lỗi, **dừng lại fix** trước khi sang bước tiếp

---

## BƯỚC 0: CHUẨN BỊ (Trước khi code)

### 0.1 Tạo project mới
```bash
npx create-next-app@latest admin-dashboard --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd admin-dashboard
```

### 0.2 Cài dependencies (Lần lượt theo thứ tự)
```bash
# Bước 0.2.1: Core (Cài đầu tiên)
npm install @reduxjs/toolkit react-redux axios

# Bước 0.2.2: Form (Sau khi có Core)
npm install react-hook-form yup @hookform/resolvers

# Bước 0.2.3: UI & Icons (Sau khi có Form)
npm install @iconify/react clsx @headlessui/react

# Bước 0.2.4: Notifications
npm install react-toastify

# Bước 0.2.5: i18n (Sau cùng cho Core)
npm install react-i18next i18next i18next-browser-languagedetector

# Bước 0.2.6: Real-time & Auth
npm install @microsoft/signalr keycloak-js

# Bước 0.2.7: Data Table (Quan trọng)
npm install react-table
npm install --save-dev @types/react-table

# Bước 0.2.8: Utilities
npm install cleave.js date-fns

# Bước 0.2.9: Mock (Dev only)
npm install miragejs @faker-js/faker --save-dev
```

### 0.3 Tạo thư mục structure
```bash
mkdir -p src/{api,components/{ui,partials/{product,category,brand,orders,coupon,inventory,header,sidebar,footer},auth,dashboard,skeleton},configs,constants,contexts,core/{api,services,store},features/{auth,products},hooks,i18n/{locales},mock/{services},providers,services,shared/{components/{auth,layout},types},store/{api/{app,auth,shop},types},types,utils}
```

✅ **TEST**: `npm run dev` chạy được là OK

---

## BƯỚC 1: CONFIGURATION (Không có UI)

### 1.1 Theme Config
**File**: `src/configs/themeConfig.ts`
**Nội dung**: Copy từ day-01.md
**TEST**: Không lỗi import

### 1.2 Type Definitions
**Files** (Theo thứ tự):
1. `src/types/common.types.ts` - Base types
2. `src/types/api.ts` - API response types  
3. `src/types/catalog.ts` - Product, Category, Brand
4. `src/types/order.ts` - Order types
5. `src/types/auth.types.ts` - Auth types
6. `src/types/index.ts` - Export all

**TEST**: Không lỗi TypeScript

### 1.3 CSS Variables
**File**: `src/app/globals.css`
```css
/* Copy toàn bộ từ project gốc */
/* Quan trọng: Các biến màu, dark mode classes */
```

✅ **TEST**: Trang có màu sắc cơ bản

---

## BƯỚC 2: REDUX STORE (Core State)

### 2.1 Layout Slice
**File**: `src/store/layout.ts` (159 lines)
- Copy chính xác từ day-01.md
- Chú ý: localStorage sync, 14 actions

**TEST**: Redux DevTools hiện layout state

### 2.2 RTK Query Base
**File**: `src/store/api/apiSlice.ts`
```typescript
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/",
    prepareHeaders: (headers) => {
      // Sau này thêm token
      return headers;
    },
  }),
  tagTypes: ["Products", "Orders"],
  endpoints: () => ({}),
});
```

### 2.3 Store Configuration
**File**: `src/store/index.ts`
```typescript
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { apiSlice } from "./api/apiSlice";

export const store = configureStore({
  reducer: {
    ...rootReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 2.4 Root Reducer
**File**: `src/store/rootReducer.ts`
```typescript
import layout from "./layout";

const rootReducer = {
  layout,
};

export default rootReducer;
```

### 2.5 Redux Provider
**File**: `src/providers/ReduxProvider.tsx`
```typescript
"use client";
import { Provider } from "react-redux";
import { store } from "@/store";

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
```

### 2.6 Update Layout
**File**: `src/app/layout.tsx`
```typescript
import ReduxProvider from "@/providers/ReduxProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
```

✅ **TEST**: Redux DevTools hoạt động, thấy layout state

---

## BƯỚC 3: UI COMPONENTS CƠ BẢN (3 components đầu tiên)

### 3.1 Icon Component
**File**: `src/components/ui/Icon.tsx`
```typescript
import { Icon as IconifyIcon } from "@iconify/react";

interface IconProps {
  icon: string;
  className?: string;
  width?: number;
}

export default function Icon({ icon, className = "", width = 20 }: IconProps) {
  return <IconifyIcon icon={icon} className={className} width={width} />;
}
```

### 3.2 Button Component
**File**: `src/components/ui/Button.tsx`
- Copy chính xác 208 lines từ day-02.md
- **Gõ từng dòng**, không copy paste

**TEST**: 
```tsx
<Button text="Test" />
<Button text="With Icon" icon="heroicons:plus" />
<Button isLoading />
```

### 3.3 Card Component
**File**: `src/components/ui/Card.tsx`
- Copy 54 lines từ day-02.md

**TEST**: Card hiển thị đúng với title

### 3.4 Textinput Component
**File**: `src/components/ui/Textinput.tsx`
- Copy 183 lines từ day-02.md

✅ **TEST**: Tất cả UI components render được

---

## BƯỚC 4: HOOKS (Theo thứ tự)

### 4.1 useSkin Hook
**File**: `src/hooks/useSkin.ts`
- Copy từ day-01.md

### 4.2 useDarkMode Hook
**File**: `src/hooks/useDarkMode.ts`
```typescript
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { handleDarkMode } from "@/store/layout";

export default function useDarkMode() {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: any) => state.layout.darkMode);

  useEffect(() => {
    const body = document.body;
    if (darkMode) {
      body.classList.add("dark");
    } else {
      body.classList.remove("dark");
    }
  }, [darkMode]);

  return [darkMode, (val: boolean) => dispatch(handleDarkMode(val))];
}
```

✅ **TEST**: Toggle dark mode hoạt động

---

## BƯỚC 5: AUTHENTICATION

### 5.1 Cookie Utils
**File**: `src/utils/cookies.ts`
```typescript
export const setCookie = (name: string, value: string, days: number) => {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
};

export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};
```

### 5.2 Keycloak Context
**File**: `src/contexts/KeycloakContext.tsx`
- Copy 320 lines từ day-03.md (phiên bản đơn giản hóa)

### 5.3 Login Form
**File**: `src/components/auth/LoginForm.tsx`
- Copy 75 lines từ day-03.md

### 5.4 Middleware
**File**: `src/middleware.ts`
- Copy từ day-03.md

### 5.5 Login Page
**File**: `src/app/(auth)/login/page.tsx`
```typescript
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Login</h2>
        <LoginForm />
      </div>
    </div>
  );
}
```

✅ **TEST**: Login page hiển thị, nhập admin/admin chuyển trang

---

## BƯỚC 6: MOCK SERVER (Để có data test)

### 6.1 Endpoints
**File**: `src/api/endpoints.ts`
- Copy từ day-01.md

### 6.2 Mock Server
**File**: `src/api/mockServer.ts`
- Copy 895 lines từ day-10.md (hoặc phiên bản ngắn gọn)

### 6.3 App Providers
**File**: `src/providers/AppProviders.tsx`
```typescript
"use client";
import { useEffect } from "react";
import { makeServer } from "@/api/mockServer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
      makeServer();
    }
  }, []);

  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
```

### 6.4 Update Layout
**File**: `src/app/layout.tsx`
```typescript
import AppProviders from "@/providers/AppProviders";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ReduxProvider>
          <AppProviders>{children}</AppProviders>
        </ReduxProvider>
      </body>
    </html>
  );
}
```

✅ **TEST**: Toast hiển thị khi gọi `toast.success("Test")`

---

## BƯỚC 7: DASHBOARD LAYOUT

### 7.1 Sidebar Component
**File**: `src/components/partials/sidebar/index.tsx`
- Code đơn giản trước

### 7.2 Header Component
**File**: `src/components/partials/header/index.tsx`
- Code đơn giản trước

### 7.3 Dashboard Layout
**File**: `src/app/(dashboard)/layout.tsx`
```typescript
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
```

✅ **TEST**: Layout có sidebar + header

---

## BƯỚC 8: PRODUCTS MODULE (react-table)

### 8.1 Product Service
**File**: `src/services/catalogService.ts`
- Copy từ day-04.md

### 8.2 Product List
**File**: `src/components/partials/product/product-list.tsx`
- Copy từ day-04.md (phiên bản react-table)

### 8.3 Products Page
**File**: `src/app/(dashboard)/products/page.tsx`
```typescript
import ProductList from "@/components/partials/product/product-list";

export default function ProductsPage() {
  return <ProductList />;
}
```

✅ **TEST**: Products list hiển thị với pagination

---

## BƯỚC 9-20: CÁC MODULE CÒN LẠI

Lặp lại pattern:
1. **Service** (API calls)
2. **Component** (UI + react-table)
3. **Page** (Route)

### Thứ tự modules:
9. Categories
10. Brands
11. Orders
12. Coupons
13. Inventory
14. Customers
15. Notifications
16. SignalR
17. Reports/Dashboard

---

## CHECKLIST SAU MỖI BƯỚC

- [ ] Không có lỗi console
- [ ] Không có lỗi TypeScript
- [ ] UI render đúng
- [ ] Redux DevTools hiện state đúng
- [ ] Network tab thấy API calls (nếu có)

---

## 🔥 LỖI THƯỜNG GẶP

### Lỗi 1: "use client"
**Fix**: Thêm `"use client"` đầu file nếu dùng hooks

### Lỗi 2: "window is not defined"
**Fix**: Thêm `if (typeof window === "undefined") return`

### Lỗi 3: "Cannot find module"
**Fix**: Check import path, restart dev server

### Lỗi 4: Redux state undefined
**Fix**: Check Provider wrap trong layout.tsx

---

**CODE TỪNG BƯỚC, TEST TỪNG BƯỚC!** 🚀
