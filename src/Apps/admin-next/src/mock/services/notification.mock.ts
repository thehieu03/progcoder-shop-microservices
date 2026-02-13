import type { Guid } from "@/shared/types";

export type MockNotification = {
  id: Guid | string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  created: string;
};

export const mockNotifications: MockNotification[] = [
  {
    id: "notif-001",
    title: "New Order",
    message: "You have a new order #ORD-2024-0001",
    type: "order",
    isRead: false,
    created: new Date().toISOString(),
  },
  {
    id: "notif-002",
    title: "Low Stock Alert",
    message: "Samsung Galaxy S24 Ultra is out of stock",
    type: "inventory",
    isRead: false,
    created: new Date().toISOString(),
  },
  {
    id: "notif-003",
    title: "Payment Received",
    message: "Payment received for order #ORD-2024-0002",
    type: "payment",
    isRead: true,
    created: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "notif-004",
    title: "New Customer",
    message: "New customer registered: Hoang Van E",
    type: "customer",
    isRead: true,
    created: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "notif-005",
    title: "Coupon Expiring",
    message: "Coupon FLASHSALE is about to expire",
    type: "coupon",
    isRead: false,
    created: new Date(Date.now() - 3600000).toISOString(),
  },
];
