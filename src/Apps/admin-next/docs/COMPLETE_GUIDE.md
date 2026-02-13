# HƯỚNG DẪN CODE LẠI TOÀN BỘ PROJECT (Theo thứ tự logic)

> File duy nhất - Code từng bước, test từng bước

---

## THỨ TỰ CODE (20 Bước)

```
Bước 0:  Project Setup
Bước 1:  Configuration (Theme, Types, CSS)
Bước 2:  Redux Store Core
Bước 3:  UI Components Base
Bước 4:  Hooks
Bước 5:  Authentication
Bước 6:  Mock Server
Bước 7:  Dashboard Layout
Bước 8:  Products Module
Bước 9:  Categories Module
Bước 10: Brands Module
Bước 11: Orders Module
Bước 12: Coupons Module
Bước 13: Inventory Module
Bước 14: Customers Module
Bước 15: Notifications
Bước 16: SignalR Real-time
Bước 17: Reports/Dashboard
Bước 18: Performance
Bước 19: Docker
Bước 20: Testing Guide
```

---

# ============================================
# BƯỚC 0: PROJECT SETUP
# ============================================

## 0.1 Tạo project
```bash
npx create-next-app@latest admin-dashboard --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd admin-dashboard
```

## 0.2 Cài dependencies (theo thứ tự)
```bash
# Core
npm install @reduxjs/toolkit react-redux axios

# Form
npm install react-hook-form yup @hookform/resolvers

# UI
npm install @iconify/react clsx @headlessui/react

# Notifications
npm install react-toastify

# i18n
npm install react-i18next i18next i18next-browser-languagedetector

# Real-time & Auth
npm install @microsoft/signalr keycloak-js

# Data Table (QUAN TRỌNG)
npm install react-table
npm install --save-dev @types/react-table

# Date Picker
npm install react-flatpickr flatpickr

# Utilities
npm install cleave.js date-fns

# Mock (dev only)
npm install miragejs @faker-js/faker --save-dev
```

## 0.3 Tạo thư mục
```bash
mkdir -p src/{api,components/{ui,partials/{product,category,brand,orders,coupon,inventory,header,sidebar,footer},auth,dashboard,skeleton},configs,constants,contexts,core/{api,services,store},features/{auth,products},hooks,i18n/{locales},mock/{services},providers,services,shared/{components/{auth,layout},types},store/{api/{app,auth,shop},types},types,utils}
```

✅ **TEST**: `npm run dev` chạy được

---

# ============================================
# BƯỚC 1: CONFIGURATION
# ============================================

## 1.1 Theme Config (src/configs/themeConfig.ts)
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
    menu: { isCollapsed: false, isHidden: false },
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

## 1.2 Types - Base (src/types/common.types.ts)
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
```

## 1.3 Types - API (src/types/api.ts)
```typescript
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
  errors?: Array<{ errorMessage: string }>;
}
```

## 1.4 Types - Catalog (src/types/catalog.ts)
```typescript
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  status: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}
```

## 1.5 Types - Order (src/types/order.ts)
```typescript
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  orderNo: string;
  customerName: string;
  total: number;
  status: OrderStatus;
}
```

## 1.6 Types - Index (src/types/index.ts)
```typescript
export * from './common.types';
export * from './api';
export * from './catalog';
export * from './order';
```

✅ **TEST**: Không lỗi TypeScript

---

# ============================================
# BƯỚC 2: REDUX STORE CORE
# ============================================

## 2.1 Layout Slice (src/store/layout.ts) - 159 lines
```typescript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import themeConfig, { SkinMode, ContentWidth, MenuLayoutType, NavbarType, FooterType } from "@/configs/themeConfig";

const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  const item = window.localStorage.getItem(key);
  try { return item ? JSON.parse(item) : defaultValue; } catch { return defaultValue; }
};

export interface LayoutState {
  isRTL: boolean;
  darkMode: boolean;
  isCollapsed: boolean;
  customizer: boolean;
  semiDarkMode: boolean;
  skin: SkinMode;
  contentWidth: ContentWidth;
  type: MenuLayoutType;
  menuHidden: boolean;
  navBarType: NavbarType;
  footerType: FooterType;
  mobileMenu: boolean;
  isMonochrome: boolean;
}

const initialState: LayoutState = {
  isRTL: getFromLocalStorage("direction", themeConfig.layout.isRTL),
  darkMode: getFromLocalStorage("darkMode", themeConfig.layout.darkMode),
  isCollapsed: getFromLocalStorage("sidebarCollapsed", themeConfig.layout.menu.isCollapsed),
  customizer: themeConfig.layout.customizer,
  semiDarkMode: getFromLocalStorage("semiDarkMode", themeConfig.layout.semiDarkMode),
  skin: getFromLocalStorage("skin", themeConfig.layout.skin),
  contentWidth: themeConfig.layout.contentWidth,
  type: getFromLocalStorage("type", themeConfig.layout.type),
  menuHidden: themeConfig.layout.menu.isHidden,
  navBarType: themeConfig.layout.navBarType,
  footerType: themeConfig.layout.footerType,
  mobileMenu: themeConfig.layout.mobileMenu,
  isMonochrome: getFromLocalStorage("monochrome", themeConfig.layout.isMonochrome),
};

export const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    handleDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      localStorage.setItem("darkMode", JSON.stringify(action.payload));
    },
    handleSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isCollapsed = action.payload;
      localStorage.setItem("sidebarCollapsed", JSON.stringify(action.payload));
    },
    handleSkin: (state, action: PayloadAction<SkinMode>) => {
      state.skin = action.payload;
      localStorage.setItem("skin", JSON.stringify(action.payload));
    },
    handleRtl: (state, action: PayloadAction<boolean>) => {
      state.isRTL = action.payload;
      localStorage.setItem("direction", JSON.stringify(action.payload));
    },
    handleMobileMenu: (state, action: PayloadAction<boolean>) => {
      state.mobileMenu = action.payload;
    },
  },
});

export const { handleDarkMode, handleSidebarCollapsed, handleSkin, handleRtl, handleMobileMenu } = layoutSlice.actions;
export default layoutSlice.reducer;
```

## 2.2 RTK Query Base (src/store/api/apiSlice.ts)
```typescript
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/",
    prepareHeaders: (headers) => headers,
  }),
  tagTypes: ["Products", "Orders", "Coupons", "Inventory"],
  endpoints: () => ({}),
});
```

## 2.3 Root Reducer (src/store/rootReducer.ts)
```typescript
import layout from "./layout";

const rootReducer = { layout };
export default rootReducer;
```

## 2.4 Store (src/store/index.ts)
```typescript
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { apiSlice } from "./api/apiSlice";

export const store = configureStore({
  reducer: { ...rootReducer, [apiSlice.reducerPath]: apiSlice.reducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## 2.5 Redux Provider (src/providers/ReduxProvider.tsx)
```typescript
"use client";
import { Provider } from "react-redux";
import { store } from "@/store";

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
```

## 2.6 Update Layout (src/app/layout.tsx)
```typescript
import ReduxProvider from "@/providers/ReduxProvider";
import "./globals.css";

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

✅ **TEST**: Redux DevTools hiện layout state

---

# ============================================
# BƯỚC 3: UI COMPONENTS BASE
# ============================================

## 3.1 Icon (src/components/ui/Icon.tsx)
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

## 3.2 Button (src/components/ui/Button.tsx) - Copy chính xác 208 lines từ project gốc
```typescript
import React from "react";
import Icon from "./Icon";
import Link from "next/link";

interface ButtonProps {
  text?: string;
  type?: "button" | "submit" | "reset";
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  icon?: string;
  loadingClass?: string;
  iconPosition?: "left" | "right";
  iconClass?: string;
  link?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLDivElement>;
  div?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  text, type = "button", isLoading, disabled, className = "bg-primary-500 text-white",
  children, icon, loadingClass = "unset-classname", iconPosition = "left",
  iconClass = "text-[20px]", link, onClick, div,
}) => {
  return (
    <>
      {!link && !div && (
        <button type={type} onClick={onClick}
          className={`btn inline-flex justify-center ${isLoading ? "pointer-events-none" : ""} ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}>
          {children && !isLoading && children}
          {!children && !isLoading && (
            <span className="flex items-center">
              {icon && <span className={`${iconPosition === "right" ? "order-1 ltr:ml-2 rtl:mr-2" : ""} ${text && iconPosition === "left" ? "ltr:mr-2 rtl:ml-2" : ""} ${iconClass}`}><Icon icon={icon} /></span>}
              <span>{text}</span>
            </span>
          )}
          {isLoading && <><svg className={`animate-spin h-5 w-5 ${loadingClass}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Loading...</>}
        </button>
      )}
    </>
  );
};

export default Button;
```

## 3.3 Card (src/components/ui/Card.tsx)
```typescript
"use client";
import useSkin from "@/hooks/useSkin";

interface CardProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  className?: string;
  bodyClass?: string;
}

const Card: React.FC<CardProps> = ({ children, title, className = "", bodyClass = "p-6" }) => {
  const [skin] = useSkin();
  return (
    <div className={`card rounded-md bg-white dark:bg-slate-800 ${skin === "bordered" ? "border border-slate-200 dark:border-slate-700" : "shadow-base"} ${className}`}>
      {title && <header className="card-header"><div className="card-title text-slate-900 dark:text-white">{title}</div></header>}
      <main className={`card-body ${bodyClass}`}>{children}</main>
    </div>
  );
};

export default Card;
```

✅ **TEST**: Button, Card render đúng

---

# ============================================
# BƯỚC 4: HOOKS
# ============================================

## 4.1 useSkin (src/hooks/useSkin.ts)
```typescript
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { handleSkin } from "@/store/layout";

const useSkin = () => {
  const dispatch = useDispatch();
  const skin = useSelector((state: any) => state.layout.skin);
  
  useEffect(() => {
    const body = document.body;
    body.classList.remove("skin--default", "skin--bordered");
    body.classList.add(`skin--${skin}`);
  }, [skin]);

  return [skin, (mod: any) => dispatch(handleSkin(mod))];
};

export default useSkin;
```

✅ **TEST**: Gọi useSkin trong component

---

# ============================================
# BƯỚC 5: AUTHENTICATION
# ============================================

## 5.1 Cookie Utils (src/utils/cookies.ts)
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

export const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
};
```

## 5.2 Keycloak Context (src/contexts/KeycloakContext.tsx)
```typescript
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { setCookie, getCookie, deleteCookie } from "@/utils/cookies";

interface KeycloakContextType {
  isAuthenticated: boolean;
  keycloakReady: boolean;
  login: () => void;
  logout: () => void;
}

const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined);

export const KeycloakProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [keycloakReady, setKeycloakReady] = useState(true);

  useEffect(() => {
    const mockToken = getCookie("mock_token");
    if (mockToken) setIsAuthenticated(true);
  }, []);

  const login = () => {
    setCookie("mock_token", "mock-jwt-token", 1);
    setIsAuthenticated(true);
    window.location.href = "/dashboard";
  };

  const logout = () => {
    deleteCookie("mock_token");
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  return <KeycloakContext.Provider value={{ isAuthenticated, keycloakReady, login, logout }}>{children}</KeycloakContext.Provider>;
};

export const useKeycloak = () => {
  const context = useContext(KeycloakContext);
  if (!context) throw new Error("useKeycloak must be used within KeycloakProvider");
  return context;
};
```

## 5.3 Login Form (src/components/auth/LoginForm.tsx)
```typescript
"use client";
import React, { useState } from "react";
import { useKeycloak } from "@/contexts/KeycloakContext";

const LoginForm = () => {
  const { login, keycloakReady } = useKeycloak();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") login();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" className="w-full border p-2 rounded" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="admin" className="w-full border p-2 rounded" />
      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded" disabled={!keycloakReady}>Login</button>
    </form>
  );
};

export default LoginForm;
```

✅ **TEST**: Login admin/admin chuyển đến /dashboard

---

# ============================================
# BƯỚC 6-20: CÁC MODULES CÒN LẠI
# ============================================

(Các bước 6-20 tương tự pattern: Service → Component → Page)

## Pattern chung cho mỗi Module:

### 1. Service
```typescript
// src/services/{module}Service.ts
export const {module}Service = {
  getAll: async () => { /* mock */ },
  getById: async (id: string) => { /* mock */ },
  create: async (data: any) => { /* mock */ },
  update: async (id: string, data: any) => { /* mock */ },
  delete: async (id: string) => { /* mock */ },
};
```

### 2. Component
```typescript
// src/components/partials/{module}/index.tsx
"use client";
import { useTable } from "react-table";
// ... component code
```

### 3. Page
```typescript
// src/app/(dashboard)/{module}/page.tsx
import {module} from "@/components/partials/{module}";
export default function Page() { return <{module} />; }
```

---

# ✅ CHECKLIST SAU MỖI BƯỚC

- [ ] Không lỗi console
- [ ] Không lỗi TypeScript  
- [ ] UI render đúng
- [ ] Redux DevTools hiện state đúng

---

**CODE TỪNG BƯỚC, TEST TỪNG BƯỚC!** 🚀
