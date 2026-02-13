/**
 * Order Service Type Definitions
 */

import { Guid, AuditableDto, PaginatedResponse, FilterParams } from './api';

// ==================== Order Types ====================

export enum OrderStatus {
  Pending = 0,
  Confirmed = 1,
  Processing = 2,
  Shipped = 3,
  Delivered = 4,
  Cancelled = 5,
  Refunded = 6,
}

export enum PaymentStatus {
  Pending = 0,
  Paid = 1,
  Failed = 2,
  Refunded = 3,
}

export interface OrderItemDto {
  id: Guid;
  productId: Guid;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount?: number;
  total: number;
}

export interface OrderDto extends AuditableDto {
  id: Guid;
  orderNo: string;
  customerId?: Guid;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  billingAddress?: string;
  items: OrderItemDto[];
  subtotal: number;
  tax?: number;
  shippingFee?: number;
  discount?: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  notes?: string;
  orderDate: string;
}

export interface CreateOrUpdateOrderRequest {
  customerId?: Guid;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  billingAddress?: string;
  items: {
    productId: Guid;
    quantity: number;
    unitPrice: number;
  }[];
  tax?: number;
  shippingFee?: number;
  discount?: number;
  paymentMethod?: string;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  reason?: string;
}

export interface GetOrdersParams extends FilterParams {
  orderNo?: string;
  customerId?: Guid;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fromDate?: string;
  toDate?: string;
}

export interface GetAllOrdersResponse {
  orders: OrderDto[];
}

export interface GetOrdersResponse extends PaginatedResponse<OrderDto> {}

export interface GetOrderByIdResponse {
  order: OrderDto;
}
