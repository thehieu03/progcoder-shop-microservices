/**
 * Inventory API Routes
 * GET /api/inventory - List all inventory items with pagination
 * POST /api/inventory - Create new inventory item
 */

import { NextRequest } from "next/server";
import { mockStore, generateGuid } from "../_lib/mockStore";
import { successResponse, errorResponse, getPaginationParams, simulateDelay } from "../_lib/utils";

// GET /api/inventory - Get inventory items
export async function GET(request: NextRequest) {
  await simulateDelay(300);
  
  try {
    const { searchParams } = new URL(request.url);
    const { pageIndex, pageSize } = getPaginationParams(searchParams);
    const getAll = searchParams.get("all") === "true";
    
    if (getAll) {
      return successResponse({
        items: mockStore.inventory,
      });
    }
    
    const result = mockStore.paginate(mockStore.inventory, pageIndex, pageSize);
    return successResponse(result);
  } catch (error) {
    return errorResponse("Failed to fetch inventory", 500);
  }
}

// POST /api/inventory - Create new inventory item
export async function POST(request: NextRequest) {
  await simulateDelay(400);
  
  try {
    const body = await request.json();
    
    if (!body.productId || !body.sku) {
      return errorResponse("Product ID and SKU are required");
    }
    
    const newItem = {
      id: generateGuid(),
      ...body,
      quantity: body.quantity ?? 0,
      reservedQuantity: body.reservedQuantity ?? 0,
      availableQuantity: body.availableQuantity ?? (body.quantity ?? 0),
      status: body.status ?? 0,
      created: new Date().toISOString(),
    };
    
    mockStore.inventory.push(newItem);
    
    return successResponse({ item: newItem }, 201);
  } catch (error) {
    return errorResponse("Failed to create inventory item", 500);
  }
}
