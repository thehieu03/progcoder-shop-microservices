/**
 * Brands API Routes
 * GET /api/brands - List all brands
 * POST /api/brands - Create new brand
 */

import { NextRequest } from "next/server";
import { mockStore, generateGuid } from "../_lib/mockStore";
import { successResponse, errorResponse, getPaginationParams, simulateDelay } from "../_lib/utils";

// GET /api/brands - Get all brands
export async function GET(request: NextRequest) {
  await simulateDelay(200);
  
  try {
    const { searchParams } = new URL(request.url);
    const { pageIndex, pageSize } = getPaginationParams(searchParams);
    
    const result = mockStore.paginate(mockStore.brands, pageIndex, pageSize);
    return successResponse(result);
  } catch (error) {
    return errorResponse("Failed to fetch brands", 500);
  }
}

// POST /api/brands - Create new brand
export async function POST(request: NextRequest) {
  await simulateDelay(300);
  
  try {
    const body = await request.json();
    
    if (!body.name) {
      return errorResponse("Name is required");
    }
    
    const newBrand = {
      id: generateGuid(),
      ...body,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
      created: new Date().toISOString(),
    };
    
    mockStore.brands.push(newBrand);
    
    return successResponse({ brand: newBrand }, 201);
  } catch (error) {
    return errorResponse("Failed to create brand", 500);
  }
}
