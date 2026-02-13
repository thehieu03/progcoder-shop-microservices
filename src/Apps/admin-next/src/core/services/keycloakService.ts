/**
 * Keycloak Service - Mock Implementation
 * This is a stub for Keycloak authentication
 */

// Mock user data
const MOCK_USER = {
  id: "mock-user-id",
  username: "admin",
  email: "admin@example.com",
  firstName: "Admin",
  lastName: "User",
  roles: ["admin"],
};

let isLoggedIn = false;
let currentToken = "mock-jwt-token";

// Initialize Keycloak (mock)
export const initKeycloak = async () => {
  // In mock mode, auto-login
  isLoggedIn = true;
  return true;
};

// Get Keycloak instance (mock)
export const getKeycloak = () => ({
  authenticated: isLoggedIn,
  token: currentToken,
  tokenParsed: {
    preferred_username: MOCK_USER.username,
    email: MOCK_USER.email,
    given_name: MOCK_USER.firstName,
    family_name: MOCK_USER.lastName,
  },
});

// Check if authenticated
export const isAuthenticated = () => isLoggedIn;

// Get user info
export const getUserInfo = async () => {
  return MOCK_USER;
};

// Get token
export const getToken = () => currentToken;

// Update token (mock)
export const updateToken = async (_minValidity: number = 5) => {
  return true;
};

// Login
export const login = () => {
  isLoggedIn = true;
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

// Logout
export const logout = () => {
  isLoggedIn = false;
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

// Load user profile
export const loadUserProfile = async () => {
  return MOCK_USER;
};

export default {
  initKeycloak,
  getKeycloak,
  isAuthenticated,
  getUserInfo,
  getToken,
  updateToken,
  login,
  logout,
  loadUserProfile,
};
