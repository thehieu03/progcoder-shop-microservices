# Day 07: Mock Server

## Mục tiêu

Xây dựng Mock Server với MirageJS để phát triển không phụ thuộc backend:
- Mock Server với 895 lines
- API Endpoints configuration
- AppProviders integration

## 1. API Endpoints - `src/api/endpoints.ts`

```typescript
const API_BASE = "/api/v1";

export const API_ENDPOINTS = {
  // Catalog Service
  CATALOG: {
    GET_PRODUCTS: `${API_BASE}/catalog/products`,
    GET_ALL_PRODUCTS: `${API_BASE}/catalog/products/all`,
    GET_PRODUCT_DETAIL: (id: string) => `${API_BASE}/catalog/products/${id}`,
    CREATE_PRODUCT: `${API_BASE}/catalog/products`,
    UPDATE_PRODUCT: (id: string) => `${API_BASE}/catalog/products/${id}`,
    DELETE_PRODUCT: (id: string) => `${API_BASE}/catalog/products/${id}`,
    PUBLISH_PRODUCT: (id: string) => `${API_BASE}/catalog/products/${id}/publish`,
    UNPUBLISH_PRODUCT: (id: string) => `${API_BASE}/catalog/products/${id}/unpublish`,
    
    GET_CATEGORIES: `${API_BASE}/catalog/categories`,
    GET_CATEGORY_TREE: `${API_BASE}/catalog/categories/tree`,
    GET_CATEGORY_DETAIL: (id: string) => `${API_BASE}/catalog/categories/${id}`,
    CREATE_CATEGORY: `${API_BASE}/catalog/categories`,
    UPDATE_CATEGORY: (id: string) => `${API_BASE}/catalog/categories/${id}`,
    DELETE_CATEGORY: (id: string) => `${API_BASE}/catalog/categories/${id}`,
    
    GET_BRANDS: `${API_BASE}/catalog/brands`,
    GET_BRAND_DETAIL: (id: string) => `${API_BASE}/catalog/brands/${id}`,
    CREATE_BRAND: `${API_BASE}/catalog/brands`,
    UPDATE_BRAND: (id: string) => `${API_BASE}/catalog/brands/${id}`,
    DELETE_BRAND: (id: string) => `${API_BASE}/catalog/brands/${id}`,
  },
  
  // Order Service
  ORDER: {
    GET_ALL: `${API_BASE}/orders`,
    GET_LIST: `${API_BASE}/orders/list`,
    GET_DETAIL: (id: string) => `${API_BASE}/orders/${id}`,
    CREATE: `${API_BASE}/orders`,
    UPDATE: (id: string) => `${API_BASE}/orders/${id}`,
    UPDATE_STATUS: (id: string) => `${API_BASE}/orders/${id}/status`,
    GET_BY_ORDER_NO: (orderNo: string) => `${API_BASE}/orders/number/${orderNo}`,
  },
  
  // Inventory Service
  INVENTORY: {
    GET_ALL: `${API_BASE}/inventory`,
    GET_LIST: `${API_BASE}/inventory/list`,
    GET_DETAIL: (id: string) => `${API_BASE}/inventory/${id}`,
    CREATE: `${API_BASE}/inventory`,
    UPDATE: (id: string) => `${API_BASE}/inventory/${id}`,
    DELETE: (id: string) => `${API_BASE}/inventory/${id}`,
    INCREASE_STOCK: (id: string) => `${API_BASE}/inventory/${id}/increase`,
    DECREASE_STOCK: (id: string) => `${API_BASE}/inventory/${id}/decrease`,
    
    GET_LOCATIONS: `${API_BASE}/inventory/locations`,
    GET_LOCATION: (id: string) => `${API_BASE}/inventory/locations/${id}`,
    CREATE_LOCATION: `${API_BASE}/inventory/locations`,
    UPDATE_LOCATION: (id: string) => `${API_BASE}/inventory/locations/${id}`,
    DELETE_LOCATION: (id: string) => `${API_BASE}/inventory/locations/${id}`,
    
    GET_HISTORIES: `${API_BASE}/inventory/histories`,
    GET_ALL_RESERVATIONS: `${API_BASE}/inventory/reservations`,
  },
  
  // Discount Service
  DISCOUNT: {
    GET_ALL_COUPONS: `${API_BASE}/discount/coupons`,
    GET_LIST: `${API_BASE}/discount/coupons/list`,
    GET_DETAIL: (id: string) => `${API_BASE}/discount/coupons/${id}`,
    CREATE: `${API_BASE}/discount/coupons`,
    UPDATE: (id: string) => `${API_BASE}/discount/coupons/${id}`,
    DELETE: (id: string) => `${API_BASE}/discount/coupons/${id}`,
    APPROVE_COUPON: (id: string) => `${API_BASE}/discount/coupons/${id}/approve`,
    REJECT_COUPON: (id: string) => `${API_BASE}/discount/coupons/${id}/reject`,
    UPDATE_VALIDITY_PERIOD: (id: string) => `${API_BASE}/discount/coupons/${id}/validity`,
    VALIDATE: `${API_BASE}/discount/coupons/validate`,
    APPLY: `${API_BASE}/discount/coupons/apply`,
  },
  
  // Report Service
  REPORT: {
    DASHBOARD_STATISTICS: `${API_BASE}/reports/dashboard/statistics`,
    ORDER_GROWTH_LINE_CHART: `${API_BASE}/reports/charts/order-growth`,
    TOP_PRODUCT_PIE_CHART: `${API_BASE}/reports/charts/top-products`,
  },
  
  // Notification Service
  NOTIFICATION: {
    GET_LIST: `${API_BASE}/notifications`,
    GET_ALL: `${API_BASE}/notifications/all`,
    MARK_AS_READ: `${API_BASE}/notifications/read`,
    GET_COUNT_UNREAD: `${API_BASE}/notifications/count/unread`,
    GET_TOP_10_UNREAD: `${API_BASE}/notifications/top/unread`,
  },
  
  // Keycloak
  KEYCLOAK: {
    GET_ME: `${API_BASE}/auth/me`,
  },
};
```

## 2. Mock Server - `src/api/mockServer.ts` (895 lines)

```typescript
import { createServer, Model } from "miragejs";
import { API_ENDPOINTS } from "./endpoints";

interface MakeServerOptions {
  environment?: string;
}

// Helper để generate GUID
const generateGuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// ==================== MOCK DATA GENERATORS ====================

const generateProducts = () => [
  {
    id: generateGuid(),
    name: "iPhone 15 Pro Max",
    sku: "IP15PM-256-NAT",
    slug: "iphone-15-pro-max",
    shortDescription: "Titanium design, A17 Pro chip, 48MP camera",
    longDescription: "The iPhone 15 Pro Max features a titanium design...",
    price: 34990000,
    salePrice: 32990000,
    published: true,
    featured: true,
    status: 1,
    displayStatus: "In Stock",
    thumbnail: { publicURL: "https://placehold.co/200x200/png?text=iPhone" },
    categoryIds: [],
    brandId: generateGuid(),
    created: new Date().toISOString(),
    createdBy: "admin",
    modified: new Date().toISOString(),
    modifiedBy: "admin",
  },
  {
    id: generateGuid(),
    name: "MacBook Pro M3",
    sku: "MBP14-M3-512",
    slug: "macbook-pro-m3",
    shortDescription: "Space Black, M3 Pro chip, 14-inch display",
    longDescription: "The MacBook Pro with M3 chip delivers incredible performance...",
    price: 52990000,
    published: true,
    featured: false,
    status: 1,
    displayStatus: "In Stock",
    thumbnail: { publicURL: "https://placehold.co/200x200/png?text=MacBook" },
    categoryIds: [],
    created: new Date().toISOString(),
    createdBy: "admin",
    modified: new Date().toISOString(),
    modifiedBy: "admin",
  },
  {
    id: generateGuid(),
    name: "Samsung Galaxy S24 Ultra",
    sku: "S24U-512-GRY",
    slug: "galaxy-s24-ultra",
    shortDescription: "AI Phone with S Pen, 200MP camera",
    longDescription: "The Galaxy S24 Ultra brings Galaxy AI...",
    price: 32990000,
    salePrice: 31990000,
    published: true,
    featured: true,
    status: 2,
    displayStatus: "Out of Stock",
    thumbnail: { publicURL: "https://placehold.co/200x200/png?text=S24" },
    categoryIds: [],
    created: new Date().toISOString(),
    createdBy: "admin",
    modified: new Date().toISOString(),
    modifiedBy: "admin",
  },
  {
    id: generateGuid(),
    name: "Sony WH-1000XM5",
    sku: "SONY-XM5-BLK",
    slug: "sony-wh1000xm5",
    shortDescription: "Industry-leading noise canceling headphones",
    longDescription: "Experience superior sound quality...",
    price: 8990000,
    salePrice: 7990000,
    published: true,
    featured: false,
    status: 1,
    displayStatus: "In Stock",
    thumbnail: { publicURL: "https://placehold.co/200x200/png?text=Sony" },
    categoryIds: [],
    created: new Date().toISOString(),
    createdBy: "admin",
    modified: new Date().toISOString(),
    modifiedBy: "admin",
  },
  {
    id: generateGuid(),
    name: "iPad Pro 12.9",
    sku: "IPAD-PRO-256",
    slug: "ipad-pro-12-9",
    shortDescription: "M2 chip, 12.9-inch Liquid Retina XDR display",
    longDescription: "The ultimate iPad experience with M2 chip...",
    price: 29990000,
    published: true,
    featured: true,
    status: 1,
    displayStatus: "In Stock",
    thumbnail: { publicURL: "https://placehold.co/200x200/png?text=iPad" },
    categoryIds: [],
    created: new Date().toISOString(),
    createdBy: "admin",
    modified: new Date().toISOString(),
    modifiedBy: "admin",
  },
  {
    id: generateGuid(),
    name: "AirPods Pro 2",
    sku: "APP-2ND-GEN",
    slug: "airpods-pro-2",
    shortDescription: "Active noise cancellation, spatial audio",
    longDescription: "AirPods Pro feature up to 2x more Active Noise Cancellation...",
    price: 6990000,
    salePrice: 5990000,
    published: false,
    featured: false,
    status: 1,
    displayStatus: "In Stock",
    thumbnail: { publicURL: "https://placehold.co/200x200/png?text=AirPods" },
    categoryIds: [],
    created: new Date().toISOString(),
    createdBy: "admin",
    modified: new Date().toISOString(),
    modifiedBy: "admin",
  },
];

const generateCategories = () => [
  { id: generateGuid(), name: "Electronics", slug: "electronics", description: "Electronic devices", parentId: null },
  { id: generateGuid(), name: "Phones", slug: "phones", description: "Smartphones", parentId: null },
  { id: generateGuid(), name: "Laptops", slug: "laptops", description: "Notebooks", parentId: null },
  { id: generateGuid(), name: "Audio", slug: "audio", description: "Headphones and speakers", parentId: null },
  { id: generateGuid(), name: "Accessories", slug: "accessories", description: "Device accessories", parentId: null },
];

const generateBrands = () => [
  { id: generateGuid(), name: "Apple", slug: "apple", created: new Date().toISOString() },
  { id: generateGuid(), name: "Samsung", slug: "samsung", created: new Date().toISOString() },
  { id: generateGuid(), name: "Sony", slug: "sony", created: new Date().toISOString() },
  { id: generateGuid(), name: "Dell", slug: "dell", created: new Date().toISOString() },
  { id: generateGuid(), name: "Logitech", slug: "logitech", created: new Date().toISOString() },
];

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
      { id: generateGuid(), productId: generateGuid(), productName: "iPhone 15 Pro Max", sku: "IP15PM-256", quantity: 1, unitPrice: 34990000, subtotal: 34990000, total: 34990000 },
    ],
    subtotal: 34990000,
    tax: 3499000,
    shippingFee: 0,
    total: 38489000,
    status: 4,
    paymentStatus: 1,
    paymentMethod: "Credit Card",
    orderDate: new Date().toISOString(),
    created: new Date().toISOString(),
  },
  {
    id: generateGuid(),
    orderNo: "ORD-2024-0002",
    customerName: "Tran Thi B",
    customerEmail: "tranthib@example.com",
    customerPhone: "0912345678",
    shippingAddress: "456 Nguyen Hue, District 1, Ho Chi Minh City",
    items: [
      { id: generateGuid(), productId: generateGuid(), productName: "MacBook Pro M3", sku: "MBP14-M3", quantity: 1, unitPrice: 52990000, subtotal: 52990000, total: 52990000 },
      { id: generateGuid(), productId: generateGuid(), productName: "AirPods Pro 2", sku: "APP-2ND", quantity: 1, unitPrice: 5990000, subtotal: 5990000, total: 5990000 },
    ],
    subtotal: 58980000,
    tax: 5898000,
    shippingFee: 0,
    total: 64878000,
    status: 2,
    paymentStatus: 1,
    paymentMethod: "Bank Transfer",
    orderDate: new Date().toISOString(),
    created: new Date().toISOString(),
  },
  {
    id: generateGuid(),
    orderNo: "ORD-2024-0003",
    customerName: "Le Van C",
    customerEmail: "levanc@example.com",
    customerPhone: "0923456789",
    shippingAddress: "789 Hai Ba Trung, District 3, Ho Chi Minh City",
    items: [
      { id: generateGuid(), productId: generateGuid(), productName: "Samsung Galaxy S24 Ultra", sku: "S24U-512", quantity: 2, unitPrice: 31990000, subtotal: 63980000, total: 63980000 },
    ],
    subtotal: 63980000,
    tax: 6398000,
    shippingFee: 50000,
    total: 70428000,
    status: 1,
    paymentStatus: 1,
    paymentMethod: "Credit Card",
    orderDate: new Date().toISOString(),
    created: new Date().toISOString(),
  },
  {
    id: generateGuid(),
    orderNo: "ORD-2024-0004",
    customerName: "Pham Thi D",
    customerEmail: "phamthid@example.com",
    customerPhone: "0934567890",
    shippingAddress: "321 Dien Bien Phu, Binh Thanh District, Ho Chi Minh City",
    items: [
      { id: generateGuid(), productId: generateGuid(), productName: "Sony WH-1000XM5", sku: "SONY-XM5", quantity: 1, unitPrice: 7990000, subtotal: 7990000, total: 7990000 },
    ],
    subtotal: 7990000,
    tax: 799000,
    shippingFee: 30000,
    total: 8819000,
    status: 0,
    paymentStatus: 0,
    paymentMethod: "Cash on Delivery",
    orderDate: new Date().toISOString(),
    created: new Date().toISOString(),
  },
  {
    id: generateGuid(),
    orderNo: "ORD-2024-0005",
    customerName: "Hoang Van E",
    customerEmail: "hoangvane@example.com",
    customerPhone: "0945678901",
    shippingAddress: "654 Vo Van Kiet, District 5, Ho Chi Minh City",
    items: [
      { id: generateGuid(), productId: generateGuid(), productName: "iPad Pro 12.9", sku: "IPAD-PRO", quantity: 1, unitPrice: 29990000, subtotal: 29990000, total: 29990000 },
    ],
    subtotal: 29990000,
    tax: 2999000,
    shippingFee: 0,
    total: 32989000,
    status: 3,
    paymentStatus: 1,
    paymentMethod: "Credit Card",
    orderDate: new Date().toISOString(),
    created: new Date().toISOString(),
  },
];

const generateInventoryItems = () => [
  { id: generateGuid(), productId: generateGuid(), productName: "iPhone 15 Pro Max", sku: "IP15PM-256", quantity: 100, reservedQuantity: 5, availableQuantity: 95, locationId: generateGuid(), locationName: "Main Warehouse", status: 0, reorderPoint: 10, reorderQuantity: 50, created: new Date().toISOString() },
  { id: generateGuid(), productId: generateGuid(), productName: "MacBook Pro M3", sku: "MBP14-M3", quantity: 50, reservedQuantity: 2, availableQuantity: 48, locationId: generateGuid(), locationName: "Main Warehouse", status: 0, reorderPoint: 5, reorderQuantity: 25, created: new Date().toISOString() },
  { id: generateGuid(), productId: generateGuid(), productName: "Samsung Galaxy S24 Ultra", sku: "S24U-512", quantity: 0, reservedQuantity: 0, availableQuantity: 0, locationId: generateGuid(), locationName: "Main Warehouse", status: 2, reorderPoint: 5, reorderQuantity: 30, created: new Date().toISOString() },
  { id: generateGuid(), productId: generateGuid(), productName: "Sony WH-1000XM5", sku: "SONY-XM5", quantity: 25, reservedQuantity: 3, availableQuantity: 22, locationId: generateGuid(), locationName: "Store A", status: 1, reorderPoint: 10, reorderQuantity: 20, created: new Date().toISOString() },
  { id: generateGuid(), productId: generateGuid(), productName: "iPad Pro 12.9", sku: "IPAD-PRO", quantity: 40, reservedQuantity: 8, availableQuantity: 32, locationId: generateGuid(), locationName: "Main Warehouse", status: 0, reorderPoint: 8, reorderQuantity: 20, created: new Date().toISOString() },
];

const generateLocations = () => [
  { id: generateGuid(), name: "Main Warehouse", code: "WH-MAIN", address: "100 Industrial Zone", city: "Ho Chi Minh City", country: "Vietnam", isActive: true, created: new Date().toISOString() },
  { id: generateGuid(), name: "Store A", code: "STORE-A", address: "123 Le Loi Street", city: "Ho Chi Minh City", country: "Vietnam", isActive: true, created: new Date().toISOString() },
  { id: generateGuid(), name: "Store B", code: "STORE-B", address: "456 Nguyen Hue", city: "Hanoi", country: "Vietnam", isActive: true, created: new Date().toISOString() },
];

const generateCoupons = () => [
  { id: generateGuid(), code: "WELCOME2024", name: "Welcome Discount", description: "20% off for new customers", discountType: 0, discountValue: 20, minOrderAmount: 100000, maxDiscountAmount: 100000, usageLimit: 100, usageCount: 45, validFrom: "2024-01-01T00:00:00Z", validTo: "2024-12-31T23:59:59Z", status: 1, isActive: true, created: new Date().toISOString() },
  { id: generateGuid(), code: "SUMMER50K", name: "Summer Sale", description: "50,000 VND off orders over 200,000", discountType: 1, discountValue: 50000, minOrderAmount: 200000, maxDiscountAmount: 50000, usageLimit: 50, usageCount: 12, validFrom: "2024-06-01T00:00:00Z", validTo: "2024-08-31T23:59:59Z", status: 1, isActive: true, created: new Date().toISOString() },
  { id: generateGuid(), code: "FLASHSALE", name: "Flash Sale", description: "15% off flash sale", discountType: 0, discountValue: 15, minOrderAmount: 0, maxDiscountAmount: 50000, usageLimit: 200, usageCount: 198, validFrom: "2024-01-01T00:00:00Z", validTo: "2024-12-31T23:59:59Z", status: 1, isActive: true, created: new Date().toISOString() },
  { id: generateGuid(), code: "EXPIRED2023", name: "Old Promo", description: "Expired promotion", discountType: 0, discountValue: 10, minOrderAmount: 0, maxDiscountAmount: 20000, usageLimit: 100, usageCount: 100, validFrom: "2023-01-01T00:00:00Z", validTo: "2023-12-31T23:59:59Z", status: 2, isActive: false, created: new Date().toISOString() },
  { id: generateGuid(), code: "VIP2024", name: "VIP Discount", description: "30% off for VIP members", discountType: 0, discountValue: 30, minOrderAmount: 500000, maxDiscountAmount: 500000, usageLimit: 20, usageCount: 5, validFrom: "2024-01-01T00:00:00Z", validTo: "2024-12-31T23:59:59Z", status: 1, isActive: true, created: new Date().toISOString() },
];

const generateCustomers = () => [
  { id: generateGuid(), firstName: "Nguyen", lastName: "Van A", email: "nguyenvana@example.com", phone: "0901234567", created: new Date().toISOString() },
  { id: generateGuid(), firstName: "Tran", lastName: "Thi B", email: "tranthib@example.com", phone: "0912345678", created: new Date().toISOString() },
  { id: generateGuid(), firstName: "Le", lastName: "Van C", email: "levanc@example.com", phone: "0923456789", created: new Date().toISOString() },
  { id: generateGuid(), firstName: "Pham", lastName: "Thi D", email: "phamthid@example.com", phone: "0934567890", created: new Date().toISOString() },
  { id: generateGuid(), firstName: "Hoang", lastName: "Van E", email: "hoangvane@example.com", phone: "0945678901", created: new Date().toISOString() },
];

const generateNotifications = () => [
  { id: generateGuid(), title: "New Order", message: "You have a new order #ORD-2024-0001", type: "order", isRead: false, created: new Date().toISOString() },
  { id: generateGuid(), title: "Low Stock Alert", message: "Samsung Galaxy S24 Ultra is out of stock", type: "inventory", isRead: false, created: new Date().toISOString() },
  { id: generateGuid(), title: "Payment Received", message: "Payment received for order #ORD-2024-0002", type: "payment", isRead: true, created: new Date().toISOString() },
  { id: generateGuid(), title: "New Customer", message: "New customer registered: Hoang Van E", type: "customer", isRead: true, created: new Date().toISOString() },
  { id: generateGuid(), title: "Coupon Expiring", message: "Coupon FLASHSALE is about to expire", type: "coupon", isRead: false, created: new Date().toISOString() },
];

// ==================== MOCK SERVER ====================

export function makeServer({ environment = "development" }: MakeServerOptions = {}) {
  const apiGateway = process.env.NEXT_PUBLIC_API_GATEWAY || "";

  console.log("Starting MirageJS Mock Server...");
  console.log("Intercepting:", apiGateway);

  return createServer({
    environment,

    models: {
      product: Model,
      order: Model,
      customer: Model,
      category: Model,
      brand: Model,
      inventoryItem: Model,
      location: Model,
      coupon: Model,
      notification: Model,
    },

    seeds(server) {
      generateProducts().forEach((product) => server.create("product", product));
      generateCategories().forEach((category) => server.create("category", category));
      generateBrands().forEach((brand) => server.create("brand", brand));
      generateOrders().forEach((order) => server.create("order", order));
      generateInventoryItems().forEach((item) => server.create("inventoryItem", item));
      generateLocations().forEach((location) => server.create("location", location));
      generateCoupons().forEach((coupon) => server.create("coupon", coupon));
      generateCustomers().forEach((customer) => server.create("customer", customer));
      generateNotifications().forEach((notification) => server.create("notification", notification));
    },

    routes() {
      this.urlPrefix = apiGateway;

      // Allow unhandled requests to pass through
      this.passthrough((request) => {
        if (request.url.startsWith("/_next/")) return true;
        if (request.url.startsWith("/__nextjs")) return true;
        return false;
      });

      // ==================== CATALOG SERVICE ====================

      this.get(API_ENDPOINTS.CATALOG.GET_ALL_PRODUCTS, (schema: any) => {
        return { result: { items: schema.products.all().models } };
      });

      this.get(API_ENDPOINTS.CATALOG.GET_PRODUCTS, (schema: any, request: any) => {
        const products = schema.products.all().models;
        const pageIndex = parseInt(request.queryParams.pageIndex) || 1;
        const pageSize = parseInt(request.queryParams.pageSize) || 10;
        const start = (pageIndex - 1) * pageSize;
        const end = start + pageSize;
        
        return {
          items: products.slice(start, end),
          totalCount: products.length,
          pageIndex,
          pageSize,
          totalPages: Math.ceil(products.length / pageSize),
          hasPreviousPage: pageIndex > 1,
          hasNextPage: end < products.length,
        };
      });

      this.get(API_ENDPOINTS.CATALOG.GET_PRODUCT_DETAIL(":id"), (schema: any, request: any) => {
        const product = schema.products.find(request.params.id);
        return { product: product?.attrs || null };
      });

      this.post(API_ENDPOINTS.CATALOG.CREATE_PRODUCT, (schema: any, request: any) => {
        const attrs = JSON.parse(request.requestBody);
        const product = schema.products.create({ ...attrs, id: generateGuid(), created: new Date().toISOString() });
        return { product: product.attrs };
      });

      this.put(API_ENDPOINTS.CATALOG.UPDATE_PRODUCT(":id"), (schema: any, request: any) => {
        const product = schema.products.find(request.params.id);
        const attrs = JSON.parse(request.requestBody);
        product.update({ ...attrs, modified: new Date().toISOString() });
        return { product: product.attrs };
      });

      this.delete(API_ENDPOINTS.CATALOG.DELETE_PRODUCT(":id"), (schema: any, request: any) => {
        const product = schema.products.find(request.params.id);
        product.destroy();
        return {};
      });

      this.post(API_ENDPOINTS.CATALOG.PUBLISH_PRODUCT(":id"), (schema: any, request: any) => {
        const product = schema.products.find(request.params.id);
        product.update({ published: true, modified: new Date().toISOString() });
        return {};
      });

      this.post(API_ENDPOINTS.CATALOG.UNPUBLISH_PRODUCT(":id"), (schema: any, request: any) => {
        const product = schema.products.find(request.params.id);
        product.update({ published: false, modified: new Date().toISOString() });
        return {};
      });

      // Categories
      this.get(API_ENDPOINTS.CATALOG.GET_CATEGORIES, (schema: any) => {
        return { categories: schema.categories.all().models.map((c: any) => c.attrs) };
      });

      this.post(API_ENDPOINTS.CATALOG.CREATE_CATEGORY, (schema: any, request: any) => {
        const attrs = JSON.parse(request.requestBody);
        const category = schema.categories.create({ ...attrs, id: generateGuid(), created: new Date().toISOString() });
        return { category: category.attrs };
      });

      this.put(API_ENDPOINTS.CATALOG.UPDATE_CATEGORY(":id"), (schema: any, request: any) => {
        const category = schema.categories.find(request.params.id);
        const attrs = JSON.parse(request.requestBody);
        category.update({ ...attrs, modified: new Date().toISOString() });
        return { category: category.attrs };
      });

      this.delete(API_ENDPOINTS.CATALOG.DELETE_CATEGORY(":id"), (schema: any, request: any) => {
        const category = schema.categories.find(request.params.id);
        category.destroy();
        return {};
      });

      // Brands
      this.get(API_ENDPOINTS.CATALOG.GET_BRANDS, (schema: any) => {
        return { brands: schema.brands.all().models.map((b: any) => b.attrs) };
      });

      this.post(API_ENDPOINTS.CATALOG.CREATE_BRAND, (schema: any, request: any) => {
        const attrs = JSON.parse(request.requestBody);
        const brand = schema.brands.create({ ...attrs, id: generateGuid(), created: new Date().toISOString() });
        return { brand: brand.attrs };
      });

      this.put(API_ENDPOINTS.CATALOG.UPDATE_BRAND(":id"), (schema: any, request: any) => {
        const brand = schema.brands.find(request.params.id);
        const attrs = JSON.parse(request.requestBody);
        brand.update({ ...attrs, modified: new Date().toISOString() });
        return { brand: brand.attrs };
      });

      this.delete(API_ENDPOINTS.CATALOG.DELETE_BRAND(":id"), (schema: any, request: any) => {
        const brand = schema.brands.find(request.params.id);
        brand.destroy();
        return {};
      });

      // ==================== ORDER SERVICE ====================

      this.get(API_ENDPOINTS.ORDER.GET_LIST, (schema: any, request: any) => {
        const orders = schema.orders.all().models;
        const pageIndex = parseInt(request.queryParams.pageIndex) || 1;
        const pageSize = parseInt(request.queryParams.pageSize) || 10;
        const start = (pageIndex - 1) * pageSize;
        const end = start + pageSize;
        
        return {
          items: orders.slice(start, end),
          totalCount: orders.length,
          pageIndex,
          pageSize,
          totalPages: Math.ceil(orders.length / pageSize),
          hasPreviousPage: pageIndex > 1,
          hasNextPage: end < orders.length,
        };
      });

      this.get(API_ENDPOINTS.ORDER.GET_DETAIL(":id"), (schema: any, request: any) => {
        const order = schema.orders.find(request.params.id);
        return { order: order?.attrs || null };
      });

      this.post(API_ENDPOINTS.ORDER.CREATE, (schema: any, request: any) => {
        const attrs = JSON.parse(request.requestBody);
        const order = schema.orders.create({
          ...attrs,
          id: generateGuid(),
          orderNo: `ORD-2024-${String(schema.orders.all().length).padStart(4, "0")}`,
          created: new Date().toISOString(),
        });
        return { order: order.attrs };
      });

      this.put(API_ENDPOINTS.ORDER.UPDATE_STATUS(":id"), (schema: any, request: any) => {
        const order = schema.orders.find(request.params.id);
        const attrs = JSON.parse(request.requestBody);
        order.update({ status: attrs.status, modified: new Date().toISOString() });
        return { order: order.attrs };
      });

      // ==================== INVENTORY SERVICE ====================

      this.get(API_ENDPOINTS.INVENTORY.GET_LIST, (schema: any, request: any) => {
        const items = schema.inventoryItems.all().models;
        const pageIndex = parseInt(request.queryParams.pageIndex) || 1;
        const pageSize = parseInt(request.queryParams.pageSize) || 10;
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
      });

      this.put(API_ENDPOINTS.INVENTORY.INCREASE_STOCK(":id"), (schema: any, request: any) => {
        const item = schema.inventoryItems.find(request.params.id);
        const attrs = JSON.parse(request.requestBody);
        const newQuantity = item.attrs.quantity + attrs.quantity;
        item.update({ quantity: newQuantity, availableQuantity: newQuantity - item.attrs.reservedQuantity, modified: new Date().toISOString() });
        return {};
      });

      this.put(API_ENDPOINTS.INVENTORY.DECREASE_STOCK(":id"), (schema: any, request: any) => {
        const item = schema.inventoryItems.find(request.params.id);
        const attrs = JSON.parse(request.requestBody);
        const newQuantity = Math.max(0, item.attrs.quantity - attrs.quantity);
        item.update({ quantity: newQuantity, availableQuantity: newQuantity - item.attrs.reservedQuantity, modified: new Date().toISOString() });
        return {};
      });

      // ==================== DISCOUNT SERVICE ====================

      this.get(API_ENDPOINTS.DISCOUNT.GET_LIST, (schema: any, request: any) => {
        const coupons = schema.coupons.all().models;
        const pageIndex = parseInt(request.queryParams.pageIndex) || 1;
        const pageSize = parseInt(request.queryParams.pageSize) || 10;
        const start = (pageIndex - 1) * pageSize;
        const end = start + pageSize;
        
        return {
          items: coupons.slice(start, end),
          totalCount: coupons.length,
          pageIndex,
          pageSize,
          totalPages: Math.ceil(coupons.length / pageSize),
          hasPreviousPage: pageIndex > 1,
          hasNextPage: end < coupons.length,
        };
      });

      this.post(API_ENDPOINTS.DISCOUNT.APPROVE_COUPON(":id"), (schema: any, request: any) => {
        const coupon = schema.coupons.find(request.params.id);
        coupon.update({ status: 1, isActive: true, modified: new Date().toISOString() });
        return {};
      });

      this.post(API_ENDPOINTS.DISCOUNT.REJECT_COUPON(":id"), (schema: any, request: any) => {
        const coupon = schema.coupons.find(request.params.id);
        coupon.update({ status: 3, isActive: false, modified: new Date().toISOString() });
        return {};
      });

      // ==================== REPORT SERVICE ====================

      this.get(API_ENDPOINTS.REPORT.DASHBOARD_STATISTICS, (schema: any) => {
        const products = schema.products.all().models;
        const orders = schema.orders.all().models;
        const customers = schema.customers.all().models;
        const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.attrs.total || 0), 0);

        return {
          totalRevenue,
          totalOrders: orders.length,
          totalProducts: products.length,
          totalCustomers: customers.length,
          growthRate: 15.5,
        };
      });

      this.get(API_ENDPOINTS.REPORT.ORDER_GROWTH_LINE_CHART, () => {
        return {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          data: [65, 78, 90, 81, 96, 105],
        };
      });

      this.get(API_ENDPOINTS.REPORT.TOP_PRODUCT_PIE_CHART, () => {
        return {
          labels: ["iPhone 15 Pro Max", "MacBook Pro M3", "Samsung Galaxy S24 Ultra", "Sony WH-1000XM5", "iPad Pro"],
          data: [35, 25, 20, 12, 8],
        };
      });

      // ==================== NOTIFICATION SERVICE ====================

      this.get(API_ENDPOINTS.NOTIFICATION.GET_COUNT_UNREAD, (schema: any) => {
        const unreadCount = schema.notifications.all().models.filter((n: any) => !n.attrs.isRead).length;
        return { count: unreadCount };
      });

      this.post(API_ENDPOINTS.NOTIFICATION.MARK_AS_READ, (schema: any, request: any) => {
        const attrs = JSON.parse(request.requestBody);
        const notification = schema.notifications.find(attrs.id);
        if (notification) {
          notification.update({ isRead: true, modified: new Date().toISOString() });
        }
        return {};
      });

      // ==================== KEYCLOAK SERVICE ====================

      this.get(API_ENDPOINTS.KEYCLOAK.GET_ME, () => {
        return {
          id: generateGuid(),
          username: "admin",
          email: "admin@example.com",
          firstName: "Admin",
          lastName: "User",
          roles: ["admin"],
        };
      });

      this.passthrough();
    },
  });
}
```

## 3. AppProviders - `src/providers/AppProviders.tsx`

```typescript
"use client";
import React from "react";
import StoreProvider from "./StoreProvider";
import { KeycloakProvider } from "../contexts/KeycloakContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import global styles
import "simplebar-react/dist/simplebar.min.css";
import "flatpickr/dist/themes/light.css";
import "../assets/css/app.css";
import "../i18n/config";

// Import MirageJS server
import { makeServer } from "@/api/mockServer";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize MirageJS Mock Server
  React.useEffect(() => {
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

    if (useMockData && typeof window !== "undefined") {
      // @ts-ignore
      if (!window.server) {
        // @ts-ignore
        window.server = makeServer({ environment: "development" });
        console.log("MirageJS Mock Server initialized");
      }
    }
  }, []);

  return (
    <StoreProvider>
      <KeycloakProvider>
        {children}
        <ToastContainer />
      </KeycloakProvider>
    </StoreProvider>
  );
}
```

**Giải thích:**
- `makeServer`: Khởi tạo MirageJS server
- Models: Define data models cho từng entity
- Seeds: Tạo mock data ban đầu
- Routes: Define API endpoints với CRUD operations
- Pagination: Hỗ trợ pageIndex, pageSize

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_MOCK_AUTH=true
NEXT_PUBLIC_API_GATEWAY=/api/v1
```

## Checklist cuối ngày

- [ ] Mock Server khởi tạo đúng
- [ ] Tất cả API endpoints hoạt động
- [ ] Pagination trả về đúng format
- [ ] CRUD operations hoạt động
- [ ] AppProviders wrap đúng thứ tự
- [ ] ToastContainer hiển thị thông báo

## Liên kết

- [Day 06: Authentication](./day-06.md) - Trước đó: Authentication
- [Day 08: Dashboard Layout](./day-08.md) - Tiếp theo: Sidebar & Header
- [MirageJS Documentation](https://miragejs.com/docs/)
