/**
 * Order Service
 * Mock service functions for order management
 */

import { AxiosResponse } from 'axios';
import {
  Guid,
  GetAllOrdersResponse,
  GetOrdersResponse,
  GetOrdersParams,
  GetOrderByIdResponse,
  CreateOrUpdateOrderRequest,
  UpdateOrderStatusRequest,
} from '@/shared/types';
import { mockOrders } from '@/mock/services/order.mock';

// Helper to create mock response
const createMockResponse = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: "OK",
  headers: {},
  config: {} as any,
});

export const orderService = {
  getOrders: async (params: GetOrdersParams = {}): Promise<AxiosResponse<GetOrdersResponse>> => {
    const pageIndex = (params as any).pageIndex || 1;
    const pageSize = (params as any).pageSize || 10;
    const start = (pageIndex - 1) * pageSize;
    const end = start + pageSize;
    
    return createMockResponse({
      items: mockOrders.slice(start, end),
      totalCount: mockOrders.length,
      pageIndex,
      pageSize,
      totalPages: Math.ceil(mockOrders.length / pageSize),
      hasPreviousPage: pageIndex > 1,
      hasNextPage: end < mockOrders.length,
    });
  },

  getAllOrders: async (params: GetOrdersParams = {}): Promise<AxiosResponse<GetAllOrdersResponse>> => {
    return createMockResponse({ orders: mockOrders });
  },

  getOrderById: async (orderId: Guid): Promise<AxiosResponse<GetOrderByIdResponse>> => {
    const order = mockOrders.find((o) => o.id === orderId);
    return createMockResponse({ order: order || mockOrders[0] });
  },

  getOrderByOrderNo: async (orderNo: string): Promise<AxiosResponse<GetOrderByIdResponse>> => {
    const order = mockOrders.find((o) => o.orderNo === orderNo);
    return createMockResponse({ order: order || mockOrders[0] });
  },

  createOrder: async (orderData: CreateOrUpdateOrderRequest): Promise<AxiosResponse<any>> => {
    return createMockResponse({ success: true, message: "Order created successfully", orderNo: "ORD-2024-0006" });
  },

  updateOrder: async (orderId: Guid, orderData: CreateOrUpdateOrderRequest): Promise<AxiosResponse<any>> => {
    return createMockResponse({ success: true, message: "Order updated successfully" });
  },

  updateOrderStatus: async (orderId: Guid, statusData: UpdateOrderStatusRequest): Promise<AxiosResponse<void>> => {
    return createMockResponse(undefined as any);
  },
};

export default orderService;
