/**
 * Mock API Service
 * Service to call Next.js API Routes for fake data
 * 
 * Usage: Use these functions instead of real API calls when ENABLE_MOCK_API is true
 */

import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ==================== Products ====================
export const mockProductApi = {
  getAll: () => apiClient.get("/products?all=true"),
  getList: (pageIndex = 1, pageSize = 10) => 
    apiClient.get(`/products?pageIndex=${pageIndex}&pageSize=${pageSize}`),
  getById: (id: string) => apiClient.get(`/products/${id}`),
  create: (data: any) => apiClient.post("/products", data),
  update: (id: string, data: any) => apiClient.put(`/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/products/${id}`),
};

// ==================== Categories ====================
export const mockCategoryApi = {
  getAll: () => apiClient.get("/categories"),
  getTree: () => apiClient.get("/categories?tree=true"),
  getById: (id: string) => apiClient.get(`/categories/${id}`),
  create: (data: any) => apiClient.post("/categories", data),
  update: (id: string, data: any) => apiClient.put(`/categories/${id}`, data),
  delete: (id: string) => apiClient.delete(`/categories/${id}`),
};

// ==================== Brands ====================
export const mockBrandApi = {
  getAll: (pageIndex = 1, pageSize = 10) => 
    apiClient.get(`/brands?pageIndex=${pageIndex}&pageSize=${pageSize}`),
  getById: (id: string) => apiClient.get(`/brands/${id}`),
  create: (data: any) => apiClient.post("/brands", data),
  update: (id: string, data: any) => apiClient.put(`/brands/${id}`, data),
  delete: (id: string) => apiClient.delete(`/brands/${id}`),
};

// ==================== Orders ====================
export const mockOrderApi = {
  getAll: () => apiClient.get("/orders?all=true"),
  getList: (pageIndex = 1, pageSize = 10) => 
    apiClient.get(`/orders?pageIndex=${pageIndex}&pageSize=${pageSize}`),
  getById: (id: string) => apiClient.get(`/orders/${id}`),
  create: (data: any) => apiClient.post("/orders", data),
  update: (id: string, data: any) => apiClient.put(`/orders/${id}`, data),
  delete: (id: string) => apiClient.delete(`/orders/${id}`),
};

// ==================== Inventory ====================
export const mockInventoryApi = {
  getAll: () => apiClient.get("/inventory?all=true"),
  getList: (pageIndex = 1, pageSize = 10) => 
    apiClient.get(`/inventory?pageIndex=${pageIndex}&pageSize=${pageSize}`),
  getById: (id: string) => apiClient.get(`/inventory/${id}`),
  create: (data: any) => apiClient.post("/inventory", data),
  update: (id: string, data: any) => apiClient.put(`/inventory/${id}`, data),
  delete: (id: string) => apiClient.delete(`/inventory/${id}`),
};

// ==================== Coupons ====================
export const mockCouponApi = {
  getAll: () => apiClient.get("/coupons?all=true"),
  getList: (pageIndex = 1, pageSize = 10) => 
    apiClient.get(`/coupons?pageIndex=${pageIndex}&pageSize=${pageSize}`),
  getById: (id: string) => apiClient.get(`/coupons/${id}`),
  create: (data: any) => apiClient.post("/coupons", data),
  update: (id: string, data: any) => apiClient.put(`/coupons/${id}`, data),
  delete: (id: string) => apiClient.delete(`/coupons/${id}`),
  validate: (code: string) => apiClient.post("/coupons/validate", { code }),
  apply: (code: string, orderId: string) => apiClient.post("/coupons/apply", { code, orderId }),
};

// ==================== Notifications ====================
export const mockNotificationApi = {
  getAll: () => apiClient.get("/notifications?all=true"),
  getList: (pageIndex = 1, pageSize = 10) => 
    apiClient.get(`/notifications?pageIndex=${pageIndex}&pageSize=${pageSize}`),
  getUnreadCount: () => apiClient.get("/notifications?countUnread=true"),
  getTop10Unread: () => apiClient.get("/notifications?top10=true&unread=true"),
  markAsRead: (id: string) => apiClient.post("/notifications", { id, action: "markAsRead" }),
  create: (data: any) => apiClient.post("/notifications", data),
};

// ==================== Dashboard ====================
export const mockDashboardApi = {
  getStatistics: () => apiClient.get("/dashboard/statistics"),
  getOrderGrowth: () => apiClient.get("/dashboard/statistics?type=orderGrowth"),
  getTopProducts: () => apiClient.get("/dashboard/statistics?type=topProducts"),
};

// Export all mock APIs
export const mockApi = {
  products: mockProductApi,
  categories: mockCategoryApi,
  brands: mockBrandApi,
  orders: mockOrderApi,
  inventory: mockInventoryApi,
  coupons: mockCouponApi,
  notifications: mockNotificationApi,
  dashboard: mockDashboardApi,
};

export default mockApi;
