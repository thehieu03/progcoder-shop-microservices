/**
 * Discount API Service
 * Handles all discount-related API calls
 */

import { api } from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/endpoints';

interface CouponEvaluationResponse {
  discountAmount: number;
  discountPercentage: number;
  finalAmount: number;
  [key: string]: any;
}

export const discountService = {
  /**
   * Evaluate coupon code
   * @param {string} code - Coupon code
   * @param {number} amount - Original amount before discount
   * @returns {Promise} API response with discount details
   */
  evaluateCoupon: async (code: string, amount: number): Promise<CouponEvaluationResponse> => {
    return await api.post(API_ENDPOINTS.DISCOUNT.EVALUATE_COUPON, {
      code,
      amount,
    });
  },
};
