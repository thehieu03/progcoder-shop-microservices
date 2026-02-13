/**
 * Keycloak Service Type Definitions
 */

import Keycloak, { KeycloakConfig, KeycloakInitOptions, KeycloakTokenParsed } from 'keycloak-js';

// ==================== Keycloak Configuration ====================

export interface KeycloakAppConfig {
  url: string;
  realm: string;
  clientId: string;
  redirectUri: string;
}

// ==================== User Info ====================

export interface KeycloakUserInfo {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  roles: string[];
  [key: string]: any; // Allow additional fields from token
}

// ==================== Extended Token Parsed ====================

export interface ExtendedKeycloakTokenParsed extends KeycloakTokenParsed {
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
  [key: string]: any;
}

// Re-export Keycloak types for convenience
export type { Keycloak, KeycloakConfig, KeycloakInitOptions };
