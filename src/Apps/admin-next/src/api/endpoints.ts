/**
 * API Endpoints Configuration
 * All endpoints are relative to NEXT_PUBLIC_API_GATEWAY base URL
 */

export interface ApiEndpoints {
  CATALOG: {
    GET_PRODUCTS: string;
    GET_ALL_PRODUCTS: string;
    GET_PRODUCT_DETAIL: (id: string) => string;
    CREATE_PRODUCT: string;
    UPDATE_PRODUCT: (id: string) => string;
    DELETE_PRODUCT: (id: string) => string;
    PUBLISH_PRODUCT: (id: string) => string;
    UNPUBLISH_PRODUCT: (id: string) => string;
    GET_CATEGORIES: string;
    GET_CATEGORY_TREE: string;
    GET_CATEGORY_DETAIL: (id: string) => string;
    CREATE_CATEGORY: string;
    UPDATE_CATEGORY: (id: string) => string;
    DELETE_CATEGORY: (id: string) => string;
    GET_BRANDS: string;
    GET_BRAND_DETAIL: (id: string) => string;
    CREATE_BRAND: string;
    UPDATE_BRAND: (id: string) => string;
    DELETE_BRAND: (id: string) => string;
  };
  INVENTORY: {
    GET_LIST: string;
    GET_ALL: string;
    GET_DETAIL: (id: string) => string;
    CREATE: string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
    INCREASE_STOCK: (id: string) => string;
    DECREASE_STOCK: (id: string) => string;
    GET_LOCATIONS: string;
    GET_LOCATION: (id: string) => string;
    CREATE_LOCATION: string;
    UPDATE_LOCATION: (id: string) => string;
    DELETE_LOCATION: (id: string) => string;
    GET_HISTORIES: string;
    GET_ALL_RESERVATIONS: string;
  };
  DISCOUNT: {
    GET_LIST: string;
    GET_ALL_COUPONS: string;
    GET_DETAIL: (id: string) => string;
    CREATE: string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
    APPROVE_COUPON: (id: string) => string;
    REJECT_COUPON: (id: string) => string;
    UPDATE_VALIDITY_PERIOD: (id: string) => string;
    VALIDATE: string;
    APPLY: string;
  };
  ORDER: {
    GET_LIST: string;
    GET_ALL: string;
    GET_DETAIL: (id: string) => string;
    CREATE: string;
    UPDATE: (id: string) => string;
    UPDATE_STATUS: (id: string) => string;
    GET_BY_ORDER_NO: (orderNo: string) => string;
    GET_BY_CURRENT_USER: string;
  };
  REPORT: {
    DASHBOARD_STATISTICS: string;
    ORDER_GROWTH_LINE_CHART: string;
    TOP_PRODUCT_PIE_CHART: string;
  };
  NOTIFICATION: {
    GET_LIST: string;
    MARK_AS_READ: string;
    GET_ALL: string;
    GET_COUNT_UNREAD: string;
    GET_TOP_10_UNREAD: string;
  };
  COMMUNICATION: {
    NOTIFICATION_HUB: string;
  };
  KEYCLOAK: {
    GET_ME: string;
  };
}

export const API_ENDPOINTS: ApiEndpoints = {
  // Catalog Service
  CATALOG: {
    GET_PRODUCTS: "/catalog-service/admin/products",
    GET_ALL_PRODUCTS: "/catalog-service/admin/products/all",
    GET_PRODUCT_DETAIL: (id: string) => `/catalog-service/admin/products/${id}`,
    CREATE_PRODUCT: "/catalog-service/admin/products",
    UPDATE_PRODUCT: (id: string) => `/catalog-service/admin/products/${id}`,
    DELETE_PRODUCT: (id: string) => `/catalog-service/admin/products/${id}`,
    PUBLISH_PRODUCT: (id: string) => `/catalog-service/admin/products/${id}/publish`,
    UNPUBLISH_PRODUCT: (id: string) => `/catalog-service/admin/products/${id}/unpublish`,
    GET_CATEGORIES: "/catalog-service/categories",
    GET_CATEGORY_TREE: "/catalog-service/admin/categories/tree",
    GET_CATEGORY_DETAIL: (id: string) => `/catalog-service/admin/categories/${id}`,
    CREATE_CATEGORY: "/catalog-service/admin/categories",
    UPDATE_CATEGORY: (id: string) => `/catalog-service/admin/categories/${id}`,
    DELETE_CATEGORY: (id: string) => `/catalog-service/admin/categories/${id}`,
    GET_BRANDS: "/catalog-service/brands",
    GET_BRAND_DETAIL: (id: string) => `/catalog-service/admin/brands/${id}`,
    CREATE_BRAND: "/catalog-service/admin/brands",
    UPDATE_BRAND: (id: string) => `/catalog-service/admin/brands/${id}`,
    DELETE_BRAND: (id: string) => `/catalog-service/admin/brands/${id}`
  },

  // Inventory Service
  INVENTORY: {
    GET_LIST: "/inventory-service/inventory-items",
    GET_ALL: "/inventory-service/inventory-items/all",
    GET_DETAIL: (id: string) => `/inventory-service/inventory-items/${id}`,
    CREATE: "/inventory-service/inventory-items",
    UPDATE: (id: string) => `/inventory-service/inventory-items/${id}`,
    DELETE: (id: string) => `/inventory-service/inventory-items/${id}`,
    INCREASE_STOCK: (id: string) => `/inventory-service/inventory-items/${id}/stock/increase`,
    DECREASE_STOCK: (id: string) => `/inventory-service/inventory-items/${id}/stock/decrease`,
    GET_LOCATIONS: "/inventory-service/locations",
    GET_LOCATION: (id: string) => `/inventory-service/locations/${id}`,
    CREATE_LOCATION: "/inventory-service/locations",
    UPDATE_LOCATION: (id: string) => `/inventory-service/locations/${id}`,
    DELETE_LOCATION: (id: string) => `/inventory-service/locations/${id}`,
    GET_HISTORIES: "/inventory-service/histories",
    GET_ALL_RESERVATIONS: "/inventory-service/reservations/all",
  },

  // Discount Service
  DISCOUNT: {
    GET_LIST: "/discount-service/admin/coupons",
    GET_ALL_COUPONS: "/discount-service/admin/coupons/all",
    GET_DETAIL: (id: string) => `/discount-service/admin/coupons/${id}`,
    CREATE: "/discount-service/admin/coupons",
    UPDATE: (id: string) => `/discount-service/admin/coupons/${id}`,
    DELETE: (id: string) => `/discount-service/admin/coupons/${id}`,
    APPROVE_COUPON: (id: string) => `/discount-service/admin/coupons/${id}/approve`,
    REJECT_COUPON: (id: string) => `/discount-service/admin/coupons/${id}/reject`,
    UPDATE_VALIDITY_PERIOD: (id: string) => `/discount-service/admin/coupons/${id}/validity-period`,
    VALIDATE: "/discount-service/coupons/validate",
    APPLY: "/discount-service/coupons/apply",
  },

  // Order Service
  ORDER: {
    GET_LIST: "/order-service/admin/orders",
    GET_ALL: "/order-service/admin/orders/all",
    GET_DETAIL: (id: string) => `/order-service/admin/orders/${id}`,
    CREATE: "/order-service/admin/orders",
    UPDATE: (id: string) => `/order-service/admin/orders/${id}`,
    UPDATE_STATUS: (id: string) => `/order-service/admin/orders/${id}/status`,
    GET_BY_ORDER_NO: (orderNo: string) => `/order-service/orders/order-no/${orderNo}`,
    GET_BY_CURRENT_USER: "/order-service/orders/me",
  },

  // Report Service
  REPORT: {
    DASHBOARD_STATISTICS: "/report-service/admin/dashboard-statistics",
    ORDER_GROWTH_LINE_CHART: "/report-service/admin/order-growth-statistics",
    TOP_PRODUCT_PIE_CHART: "/report-service/admin/top-product-statistics",
  },

  // Notification Service
  NOTIFICATION: {
    GET_LIST: "/notification-service/notifications",
    MARK_AS_READ: "/notification-service/notifications/read",
    GET_ALL: "/notification-service/notifications/all",
    GET_COUNT_UNREAD: "/notification-service/notifications/unread/count",
    GET_TOP_10_UNREAD: "/notification-service/notifications/unread/top10"
  },

  // Communication Service
  COMMUNICATION: {
    NOTIFICATION_HUB: "/communication-service/hubs/notifications",
  },

  // Keycloak
  KEYCLOAK: {
    GET_ME: "/account/me",
  },
};

export default API_ENDPOINTS;
