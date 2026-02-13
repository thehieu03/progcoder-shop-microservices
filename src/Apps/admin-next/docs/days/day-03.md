# Day 03: Redux Store Core

## Mục tiêu

Xây dựng nền tảng Redux Store cho toàn bộ ứng dụng, bao gồm:
- Store configuration với Redux Toolkit
- API Slice cho RTK Query
- Redux Provider wrapper
- Layout integration

## 1. Store Configuration - `src/core/store/index.ts`

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import layoutReducer from '@/store/layout';
import authReducer from '@/store/api/auth/authSlice';
import cartReducer from '@/store/api/shop/cartSlice';
import { apiSlice } from '@/store/api/apiSlice';

export const store = configureStore({
  reducer: {
    layout: layoutReducer,
    auth: authReducer,
    cart: cartReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Types cho TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

**Giải thích:**
- `configureStore`: Tự động setup Redux DevTools và middleware
- `apiSlice.reducerPath`: Dynamic key cho RTK Query reducer
- `middleware`: Thêm apiSlice middleware để handle caching và invalidation
- Typed hooks: Giúp TypeScript infer đúng type cho state và dispatch

## 2. API Slice - `src/store/api/apiSlice.ts`

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from '@/core/services/keycloakService';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_GATEWAY || '',
    prepareHeaders: (headers, { getState }) => {
      // Get Keycloak token
      const token = getToken();
      
      // If token exists, add it to the Authorization header
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      // Set content type
      headers.set('Content-Type', 'application/json');
      
      return headers;
    },
  }),
  tagTypes: ['Products', 'Orders', 'Coupons', 'Inventory', 'Categories', 'Brands'],
  endpoints: (builder) => ({}),
});
```

**Giải thích:**
- `createApi`: Core của RTK Query, tạo auto-generated hooks
- `baseQuery`: Wrapper cho fetch với authentication
- `prepareHeaders`: Thêm token vào mỗi request
- `tagTypes`: Định nghĩa các tag để cache invalidation

## 3. Layout Slice - `src/store/layout.ts`

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import themeConfig from '@/configs/themeConfig';
import type { SkinMode, MenuLayoutType } from '@/configs/themeConfig';

// Helper để safely get từ localStorage
const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const item = window.localStorage.getItem(key);
  try {
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

const initialDarkMode = (): boolean =>
  getFromLocalStorage('darkMode', themeConfig.layout.darkMode);
const initialSidebarCollapsed = (): boolean =>
  getFromLocalStorage('sidebarCollapsed', themeConfig.layout.menu.isCollapsed);
const initialSkin = (): SkinMode => 
  getFromLocalStorage('skin', themeConfig.layout.skin);

export interface LayoutState {
  darkMode: boolean;
  isCollapsed: boolean;
  skin: SkinMode;
  type: MenuLayoutType;
  mobileMenu: boolean;
  customizer: boolean;
}

const initialState: LayoutState = {
  darkMode: initialDarkMode(),
  isCollapsed: initialSidebarCollapsed(),
  skin: initialSkin(),
  type: 'vertical',
  mobileMenu: false,
  customizer: false,
};

export const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    handleDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('darkMode', JSON.stringify(action.payload));
      }
    },
    handleSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isCollapsed = action.payload;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('sidebarCollapsed', JSON.stringify(action.payload));
      }
    },
    handleSkin: (state, action: PayloadAction<SkinMode>) => {
      state.skin = action.payload;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('skin', JSON.stringify(action.payload));
      }
    },
    handleMobileMenu: (state, action: PayloadAction<boolean>) => {
      state.mobileMenu = action.payload;
    },
    handleCustomizer: (state, action: PayloadAction<boolean>) => {
      state.customizer = action.payload;
    },
  },
});

export const {
  handleDarkMode,
  handleSidebarCollapsed,
  handleSkin,
  handleMobileMenu,
  handleCustomizer,
} = layoutSlice.actions;

export default layoutSlice.reducer;
```

**Giải thích:**
- `getFromLocalStorage`: Helper để đọc từ localStorage (SSR-safe)
- `createSlice`: Tạo actions và reducer cùng lúc
- Mỗi action đều persist vào localStorage
- State bao gồm: dark mode, sidebar state, skin, mobile menu

## 4. Redux Provider - `src/providers/StoreProvider.tsx`

```typescript
"use client";
import { Provider } from "react-redux";
import { store } from "@/core/store";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={store}>{children}</Provider>;
}
```

**Giải thích:**
- `"use client"`: Provider phải là client component
- Wrap toàn bộ app với Redux Provider

## 5. Root Layout Integration - `src/app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import './globals.css';
import StoreProvider from '@/providers/StoreProvider';

export const metadata: Metadata = {
  title: 'ProG Admin Dashboard',
  description: 'Admin dashboard for ProG Coder Shop',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
```

**Giải thích:**
- `StoreProvider` wrap toàn bộ children
- Metadata cho SEO
- Body classes cho styling cơ bản

## 6. Theme Config - `src/configs/themeConfig.ts`

```typescript
export type SkinMode = 'default' | 'bordered';
export type MenuLayoutType = 'vertical' | 'horizontal';
export type ContentWidth = 'full' | 'boxed';
export type NavbarType = 'sticky' | 'static' | 'floating' | 'hidden';
export type FooterType = 'sticky' | 'static' | 'hidden';

interface ThemeConfig {
  layout: {
    darkMode: boolean;
    semiDarkMode: boolean;
    skin: SkinMode;
    type: MenuLayoutType;
    contentWidth: ContentWidth;
    navBarType: NavbarType;
    footerType: FooterType;
    isRTL: boolean;
    isMonochrome: boolean;
    menu: {
      isCollapsed: boolean;
      isHidden: boolean;
    };
    customizer: boolean;
    mobileMenu: boolean;
  };
}

const themeConfig: ThemeConfig = {
  layout: {
    darkMode: false,
    semiDarkMode: false,
    skin: 'default',
    type: 'vertical',
    contentWidth: 'full',
    navBarType: 'sticky',
    footerType: 'static',
    isRTL: false,
    isMonochrome: false,
    menu: {
      isCollapsed: false,
      isHidden: false,
    },
    customizer: false,
    mobileMenu: false,
  },
};

export default themeConfig;
```

**Giải thích:**
- Type definitions cho tất cả theme options
- Default values cho toàn bộ layout
- Dùng làm fallback khi localStorage chưa có data

## Checklist cuối ngày

- [ ] Store configuration hoạt động đúng
- [ ] API Slice setup đầy đủ
- [ ] Layout slice với localStorage persistence
- [ ] Store Provider wrap toàn bộ app
- [ ] TypeScript types định nghĩa đầy đủ
- [ ] Redux DevTools hiển thị state đúng

## Liên kết

- [Day 04: UI Components](./day-04.md) - Tiếp theo: Xây dựng các UI components cơ bản
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [RTK Query Docs](https://redux-toolkit.js.org/rtk-query/overview)
