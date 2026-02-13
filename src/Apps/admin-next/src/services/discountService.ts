/**
 * Discount Service
 * Mock service functions for coupon/discount management
 */

import { AxiosResponse } from 'axios';
import {
  Guid,
  GetAllCouponsResponse,
  GetCouponsResponse,
  GetCouponsParams,
  UpdateValidityPeriodRequest,
  ValidateCouponRequest,
  ApplyCouponRequest,
} from '@/shared/types';
import { mockCoupons } from '@/mock/services/discount.mock';

// Helper to create mock response
const createMockResponse = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: "OK",
  headers: {},
  config: {} as any,
});

export const discountService = {
  getAllCoupons: async (): Promise<AxiosResponse<GetAllCouponsResponse>> => {
    return createMockResponse({ coupons: mockCoupons });
  },

  getCoupons: async (params: GetCouponsParams = {}): Promise<AxiosResponse<GetCouponsResponse>> => {
    const pageIndex = (params as any).pageIndex || 1;
    const pageSize = (params as any).pageSize || 10;
    const start = (pageIndex - 1) * pageSize;
    const end = start + pageSize;
    
    return createMockResponse({
      items: mockCoupons.slice(start, end),
      totalCount: mockCoupons.length,
      pageIndex,
      pageSize,
      totalPages: Math.ceil(mockCoupons.length / pageSize),
      hasPreviousPage: pageIndex > 1,
      hasNextPage: end < mockCoupons.length,
    });
  },

  getCouponById: async (couponId: Guid): Promise<AxiosResponse<any>> => {
    const coupon = mockCoupons.find((c) => c.id === couponId);
    return createMockResponse({ coupon: coupon || mockCoupons[0] });
  },

  createCoupon: async (couponData: any): Promise<AxiosResponse<any>> => {
    return createMockResponse({ success: true, message: "Coupon created successfully" });
  },

  updateCoupon: async (couponId: Guid, couponData: any): Promise<AxiosResponse<any>> => {
    return createMockResponse({ success: true, message: "Coupon updated successfully" });
  },

  deleteCoupon: async (couponId: Guid): Promise<AxiosResponse<void>> => {
    return createMockResponse(undefined as any);
  },

  approveCoupon: async (couponId: Guid): Promise<AxiosResponse<void>> => {
    return createMockResponse(undefined as any);
  },

  rejectCoupon: async (couponId: Guid): Promise<AxiosResponse<void>> => {
    return createMockResponse(undefined as any);
  },

  updateValidityPeriod: async (couponId: Guid, validityData: UpdateValidityPeriodRequest): Promise<AxiosResponse<void>> => {
    return createMockResponse(undefined as any);
  },

  validateCoupon: async (validateData: ValidateCouponRequest): Promise<AxiosResponse<any>> => {
    const coupon = mockCoupons.find((c) => c.code === validateData.code);
    if (coupon && coupon.active) {
      return createMockResponse({ valid: true, coupon });
    }
    return createMockResponse({ valid: false, message: "Invalid or expired coupon" });
  },

  applyCoupon: async (applyData: ApplyCouponRequest): Promise<AxiosResponse<any>> => {
    const coupon = mockCoupons.find((c) => c.code === applyData.code);
    if (coupon) {
      return createMockResponse({ success: true, discountAmount: coupon.discountValue });
    }
    return createMockResponse({ success: false, message: "Coupon not found" });
  },
};

export default discountService;
