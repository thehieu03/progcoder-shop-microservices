/**
 * Dashboard Statistics API Route
 * GET /api/dashboard/statistics - Get dashboard statistics
 */

import { NextRequest } from "next/server";
import { mockStore } from "../../_lib/mockStore";
import { successResponse, errorResponse, simulateDelay } from "../../_lib/utils";

// GET /api/dashboard/statistics - Get dashboard statistics
export async function GET(request: NextRequest) {
  await simulateDelay(400);
  
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    
    // Order growth line chart
    if (type === "orderGrowth") {
      return successResponse({
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        data: [65, 78, 90, 81, 96, 105],
      });
    }
    
    // Top products pie chart
    if (type === "topProducts") {
      return successResponse({
        labels: ["iPhone 15 Pro Max", "MacBook Pro M3", "Samsung Galaxy S24 Ultra", "Sony WH-1000XM5", "iPad Pro"],
        data: [35, 25, 20, 12, 8],
      });
    }
    
    // Main dashboard statistics
    const totalRevenue = mockStore.orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    
    return successResponse({
      totalRevenue,
      totalOrders: mockStore.orders.length,
      totalProducts: mockStore.products.length,
      totalCustomers: 5, // Mock value
      growthRate: 15.5,
    });
  } catch (error) {
    return errorResponse("Failed to fetch statistics", 500);
  }
}
