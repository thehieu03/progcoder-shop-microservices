/**
 * Brand Detail API Routes
 * GET /api/brands/[id] - Get brand by ID
 * PUT /api/brands/[id] - Update brand
 * DELETE /api/brands/[id] - Delete brand
 */

import { NextRequest } from "next/server";
import { mockStore } from "../../_lib/mockStore";
import { successResponse, errorResponse, notFoundResponse, simulateDelay } from "../../_lib/utils";

// GET /api/brands/[id] - Get brand detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateDelay(200);
  
  try {
    const { id } = await params;
    const brand = mockStore.brands.find((b) => b.id === id);
    
    if (!brand) {
      return notFoundResponse("Brand not found");
    }
    
    return successResponse({ brand });
  } catch (error) {
    return errorResponse("Failed to fetch brand", 500);
  }
}

// PUT /api/brands/[id] - Update brand
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateDelay(300);
  
  try {
    const { id } = await params;
    const brandIndex = mockStore.brands.findIndex((b) => b.id === id);
    
    if (brandIndex === -1) {
      return notFoundResponse("Brand not found");
    }
    
    const body = await request.json();
    
    const updatedBrand = {
      ...mockStore.brands[brandIndex],
      ...body,
      id,
    };
    
    mockStore.brands[brandIndex] = updatedBrand;
    
    return successResponse({ brand: updatedBrand });
  } catch (error) {
    return errorResponse("Failed to update brand", 500);
  }
}

// DELETE /api/brands/[id] - Delete brand
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateDelay(300);
  
  try {
    const { id } = await params;
    const brandIndex = mockStore.brands.findIndex((b) => b.id === id);
    
    if (brandIndex === -1) {
      return notFoundResponse("Brand not found");
    }
    
    mockStore.brands.splice(brandIndex, 1);
    
    return successResponse({ success: true });
  } catch (error) {
    return errorResponse("Failed to delete brand", 500);
  }
}
