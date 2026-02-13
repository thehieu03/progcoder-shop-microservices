# Day 20: Testing Guide

## Mục tiêu
Hướng dẫn testing cho Admin Dashboard.

## 1. Unit Testing với Jest + React Testing Library

### Setup

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

### jest.config.js

```javascript
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

module.exports = createJestConfig(customJestConfig);
```

### jest.setup.js

```javascript
import "@testing-library/jest-dom";
```

### Example Test - Button.test.tsx

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "@/components/ui/Button";

describe("Button", () => {
  it("renders button with text", () => {
    render(<Button text="Click me" />);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", () => {
    const handleClick = jest.fn();
    render(<Button text="Click me" onClick={handleClick} />);
    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shows loading spinner when isLoading is true", () => {
    render(<Button text="Loading" isLoading />);
    expect(screen.getByText("Loading ...")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button text="Disabled" disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

### Example Test - useSidebar.test.ts

```typescript
import { renderHook, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import useSidebar from "@/hooks/useSidebar";
import layoutReducer from "@/store/layout";

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: { layout: layoutReducer },
    preloadedState: initialState,
  });
};

const wrapper = ({ children, store }: any) => (
  <Provider store={store}>{children}</Provider>
);

describe("useSidebar", () => {
  it("returns collapsed state and setter", () => {
    const store = createTestStore({ layout: { isCollapsed: false } });
    const { result } = renderHook(() => useSidebar(), {
      wrapper: ({ children }) => wrapper({ children, store }),
    });

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
  });
});
```

## 2. E2E Testing với Playwright

### Setup

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### playwright.config.ts

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### Example E2E Test - auth.spec.ts

```typescript
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/login");
  });

  test("should login successfully", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "password");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/dashboard");
  });

  test("should navigate through sidebar menu", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "password");
    await page.click('button[type="submit"]');

    // Click on Products menu
    await page.click("text=Products");
    await expect(page).toHaveURL("/products");
  });
});
```

## 3. Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## 4. Testing Best Practices

### DO:
- Test behavior, not implementation
- Use `data-testid` cho elements khó select
- Mock external dependencies (API calls)
- Clean up sau mỗi test

### DON'T:
- Test implementation details
- Test 3rd party libraries
- Write tests quá phức tạp

## 5. Coverage Report

```bash
npm run test:coverage
```

Target coverage:
- Statements: 80%
- Branches: 70%
- Functions: 80%
- Lines: 80%

## Checklist
- [ ] Jest configuration
- [ ] React Testing Library setup
- [ ] Unit tests cho components
- [ ] Unit tests cho hooks
- [ ] Playwright E2E tests
- [ ] Test scripts trong package.json
- [ ] Coverage reporting

## Hoàn thành 20 ngày!

Chúc mừng! Bạn đã hoàn thành toàn bộ Admin Dashboard.

## Liên kết

- [Day 01: Project Setup](./day-01.md) - Quay lại ngày đầu tiên
- [Project README](../../README.md) - Xem lại dự án
