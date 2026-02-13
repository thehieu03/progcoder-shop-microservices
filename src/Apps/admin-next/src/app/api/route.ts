/**
 * Root API Route
 * Returns API information and available endpoints
 * 
 * GET /api - API documentation and endpoints list
 */

import { NextRequest } from "next/server";
import { successResponse, simulateDelay } from "./_lib/utils";

// API Information
const apiInfo = {
  name: "Mock E-Commerce API",
  version: "1.0.0",
  description: "Mock API for e-commerce admin dashboard development",
  baseUrl: "/api",
  documentation: "/api/docs",
  
  endpoints: {
    products: {
      base: "/api/products",
      methods: ["GET", "POST"],
      description: "Product management",
      params: {
        GET: { pageIndex: "number (default: 1)", pageSize: "number (default: 10)", all: "boolean (return all items)" },
        POST: { name: "string (required)", sku: "string (required)", price: "number (required)" },
      },
    },
    productDetail: {
      base: "/api/products/{id}",
      methods: ["GET", "PUT", "DELETE"],
      description: "Single product operations",
    },
    orders: {
      base: "/api/orders",
      methods: ["GET", "POST"],
      description: "Order management",
      params: {
        GET: { pageIndex: "number", pageSize: "number", all: "boolean" },
        POST: { customerName: "string (required)", items: "array (required)" },
      },
    },
    orderDetail: {
      base: "/api/orders/{id}",
      methods: ["GET", "PUT", "DELETE"],
      description: "Single order operations",
    },
    categories: {
      base: "/api/categories",
      methods: ["GET", "POST"],
      description: "Category management",
      params: {
        GET: { tree: "boolean (return tree structure)" },
        POST: { name: "string (required)" },
      },
    },
    categoryDetail: {
      base: "/api/categories/{id}",
      methods: ["GET", "PUT", "DELETE"],
      description: "Single category operations",
    },
    brands: {
      base: "/api/brands",
      methods: ["GET", "POST"],
      description: "Brand management",
    },
    brandDetail: {
      base: "/api/brands/{id}",
      methods: ["GET", "PUT", "DELETE"],
      description: "Single brand operations",
    },
    inventory: {
      base: "/api/inventory",
      methods: ["GET", "POST"],
      description: "Inventory management",
      params: {
        GET: { pageIndex: "number", pageSize: "number", all: "boolean" },
        POST: { productId: "string (required)", sku: "string (required)" },
      },
    },
    inventoryDetail: {
      base: "/api/inventory/{id}",
      methods: ["GET", "PUT", "DELETE"],
      description: "Single inventory item operations",
    },
    coupons: {
      base: "/api/coupons",
      methods: ["GET", "POST"],
      description: "Coupon/Discount management",
      params: {
        GET: { pageIndex: "number", pageSize: "number", all: "boolean" },
        POST: { code: "string (required)", name: "string (required)" },
      },
    },
    couponDetail: {
      base: "/api/coupons/{id}",
      methods: ["GET", "PUT", "DELETE"],
      description: "Single coupon operations",
    },
    notifications: {
      base: "/api/notifications",
      methods: ["GET", "POST"],
      description: "Notification management",
      params: {
        GET: { 
          pageIndex: "number", 
          pageSize: "number", 
          all: "boolean",
          unread: "boolean (filter unread only)",
          top10: "boolean (return top 10)",
          countUnread: "boolean (return unread count only)",
        },
        POST: { 
          title: "string (required for create)", 
          message: "string (required for create)",
          id: "string (for mark as read)",
          action: "'markAsRead' (for mark as read)",
        },
      },
    },
    dashboard: {
      base: "/api/dashboard/statistics",
      methods: ["GET"],
      description: "Dashboard statistics",
      params: {
        GET: { 
          type: "'orderGrowth' | 'topProducts' | undefined (for main stats)",
        },
      },
    },
  },
  
  responseFormat: {
    success: {
      single: "{ data: object }",
      list: "{ items: array, totalCount: number, pageIndex: number, pageSize: number, totalPages: number, hasPreviousPage: boolean, hasNextPage: boolean }",
    },
    error: "{ error: string }",
  },
  
  notes: [
    "All endpoints support CORS for cross-origin requests",
    "Responses include realistic delay (200-500ms) to simulate real API",
    "Data is stored in-memory and will reset on server restart",
    "All IDs are UUID v4 format",
    "Timestamps are in ISO 8601 format",
  ],
};

// GET /api - API info
export async function GET(request: NextRequest) {
  await simulateDelay(200);
  return successResponse(apiInfo, 200, request);
}

// OPTIONS /api - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
