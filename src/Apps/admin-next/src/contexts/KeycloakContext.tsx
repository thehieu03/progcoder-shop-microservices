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

  // Initialize Keycloak
  useEffect(() => {
    const initializeKeycloak = async (): Promise<void> => {
      try {
        // MOCK AUTH: Skip Keycloak entirely when MOCK_AUTH is enabled
        if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
          console.log("[KeycloakContext] MOCK_AUTH enabled - bypassing Keycloak");
          setKeycloakReady(true);
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              setAuthenticated(true);
              dispatch(setUser(parsedUser));
              document.cookie = "auth_status=authenticated; path=/; max-age=86400; SameSite=Lax";
              document.cookie = "access_token=mock-token; path=/; max-age=86400; SameSite=Lax";
            } catch {
              setAuthenticated(false);
              dispatch(logOut());
            }
          } else {
            setAuthenticated(false);
            dispatch(logOut());
          }
          setLoading(false);
          return;
        }

        setLoading(true);

        // Try to initialize Keycloak (only when MOCK_AUTH is false)
        const initResult = await initKeycloak({
          onLoad: "check-sso",
          checkLoginIframe: false,
        });

        // initResult can be:
        // - true: authenticated
        // - false: not authenticated but initialization successful (can still login)
        // - throws error: initialization failed (server not accessible, wrong config, etc.)

        // Get the keycloak instance
        let keycloak;
        try {
          keycloak = getKeycloak();
        } catch (error) {
          console.error("Failed to get Keycloak instance:", error);
          setLoading(false);
          setKeycloakReady(false);
          return;
        }

        // Verify keycloak is a valid object before setting event handlers
        if (!keycloak || typeof keycloak !== "object") {
          console.error("Invalid Keycloak instance");
          setLoading(false);
          setKeycloakReady(false);
          return;
        }

        setKeycloakReady(true);
        setAuthenticated(keycloak.authenticated || false);

        // If authenticated, sync user info with Redux
        // Use retry logic in case tokenParsed isn't ready yet
        if (keycloak.authenticated) {
          const syncUserInfo = async (retries = 3, delay = 100): Promise<void> => {
            for (let i = 0; i < retries; i++) {
              // Wait a bit for tokenParsed to be available
              if (i > 0) {
                await new Promise((resolve) => setTimeout(resolve, delay));
              }

              const userInfo = getUserInfo();
              if (userInfo) {
                dispatch(setUser(userInfo));
                localStorage.setItem("user", JSON.stringify(userInfo));
                return;
              }

              // If tokenParsed is still not available, try loading user profile as fallback
              if (i === retries - 1 && keycloak.tokenParsed === undefined) {
                try {
                  const profile = await loadUserProfile();
                  if (profile) {
                    const fallbackUserInfo: KeycloakUserInfo = {
                      id: profile.id || keycloak.subject || "unknown",
                      username:
                        profile.username ||
                        profile.preferred_username ||
                        "user",
                      email: profile.email || "",
                      firstName: profile.firstName || profile.given_name || "",
                      lastName: profile.lastName || profile.family_name || "",
                      name:
                        profile.firstName && profile.lastName
                          ? `${profile.firstName} ${profile.lastName}`
                          : profile.name || "",
                      roles: [],
                    };
                    dispatch(setUser(fallbackUserInfo));
                    localStorage.setItem(
                      "user",
                      JSON.stringify(fallbackUserInfo),
                    );
                  }
                } catch (error) {
                  console.warn("Failed to load user profile:", error);
                }
              }
            }
          };

          syncUserInfo();
        }

        // Set up event listeners only if keycloak is valid
        if (keycloak && typeof keycloak === "object") {
          keycloak.onAuthSuccess = async (): Promise<void> => {
            setAuthenticated(true);
            // Set cookie for middleware
            document.cookie =
              "auth_status=authenticated; path=/; max-age=86400; SameSite=Lax";

            // Retry getting user info in case tokenParsed isn't ready yet
            const syncUserInfo = async (retries = 3, delay = 100): Promise<void> => {
              for (let i = 0; i < retries; i++) {
                if (i > 0) {
                  await new Promise((resolve) => setTimeout(resolve, delay));
                }

                const userInfo = getUserInfo();
                if (userInfo) {
                  dispatch(setUser(userInfo));
                  localStorage.setItem("user", JSON.stringify(userInfo));
                  return;
                }
              }
            };

            await syncUserInfo();
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
              // If token refresh fails, logout
              if (keycloak && typeof keycloak.logout === "function") {
                keycloak.logout();
              }
            });
          };

          // Set up token refresh interval
          tokenRefreshIntervalRef.current = setInterval(() => {
            if (keycloak && keycloak.authenticated) {
              updateToken(30).catch(() => {
                if (tokenRefreshIntervalRef.current) {
                  clearInterval(tokenRefreshIntervalRef.current);
                  tokenRefreshIntervalRef.current = null;
                }
              });
            }
          }, 60000); // Check every minute
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to initialize Keycloak:", error);
        setLoading(false);
        setKeycloakReady(false);
      }
    };

    initializeKeycloak();

    // Cleanup function - runs when component unmounts or dependencies change
    return () => {
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
        tokenRefreshIntervalRef.current = null;
      }
    };
  }, [dispatch, router]);

  const login = useCallback(
    (options: any = {}): void => {
      // Mock Auth: Just set authenticated without Keycloak
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
        console.log("[KeycloakContext] Mock login");
        setAuthenticated(true);
        dispatch(
          setUser({
            id: "mock-user-id",
            username: "admin",
            email: "admin@example.com",
            firstName: "Admin",
            lastName: "User",
            name: "Admin User",
            roles: ["admin"],
          }),
        );
        document.cookie = "auth_status=authenticated; path=/; max-age=86400; SameSite=Lax";
        document.cookie = "access_token=mock-token; path=/; max-age=86400; SameSite=Lax";
        return;
      }
      keycloakLogin(options);
    },
    [dispatch],
  );

  const logout = useCallback(
    (options: any = {}): void => {
      // Mock Auth: Just clear state without Keycloak
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
        console.log("[KeycloakContext] Mock logout");
        setAuthenticated(false);
        dispatch(logOut());
        document.cookie = "auth_status=; path=/; max-age=0";
        document.cookie = "access_token=; path=/; max-age=0";
        router.push("/login");
        return;
      }
      keycloakLogout(options);
    },
    [dispatch, router],
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
