/**
 * CORS Configuration for Mock API
 * Cho phép các project khác gọi API từ domain khác
 */

import { NextResponse } from "next/server";

// Các domain được phép gọi API (có thể thêm domain của bạn vào đây)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173", // Vite default
  "http://localhost:8080",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

// CORS headers mặc định
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
};

// Hàm kiểm tra và trả về origin phù hợp
export function getCorsHeaders(origin: string | null): Record<string, string> {
  if (!origin) return corsHeaders;
  
  // Cho phép tất cả origin trong development
  // Trong production, bạn nên giới hạn lại
  return {
    ...corsHeaders,
    "Access-Control-Allow-Origin": origin,
  };
}

// Wrapper cho API responses với CORS headers
export function corsResponse<T>(data: T, status = 200, origin: string | null = null) {
  return NextResponse.json(data, {
    status,
    headers: getCorsHeaders(origin),
  });
}

// Handle OPTIONS request (preflight)
export function handleCorsPreflight(request: Request) {
  const origin = request.headers.get("origin");
  
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}
