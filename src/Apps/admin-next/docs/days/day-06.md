# Day 06: Authentication

## Mục tiêu

Xây dựng hệ thống Authentication với Keycloak:
- Keycloak Context Provider
- Login Form component
- Middleware bảo vệ routes
- Auth Guard cho dashboard

## 1. Keycloak Service - `src/core/services/keycloakService.ts`

```typescript
import Keycloak from "keycloak-js";

// Keycloak configuration
const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080",
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "progcoder",
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "admin-client",
};

let keycloak: Keycloak | null = null;

export const initKeycloak = async (initOptions?: any): Promise<boolean> => {
  if (typeof window === "undefined") return false;
  
  keycloak = new Keycloak(keycloakConfig);
  
  try {
    const authenticated = await keycloak.init(initOptions || { onLoad: "check-sso" });
    return authenticated;
  } catch (error) {
    console.error("Keycloak init failed:", error);
    return false;
  }
};

export const getKeycloak = (): Keycloak => {
  if (!keycloak) {
    throw new Error("Keycloak not initialized");
  }
  return keycloak;
};

export const isAuthenticated = (): boolean => {
  return keycloak?.authenticated || false;
};

export const getToken = (): string | undefined => {
  return keycloak?.token;
};

export const getUserInfo = () => {
  if (!keycloak?.tokenParsed) return null;
  
  const { sub, preferred_username, email, given_name, family_name, realm_access } = keycloak.tokenParsed as any;
  
  return {
    id: sub,
    username: preferred_username,
    email: email,
    firstName: given_name,
    lastName: family_name,
    name: `${given_name || ""} ${family_name || ""}`.trim(),
    roles: realm_access?.roles || [],
  };
};

export const login = (options?: any): void => {
  keycloak?.login(options);
};

export const logout = (options?: any): void => {
  keycloak?.logout(options);
};

export const updateToken = (minValidity: number = 5): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    keycloak
      ?.updateToken(minValidity)
      .then((refreshed) => resolve(refreshed))
      .catch((error) => reject(error));
  });
};

export const loadUserProfile = (): Promise<any> => {
  return keycloak?.loadUserProfile() || Promise.resolve(null);
};
```

**Giải thích:**
- Singleton pattern cho Keycloak instance
- Các hàm tiện ích: init, login, logout, getToken
- `getUserInfo` parse token để lấy user info
- `updateToken` tự động refresh token

## 2. Keycloak Context - `src/contexts/KeycloakContext.tsx`

```typescript
"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import {
  initKeycloak,
  getKeycloak,
  isAuthenticated,
  getUserInfo,
  updateToken,
  login as keycloakLogin,
  logout as keycloakLogout,
  loadUserProfile,
} from "@/core/services/keycloakService";
import { setUser, logOut } from "@/store/api/auth/authSlice";
import Loading from "@/components/Loading";
import type { AppDispatch } from "@/shared/types/store.types";
import type { KeycloakUserInfo } from "@/shared/types/keycloak";

interface KeycloakContextValue {
  keycloakReady: boolean;
  authenticated: boolean;
  login: (options?: any) => void;
  logout: (options?: any) => void;
  getKeycloak: typeof getKeycloak;
  getUserInfo: typeof getUserInfo;
  updateToken: typeof updateToken;
}

const KeycloakContext = createContext<KeycloakContextValue | null>(null);

export const useKeycloak = (): KeycloakContextValue => {
  const context = useContext(KeycloakContext);
  if (!context) {
    throw new Error("useKeycloak must be used within a KeycloakProvider");
  }
  return context;
};

interface KeycloakProviderProps {
  children: React.ReactNode;
}

export const KeycloakProvider: React.FC<KeycloakProviderProps> = ({ children }) => {
  const [keycloakReady, setKeycloakReady] = useState<boolean>(false);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const tokenRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initializeKeycloak = async (): Promise<void> => {
      try {
        // MOCK AUTH: Skip Keycloak khi MOCK_AUTH enabled
        if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
          console.log("[KeycloakContext] MOCK_AUTH enabled");
          setKeycloakReady(true);
          
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setAuthenticated(true);
            dispatch(setUser(parsedUser));
            document.cookie = "auth_status=authenticated; path=/; max-age=86400; SameSite=Lax";
          }
          
          setLoading(false);
          return;
        }

        setLoading(true);
        const initResult = await initKeycloak({
          onLoad: "check-sso",
          checkLoginIframe: false,
        });

        let keycloak;
        try {
          keycloak = getKeycloak();
        } catch (error) {
          console.error("Failed to get Keycloak instance:", error);
          setLoading(false);
          setKeycloakReady(false);
          return;
        }

        setKeycloakReady(true);
        setAuthenticated(keycloak.authenticated || false);

        if (keycloak.authenticated) {
          const syncUserInfo = async (retries = 3, delay = 100): Promise<void> => {
            for (let i = 0; i < retries; i++) {
              if (i > 0) await new Promise((resolve) => setTimeout(resolve, delay));

              const userInfo = getUserInfo();
              if (userInfo) {
                dispatch(setUser(userInfo));
                localStorage.setItem("user", JSON.stringify(userInfo));
                document.cookie = "auth_status=authenticated; path=/; max-age=86400; SameSite=Lax";
                return;
              }
            }
          };

          syncUserInfo();
        }

        // Event listeners
        keycloak.onAuthSuccess = async (): Promise<void> => {
          setAuthenticated(true);
          document.cookie = "auth_status=authenticated; path=/; max-age=86400; SameSite=Lax";
          
          const userInfo = getUserInfo();
          if (userInfo) {
            dispatch(setUser(userInfo));
            localStorage.setItem("user", JSON.stringify(userInfo));
          }
        };

        keycloak.onAuthError = (): void => {
          setAuthenticated(false);
          dispatch(logOut());
          localStorage.removeItem("user");
          document.cookie = "auth_status=; path=/; max-age=0";
        };

        keycloak.onAuthLogout = (): void => {
          setAuthenticated(false);
          dispatch(logOut());
          localStorage.removeItem("user");
          document.cookie = "auth_status=; path=/; max-age=0";
          router.push("/login");
        };

        keycloak.onTokenExpired = (): void => {
          updateToken().catch(() => {
            keycloak?.logout();
          });
        };

        // Auto refresh token mỗi phút
        tokenRefreshIntervalRef.current = setInterval(() => {
          if (keycloak?.authenticated) {
            updateToken(30).catch(() => {
              if (tokenRefreshIntervalRef.current) {
                clearInterval(tokenRefreshIntervalRef.current);
                tokenRefreshIntervalRef.current = null;
              }
            });
          }
        }, 60000);

        setLoading(false);
      } catch (error) {
        console.error("Failed to initialize Keycloak:", error);
        setLoading(false);
        setKeycloakReady(false);
      }
    };

    initializeKeycloak();

    return () => {
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
        tokenRefreshIntervalRef.current = null;
      }
    };
  }, [dispatch, router]);

  const login = useCallback(
    (options: any = {}): void => {
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
        console.log("[KeycloakContext] Mock login");
        setAuthenticated(true);
        const mockUser = {
          id: "mock-user-id",
          username: "admin",
          email: "admin@example.com",
          firstName: "Admin",
          lastName: "User",
          name: "Admin User",
          roles: ["admin"],
        };
        dispatch(setUser(mockUser));
        localStorage.setItem("user", JSON.stringify(mockUser));
        document.cookie = "auth_status=authenticated; path=/; max-age=86400; SameSite=Lax";
        return;
      }
      keycloakLogin(options);
    },
    [dispatch]
  );

  const logout = useCallback(
    (options: any = {}): void => {
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
        console.log("[KeycloakContext] Mock logout");
        setAuthenticated(false);
        dispatch(logOut());
        localStorage.removeItem("user");
        document.cookie = "auth_status=; path=/; max-age=0";
        router.push("/login");
        return;
      }
      keycloakLogout(options);
    },
    [dispatch, router]
  );

  const value: KeycloakContextValue = {
    keycloakReady,
    authenticated,
    login,
    logout,
    getKeycloak,
    getUserInfo,
    updateToken,
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <KeycloakContext.Provider value={value}>
      {children}
    </KeycloakContext.Provider>
  );
};
```

## 3. Auth Slice - `src/store/api/auth/authSlice.ts`

```typescript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  roles: string[];
}

interface AuthState {
  isAuth: boolean;
  user: User | null;
}

const initialState: AuthState = {
  isAuth: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.isAuth = true;
      state.user = action.payload;
    },
    logOut: (state) => {
      state.isAuth = false;
      state.user = null;
    },
  },
});

export const { setUser, logOut } = authSlice.actions;
export default authSlice.reducer;
```

## 4. Login Page - `src/app/login/page.tsx`

```typescript
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useKeycloak } from "@/contexts/KeycloakContext";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, authenticated } = useKeycloak();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect nếu đã authenticated
  if (authenticated) {
    router.push("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
        // Mock login
        login();
        router.push("/dashboard");
      } else {
        // Real Keycloak login
        login({
          redirectUri: window.location.origin + "/dashboard",
        });
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md px-4">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome Back
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-md">
              <p className="text-danger-500 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Textinput
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Textinput
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hasicon
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-slate-300" />
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                  Remember me
                </span>
              </label>
              <a
                href="/forgot-password"
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              text="Sign In"
              className="w-full btn-dark"
              isLoading={isLoading}
            />
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <a
                href="/register"
                className="text-primary-500 hover:text-primary-600"
              >
                Sign up
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
```

## 5. Middleware - `src/middleware.ts`

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authStatus = request.cookies.get("auth_status")?.value;

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register") ||
    request.nextUrl.pathname.startsWith("/forgot-password");

  // Chưa authenticated và không ở auth page -> redirect login
  if (!authStatus && !isAuthPage) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Đã authenticated và ở auth page -> redirect dashboard
  if (authStatus && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login|register).*)",
  ],
};
```

## 6. Auth Guard - `src/shared/components/auth/AuthGuard.tsx`

```typescript
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/types/store.types";
import Loading from "@/components/Loading";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const { isAuth } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuth) {
      router.push("/login");
    }
  }, [isAuth, router]);

  if (!isAuth) {
    return <Loading />;
  }

  return <>{children}</>;
};

export default AuthGuard;
```

## Checklist cuối ngày

- [ ] Keycloak service khởi tạo đúng
- [ ] Keycloak Context cung cấp auth state
- [ ] Login page UI hoàn chỉnh
- [ ] Mock auth mode hoạt động
- [ ] Middleware bảo vệ routes
- [ ] Auth Guard cho dashboard layout
- [ ] Token auto refresh hoạt động
- [ ] Cookie auth_status set/remove đúng

## Liên kết

- [Day 05: Hooks](./day-05.md) - Trước đó: Custom hooks
- [Day 07: Mock Server](./day-07.md) - Tiếp theo: MirageJS Mock Server
- [Keycloak Documentation](https://www.keycloak.org/documentation)
