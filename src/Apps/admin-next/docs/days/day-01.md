# Day 01: Project Setup + Dependencies

## 🎯 Mục tiêu hôm nay
- Khởi tạo project Next.js
- Cài đặt tất cả dependencies
- Tạo cấu trúc thư mục
- Chạy thử project

## 1. Khởi tạo Project

```bash
npx create-next-app@latest admin-dashboard --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd admin-dashboard
```

**Chọn options:**
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- src/ directory: Yes
- App Router: Yes
- Import alias: @/*

## 2. Cài Dependencies (Theo thứ tự quan trọng)

```bash
# Step 2.1: Redux + State Management
npm install @reduxjs/toolkit react-redux

# Step 2.2: HTTP Client
npm install axios

# Step 2.3: Form Handling
npm install react-hook-form yup @hookform/resolvers

# Step 2.4: UI Components & Icons
npm install @iconify/react clsx @headlessui/react

# Step 2.5: Notifications
npm install react-toastify

# Step 2.6: i18n (Đa ngôn ngữ)
npm install react-i18next i18next i18next-browser-languagedetector

# Step 2.7: Authentication & Real-time
npm install @microsoft/signalr keycloak-js

# Step 2.8: Data Tables (QUAN TRỌNG)
npm install react-table
npm install --save-dev @types/react-table

# Step 2.9: Date/Time Picker
npm install react-flatpickr flatpickr

# Step 2.10: Input Mask
npm install cleave.js

# Step 2.11: Date utilities
npm install date-fns

# Step 2.12: Mock API (Dev only)
npm install miragejs @faker-js/faker --save-dev
```

## 3. Tạo Cấu Trúc Thư Mục

```bash
mkdir -p src/{api,components/{ui,partials/{product,category,brand,orders,coupon,inventory,customers,header,sidebar,footer},auth,dashboard,skeleton},configs,constants,contexts,core/{api,services,store},features/{auth,products},hooks,i18n/{locales},mock/{services},providers,services,shared/{components/{auth,layout},types},store/{api/{app,auth,shop},types},types,utils}
```

## 4. File package.json đầy đủ

```json
{
  "name": "admin-dashboard",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 4001",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@reduxjs/toolkit": "^2.11.2",
    "react-redux": "^9.2.0",
    "axios": "^1.13.4",
    "react-hook-form": "^7.71.1",
    "yup": "^1.7.1",
    "@hookform/resolvers": "^5.2.2",
    "@iconify/react": "^6.0.2",
    "clsx": "^2.1.1",
    "@headlessui/react": "^2.2.9",
    "react-toastify": "^11.0.5",
    "react-i18next": "^16.5.4",
    "i18next": "^25.8.0",
    "i18next-browser-languagedetector": "^8.2.0",
    "@microsoft/signalr": "^10.0.0",
    "keycloak-js": "^26.2.2",
    "react-table": "^7.8.0",
    "react-flatpickr": "^4.0.11",
    "flatpickr": "^4.6.13",
    "cleave.js": "^1.6.0",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "@types/react-table": "^7.7.0",
    "miragejs": "^0.1.48",
    "@faker-js/faker": "^9.6.0",
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4"
  }
}
```

## 5. Test Project

```bash
npm run dev
```

Truy cập: http://localhost:4001

✅ **Kết quả Day 1:** Project chạy được, không lỗi

---

## 📋 Checklist Day 1

- [ ] Project khởi tạo thành công
- [ ] Tất cả dependencies cài đặt xong
- [ ] Cấu trúc thư mục đúng
- [ ] `npm run dev` chạy được
- [ ] Không có lỗi trong console

**Sang Day 2 → Configuration (Theme, Types, CSS)**
