# Day 16: SignalR + Notifications

## Mục tiêu
Tích hợp SignalR cho real-time notifications.

## SignalR Service - `src/core/services/signalRService.ts`

```typescript
import * as signalR from "@microsoft/signalr";

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  async connect(url: string, token?: string): Promise<void> {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(url, { accessTokenFactory: () => token || "" })
      .withAutomaticReconnect()
      .build();

    this.connection.onreconnecting(() => console.log("SignalR reconnecting..."));
    this.connection.onreconnected(() => console.log("SignalR reconnected"));
    this.connection.onclose(() => console.log("SignalR closed"));

    try {
      await this.connection.start();
      console.log("SignalR connected");
    } catch (error) {
      console.error("SignalR connection failed:", error);
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
      this.connection?.on(event, (data) => {
        this.listeners.get(event)?.forEach((cb) => cb(data));
      });
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  async invoke(method: string, ...args: any[]): Promise<any> {
    return this.connection?.invoke(method, ...args);
  }

  async disconnect(): Promise<void> {
    await this.connection?.stop();
    this.connection = null;
  }
}

export default new SignalRService();
```

## Notification Component - `src/components/partials/header/Tools/Notification.tsx`

```typescript
"use client";
import React, { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
// import signalRService from "@/core/services/signalRService";

const MOCK_NOTIFICATIONS = [
  { id: "1", title: "New Order", message: "New order #ORD-2024-001 received", type: "order", isRead: false, created: new Date().toISOString() },
  { id: "2", title: "Low Stock", message: "Samsung Galaxy S24 Ultra is out of stock", type: "inventory", isRead: false, created: new Date(Date.now() - 3600000).toISOString() },
  { id: "3", title: "Payment Received", message: "Payment received for order #ORD-2024-002", type: "payment", isRead: true, created: new Date(Date.now() - 7200000).toISOString() },
];

const Notification: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load mock notifications
    setNotifications(MOCK_NOTIFICATIONS);
    setUnreadCount(MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length);

    // SignalR integration (commented for mock mode)
    // signalRService.on("NewNotification", (notification) => {
    //   setNotifications((prev) => [notification, ...prev]);
    //   setUnreadCount((count) => count + 1);
    //   toast.info(notification.message);
    // });

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((count) => Math.max(0, count - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "order": return "heroicons:shopping-bag";
      case "inventory": return "heroicons:archive-box";
      case "payment": return "heroicons:credit-card";
      case "customer": return "heroicons:user";
      default: return "heroicons:bell";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
        <Icon icon="heroicons:bell" className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        {unreadCount > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">{unreadCount}</span>}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold">{t("notifications.title")}</h3>
            {unreadCount > 0 && <button onClick={markAllAsRead} className="text-sm text-primary-500 hover:text-primary-600">{t("notifications.markAllAsRead")}</button>}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-500">{t("notifications.noNotifications")}</div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} onClick={() => markAsRead(notification.id)} className={`flex items-start p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer ${!notification.isRead ? "bg-primary-50/50 dark:bg-primary-900/20" : ""}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${notification.isRead ? "bg-slate-100 dark:bg-slate-700" : "bg-primary-500/20"}`}>
                    <Icon icon={getIcon(notification.type)} className={`w-5 h-5 ${notification.isRead ? "text-slate-500" : "text-primary-500"}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${!notification.isRead ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>{notification.title}</p>
                    <p className="text-sm text-slate-500">{notification.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(notification.created).toLocaleTimeString()}</p>
                  </div>
                  {!notification.isRead && <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />}
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t border-slate-200 dark:border-slate-700 text-center">
            <a href="/notifications" className="text-sm text-primary-500 hover:text-primary-600">{t("notifications.viewAll")}</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
```

## Checklist
- [ ] Notification dropdown UI
- [ ] Unread count badge
- [ ] Mark as read functionality
- [ ] SignalR integration structure

## Liên kết
- [Day 17: Reports/Dashboard](./day-17.md) - Tiếp theo
