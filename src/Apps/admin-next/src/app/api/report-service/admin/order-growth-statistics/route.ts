/**
 * Order Growth Statistics API Route
 * GET /api/report-service/admin/order-growth-statistics
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse, simulateDelay } from "../../../_lib/utils";
import { mockOrderGrowthStatistics } from "@/mock/services/report.mock";

// GET /api/report-service/admin/order-growth-statistics
export async function GET(request: NextRequest) {
  await simulateDelay(300);
  
  try {
    return successResponse({
      result: {
        items: mockOrderGrowthStatistics.data,
      },
    });
  } catch (error) {
    return errorResponse("Failed to fetch order growth statistics", 500);
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
