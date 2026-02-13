# Day 08: Dashboard Layout

## Mục tiêu

Xây dựng Dashboard Layout với:
- Sidebar navigation
- Header với user profile
- Layout wrapper cho dashboard

## 1. Sidebar Component - `src/components/partials/sidebar/index.tsx`

```typescript
"use client";
import React, { useRef, useEffect, useState, type RefObject } from "react";
import SidebarLogo from "./Logo";
import Navmenu from "./Navmenu";
import useMenuTranslation from "@/hooks/useMenuTranslation";
import SimpleBar from "simplebar-react";
import useSidebar from "@/hooks/useSidebar";
import useSemiDark from "@/hooks/useSemiDark";
import useSkin from "@/hooks/useSkin";
import { useTranslation } from "react-i18next";

const Sidebar = () => {
  const scrollableNodeRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollableNodeRef.current && scrollableNodeRef.current.scrollTop > 0) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    };
    
    const node = scrollableNodeRef.current;
    if (node) {
      node.addEventListener("scroll", handleScroll);
      return () => {
        node.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  const [collapsed, setMenuCollapsed] = useSidebar();
  const [menuHover, setMenuHover] = useState<boolean>(false);
  const { menuItems } = useMenuTranslation();
  const { t } = useTranslation();

  const [isSemiDark] = useSemiDark();
  const [skin] = useSkin();

  return (
    <div className={isSemiDark ? "dark" : ""}>
      <div
        className={`sidebar-wrapper bg-white dark:bg-slate-800 ${
          collapsed ? "w-[72px] close_sidebar" : "w-[248px]"
        } ${menuHover ? "sidebar-hovered" : ""} ${
          skin === "bordered"
            ? "border-r border-slate-200 dark:border-slate-700"
            : "shadow-base"
        }`}
        onMouseEnter={() => setMenuHover(true)}
        onMouseLeave={() => setMenuHover(false)}
      >
        <SidebarLogo menuHover={menuHover} />
        <div
          className={`h-[60px] absolute top-[80px] nav-shadow z-1 w-full transition-all duration-200 pointer-events-none ${
            scroll ? "opacity-100" : "opacity-0"
          }`}
        />

        <SimpleBar
          className="sidebar-menu px-4 h-[calc(100%-80px)]"
          scrollableNodeProps={{ ref: scrollableNodeRef as RefObject<HTMLDivElement> }}
        >
          <Navmenu menus={menuItems} />
        </SimpleBar>
      </div>
    </div>
  );
};

export default Sidebar;
```

## 2. Sidebar Logo - `src/components/partials/sidebar/Logo.tsx`

```typescript
"use client";
import React from "react";
import Link from "next/link";
import useSidebar from "@/hooks/useSidebar";
import useMobileMenu from "@/hooks/useMobileMenu";

interface SidebarLogoProps {
  menuHover: boolean;
}

const SidebarLogo: React.FC<SidebarLogoProps> = ({ menuHover }) => {
  const [collapsed, setMenuCollapsed] = useSidebar();
  const [mobileMenu, setMobileMenu] = useMobileMenu();

  return (
    <div className="logo-segment flex justify-between items-center h-[80px] px-4">
      <Link href="/dashboard" className="flex items-center">
        {!collapsed || menuHover ? (
          <>
            <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center mr-3">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              ProG Admin
            </span>
          </>
        ) : (
          <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
        )}
      </Link>

      {(!collapsed || menuHover) && (
        <button
          onClick={() => setMenuCollapsed(!collapsed)}
          className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SidebarLogo;
```

## 3. Navmenu - `src/components/partials/sidebar/Navmenu.tsx`

```typescript
"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import useSidebar from "@/hooks/useSidebar";
import { useTranslation } from "react-i18next";

interface MenuItem {
  title: string;
  icon?: string;
  link?: string;
  child?: MenuItem[];
}

interface NavmenuProps {
  menus: MenuItem[];
}

const Navmenu: React.FC<NavmenuProps> = ({ menus }) => {
  const pathname = usePathname();
  const [collapsed] = useSidebar();
  const { t } = useTranslation();

  const isActive = (link?: string) => {
    if (!link) return false;
    return pathname === link || pathname.startsWith(`${link}/`);
  };

  return (
    <ul className="space-y-1">
      {menus.map((menu, index) => (
        <li key={index}>
          {menu.child ? (
            <Submenu menu={menu} isActive={isActive} />
          ) : (
            <Link
              href={menu.link || "#"}
              className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${
                isActive(menu.link)
                  ? "bg-primary-500 text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {menu.icon && (
                <Icon icon={menu.icon} className="w-5 h-5 mr-3" />
              )}
              {!collapsed && <span>{menu.title}</span>}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
};

// Submenu component
const Submenu: React.FC<{ menu: MenuItem; isActive: (link?: string) => boolean }> = ({
  menu,
  isActive,
}) => {
  const [open, setOpen] = React.useState(false);
  const [collapsed] = useSidebar();

  React.useEffect(() => {
    if (menu.child?.some((item) => isActive(item.link))) {
      setOpen(true);
    }
  }, [menu.child]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-colors ${
          menu.child?.some((item) => isActive(item.link))
            ? "bg-primary-500/10 text-primary-500"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
        }`}
      >
        <div className="flex items-center">
          {menu.icon && <Icon icon={menu.icon} className="w-5 h-5 mr-3" />}
          {!collapsed && <span>{menu.title}</span>}
        </div>
        {!collapsed && (
          <Icon
            icon="heroicons:chevron-down"
            className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>
      {open && !collapsed && (
        <ul className="ml-8 mt-1 space-y-1">
          {menu.child?.map((item, idx) => (
            <li key={idx}>
              <Link
                href={item.link || "#"}
                className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive(item.link)
                    ? "text-primary-500 font-medium"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default Navmenu;
```

## 4. Header Component - `src/components/partials/header/index.tsx`

```typescript
"use client";
import React from "react";
import { useSelector } from "react-redux";
import { useKeycloak } from "@/contexts/KeycloakContext";
import Icon from "@/components/ui/Icon";
import SwitchDark from "./Tools/SwitchDark";
import useWidth from "@/hooks/useWidth";
import useSidebar from "@/hooks/useSidebar";
import useSkin from "@/hooks/useSkin";
import Logo from "./Tools/Logo";
import Profile from "./Tools/Profile";
import Notification from "./Tools/Notification";
import Language from "./Tools/Language";
import useMobileMenu from "@/hooks/useMobileMenu";
import type { RootState } from "@/shared/types/store.types";

const Header: React.FC = () => {
  const [collapsed, setMenuCollapsed] = useSidebar();
  const { width, breakpoints } = useWidth();
  const { authenticated, keycloakReady } = useKeycloak();
  const isAuth = useSelector((state: RootState) => state.auth?.isAuth);
  const isLoggedIn = keycloakReady && (authenticated === true || isAuth === true);
  
  const [skin] = useSkin();
  const [mobileMenu, setMobileMenu] = useMobileMenu();

  const handleOpenMobileMenu = (): void => {
    setMobileMenu(!mobileMenu);
  };

  return (
    <header className="sticky top-0 z-50">
      <div
        className={`app-header md:px-6 px-[15px] dark:bg-slate-800 shadow-base dark:shadow-base3 bg-white
          ${skin === "bordered" ? "border-b border-slate-200/60 dark:border-slate-700/60" : "dark:border-b dark:border-slate-700/60"}
        `}
      >
        <div className="flex justify-between items-center h-full py-4">
          {/* Left side */}
          <div className="flex items-center md:space-x-4 space-x-2 rtl:space-x-reverse">
            {collapsed && width >= breakpoints.xl && (
              <button
                className="text-xl text-slate-900 dark:text-white"
                onClick={() => setMenuCollapsed(!collapsed)}
              >
                <Icon icon="akar-icons:arrow-right" />
              </button>
            )}
            {width < breakpoints.xl && <Logo />}
            {width < breakpoints.xl && width >= breakpoints.md && (
              <div
                className="cursor-pointer text-slate-900 dark:text-white text-2xl"
                onClick={handleOpenMobileMenu}
              >
                <Icon icon="heroicons-outline:menu-alt-3" />
              </div>
            )}
          </div>

          {/* Right side - Tools */}
          <div className="nav-tools flex items-center lg:space-x-6 space-x-3 rtl:space-x-reverse">
            <Language />
            <SwitchDark />
            {width >= breakpoints.md && isLoggedIn && <Notification />}
            {width >= breakpoints.md && <Profile />}
            {width <= breakpoints.md && (
              <div
                className="cursor-pointer text-slate-900 dark:text-white text-2xl"
                onClick={handleOpenMobileMenu}
              >
                <Icon icon="heroicons-outline:menu-alt-3" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
```

## 5. Dashboard Layout - `src/app/(dashboard)/layout.tsx`

```typescript
import Sidebar from '@/components/partials/sidebar';
import Header from '@/components/partials/header';
import AuthGuard from '@/shared/components/auth/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 bg-slate-50 dark:bg-slate-900">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
```

## 6. Menu Translation Hook - `src/hooks/useMenuTranslation.ts`

```typescript
import { useTranslation } from "react-i18next";

const useMenuTranslation = () => {
  const { t } = useTranslation();

  const menuItems = [
    {
      title: t("menu.dashboard"),
      icon: "heroicons:home",
      link: "/dashboard",
    },
    {
      title: t("menu.catalog"),
      icon: "heroicons:shopping-bag",
      child: [
        { title: t("menu.products"), link: "/products" },
        { title: t("menu.categories"), link: "/categories" },
        { title: t("menu.brands"), link: "/brands" },
      ],
    },
    {
      title: t("menu.orders"),
      icon: "heroicons:shopping-cart",
      link: "/orders",
    },
    {
      title: t("menu.inventory"),
      icon: "heroicons:archive-box",
      link: "/inventories",
    },
    {
      title: t("menu.discounts"),
      icon: "heroicons:ticket",
      child: [
        { title: t("menu.coupons"), link: "/coupons" },
      ],
    },
    {
      title: t("menu.customers"),
      icon: "heroicons:users",
      link: "/customers",
    },
    {
      title: t("menu.notifications"),
      icon: "heroicons:bell",
      link: "/notifications",
    },
    {
      title: t("menu.settings"),
      icon: "heroicons:cog-6-tooth",
      link: "/settings",
    },
  ];

  return { menuItems };
};

export default useMenuTranslation;
```

## Checklist cuối ngày

- [ ] Sidebar hiển thị menu đúng
- [ ] Sidebar collapse/expand hoạt động
- [ ] Header hiển thị tools đúng
- [ ] Dark mode toggle hoạt động
- [ ] Language switcher hoạt thị
- [ ] Dashboard layout render đúng
- [ ] Mobile responsive hoạt động

## Liên kết

- [Day 07: Mock Server](./day-07.md) - Trước đó: Mock Server
- [Day 09: Products Module](./day-09.md) - Tiếp theo: Products Module
