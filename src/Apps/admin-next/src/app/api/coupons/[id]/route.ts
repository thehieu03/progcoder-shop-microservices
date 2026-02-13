/**
 * Coupon Detail API Routes
 * GET /api/coupons/[id] - Get coupon by ID
 * PUT /api/coupons/[id] - Update coupon
 * DELETE /api/coupons/[id] - Delete coupon
 */

import { NextRequest } from "next/server";
import { mockStore } from "../../_lib/mockStore";
import { successResponse, errorResponse, notFoundResponse, simulateDelay } from "../../_lib/utils";

// GET /api/coupons/[id] - Get coupon detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateDelay(200);
  
  try {
    const { id } = await params;
    const coupon = mockStore.coupons.find((c) => c.id === id);
    
    if (!coupon) {
      return notFoundResponse("Coupon not found");
    }
    
    return successResponse({ coupon });
  } catch (error) {
    return errorResponse("Failed to fetch coupon", 500);
  }
}

// PUT /api/coupons/[id] - Update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateDelay(300);
  
  try {
    const { id } = await params;
    const couponIndex = mockStore.coupons.findIndex((c) => c.id === id);
    
    if (couponIndex === -1) {
      return notFoundResponse("Coupon not found");
    }
    
    const body = await request.json();
    
    // Check for duplicate code if changing code
    if (body.code && body.code !== mockStore.coupons[couponIndex].code) {
      if (mockStore.coupons.some((c) => c.code === body.code && c.id !== id)) {
        return errorResponse("Coupon code already exists");
      }
    }
    
    const updatedCoupon = {
      ...mockStore.coupons[couponIndex],
      ...body,
      id,
      modified: new Date().toISOString(),
    };
    
    mockStore.coupons[couponIndex] = updatedCoupon;
    
    return successResponse({ coupon: updatedCoupon });
  } catch (error) {
    return errorResponse("Failed to update coupon", 500);
  }
}

// DELETE /api/coupons/[id] - Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateDelay(300);
  
  try {
    const { id } = await params;
    const couponIndex = mockStore.coupons.findIndex((c) => c.id === id);
    
    if (couponIndex === -1) {
      return notFoundResponse("Coupon not found");
    }
    
    mockStore.coupons.splice(couponIndex, 1);
    
    return successResponse({ success: true });
  } catch (error) {
    return errorResponse("Failed to delete coupon", 500);
  }
}
