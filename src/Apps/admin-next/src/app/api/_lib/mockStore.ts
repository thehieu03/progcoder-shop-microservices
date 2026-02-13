/**
 * Mock Data Store - In-memory storage for fake data
 * This replaces MirageJS with a simple in-memory store for API routes
 */

import { mockProducts, mockCategories, mockBrands } from "@/mock/services/catalog.mock";

// Helper to generate GUID
export const generateGuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Generate initial orders
const generateOrders = () => [
  {
    id: generateGuid(),
    orderNo: "ORD-2024-0001",
    customerId: generateGuid(),
    customerName: "Nguyen Van A",
    customerEmail: "nguyenvana@example.com",
    customerPhone: "0901234567",
    shippingAddress: "123 Le Loi, District 1, Ho Chi Minh City",
    billingAddress: "123 Le Loi, District 1, Ho Chi Minh City",
    items: [
      { id: generateGuid(), productId: mockProducts[0]?.id, productName: "iPhone 15 Pro Max", sku: "IP15PM-256", quantity: 1, unitPrice: 1199, subtotal: 1199, total: 1199 },
    ],
    subtotal: 1199,
    tax: 119.9,
    shippingFee: 10,
    total: 1328.9,
    status: 4,
    paymentStatus: 1,
    paymentMethod: "Credit Card",
    orderDate: new Date().toISOString(),
    created: new Date().toISOString(),
  },
  {
    id: generateGuid(),
    orderNo: "ORD-2024-0002",
    customerId: generateGuid(),
    customerName: "Tran Thi B",
    customerEmail: "tranthib@example.com",
    customerPhone: "0912345678",
    shippingAddress: "456 Nguyen Hue, District 1, Ho Chi Minh City",
    billingAddress: "456 Nguyen Hue, District 1, Ho Chi Minh City",
    items: [
      { id: generateGuid(), productId: mockProducts[1]?.id, productName: "MacBook Pro M3", sku: "MBP14-M3", quantity: 1, unitPrice: 1999, subtotal: 1999, total: 1999 },
      { id: generateGuid(), productId: mockProducts[5]?.id, productName: "AirPods Pro 2", sku: "APP-2ND", quantity: 1, unitPrice: 249, subtotal: 249, total: 249 },
    ],
    subtotal: 2248,
    tax: 224.8,
    shippingFee: 0,
    total: 2472.8,
    status: 2,
    paymentStatus: 1,
    paymentMethod: "Bank Transfer",
    orderDate: new Date().toISOString(),
    created: new Date().toISOString(),
  },
  {
    id: generateGuid(),
    orderNo: "ORD-2024-0003",
    customerId: generateGuid(),
    customerName: "Le Van C",
    customerEmail: "levanc@example.com",
    customerPhone: "0923456789",
    shippingAddress: "789 Hai Ba Trung, District 3, Ho Chi Minh City",
    billingAddress: "789 Hai Ba Trung, District 3, Ho Chi Minh City",
    items: [
      { id: generateGuid(), productId: mockProducts[2]?.id, productName: "Samsung Galaxy S24 Ultra", sku: "S24U-512", quantity: 2, unitPrice: 1299, subtotal: 2598, total: 2598 },
    ],
    subtotal: 2598,
    tax: 259.8,
    shippingFee: 15,
    total: 2872.8,
    status: 1,
    paymentStatus: 1,
    paymentMethod: "Credit Card",
    orderDate: new Date().toISOString(),
    created: new Date().toISOString(),
  },
];

// Generate inventory items
const generateInventoryItems = () => [
  { id: generateGuid(), productId: mockProducts[0]?.id, productName: "iPhone 15 Pro Max", sku: "IP15PM-256", quantity: 100, reservedQuantity: 5, availableQuantity: 95, locationId: generateGuid(), locationName: "Main Warehouse", status: 0, reorderPoint: 10, reorderQuantity: 50, created: new Date().toISOString() },
  { id: generateGuid(), productId: mockProducts[1]?.id, productName: "MacBook Pro M3", sku: "MBP14-M3", quantity: 50, reservedQuantity: 2, availableQuantity: 48, locationId: generateGuid(), locationName: "Main Warehouse", status: 0, reorderPoint: 5, reorderQuantity: 25, created: new Date().toISOString() },
  { id: generateGuid(), productId: mockProducts[2]?.id, productName: "Samsung Galaxy S24 Ultra", sku: "S24U-512", quantity: 0, reservedQuantity: 0, availableQuantity: 0, locationId: generateGuid(), locationName: "Main Warehouse", status: 2, reorderPoint: 5, reorderQuantity: 30, created: new Date().toISOString() },
  { id: generateGuid(), productId: mockProducts[3]?.id, productName: "Sony WH-1000XM5", sku: "SONY-XM5", quantity: 25, reservedQuantity: 3, availableQuantity: 22, locationId: generateGuid(), locationName: "Store A", status: 1, reorderPoint: 10, reorderQuantity: 20, created: new Date().toISOString() },
  { id: generateGuid(), productId: mockProducts[4]?.id, productName: "iPad Pro 12.9", sku: "IPAD-PRO", quantity: 40, reservedQuantity: 8, availableQuantity: 32, locationId: generateGuid(), locationName: "Main Warehouse", status: 0, reorderPoint: 8, reorderQuantity: 20, created: new Date().toISOString() },
];

// Generate coupons
const generateCoupons = () => [
  { id: generateGuid(), code: "WELCOME2024", name: "Welcome Discount", description: "20% off for new customers", discountType: 0, discountValue: 20, minOrderAmount: 50, maxDiscountAmount: 100, usageLimit: 100, usageCount: 45, validFrom: "2024-01-01T00:00:00Z", validTo: "2024-12-31T23:59:59Z", status: 1, active: true, created: new Date().toISOString() },
  { id: generateGuid(), code: "SUMMER50", name: "Summer Sale", description: "$50 off orders over $200", discountType: 1, discountValue: 50, minOrderAmount: 200, maxDiscountAmount: 50, usageLimit: 50, usageCount: 12, validFrom: "2024-06-01T00:00:00Z", validTo: "2024-08-31T23:59:59Z", status: 1, active: true, created: new Date().toISOString() },
  { id: generateGuid(), code: "FLASHSALE", name: "Flash Sale", description: "15% off flash sale", discountType: 0, discountValue: 15, minOrderAmount: 0, maxDiscountAmount: 50, usageLimit: 200, usageCount: 198, validFrom: "2024-01-01T00:00:00Z", validTo: "2024-12-31T23:59:59Z", status: 1, active: true, created: new Date().toISOString() },
  { id: generateGuid(), code: "EXPIRED2023", name: "Old Promo", description: "Expired promotion", discountType: 0, discountValue: 10, minOrderAmount: 0, maxDiscountAmount: 20, usageLimit: 100, usageCount: 100, validFrom: "2023-01-01T00:00:00Z", validTo: "2023-12-31T23:59:59Z", status: 2, active: false, created: new Date().toISOString() },
  { id: generateGuid(), code: "VIP2024", name: "VIP Discount", description: "30% off for VIP members", discountType: 0, discountValue: 30, minOrderAmount: 100, maxDiscountAmount: 200, usageLimit: 20, usageCount: 5, validFrom: "2024-01-01T00:00:00Z", validTo: "2024-12-31T23:59:59Z", status: 1, active: true, created: new Date().toISOString() },
];

// Generate notifications
const generateNotifications = () => [
  { id: generateGuid(), title: "New Order", message: "You have a new order #ORD-2024-0001", type: "order", isRead: false, created: new Date().toISOString() },
  { id: generateGuid(), title: "Low Stock Alert", message: "Samsung Galaxy S24 Ultra is out of stock", type: "inventory", isRead: false, created: new Date().toISOString() },
  { id: generateGuid(), title: "Payment Received", message: "Payment received for order #ORD-2024-0002", type: "payment", isRead: true, created: new Date().toISOString() },
  { id: generateGuid(), title: "New Customer", message: "New customer registered: Hoang Van E", type: "customer", isRead: true, created: new Date().toISOString() },
  { id: generateGuid(), title: "Coupon Expiring", message: "Coupon FLASHSALE is about to expire", type: "coupon", isRead: false, created: new Date().toISOString() },
];

// In-memory store
class MockStore {
  products = [...mockProducts];
  categories = [...mockCategories];
  brands = [...mockBrands];
  orders = generateOrders();
  inventory = generateInventoryItems();
  coupons = generateCoupons();
  notifications = generateNotifications();

  // Helper methods for pagination
  paginate<T>(items: T[], pageIndex: number, pageSize: number) {
    const start = (pageIndex - 1) * pageSize;
    const end = start + pageSize;
    return {
      items: items.slice(start, end),
      totalCount: items.length,
      pageIndex,
      pageSize,
      totalPages: Math.ceil(items.length / pageSize),
      hasPreviousPage: pageIndex > 1,
      hasNextPage: end < items.length,
    };
  }
}

// Export singleton instance
export const mockStore = new MockStore();
