/**
 * Order Service
 * Handles order operations
 */

import { api } from "@/api";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { CreateOrderRequest, UpdateOrderRequest } from "@/types/order";

export const orderService = {
  getOrders: (pageIndex = 1, pageSize = 10) =>
    api.get(API_ENDPOINTS.ORDER.GET_LIST, {
      params: { pageIndex, pageSize },
    }),

  getAllOrders: () => api.get(API_ENDPOINTS.ORDER.GET_ALL),

  getOrderById: (id: string) =>
    api.get(API_ENDPOINTS.ORDER.GET_DETAIL(id)),

  getOrderByOrderNo: (orderNo: string) =>
    api.get(API_ENDPOINTS.ORDER.GET_BY_ORDER_NO(orderNo)),

  getMyOrders: () => api.get(API_ENDPOINTS.ORDER.GET_BY_CURRENT_USER),

  createOrder: (data: CreateOrderRequest) =>
    api.post(API_ENDPOINTS.ORDER.CREATE, data),

  updateOrder: (id: string, data: UpdateOrderRequest) =>
    api.put(API_ENDPOINTS.ORDER.UPDATE(id), data),

  updateOrderStatus: (id: string, status: number) =>
    api.put(API_ENDPOINTS.ORDER.UPDATE_STATUS(id), { status }),

  deleteOrder: (id: string) =>
    api.delete(API_ENDPOINTS.ORDER.GET_DETAIL(id)),
};

export default orderService;
