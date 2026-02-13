/**
 * Notification Service Type Definitions
 */

import { Guid, AuditableDto } from './api';

// ==================== Notification Types ====================

export enum NotificationType {
  Info = 0,
  Success = 1,
  Warning = 2,
  Error = 3,
}

export enum NotificationPriority {
  Low = 0,
  Normal = 1,
  High = 2,
  Urgent = 3,
}

export interface NotificationDto extends AuditableDto {
  id: Guid;
  userId?: Guid;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: string;
  link?: string;
  metadata?: Record<string, any>;
}

export interface GetTop10UnreadResponse {
  notifications: NotificationDto[];
}

export interface GetUnreadCountResponse {
  count: number;
}

export interface GetAllNotificationsResponse {
  notifications: NotificationDto[];
}

export interface MarkAsReadRequest {
  ids: Guid[];
}
