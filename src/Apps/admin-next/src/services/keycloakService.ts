/**
 * Keycloak Service
 * Manages Keycloak authentication and user session
 */

import Keycloak, { KeycloakInitOptions } from 'keycloak-js';
import type {
  KeycloakAppConfig,
  KeycloakUserInfo,
  ExtendedKeycloakTokenParsed,
} from '@/shared/types/keycloak';

// ==================== Configuration ====================

// Get configuration from environment variables
const keycloakConfig: KeycloakAppConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'your-realm-name',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'your-client-id',
  redirectUri:
    process.env.NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI ||
    (typeof window !== 'undefined' ? window.location.origin + '/ecommerce' : ''),
};

// Log configuration for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Keycloak Configuration:', {
    url: keycloakConfig.url,
    realm: keycloakConfig.realm,
    clientId: keycloakConfig.clientId,
    redirectUri: keycloakConfig.redirectUri,
  });
}

// ==================== Cookie Helper Functions ====================

/**
 * Set a cookie
 */
const setCookie = (name: string, value: string, days: number = 1): void => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;

  // Set secure flag only in production (HTTPS)
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax${secure}`;

  if (process.env.NODE_ENV === 'development') {
    console.log(`Cookie set: ${name}`);
  }
};

/**
 * Delete a cookie
 */
const deleteCookie = (name: string): void => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

  if (process.env.NODE_ENV === 'development') {
    console.log(`Cookie deleted: ${name}`);
  }
};

/**
 * Set access token cookie
 */
const setAccessTokenCookie = (token: string): void => {
  if (token) {
    // Set cookie to expire in 1 day (token refresh will update it)
    setCookie('access_token', token, 1);
  }
};

/**
 * Delete access token cookie
 */
const deleteAccessTokenCookie = (): void => {
  deleteCookie('access_token');
};

// ==================== Keycloak Instance ====================

// Initialize Keycloak instance
let keycloakInstance: Keycloak | null = null;

/**
 * Initialize Keycloak
 */
export const initKeycloak = (initOptions: KeycloakInitOptions = {}): Promise<boolean> => {
  // Skip Keycloak initialization when using mock auth
  if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true') {
    console.log('Keycloak: Skipping initialization (MOCK_AUTH enabled)');
    return Promise.resolve(true);
  }

  if (keycloakInstance) {
    return Promise.resolve(!!keycloakInstance.authenticated);
  }

  keycloakInstance = new Keycloak({
    url: keycloakConfig.url,
    realm: keycloakConfig.realm,
    clientId: keycloakConfig.clientId,
  });

  // Set up event callbacks
  keycloakInstance.onAuthSuccess = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Keycloak: Authentication successful');
    }
    // Set access token cookie on successful authentication
    if (keycloakInstance?.token) {
      setAccessTokenCookie(keycloakInstance.token);
    }
  };

  keycloakInstance.onAuthRefreshSuccess = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Keycloak: Token refresh successful');
    }
    // Update access token cookie after refresh
    if (keycloakInstance?.token) {
      setAccessTokenCookie(keycloakInstance.token);
    }
  };

  keycloakInstance.onAuthLogout = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Keycloak: User logged out');
    }
    // Delete access token cookie on logout
    deleteAccessTokenCookie();
  };

  keycloakInstance.onTokenExpired = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Keycloak: Token expired, attempting refresh...');
    }
    // Try to refresh the token
    keycloakInstance
      ?.updateToken(30)
      .then((refreshed) => {
        if (refreshed) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Keycloak: Token refreshed successfully');
          }
          if (keycloakInstance?.token) {
            setAccessTokenCookie(keycloakInstance.token);
          }
        }
      })
      .catch(() => {
        console.warn('Keycloak: Failed to refresh token, user may need to re-login');
        deleteAccessTokenCookie();
      });
  };

  keycloakInstance.onAuthError = (error) => {
    console.error('Keycloak: Authentication error', error);
    deleteAccessTokenCookie();
  };

  const defaultInitOptions: KeycloakInitOptions = {
    onLoad: 'check-sso',
    checkLoginIframe: false,
    pkceMethod: 'S256',
    // Ensure we use the configured redirect URI
    redirectUri: keycloakConfig.redirectUri,
  };

  const finalInitOptions = { ...defaultInitOptions, ...initOptions };

  // Log for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('Initializing Keycloak with options:', {
      ...finalInitOptions,
      redirectUri: finalInitOptions.redirectUri,
    });
  }

  return keycloakInstance.init(finalInitOptions).then((authenticated) => {
    if (authenticated && keycloakInstance?.token) {
      // Set access token cookie if already authenticated (e.g., SSO)
      setAccessTokenCookie(keycloakInstance.token);
      if (process.env.NODE_ENV === 'development') {
        console.log('Keycloak: User is authenticated via SSO');
      }
    } else {
      // Make sure cookie is cleared if not authenticated
      deleteAccessTokenCookie();
    }
    return authenticated;
  });
};

/**
 * Get Keycloak instance
 */
export const getKeycloak = (): Keycloak => {
  if (!keycloakInstance) {
    throw new Error('Keycloak has not been initialized. Call initKeycloak() first.');
  }
  return keycloakInstance;
};

/**
 * Get default redirect URI from config
 */
export const getRedirectUri = (): string => {
  return keycloakConfig.redirectUri;
};

/**
 * Login - Redirect to Keycloak login page
 */
export const login = (options: Record<string, any> = {}): void => {
  const keycloak = getKeycloak();
  const redirectUri = options.redirectUri || keycloakConfig.redirectUri;

  // Log for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('Keycloak login called with redirectUri:', redirectUri);
  }

  keycloak.login({
    redirectUri: redirectUri,
    ...options,
  });
};

/**
 * Logout - Logout and redirect to Keycloak logout page
 */
export const logout = (options: Record<string, any> = {}): void => {
  const keycloak = getKeycloak();

  // Delete access token cookie before logout
  deleteAccessTokenCookie();

  keycloak.logout({
    redirectUri: window.location.origin,
    ...options,
  });
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const keycloak = getKeycloak();
  return keycloak.authenticated || false;
};

/**
 * Get access token
 */
export const getToken = (): string | null => {
  const keycloak = getKeycloak();
  return keycloak.token || null;
};

/**
 * Get refresh token
 */
export const getRefreshToken = (): string | null => {
  const keycloak = getKeycloak();
  return keycloak.refreshToken || null;
};

/**
 * Get user info from Keycloak token
 */
export const getUserInfo = (): KeycloakUserInfo | null => {
  const keycloak = getKeycloak();
  if (!keycloak.authenticated) {
    return null;
  }

  // If tokenParsed is available, use it
  if (keycloak.tokenParsed) {
    const tokenParsed = keycloak.tokenParsed as ExtendedKeycloakTokenParsed;
    return {
      id: tokenParsed.sub || keycloak.subject || 'unknown',
      username: tokenParsed.preferred_username || tokenParsed.username || 'user',
      email: tokenParsed.email || '',
      firstName: tokenParsed.given_name || '',
      lastName: tokenParsed.family_name || '',
      name:
        tokenParsed.name ||
        (tokenParsed.given_name && tokenParsed.family_name
          ? `${tokenParsed.given_name} ${tokenParsed.family_name}`
          : tokenParsed.preferred_username || 'User'),
      roles: tokenParsed.realm_access?.roles || [],
      ...tokenParsed,
    };
  }

  // Fallback: if tokenParsed is not available but we have a token, try to decode it
  if (keycloak.token) {
    try {
      // Try to decode JWT token manually as fallback
      const base64Url = keycloak.token.split('.')[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decoded = JSON.parse(jsonPayload) as ExtendedKeycloakTokenParsed;

        return {
          id: decoded.sub || keycloak.subject || 'unknown',
          username: decoded.preferred_username || decoded.username || 'user',
          email: decoded.email || '',
          firstName: decoded.given_name || '',
          lastName: decoded.family_name || '',
          name:
            decoded.name ||
            (decoded.given_name && decoded.family_name
              ? `${decoded.given_name} ${decoded.family_name}`
              : decoded.preferred_username || 'User'),
          roles: decoded.realm_access?.roles || [],
          ...decoded,
        };
      }
    } catch (error) {
      console.warn('Failed to decode token manually:', error);
    }
  }

  // Last resort: return minimal user object if we have subject
  if (keycloak.subject) {
    return {
      id: keycloak.subject,
      username: 'user',
      email: '',
      firstName: '',
      lastName: '',
      name: 'User',
      roles: [],
    };
  }

  return null;
};

/**
 * Update token - Refresh the access token
 */
export const updateToken = (minValidity: number = 5): Promise<boolean> => {
  const keycloak = getKeycloak();
  return keycloak.updateToken(minValidity).then((refreshed) => {
    if (refreshed && keycloak.token) {
      // Update access token cookie after successful refresh
      setAccessTokenCookie(keycloak.token);
    }
    return refreshed;
  });
};

/**
 * Check if token is expired or will expire soon
 */
export const isTokenExpired = (minValidity: number = 5): boolean => {
  const keycloak = getKeycloak();
  return keycloak.isTokenExpired(minValidity);
};

/**
 * Load user profile from Keycloak
 */
export const loadUserProfile = (): Promise<any> => {
  const keycloak = getKeycloak();
  return keycloak.loadUserProfile();
};
