import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { toast, ToastOptions } from "react-toastify";
import i18n from "@/i18n/config";

// ==================== Type Definitions ====================

/**
 * API Error Response Structure
 */
interface ApiErrorDetail {
  errorMessage: string;
  details?: string;
}

interface ApiErrorResponse {
  message?: string;
  errors?: ApiErrorDetail[];
}

/**
 * Custom Axios Config with baseURL override support
 */
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  baseURL?: string;
}

// ==================== Constants ====================

// Get the API Gateway URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY || "not_config";
const KEYCLOAK_BASE_URL =
  process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL || "not_config";

// Toast configuration
const toastConfig: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// ==================== Helper Functions ====================

/**
 * Helper function to get cookie by name
 */
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

/**
 * Show error toast with i18n translation
 */
const showErrorToast = (errorKey: string, details?: string): void => {
  const translationKey = `error_response.${errorKey}`;
  const defaultKey = "error_response.DEFAULT_ERROR";

  // Check if translation exists for the error key
  const translatedMessage = i18n.exists(translationKey)
    ? i18n.t(translationKey)
    : i18n.t(defaultKey);

  const message = details
    ? `${translatedMessage}: ${details}`
    : translatedMessage;
  toast.error(message, toastConfig);
};

/**
 * Handle API error response and show appropriate toast messages
 */
const handleErrorResponse = (
  response: AxiosResponse<ApiErrorResponse>,
): void => {
  const data = response?.data;

  // Check if response has errors array
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    // Show toast for each error message
    data.errors.forEach((error) => {
      if (error.errorMessage) {
        showErrorToast(error.errorMessage, error.details);
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
 */
const handleStatusError = (status: number): void => {
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

/**
 * Redirect to login and clear access token
 */
const redirectToLogin = (): void => {
  if (typeof document !== "undefined" && typeof window !== "undefined") {
    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  }
};

// ==================== Axios Instances ====================

// Create axios instance with base configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create Keycloak axios instance with base configuration
const keycloakAxiosInstance: AxiosInstance = axios.create({
  baseURL: KEYCLOAK_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==================== Request Interceptors ====================

// Request interceptor - Add Bearer token from cookie
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from cookie
    const token = getCookie("access_token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Keycloak request interceptor - Add Bearer token from cookie
keycloakAxiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from cookie
    const token = getCookie("access_token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ==================== Response Interceptors ====================

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (response) {
      // Handle API error response
      handleErrorResponse(response);

      // Special handling for 401 - redirect to login
      if (response.status === 401) {
        redirectToLogin();
      }
    } else if (error.request) {
      // Network error - no response received
      // showErrorToast("NETWORK_ERROR");
      console.warn(
        "Network error suppressed, falling back to mocks if handled.",
      );
    } else {
      // Something else happened
      // showErrorToast("DEFAULT_ERROR");
      console.warn("Unknown error suppressed.");
    }

    return Promise.reject(error);
  },
);

// Keycloak response interceptor - Handle errors globally
keycloakAxiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (response) {
      // Handle API error response
      handleErrorResponse(response);

      // Special handling for 401 - redirect to login
      if (response.status === 401) {
        redirectToLogin();
      }
    } else if (error.request) {
      // Network error - no response received
      showErrorToast("NETWORK_ERROR");
    } else {
      // Something else happened
      showErrorToast("DEFAULT_ERROR");
    }

    return Promise.reject(error);
  },
);

// ==================== Helper Functions for Custom BaseURL ====================

/**
 * Helper function to create axios instance with custom baseURL
 */
const createAxiosInstanceWithBaseURL = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: baseURL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add request interceptor
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getCookie("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Add response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error) => {
      const { response } = error;

      if (response) {
        handleErrorResponse(response);

        if (response.status === 401) {
          redirectToLogin();
        }
      } else if (error.request) {
        showErrorToast("NETWORK_ERROR");
      } else {
        showErrorToast("DEFAULT_ERROR");
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

// ==================== API Helper Methods ====================

/**
 * Export helper methods for common HTTP operations with generic type support
 */
export const api = {
  get: <T = unknown>(
    url: string,
    config: CustomAxiosRequestConfig = {},
  ): Promise<AxiosResponse<T>> => {
    // Check if config has baseURL override
    if (config.baseURL) {
      const customInstance = createAxiosInstanceWithBaseURL(config.baseURL);
      return customInstance.get<T>(url, { ...config, baseURL: undefined });
    }
    return axiosInstance.get<T>(url, config);
  },

  post: <T = unknown>(
    url: string,
    data?: unknown,
    config: CustomAxiosRequestConfig = {},
  ): Promise<AxiosResponse<T>> => {
    if (config.baseURL) {
      const customInstance = createAxiosInstanceWithBaseURL(config.baseURL);
      return customInstance.post<T>(url, data, {
        ...config,
        baseURL: undefined,
      });
    }
    return axiosInstance.post<T>(url, data, config);
  },

  put: <T = unknown>(
    url: string,
    data?: unknown,
    config: CustomAxiosRequestConfig = {},
  ): Promise<AxiosResponse<T>> => {
    if (config.baseURL) {
      const customInstance = createAxiosInstanceWithBaseURL(config.baseURL);
      return customInstance.put<T>(url, data, {
        ...config,
        baseURL: undefined,
      });
    }
    return axiosInstance.put<T>(url, data, config);
  },

  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config: CustomAxiosRequestConfig = {},
  ): Promise<AxiosResponse<T>> => {
    if (config.baseURL) {
      const customInstance = createAxiosInstanceWithBaseURL(config.baseURL);
      return customInstance.patch<T>(url, data, {
        ...config,
        baseURL: undefined,
      });
    }
    return axiosInstance.patch<T>(url, data, config);
  },

  delete: <T = unknown>(
    url: string,
    config: CustomAxiosRequestConfig = {},
  ): Promise<AxiosResponse<T>> => {
    if (config.baseURL) {
      const customInstance = createAxiosInstanceWithBaseURL(config.baseURL);
      return customInstance.delete<T>(url, { ...config, baseURL: undefined });
    }
    return axiosInstance.delete<T>(url, config);
  },
};

// ==================== Keycloak API Helper ====================

/**
 * Export Keycloak API helper with generic type support
 */
export const keycloakApi = {
  get: <T = unknown>(
    url: string,
    config: CustomAxiosRequestConfig = {},
  ): Promise<AxiosResponse<T>> => {
    // Allow baseURL override from config, otherwise use KEYCLOAK_BASE_URL
    const baseURL = config.baseURL || KEYCLOAK_BASE_URL;
    const instance = createAxiosInstanceWithBaseURL(baseURL);
    return instance.get<T>(url, { ...config, baseURL: undefined });
  },

  post: <T = unknown>(
    url: string,
    data?: unknown,
    config: CustomAxiosRequestConfig = {},
  ): Promise<AxiosResponse<T>> => {
    const baseURL = config.baseURL || KEYCLOAK_BASE_URL;
    const instance = createAxiosInstanceWithBaseURL(baseURL);
    return instance.post<T>(url, data, { ...config, baseURL: undefined });
  },

  put: <T = unknown>(
    url: string,
    data?: unknown,
    config: CustomAxiosRequestConfig = {},
  ): Promise<AxiosResponse<T>> => {
    const baseURL = config.baseURL || KEYCLOAK_BASE_URL;
    const instance = createAxiosInstanceWithBaseURL(baseURL);
    return instance.put<T>(url, data, { ...config, baseURL: undefined });
  },

  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config: CustomAxiosRequestConfig = {},
  ): Promise<AxiosResponse<T>> => {
    const baseURL = config.baseURL || KEYCLOAK_BASE_URL;
    const instance = createAxiosInstanceWithBaseURL(baseURL);
    return instance.patch<T>(url, data, { ...config, baseURL: undefined });
  },

  delete: <T = unknown>(
    url: string,
    config: CustomAxiosRequestConfig = {},
  ): Promise<AxiosResponse<T>> => {
    const baseURL = config.baseURL || KEYCLOAK_BASE_URL;
    const instance = createAxiosInstanceWithBaseURL(baseURL);
    return instance.delete<T>(url, { ...config, baseURL: undefined });
  },
};

export default axiosInstance;
