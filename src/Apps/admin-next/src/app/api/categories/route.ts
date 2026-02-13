/**
 * Categories API Routes
 * GET /api/categories - List all categories
 * POST /api/categories - Create new category
 */

import { NextRequest } from "next/server";
import { mockStore, generateGuid } from "../_lib/mockStore";
import { successResponse, errorResponse, simulateDelay } from "../_lib/utils";

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  await simulateDelay(200);
  
  try {
    const { searchParams } = new URL(request.url);
    const tree = searchParams.get("tree") === "true";
    
    if (tree) {
      // Return categories in tree format (flat for now)
      return successResponse({
        categories: mockStore.categories,
      });
    }
    
    return successResponse({
      categories: mockStore.categories,
    });
  } catch (error) {
    return errorResponse("Failed to fetch categories", 500);
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  await simulateDelay(300);
  
  try {
    const body = await request.json();
    
    if (!body.name) {
      return errorResponse("Name is required");
    }
    
    const newCategory = {
      id: generateGuid(),
      ...body,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
      created: new Date().toISOString(),
    };
    
    mockStore.categories.push(newCategory);
    
    return successResponse({ category: newCategory }, 201);
  } catch (error) {
    return errorResponse("Failed to create category", 500);
  }
}
