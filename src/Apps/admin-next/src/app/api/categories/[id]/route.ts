/**
 * Category Detail API Routes
 * GET /api/categories/[id] - Get category by ID
 * PUT /api/categories/[id] - Update category
 * DELETE /api/categories/[id] - Delete category
 */

import { NextRequest } from "next/server";
import { mockStore } from "../../_lib/mockStore";
import { successResponse, errorResponse, notFoundResponse, simulateDelay } from "../../_lib/utils";

// GET /api/categories/[id] - Get category detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateDelay(200);
  
  try {
    const { id } = await params;
    const category = mockStore.categories.find((c) => c.id === id);
    
    if (!category) {
      return notFoundResponse("Category not found");
    }
    
    return successResponse({ category });
  } catch (error) {
    return errorResponse("Failed to fetch category", 500);
  }
}

// PUT /api/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateDelay(300);
  
  try {
    const { id } = await params;
    const categoryIndex = mockStore.categories.findIndex((c) => c.id === id);
    
    if (categoryIndex === -1) {
      return notFoundResponse("Category not found");
    }
    
    const body = await request.json();
    
    const updatedCategory = {
      ...mockStore.categories[categoryIndex],
      ...body,
      id,
    };
    
    mockStore.categories[categoryIndex] = updatedCategory;
    
    return successResponse({ category: updatedCategory });
  } catch (error) {
    return errorResponse("Failed to update category", 500);
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateDelay(300);
  
  try {
    const { id } = await params;
    const categoryIndex = mockStore.categories.findIndex((c) => c.id === id);
    
    if (categoryIndex === -1) {
      return notFoundResponse("Category not found");
    }
    
    mockStore.categories.splice(categoryIndex, 1);
    
    return successResponse({ success: true });
  } catch (error) {
    return errorResponse("Failed to delete category", 500);
  }
}
