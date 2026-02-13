/**
 * Discount Service Type Definitions
 */

import { Guid, AuditableDto, PaginatedResponse, FilterParams } from './api';

// ==================== Coupon Types ====================

export enum CouponStatus {
  Draft = 0,
  Active = 1,
  Expired = 2,
  Disabled = 3,
}

export enum DiscountType {
  Percentage = 0,
  FixedAmount = 1,
}

export interface CouponDto extends AuditableDto {
  id: Guid;
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  validFrom: string;
  validTo: string;
  status: CouponStatus;
  active: boolean;
}

export interface CreateCouponRequest {
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  validFrom: string;
  validTo: string;
}

export interface UpdateCouponRequest extends CreateCouponRequest {}

export interface UpdateValidityPeriodRequest {
  validFrom: string;
  validTo: string;
}

export interface ValidateCouponRequest {
  code: string;
  orderAmount: number;
  userId?: Guid;
}

export interface ApplyCouponRequest {
  code: string;
  orderId: Guid;
  orderAmount: number;
}

export interface GetCouponsParams extends FilterParams {
  code?: string;
  status?: CouponStatus;
  discountType?: DiscountType;
}

export interface GetAllCouponsResponse {
  coupons: CouponDto[];
}

export interface GetCouponsResponse extends PaginatedResponse<CouponDto> {}
