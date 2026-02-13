/**
 * Discount Service
 * Handles coupon and discount operations
 */

import { api } from "@/api";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { CreateCouponRequest, UpdateCouponRequest } from "@/types/discount";

export const discountService = {
  // Coupons
  getCoupons: (pageIndex = 1, pageSize = 10) =>
    api.get(API_ENDPOINTS.DISCOUNT.GET_LIST, {
      params: { pageIndex, pageSize },
    }),

  getAllCoupons: () => api.get(API_ENDPOINTS.DISCOUNT.GET_ALL_COUPONS),

  getCouponById: (id: string) =>
    api.get(API_ENDPOINTS.DISCOUNT.GET_DETAIL(id)),

  createCoupon: (data: CreateCouponRequest) =>
    api.post(API_ENDPOINTS.DISCOUNT.CREATE, data),

  updateCoupon: (id: string, data: UpdateCouponRequest) =>
    api.put(API_ENDPOINTS.DISCOUNT.UPDATE(id), data),

  deleteCoupon: (id: string) =>
    api.delete(API_ENDPOINTS.DISCOUNT.DELETE(id)),

  approveCoupon: (id: string) =>
    api.post(API_ENDPOINTS.DISCOUNT.APPROVE_COUPON(id)),

  rejectCoupon: (id: string) =>
    api.post(API_ENDPOINTS.DISCOUNT.REJECT_COUPON(id)),

  updateValidityPeriod: (id: string, validFrom: string, validTo: string) =>
    api.put(API_ENDPOINTS.DISCOUNT.UPDATE_VALIDITY_PERIOD(id), { validFrom, validTo }),

  validateCoupon: (code: string, orderAmount?: number) =>
    api.post(API_ENDPOINTS.DISCOUNT.VALIDATE, { code, orderAmount }),

  applyCoupon: (code: string, orderId: string) =>
    api.post(API_ENDPOINTS.DISCOUNT.APPLY, { code, orderId }),
};

export default discountService;
