/**
 * Authentication Type Definitions
 */

import { ExtendedKeycloakTokenParsed, KeycloakUserInfo } from './keycloak';

// ==================== User Types ====================

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  roles: string[];
  avatar?: string;
}

// ==================== Token Types ====================

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
}

export interface TokenPayload {
  sub?: string;
  preferred_username?: string;
  username?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  realm_access?: {
    roles: string[];
  };
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string | string[];
  [key: string]: any;
}

// ==================== Auth State ====================

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ==================== Login/Logout ====================

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  tokens: TokenPair;
}

export interface LogoutRequest {
  refreshToken?: string;
}

// ==================== Role & Permission ====================

export type Role = 'admin' | 'user' | 'manager' | 'viewer';

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface RolePermissions {
  role: Role;
  permissions: Permission[];
}

// ==================== Auth Guards ====================

export interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
  fallback?: React.ReactNode;
}

// ==================== Keycloak Integration ====================

export interface KeycloakAuthState {
  authenticated: boolean;
  initialized: boolean;
  user: KeycloakUserInfo | null;
  token: string | null;
  refreshToken: string | null;
}
