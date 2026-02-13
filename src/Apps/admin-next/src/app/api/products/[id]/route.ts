/**
 * Product Detail API Routes
 * GET /api/products/[id] - Get product by ID
 * PUT /api/products/[id] - Update product
 * DELETE /api/products/[id] - Delete product
 */

import { NextRequest } from "next/server";
import { mockStore } from "../../_lib/mockStore";
import { successResponse, errorResponse, notFoundResponse, simulateDelay } from "../../_lib/utils";

// GET /api/products/[id] - Get product detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateDelay(300);
  
  try {
    const { id } = await params;
    const product = mockStore.products.find((p) => p.id === id);
    
    if (!product) {
      return notFoundResponse("Product not found");
    }
    
    return successResponse({ product });
  } catch (error) {
    return errorResponse("Failed to fetch product", 500);
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateDelay(400);
  
  try {
    const { id } = await params;
    const productIndex = mockStore.products.findIndex((p) => p.id === id);
    
    if (productIndex === -1) {
      return notFoundResponse("Product not found");
    }
    
    const body = await request.json();
    
    // Check for duplicate SKU if changing SKU
    if (body.sku && body.sku !== mockStore.products[productIndex].sku) {
      if (mockStore.products.some((p) => p.sku === body.sku && p.id !== id)) {
        return errorResponse("SKU already exists");
      }
    }
    
    const updatedProduct = {
      ...mockStore.products[productIndex],
      ...body,
      id, // Ensure ID doesn't change
      modified: new Date().toISOString(),
      modifiedBy: "admin",
    };
    
    mockStore.products[productIndex] = updatedProduct;
    
    return successResponse({ product: updatedProduct });
  } catch (error) {
    return errorResponse("Failed to update product", 500);
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateDelay(300);
  
  try {
    const { id } = await params;
    const productIndex = mockStore.products.findIndex((p) => p.id === id);
    
    if (productIndex === -1) {
      return notFoundResponse("Product not found");
    }
    
    mockStore.products.splice(productIndex, 1);
    
    return successResponse({ success: true });
  } catch (error) {
    return errorResponse("Failed to delete product", 500);
  }
}
