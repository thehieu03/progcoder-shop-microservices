/**
 * SignalR Service Type Definitions
 */

import * as signalR from '@microsoft/signalr';
import { NotificationDto } from './notification';

// ==================== SignalR Types ====================

export type NotificationCallback = (notification: NotificationDto) => void;

export type UnsubscribeFunction = () => void;

export interface ISignalRService {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectDelay: number;
  callbacks: Map<string, NotificationCallback>;

  getHubUrl(): string;
  getAccessToken(): string | null;
  createConnection(): signalR.HubConnection;
  connect(): Promise<void>;
  setupNotificationHandler(): void;
  onNotificationByKey(key: string, callback: NotificationCallback): UnsubscribeFunction;
  offNotificationByKey(key: string): boolean;
  onNotification(callback: NotificationCallback): UnsubscribeFunction;
  disconnect(): Promise<void>;
  getConnected(): boolean;
}

// Re-export SignalR types for convenience
export { signalR };
export type { HubConnection, HubConnectionState, LogLevel } from '@microsoft/signalr';
