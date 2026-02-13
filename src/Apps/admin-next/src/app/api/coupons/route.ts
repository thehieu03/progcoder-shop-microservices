/**
 * Coupons API Routes
 * GET /api/coupons - List all coupons with pagination
 * POST /api/coupons - Create new coupon
 */

import { NextRequest } from "next/server";
import { mockStore, generateGuid } from "../_lib/mockStore";
import { successResponse, errorResponse, getPaginationParams, simulateDelay } from "../_lib/utils";

// GET /api/coupons - Get coupons list
export async function GET(request: NextRequest) {
  await simulateDelay(300);
  
  try {
    const { searchParams } = new URL(request.url);
    const { pageIndex, pageSize } = getPaginationParams(searchParams);
    const getAll = searchParams.get("all") === "true";
    
    if (getAll) {
      return successResponse({
        coupons: mockStore.coupons,
      });
    }
    
    const result = mockStore.paginate(mockStore.coupons, pageIndex, pageSize);
    return successResponse(result);
  } catch (error) {
    return errorResponse("Failed to fetch coupons", 500);
  }
}

// POST /api/coupons - Create new coupon
export async function POST(request: NextRequest) {
  await simulateDelay(400);
  
  try {
    const body = await request.json();
    
    if (!body.code || !body.name) {
      return errorResponse("Code and name are required");
    }
    
    // Check for duplicate code
    if (mockStore.coupons.some((c) => c.code === body.code)) {
      return errorResponse("Coupon code already exists");
    }
    
    const newCoupon = {
      id: generateGuid(),
      ...body,
      usageCount: 0,
      status: body.status ?? 0,
      active: body.active ?? true,
      created: new Date().toISOString(),
    };
    
    mockStore.coupons.push(newCoupon);
    
    return successResponse({ coupon: newCoupon }, 201);
  } catch (error) {
    return errorResponse("Failed to create coupon", 500);
  }
}
