/**
 * Notifications API Routes
 * GET /api/notifications - List all notifications with pagination
 * POST /api/notifications - Mark notification as read
 */

import { NextRequest } from "next/server";
import { mockStore, generateGuid } from "../_lib/mockStore";
import { successResponse, errorResponse, getPaginationParams, simulateDelay } from "../_lib/utils";

// GET /api/notifications - Get notifications list
export async function GET(request: NextRequest) {
  await simulateDelay(200);
  
  try {
    const { searchParams } = new URL(request.url);
    const { pageIndex, pageSize } = getPaginationParams(searchParams);
    const getAll = searchParams.get("all") === "true";
    const unreadOnly = searchParams.get("unread") === "true";
    const top10 = searchParams.get("top10") === "true";
    const countUnread = searchParams.get("countUnread") === "true";
    
    if (countUnread) {
      const unreadCount = mockStore.notifications.filter((n) => !n.isRead).length;
      return successResponse({ count: unreadCount });
    }
    
    let notifications = mockStore.notifications;
    
    if (unreadOnly) {
      notifications = notifications.filter((n) => !n.isRead);
    }
    
    if (top10) {
      notifications = notifications.slice(0, 10);
      return successResponse({ notifications });
    }
    
    if (getAll) {
      return successResponse({ notifications });
    }
    
    const result = mockStore.paginate(notifications, pageIndex, pageSize);
    return successResponse(result);
  } catch (error) {
    return errorResponse("Failed to fetch notifications", 500);
  }
}

// POST /api/notifications - Create new notification or mark as read
export async function POST(request: NextRequest) {
  await simulateDelay(300);
  
  try {
    const body = await request.json();
    
    // Mark as read
    if (body.id && body.action === "markAsRead") {
      const notification = mockStore.notifications.find((n) => n.id === body.id);
      if (!notification) {
        return errorResponse("Notification not found", 404);
      }
      notification.isRead = true;
      (notification as any).modified = new Date().toISOString();
      return successResponse({ success: true });
    }
    
    // Create new notification
    if (!body.title || !body.message) {
      return errorResponse("Title and message are required");
    }
    
    const newNotification = {
      id: generateGuid(),
      ...body,
      type: body.type || "general",
      isRead: false,
      created: new Date().toISOString(),
    };
    
    mockStore.notifications.unshift(newNotification);
    
    return successResponse({ notification: newNotification }, 201);
  } catch (error) {
    return errorResponse("Failed to process notification", 500);
  }
}
