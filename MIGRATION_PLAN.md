# MIGRATION_PLAN.md

## Overview
This plan outlines the migration of two React Vite applications (`App.Admin` and `App.Store`) to Next.js 16 App Router applications (`admin-next` and `store-next`).

## Phase 1: Preparation & Dependencies

### 1.1 Admin App Dependencies (`admin-next`)
Run the following command to install missing dependencies (based on `App.Admin/package.json`):

```bash
cd src/Apps/admin-next
npm install @reduxjs/toolkit react-redux axios i18next react-i18next keycloak-js react-toastify react-hook-form formik yup @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities chart.js react-chartjs-2 apexcharts react-apexcharts date-fns dayjs react-dropzone react-select sweetalert2 swiper uuid clsx
npm install -D sass tailwindcss postcss autoprefixer
```

### 1.2 Store App Dependencies (`store-next`)
Run the following command to install missing dependencies (based on `App.Store/package.json`):

```bash
cd src/Apps/store-next
npm install axios i18next react-i18next keycloak-js react-toastify formik yup bootstrap react-bootstrap font-awesome swiper react-slick slick-carousel react-select @mui/material @emotion/react @emotion/styled
npm install -D sass
```

## Phase 2: Configuration & Assets

### 2.1 TypeScript Configuration
Ensure `tsconfig.json` in both projects has the correct alias configuration to match the source (typically `@/*` mapped to `./src/*`).

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 2.2 Environment Variables
Create `.env.local` files in both Next.js projects.
*   Rename `VITE_*` variables to `NEXT_PUBLIC_*`.
*   Example: `VITE_API_GATEWAY` -> `NEXT_PUBLIC_API_GATEWAY`.

### 2.3 Assets Migration
*   **Admin**: Copy `src/Apps/App.Admin/public/*` to `src/Apps/admin-next/public/`.
*   **Store**: Copy `src/Apps/App.Store/public/*` to `src/Apps/store-next/public/`.
    *   *Note*: Update image paths in code from `src="/assets/..."` if necessary, though Next.js serves `public` at root `/`.

### 2.4 Styles Migration
*   **Admin**:
    *   Initialize Tailwind: `npx tailwindcss init -p`.
    *   Configure `tailwind.config.js` to scan `src/**/*.{js,ts,jsx,tsx}`.
    *   Copy `src/Apps/App.Admin/src/assets/css/app.css` content to `src/Apps/admin-next/src/app/globals.css`.
*   **Store**:
    *   Copy `src/Apps/App.Store/public/assets/scss` to `src/Apps/store-next/src/styles/scss`.
    *   Import main SCSS file in `src/Apps/store-next/src/app/layout.tsx`: `import "@/styles/scss/style.scss";`.
    *   Import Bootstrap in `layout.tsx`: `import "bootstrap/dist/css/bootstrap.min.css";`.

## Phase 3: Shared Core Migration (Auth & API)

### 3.1 Keycloak Service
*   Copy `src/services/keycloakService.js` to `src/services/keycloakService.ts`.
*   Update `import.meta.env` to `process.env`.
*   Ensure `window` checks are present for SSR safety.

### 3.2 Keycloak Provider
Create a client-side provider wrapper since `keycloak-js` is client-only.

```tsx
// src/providers/AuthProvider.tsx
"use client";

import { KeycloakProvider } from "@/contexts/KeycloakContext";
// ... import context implementation

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <KeycloakProvider>{children}</KeycloakProvider>;
}
```

*   Use this `AuthProvider` in `src/app/layout.tsx`.

### 3.3 API Client
*   Copy `src/api/axiosInstance.js` to `src/api/axiosInstance.ts`.
*   Update env access to `process.env.NEXT_PUBLIC_API_GATEWAY`.
*   Ensure `document.cookie` access is safe (client-only).

## Phase 4: Admin App Specifics

### 4.1 Redux Store
*   Create `src/store/provider.tsx` ("use client").
*   Recreate the Redux store setup from `App.Admin/src/store`.
*   Wrap `src/app/layout.tsx` with `<ReduxProvider>`.

### 4.2 Routing & Layouts
Map `react-router` structure to App Router:

| Source Route | Next.js Path |
|--------------|--------------|
| `/` (Layout) | `src/app/layout.tsx` |
| `/login` | `src/app/login/page.tsx` |
| `/dashboard` | `src/app/dashboard/page.tsx` |
| `/products` | `src/app/products/page.tsx` |
| `/products/:id` | `src/app/products/[id]/page.tsx` |

*   Move `Layout.jsx` components to `src/components/layout/MainLayout.tsx`.
*   In `src/app/dashboard/layout.tsx`, use `MainLayout`.

## Phase 5: Store App Specifics

### 5.1 Context Migration
*   Migrate `FarzaaContext.jsx` to `src/context/FarzaaContext.tsx`.
*   Create a provider wrapper `src/providers/StoreProvider.tsx` to wrap `FarzaaProvider` and `KeycloakProvider`.
*   Use in `src/app/layout.tsx`.

### 5.2 Routing
Map `App.jsx` routes:

| Source Route | Next.js Path |
|--------------|--------------|
| `/` (Shop) | `src/app/page.tsx` |
| `/cart` | `src/app/cart/page.tsx` |
| `/checkout` | `src/app/checkout/page.tsx` |
| `/products/:id` | `src/app/products/[id]/page.tsx` |

## Phase 6: Component Migration Strategy
1.  **"Use Client"**: Since the source apps are SPAs, most page components will initially need `"use client"` at the top.
2.  **Hooks**: `useNavigate` -> `useRouter` (from `next/navigation`). `useLocation` -> `usePathname`, `useSearchParams`.
3.  **Links**: `Link` from `react-router-dom` -> `Link` from `next/link`.
4.  **Images**: `img` tags -> `Image` from `next/image` (optional but recommended).

## Phase 7: Verification
1.  Verify authentication flow (Login/Logout/Redirects).
2.  Verify API calls (Token attachment).
3.  Verify styles (Global styles, Tailwind/Bootstrap).
4.  Test dynamic routes (`[id]`).
