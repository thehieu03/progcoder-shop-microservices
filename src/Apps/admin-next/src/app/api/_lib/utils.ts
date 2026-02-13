/**
 * API Utilities
 */

import { NextResponse } from "next/server";
import { corsHeaders, getCorsHeaders } from "./cors";

// Success response with CORS
export function successResponse<T>(data: T, status = 200, request?: Request) {
  const origin = request?.headers.get("origin");
  return NextResponse.json(data, { 
    status,
    headers: getCorsHeaders(origin),
  });
}

// Error response with CORS
export function errorResponse(message: string, status = 400, request?: Request) {
  const origin = request?.headers.get("origin");
  return NextResponse.json(
    { error: message },
    { status, headers: getCorsHeaders(origin) }
  );
}

// Not found response with CORS
export function notFoundResponse(message = "Resource not found", request?: Request) {
  const origin = request?.headers.get("origin");
  return NextResponse.json(
    { error: message },
    { status: 404, headers: getCorsHeaders(origin) }
  );
}

// Parse pagination params from URL
export function getPaginationParams(searchParams: URLSearchParams) {
  const pageIndex = parseInt(searchParams.get("pageIndex") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  return {
    pageIndex: Math.max(1, pageIndex),
    pageSize: Math.max(1, Math.min(100, pageSize)),
  };
}

// Delay simulation for realistic API behavior
export async function simulateDelay(ms = 300) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

// Re-export CORS utilities
export { corsHeaders, getCorsHeaders };
