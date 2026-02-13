# Day 05: Custom Hooks

## Mục tiêu

Xây dựng các custom hooks tái sử dụng:
- useSkin: Quản lý theme skin (default/bordered)
- useDarkMode: Quản lý dark/light mode
- useSidebar: Quản lý sidebar collapsed state

## 1. useSkin Hook - `src/hooks/useSkin.ts`

```typescript
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { handleSkin } from "@/store/layout";
import type { RootState, AppDispatch } from "@/shared/types/store.types";
import type { SkinMode } from "@/configs/themeConfig";

const useSkin = (): [SkinMode, (mod: SkinMode) => void] => {
  const dispatch = useDispatch<AppDispatch>();
  const skin = useSelector((state: RootState) => state.layout.skin);

  const setSkin = (mod: SkinMode): void => {
    dispatch(handleSkin(mod));
  };

  useEffect(() => {
    const body = window.document.body;
    const classNames = {
      default: "skin--default",
      bordered: "skin--bordered",
    };

    if (skin === "default") {
      body.classList.add(classNames.default);
      body.classList.remove(classNames.bordered);
    } else if (skin === "bordered") {
      body.classList.add(classNames.bordered);
      body.classList.remove(classNames.default);
    }
  }, [skin]);

  return [skin, setSkin];
};

export default useSkin;
```

**Giải thích:**
- Trả về tuple `[skin, setSkin]` giống useState
- Dispatch action để update Redux store
- useEffect sync skin với body class
- 2 skin modes: `default` (shadow) và `bordered` (border)

## 2. useDarkMode Hook - `src/hooks/useDarkMode.ts`

```typescript
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { handleDarkMode } from "@/store/layout";
import type { RootState, AppDispatch } from "@/shared/types/store.types";

const useDarkmode = (): [boolean, (mode: boolean) => void] => {
  const dispatch = useDispatch<AppDispatch>();
  const isDark = useSelector((state: RootState) => state.layout.darkMode);

  const setDarkMode = (mode: boolean): void => {
    dispatch(handleDarkMode(mode));
  };

  useEffect(() => {
    const body = window.document.body;
    const classNames = {
      dark: "dark",
      light: "light",
    };

    if (isDark) {
      body.classList.add(classNames.dark);
      body.classList.remove(classNames.light);
    } else {
      body.classList.add(classNames.light);
      body.classList.remove(classNames.dark);
    }
  }, [isDark]);

  return [isDark, setDarkMode];
};

export default useDarkmode;
```

**Giải thích:**
- Wrapper cho dark mode state từ Redux
- Thêm/xóa class `dark` hoặc `light` trên body
- Tailwind `dark:` prefix sẽ hoạt động khi có class `dark`

## 3. useSidebar Hook - `src/hooks/useSidebar.ts`

```typescript
import { useSelector, useDispatch } from "react-redux";
import { handleSidebarCollapsed } from "@/store/layout";
import type { RootState, AppDispatch } from "@/shared/types/store.types";

const useSidebar = (): [boolean, (val: boolean) => void] => {
  const dispatch = useDispatch<AppDispatch>();
  const collapsed = useSelector((state: RootState) => state.layout.isCollapsed);

  const setMenuCollapsed = (val: boolean): void => {
    dispatch(handleSidebarCollapsed(val));
  };

  return [collapsed, setMenuCollapsed];
};

export default useSidebar;
```

**Giải thích:**
- Đơn giản hóa việc toggle sidebar
- Trả về `[isCollapsed, setCollapsed]`
- Persist vào localStorage qua Redux action

## 4. useSemiDark Hook - `src/hooks/useSemiDark.ts`

```typescript
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { handleSemiDarkMode } from "@/store/layout";
import type { RootState, AppDispatch } from "@/shared/types/store.types";

const useSemiDark = (): [boolean, (val: boolean) => void] => {
  const dispatch = useDispatch<AppDispatch>();
  const isSemiDark = useSelector((state: RootState) => state.layout.semiDarkMode);

  const setSemiDark = (val: boolean): void => {
    dispatch(handleSemiDarkMode(val));
  };

  useEffect(() => {
    const body = window.document.body;
    if (isSemiDark) {
      body.classList.add("semi-dark");
    } else {
      body.classList.remove("semi-dark");
    }
  }, [isSemiDark]);

  return [isSemiDark, setSemiDark];
};

export default useSemiDark;
```

**Giải thích:**
- Semi-dark mode: Chỉ sidebar dark, content light
- Thêm class `semi-dark` cho body

## 5. useWidth Hook - `src/hooks/useWidth.ts`

```typescript
import { useState, useEffect } from "react";

interface Breakpoints {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
}

const breakpoints: Breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

const useWidth = () => {
  const [width, setWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    
    window.addEventListener("resize", handleResize);
    handleResize();
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { width, breakpoints };
};

export default useWidth;
```

**Giải thích:**
- Theo dõi window width
- Trả về breakpoints để so sánh
- Responsive design helper

## 6. useMobileMenu Hook - `src/hooks/useMobileMenu.ts`

```typescript
import { useSelector, useDispatch } from "react-redux";
import { handleMobileMenu } from "@/store/layout";
import type { RootState, AppDispatch } from "@/shared/types/store.types";

const useMobileMenu = (): [boolean, (val: boolean) => void] => {
  const dispatch = useDispatch<AppDispatch>();
  const mobileMenu = useSelector((state: RootState) => state.layout.mobileMenu);

  const setMobileMenu = (val: boolean): void => {
    dispatch(handleMobileMenu(val));
  };

  return [mobileMenu, setMobileMenu];
};

export default useMobileMenu;
```

## 7. useMenuLayout Hook - `src/hooks/useMenulayout.ts`

```typescript
import { useSelector, useDispatch } from "react-redux";
import { handleType } from "@/store/layout";
import type { RootState, AppDispatch } from "@/shared/types/store.types";
import type { MenuLayoutType } from "@/configs/themeConfig";

const useMenulayout = (): [MenuLayoutType, (val: MenuLayoutType) => void] => {
  const dispatch = useDispatch<AppDispatch>();
  const type = useSelector((state: RootState) => state.layout.type);

  const setMenuLayout = (val: MenuLayoutType): void => {
    dispatch(handleType(val));
  };

  return [type, setMenuLayout];
};

export default useMenulayout;
```

## 8. Type Definitions - `src/shared/types/store.types.ts`

```typescript
import { store } from "@/core/store";

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## Sử dụng các Hooks

```typescript
// Trong component
import useSkin from "@/hooks/useSkin";
import useDarkmode from "@/hooks/useDarkMode";
import useSidebar from "@/hooks/useSidebar";

const MyComponent = () => {
  const [skin, setSkin] = useSkin();
  const [isDark, setDarkMode] = useDarkmode();
  const [isCollapsed, setCollapsed] = useSidebar();

  return (
    <div>
      <button onClick={() => setSkin(skin === "default" ? "bordered" : "default")}>
        Toggle Skin
      </button>
      <button onClick={() => setDarkMode(!isDark)}>
        Toggle Dark Mode
      </button>
      <button onClick={() => setCollapsed(!isCollapsed)}>
        Toggle Sidebar
      </button>
    </div>
  );
};
```

## Checklist cuối ngày

- [ ] useSkin toggle giữa default và bordered
- [ ] useDarkMode thêm class dark/light vào body
- [ ] useSidebar collapse/expand sidebar
- [ ] useSemiDark hoạt động đúng
- [ ] useWidth cập nhật khi resize window
- [ ] Tất cả hooks persist state vào localStorage

## Liên kết

- [Day 04: UI Components](./day-04.md) - Trước đó: UI Components
- [Day 06: Authentication](./day-06.md) - Tiếp theo: Keycloak Authentication
