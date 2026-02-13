/**
 * Products API Routes
 * GET /api/products - List all products with pagination
 * POST /api/products - Create new product
 */

import { NextRequest } from "next/server";
import { mockStore, generateGuid } from "../_lib/mockStore";
import { successResponse, errorResponse, getPaginationParams, simulateDelay } from "../_lib/utils";

// GET /api/products - Get products list
export async function GET(request: NextRequest) {
  await simulateDelay(300);
  
  try {
    const { searchParams } = new URL(request.url);
    const { pageIndex, pageSize } = getPaginationParams(searchParams);
    
    // Check if requesting all products (no pagination)
    const getAll = searchParams.get("all") === "true";
    
    if (getAll) {
      return successResponse({
        result: {
          items: mockStore.products,
        },
      });
    }
    
    const result = mockStore.paginate(mockStore.products, pageIndex, pageSize);
    return successResponse(result);
  } catch (error) {
    return errorResponse("Failed to fetch products", 500);
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  await simulateDelay(400);
  
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.sku || !body.price) {
      return errorResponse("Name, SKU and price are required");
    }
    
    // Check for duplicate SKU
    if (mockStore.products.some((p) => p.sku === body.sku)) {
      return errorResponse("SKU already exists");
    }
    
    const newProduct = {
      id: generateGuid(),
      ...body,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
      published: body.published ?? false,
      featured: body.featured ?? false,
      status: body.status ?? 1,
      displayStatus: body.displayStatus || "In Stock",
      created: new Date().toISOString(),
      createdBy: "admin",
      modified: new Date().toISOString(),
      modifiedBy: "admin",
    };
    
    mockStore.products.push(newProduct);
    
    return successResponse({ product: newProduct }, 201);
  } catch (error) {
    return errorResponse("Failed to create product", 500);
  }
}
