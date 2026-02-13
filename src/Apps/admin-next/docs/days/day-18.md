# Day 18: i18n Integration

## Mục tiêu
Tích hợp đa ngôn ngữ với react-i18next.

## i18n Config - `src/i18n/config.ts`

```typescript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslations from "./locales/en.json";
import viTranslations from "./locales/vi.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      vi: { translation: viTranslations },
    },
    fallbackLng: "en",
    debug: false,
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
```

## Translation Files - `src/i18n/locales/en.json`

```json
{
  "common": {
    "menu": "Menu",
    "dashboard": "Dashboard",
    "signIn": "Sign In",
    "signOut": "Sign Out",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "view": "View",
    "search": "Search",
    "loading": "Loading...",
    "refresh": "Refresh",
    "show": "Show",
    "page": "Page",
    "of": "of",
    "next": "Next",
    "previous": "Previous",
    "deleteConfirmTitle": "Confirm Delete",
    "deleteProductMessage": "Are you sure you want to delete this product?"
  },
  "menu": {
    "dashboard": "Dashboard",
    "catalog": "Catalog",
    "products": "Products",
    "categories": "Categories",
    "brands": "Brands",
    "orders": "Orders",
    "inventory": "Inventory",
    "discounts": "Discounts",
    "coupons": "Coupons",
    "customers": "Customers",
    "notifications": "Notifications",
    "settings": "Settings"
  },
  "products": {
    "title": "Products",
    "product": "Product",
    "name": "Name",
    "sku": "SKU",
    "price": "Price",
    "category": "Category",
    "brand": "Brand",
    "status": "Status",
    "published": "Published",
    "unpublished": "Unpublished",
    "active": "Active",
    "inStock": "In Stock",
    "outOfStock": "Out of Stock",
    "draft": "Draft",
    "hidden": "Hidden",
    "createNew": "Create Product",
    "search": "Search products...",
    "noProducts": "No products found"
  },
  "orders": {
    "title": "Orders",
    "orderNumber": "Order #",
    "customer": "Customer",
    "orderDate": "Order Date",
    "items": "Items",
    "total": "Total",
    "status": "Status",
    "pending": "Pending",
    "confirmed": "Confirmed",
    "processing": "Processing",
    "shipped": "Shipped",
    "delivered": "Delivered",
    "cancelled": "Cancelled",
    "refunded": "Refunded",
    "updateStatus": "Update Status",
    "createNew": "Create Order"
  },
  "coupon": {
    "title": "Coupons",
    "code": "Code",
    "name": "Name",
    "discount": "Discount",
    "type": "Type",
    "percent": "Percentage",
    "fixed": "Fixed Amount",
    "minOrder": "Min Order",
    "usedCount": "Used",
    "expiryDate": "Expires",
    "status": "Status",
    "approved": "Approved",
    "pending": "Pending",
    "rejected": "Rejected",
    "approve": "Approve",
    "reject": "Reject",
    "createNew": "Create Coupon"
  },
  "inventory": {
    "title": "Inventory",
    "product": "Product",
    "sku": "SKU",
    "quantity": "Quantity",
    "available": "Available",
    "reserved": "Reserved",
    "location": "Location",
    "status": "Status",
    "inStock": "In Stock",
    "lowStock": "Low Stock",
    "outOfStock": "Out of Stock",
    "increaseStock": "Increase",
    "decreaseStock": "Decrease"
  },
  "customers": {
    "title": "Customers",
    "name": "Name",
    "email": "Email",
    "phone": "Phone",
    "orders": "Orders",
    "totalSpent": "Total Spent",
    "joined": "Joined"
  },
  "dashboard": {
    "title": "Dashboard",
    "totalRevenue": "Total Revenue",
    "totalOrders": "Total Orders",
    "totalProducts": "Total Products",
    "totalCustomers": "Total Customers",
    "orderGrowthReport": "Order Growth",
    "topBestSellingProducts": "Top Products",
    "recentActivity": "Recent Activity"
  },
  "notifications": {
    "title": "Notifications",
    "markAllAsRead": "Mark all as read",
    "viewAll": "View all notifications",
    "noNotifications": "No notifications"
  }
}
```

## Language Switcher - `src/components/partials/header/Tools/Language.tsx`

```typescript
"use client";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from "@/components/ui/Icon";

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
];

const Language: React.FC = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
        <span className="text-xl">{currentLang.flag}</span>
        <span className="hidden md:block text-sm text-slate-600 dark:text-slate-300">{currentLang.label}</span>
        <Icon icon="heroicons:chevron-down" className="w-4 h-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
          {languages.map((lang) => (
            <button key={lang.code} onClick={() => changeLanguage(lang.code)} className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 ${i18n.language === lang.code ? "bg-primary-50 dark:bg-primary-900/20" : ""}`}>
              <span className="text-xl">{lang.flag}</span>
              <span className={i18n.language === lang.code ? "text-primary-500 font-medium" : "text-slate-600 dark:text-slate-300"}>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Language;
```

## Checklist
- [ ] i18n config với language detector
- [ ] English và Vietnamese translations
- [ ] Language switcher component
- [ ] Persist language preference

## Liên kết
- [Day 19: Docker](./day-19.md) - Tiếp theo
