/**
 * Notification Service
 * Mock service functions for notification management
 */

import { AxiosResponse } from 'axios';
import {
  Guid,
  GetTop10UnreadResponse,
  GetUnreadCountResponse,
  GetAllNotificationsResponse,
} from '@/shared/types';
import { mockNotifications } from '@/mock/services/notification.mock';

// Helper to create mock response
const createMockResponse = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: "OK",
  headers: {},
  config: {} as any,
});

export const notificationService = {
  getTop10Unread: async (): Promise<AxiosResponse<GetTop10UnreadResponse>> => {
    const unreadNotifications = mockNotifications.filter((n) => !n.isRead).slice(0, 10);
    return createMockResponse({ notifications: unreadNotifications });
  },

  getUnreadCount: async (): Promise<AxiosResponse<GetUnreadCountResponse>> => {
    const unreadCount = mockNotifications.filter((n) => !n.isRead).length;
    return createMockResponse({ count: unreadCount });
  },

  getAll: async (): Promise<AxiosResponse<GetAllNotificationsResponse>> => {
    return createMockResponse({ notifications: mockNotifications });
  },

  markAsRead: async (ids: Guid[]): Promise<AxiosResponse<void>> => {
    // Mark notifications as read in mock data
    mockNotifications.forEach((n) => {
      if (ids.includes(n.id as Guid)) {
        n.isRead = true;
      }
    });
    return createMockResponse(undefined as any);
  },
};

export default notificationService;
