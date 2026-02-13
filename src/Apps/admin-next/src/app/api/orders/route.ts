/**
 * Orders API Routes
 * GET /api/orders - List all orders with pagination
 * POST /api/orders - Create new order
 */

import { NextRequest } from "next/server";
import { mockStore, generateGuid } from "../_lib/mockStore";
import { successResponse, errorResponse, getPaginationParams, simulateDelay } from "../_lib/utils";

// GET /api/orders - Get orders list
export async function GET(request: NextRequest) {
  await simulateDelay(300);
  
  try {
    const { searchParams } = new URL(request.url);
    const { pageIndex, pageSize } = getPaginationParams(searchParams);
    const getAll = searchParams.get("all") === "true";
    
    if (getAll) {
      return successResponse({
        orders: mockStore.orders,
      });
    }
    
    const result = mockStore.paginate(mockStore.orders, pageIndex, pageSize);
    return successResponse(result);
  } catch (error) {
    return errorResponse("Failed to fetch orders", 500);
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  await simulateDelay(500);
  
  try {
    const body = await request.json();
    
    if (!body.customerName || !body.items || body.items.length === 0) {
      return errorResponse("Customer name and items are required");
    }
    
    const orderNo = `ORD-${new Date().getFullYear()}-${String(mockStore.orders.length + 1).padStart(4, "0")}`;
    
    const newOrder = {
      id: generateGuid(),
      orderNo,
      ...body,
      status: body.status ?? 0,
      paymentStatus: body.paymentStatus ?? 0,
      orderDate: new Date().toISOString(),
      created: new Date().toISOString(),
    };
    
    mockStore.orders.push(newOrder);
    
    return successResponse({ order: newOrder }, 201);
  } catch (error) {
    return errorResponse("Failed to create order", 500);
  }
}
