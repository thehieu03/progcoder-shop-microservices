import axios from "axios";
import { toast } from "react-toastify";
import i18n from "../i18n/config";

// Get the API Gateway URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY || "not_config";
const KEYCLOAK_BASE_URL = process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL || "not_config";

// Helper function to get cookie by name
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()!.split(";").shift() || null;
  }
  return null;
};

// Toast configuration
const toastConfig = {
  position: "top-right" as const,
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

/**
 * Show error toast with i18n translation
 * @param {string} errorKey - The error key from API response
 */
const showErrorToast = (errorKey: string) => {
  const translationKey = `error_response.${errorKey}`;
  const defaultKey = "error_response.DEFAULT_ERROR";

  // Check if translation exists for the error key
  const translatedMessage = i18n.exists(translationKey)
    ? i18n.t(translationKey)
    : i18n.t(defaultKey);

  toast.error(translatedMessage, toastConfig);
};

/**
 * Handle API error response and show appropriate toast messages
 * @param {Object} response - The error response object
 */
const handleErrorResponse = (response: any) => {
  const data = response?.data;

  // Check if response has errors array
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    // Show toast for each error message
    data.errors.forEach((error: any) => {
      if (error.errorMessage) {
        showErrorToast(error.errorMessage);
      }
    });
  } else if (data?.message) {
    // If no errors array but has message, show the message
    showErrorToast(data.message);
  } else {
    // Fallback to status-based error handling
    handleStatusError(response.status);
  }
};

/**
 * Handle HTTP status code errors
 * @param {number} status - HTTP status code
 */
const handleStatusError = (status: number) => {
  switch (status) {
    case 400:
      showErrorToast("BAD_REQUEST");
      break;
    case 401:
      showErrorToast("UNAUTHORIZED");
      break;
    case 403:
      showErrorToast("FORBIDDEN");
      break;
    case 404:
      showErrorToast("NOT_FOUND");
      break;
    case 500:
      showErrorToast("SERVER_ERROR");
      break;
    default:
      showErrorToast("DEFAULT_ERROR");
  }
};

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create Keycloak axios instance with base configuration
const keycloakAxiosInstance = axios.create({
  baseURL: KEYCLOAK_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add Bearer token from cookie
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from cookie
    const token = getCookie("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Keycloak request interceptor - Add Bearer token from cookie
keycloakAxiosInstance.interceptors.request.use(
  (config) => {
    // Get token from cookie
    const token = getCookie("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (response) {
      // Handle API error response
      handleErrorResponse(response);

      // Special handling for 401 - clear token but don't auto-redirect
      // Only redirect if user is on a protected route (handled by ProtectedRoute component)
      if (response.status === 401 && typeof document !== 'undefined') {
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        // Don't auto-redirect here - let ProtectedRoute handle it
      }
    } else if (error.request) {
      // Network error - no response received
      showErrorToast("NETWORK_ERROR");
    } else {
      // Something else happened
      showErrorToast("DEFAULT_ERROR");
    }

    return Promise.reject(error);
  }
);

// Keycloak response interceptor - Handle errors globally
keycloakAxiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (response) {
      // Handle API error response
      handleErrorResponse(response);

      // Special handling for 401 - clear token but don't auto-redirect
      // Only redirect if user is on a protected route (handled by ProtectedRoute component)
      if (response.status === 401 && typeof document !== 'undefined') {
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        // Don't auto-redirect here - let ProtectedRoute handle it
      }
    } else if (error.request) {
      // Network error - no response received
      showErrorToast("NETWORK_ERROR");
    } else {
      // Something else happened
      showErrorToast("DEFAULT_ERROR");
    }

    return Promise.reject(error);
  }
);

// Export helper methods for common HTTP operations
export const api = {
  get: (url: string, config = {}) => {
    return axiosInstance.get(url, config);
  },
  post: (url: string, data?: any, config = {}) => {
    return axiosInstance.post(url, data, config);
  },
  put: (url: string, data?: any, config = {}) => {
    return axiosInstance.put(url, data, config);
  },
  patch: (url: string, data?: any, config = {}) => {
    return axiosInstance.patch(url, data, config);
  },
  delete: (url: string, config = {}) => {
    return axiosInstance.delete(url, config);
  },
};

// Helper function to create axios instance with custom baseURL
const createAxiosInstanceWithBaseURL = (baseURL: string) => {
  const instance = axios.create({
    baseURL: baseURL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add request interceptor
  instance.interceptors.request.use(
    (config) => {
      const token = getCookie("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      const { response } = error;

      if (response) {
        handleErrorResponse(response);

        if (response.status === 401 && typeof document !== 'undefined') {
          document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
      } else if (error.request) {
        showErrorToast("NETWORK_ERROR");
      } else {
        showErrorToast("DEFAULT_ERROR");
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Export Keycloak API helper
export const keycloakApi = {
  get: (url: string, config: any = {}) => {
    const baseURL = config.baseURL || KEYCLOAK_BASE_URL;
    const instance = createAxiosInstanceWithBaseURL(baseURL);
    return instance.get(url, { ...config, baseURL: undefined });
  },
  post: (url: string, data?: any, config: any = {}) => {
    const baseURL = config.baseURL || KEYCLOAK_BASE_URL;
    const instance = createAxiosInstanceWithBaseURL(baseURL);
    return instance.post(url, data, { ...config, baseURL: undefined });
  },
  put: (url: string, data?: any, config: any = {}) => {
    const baseURL = config.baseURL || KEYCLOAK_BASE_URL;
    const instance = createAxiosInstanceWithBaseURL(baseURL);
    return instance.put(url, data, { ...config, baseURL: undefined });
  },
  patch: (url: string, data?: any, config: any = {}) => {
    const baseURL = config.baseURL || KEYCLOAK_BASE_URL;
    const instance = createAxiosInstanceWithBaseURL(baseURL);
    return instance.patch(url, data, { ...config, baseURL: undefined });
  },
  delete: (url: string, config: any = {}) => {
    const baseURL = config.baseURL || KEYCLOAK_BASE_URL;
    const instance = createAxiosInstanceWithBaseURL(baseURL);
    return instance.delete(url, { ...config, baseURL: undefined });
  },
};

export default axiosInstance;
