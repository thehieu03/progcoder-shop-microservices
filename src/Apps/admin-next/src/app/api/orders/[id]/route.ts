/**
 * Order Detail API Routes
 * GET /api/orders/[id] - Get order by ID
 * PUT /api/orders/[id] - Update order
 * DELETE /api/orders/[id] - Delete order
 */

import { NextRequest } from "next/server";
import { mockStore } from "../../_lib/mockStore";
import { successResponse, errorResponse, notFoundResponse, simulateDelay } from "../../_lib/utils";

// GET /api/orders/[id] - Get order detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateDelay(300);
  
  try {
    const { id } = await params;
    const order = mockStore.orders.find((o) => o.id === id);
    
    if (!order) {
      return notFoundResponse("Order not found");
    }
    
    return successResponse({ order });
  } catch (error) {
    return errorResponse("Failed to fetch order", 500);
  }
}

// PUT /api/orders/[id] - Update order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateDelay(400);
  
  try {
    const { id } = await params;
    const orderIndex = mockStore.orders.findIndex((o) => o.id === id);
    
    if (orderIndex === -1) {
      return notFoundResponse("Order not found");
    }
    
    const body = await request.json();
    
    const updatedOrder = {
      ...mockStore.orders[orderIndex],
      ...body,
      id,
      modified: new Date().toISOString(),
    };
    
    mockStore.orders[orderIndex] = updatedOrder;
    
    return successResponse({ order: updatedOrder });
  } catch (error) {
    return errorResponse("Failed to update order", 500);
  }
}

// DELETE /api/orders/[id] - Delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateDelay(300);
  
  try {
    const { id } = await params;
    const orderIndex = mockStore.orders.findIndex((o) => o.id === id);
    
    if (orderIndex === -1) {
      return notFoundResponse("Order not found");
    }
    
    mockStore.orders.splice(orderIndex, 1);
    
    return successResponse({ success: true });
  } catch (error) {
    return errorResponse("Failed to delete order", 500);
  }
}
