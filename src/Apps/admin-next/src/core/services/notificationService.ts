/**
 * Notification Service
 * Handles notification operations
 */

import { api } from "@/api";
import { API_ENDPOINTS } from "@/api/endpoints";

export const notificationService = {
  getNotifications: (pageIndex = 1, pageSize = 10) =>
    api.get(API_ENDPOINTS.NOTIFICATION.GET_LIST, {
      params: { pageIndex, pageSize },
    }),

  getAllNotifications: () => api.get(API_ENDPOINTS.NOTIFICATION.GET_ALL),

  getUnreadCount: () => api.get(API_ENDPOINTS.NOTIFICATION.GET_COUNT_UNREAD),

  getTop10Unread: () => api.get(API_ENDPOINTS.NOTIFICATION.GET_TOP_10_UNREAD),

  markAsRead: (id: string) =>
    api.post(API_ENDPOINTS.NOTIFICATION.MARK_AS_READ, { id }),

  markAllAsRead: () =>
    api.post(API_ENDPOINTS.NOTIFICATION.MARK_AS_READ, {}),
};

export default notificationService;
