/**
 * Inventory Detail API Routes
 * GET /api/inventory/[id] - Get inventory item by ID
 * PUT /api/inventory/[id] - Update inventory item
 * DELETE /api/inventory/[id] - Delete inventory item
 */

import { NextRequest } from "next/server";
import { mockStore } from "../../_lib/mockStore";
import { successResponse, errorResponse, notFoundResponse, simulateDelay } from "../../_lib/utils";

// GET /api/inventory/[id] - Get inventory item detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateDelay(300);
  
  try {
    const { id } = await params;
    const item = mockStore.inventory.find((i) => i.id === id);
    
    if (!item) {
      return notFoundResponse("Inventory item not found");
    }
    
    return successResponse({ item });
  } catch (error) {
    return errorResponse("Failed to fetch inventory item", 500);
  }
}

// PUT /api/inventory/[id] - Update inventory item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateDelay(400);
  
  try {
    const { id } = await params;
    const itemIndex = mockStore.inventory.findIndex((i) => i.id === id);
    
    if (itemIndex === -1) {
      return notFoundResponse("Inventory item not found");
    }
    
    const body = await request.json();
    
    const updatedItem = {
      ...mockStore.inventory[itemIndex],
      ...body,
      id,
      modified: new Date().toISOString(),
    };
    
    // Recalculate available quantity if quantity or reservedQuantity changed
    if (body.quantity !== undefined || body.reservedQuantity !== undefined) {
      const quantity = body.quantity ?? updatedItem.quantity;
      const reserved = body.reservedQuantity ?? updatedItem.reservedQuantity;
      updatedItem.availableQuantity = quantity - reserved;
    }
    
    mockStore.inventory[itemIndex] = updatedItem;
    
    return successResponse({ item: updatedItem });
  } catch (error) {
    return errorResponse("Failed to update inventory item", 500);
  }
}

// DELETE /api/inventory/[id] - Delete inventory item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateDelay(300);
  
  try {
    const { id } = await params;
    const itemIndex = mockStore.inventory.findIndex((i) => i.id === id);
    
    if (itemIndex === -1) {
      return notFoundResponse("Inventory item not found");
    }
    
    mockStore.inventory.splice(itemIndex, 1);
    
    return successResponse({ success: true });
  } catch (error) {
    return errorResponse("Failed to delete inventory item", 500);
  }
}
