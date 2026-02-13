import { createServer, Model } from "miragejs";
import { API_ENDPOINTS } from "./endpoints";

interface MakeServerOptions {
  environment?: string;
}

// Helper to generate GUID
const generateGuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Mock Data Generators
const generateProducts = () => [
  {
    id: generateGuid(),
    name: "iPhone 15 Pro Max",
    sku: "IP15PM-256-NAT",
    slug: "iphone-15-pro-max",
    shortDescription: "Titanium design, A17 Pro chip, 48MP camera system",
    longDescription: "The iPhone 15 Pro Max features a titanium design, A17 Pro chip, and a 48MP camera system.",
    price: 1199,
    salePrice: 1099,
    published: true,
    featured: true,
    status: 1, // InStock
    displayStatus: "In Stock",
    thumbnail: { publicURL: "https://placehold.co/200x200/png?text=iPhone+15" },
    images: [],
    categoryIds: [],
    brandId: generateGuid(),
    colors: ["Natural Titanium", "Blue Titanium", "White Titanium"],
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
    longDescription: "The MacBook Pro with M3 chip delivers incredible performance for professional workflows.",
    price: 1999,
    published: true,
    featured: false,
    status: 1,
    displayStatus: "In Stock",
    thumbnail: { publicURL: "https://placehold.co/200x200/png?text=MacBook" },
    images: [],
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
    longDescription: "The Galaxy S24 Ultra brings Galaxy AI and the power of the S Pen together.",
    price: 1299,
    salePrice: 1199,
    published: true,
    featured: true,
    status: 2, // OutOfStock
    displayStatus: "Out of Stock",
    thumbnail: { publicURL: "https://placehold.co/200x200/png?text=S24+Ultra" },
    images: [],
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
    longDescription: "Experience superior sound quality with industry-leading noise cancellation.",
    price: 399,
    salePrice: 349,
    published: true,
    featured: false,
    status: 1,
    displayStatus: "In Stock",
    thumbnail: { publicURL: "https://placehold.co/200x200/png?text=Sony+XM5" },
    images: [],
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
    longDescription: "The ultimate iPad experience with the M2 chip and XDR display.",
    price: 1099,
    published: true,
    featured: true,
    status: 1,
    displayStatus: "In Stock",
    thumbnail: { publicURL: "https://placehold.co/200x200/png?text=iPad+Pro" },
    images: [],
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
    longDescription: "AirPods Pro feature up to 2x more Active Noise Cancellation.",
    price: 249,
    salePrice: 229,
    published: true,
    featured: false,
    status: 1,
    displayStatus: "In Stock",
    thumbnail: { publicURL: "https://placehold.co/200x200/png?text=AirPods" },
    images: [],
    categoryIds: [],
    created: new Date().toISOString(),
    createdBy: "admin",
    modified: new Date().toISOString(),
    modifiedBy: "admin",
  },
];

const generateCategories = () => [
  { id: generateGuid(), name: "Electronics", slug: "electronics", description: "Electronic devices and accessories", parentId: null },
  { id: generateGuid(), name: "Phones", slug: "phones", description: "Smartphones and accessories", parentId: null },
  { id: generateGuid(), name: "Laptops", slug: "laptops", description: "Laptops and computers", parentId: null },
  { id: generateGuid(), name: "Audio", slug: "audio", description: "Headphones and speakers", parentId: null },
  { id: generateGuid(), name: "Accessories", slug: "accessories", description: "Device accessories", parentId: null },
];

const generateBrands = () => [
  { id: generateGuid(), name: "Apple", slug: "apple", created: new Date().toISOString() },
  { id: generateGuid(), name: "Samsung", slug: "samsung", created: new Date().toISOString() },
  { id: generateGuid(), name: "Sony", slug: "sony", created: new Date().toISOString() },
  { id: generateGuid(), name: "Nike", slug: "nike", created: new Date().toISOString() },
  { id: generateGuid(), name: "Adidas", slug: "adidas", created: new Date().toISOString() },
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
      { id: generateGuid(), productId: generateGuid(), productName: "iPhone 15 Pro Max", sku: "IP15PM-256", quantity: 1, unitPrice: 1199, subtotal: 1199, total: 1199 },
    ],
    subtotal: 1199,
    tax: 119.9,
    shippingFee: 10,
    total: 1328.9,
    status: 4, // Delivered
    paymentStatus: 1, // Paid
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
      { id: generateGuid(), productId: generateGuid(), productName: "MacBook Pro M3", sku: "MBP14-M3", quantity: 1, unitPrice: 1999, subtotal: 1999, total: 1999 },
      { id: generateGuid(), productId: generateGuid(), productName: "AirPods Pro 2", sku: "APP-2ND", quantity: 1, unitPrice: 249, subtotal: 249, total: 249 },
    ],
    subtotal: 2248,
    tax: 224.8,
    shippingFee: 0,
    total: 2472.8,
    status: 2, // Processing
    paymentStatus: 1, // Paid
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
      { id: generateGuid(), productId: generateGuid(), productName: "Samsung Galaxy S24 Ultra", sku: "S24U-512", quantity: 2, unitPrice: 1299, subtotal: 2598, total: 2598 },
    ],
    subtotal: 2598,
    tax: 259.8,
    shippingFee: 15,
    total: 2872.8,
    status: 1, // Confirmed
    paymentStatus: 1, // Paid
    paymentMethod: "Credit Card",
    orderDate: new Date().toISOString(),
    created: new Date().toISOString(),
  },
  {
    id: generateGuid(),
    orderNo: "ORD-2024-0004",
    customerId: generateGuid(),
    customerName: "Pham Thi D",
    customerEmail: "phamthid@example.com",
    customerPhone: "0934567890",
    shippingAddress: "321 Dien Bien Phu, Binh Thanh District, Ho Chi Minh City",
    billingAddress: "321 Dien Bien Phu, Binh Thanh District, Ho Chi Minh City",
    items: [
      { id: generateGuid(), productId: generateGuid(), productName: "Sony WH-1000XM5", sku: "SONY-XM5", quantity: 1, unitPrice: 399, subtotal: 399, total: 399 },
    ],
    subtotal: 399,
    tax: 39.9,
    shippingFee: 10,
    total: 448.9,
    status: 0, // Pending
    paymentStatus: 0, // Pending
    paymentMethod: "Cash on Delivery",
    orderDate: new Date().toISOString(),
    created: new Date().toISOString(),
  },
  {
    id: generateGuid(),
    orderNo: "ORD-2024-0005",
    customerId: generateGuid(),
    customerName: "Hoang Van E",
    customerEmail: "hoangvane@example.com",
    customerPhone: "0945678901",
    shippingAddress: "654 Vo Van Kiet, District 5, Ho Chi Minh City",
    billingAddress: "654 Vo Van Kiet, District 5, Ho Chi Minh City",
    items: [
      { id: generateGuid(), productId: generateGuid(), productName: "iPad Pro 12.9", sku: "IPAD-PRO", quantity: 1, unitPrice: 1099, subtotal: 1099, total: 1099 },
      { id: generateGuid(), productId: generateGuid(), productName: "AirPods Pro 2", sku: "APP-2ND", quantity: 1, unitPrice: 249, subtotal: 249, total: 249 },
    ],
    subtotal: 1348,
    tax: 134.8,
    shippingFee: 0,
    total: 1482.8,
    status: 3, // Shipped
    paymentStatus: 1, // Paid
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
  { id: generateGuid(), name: "Main Warehouse", code: "WH-MAIN", address: "100 Industrial Zone", city: "Ho Chi Minh City", country: "Vietnam", active: true, created: new Date().toISOString() },
  { id: generateGuid(), name: "Store A", code: "STORE-A", address: "123 Le Loi Street", city: "Ho Chi Minh City", country: "Vietnam", active: true, created: new Date().toISOString() },
  { id: generateGuid(), name: "Store B", code: "STORE-B", address: "456 Nguyen Hue", city: "Hanoi", country: "Vietnam", active: true, created: new Date().toISOString() },
];

const generateCoupons = () => [
  { id: generateGuid(), code: "WELCOME2024", name: "Welcome Discount", description: "20% off for new customers", discountType: 0, discountValue: 20, minOrderAmount: 50, maxDiscountAmount: 100, usageLimit: 100, usageCount: 45, validFrom: "2024-01-01T00:00:00Z", validTo: "2024-12-31T23:59:59Z", status: 1, active: true, created: new Date().toISOString() },
  { id: generateGuid(), code: "SUMMER50", name: "Summer Sale", description: "$50 off orders over $200", discountType: 1, discountValue: 50, minOrderAmount: 200, maxDiscountAmount: 50, usageLimit: 50, usageCount: 12, validFrom: "2024-06-01T00:00:00Z", validTo: "2024-08-31T23:59:59Z", status: 1, active: true, created: new Date().toISOString() },
  { id: generateGuid(), code: "FLASHSALE", name: "Flash Sale", description: "15% off flash sale", discountType: 0, discountValue: 15, minOrderAmount: 0, maxDiscountAmount: 50, usageLimit: 200, usageCount: 198, validFrom: "2024-01-01T00:00:00Z", validTo: "2024-12-31T23:59:59Z", status: 1, active: true, created: new Date().toISOString() },
  { id: generateGuid(), code: "EXPIRED2023", name: "Old Promo", description: "Expired promotion", discountType: 0, discountValue: 10, minOrderAmount: 0, maxDiscountAmount: 20, usageLimit: 100, usageCount: 100, validFrom: "2023-01-01T00:00:00Z", validTo: "2023-12-31T23:59:59Z", status: 2, active: false, created: new Date().toISOString() },
  { id: generateGuid(), code: "VIP2024", name: "VIP Discount", description: "30% off for VIP members", discountType: 0, discountValue: 30, minOrderAmount: 100, maxDiscountAmount: 200, usageLimit: 20, usageCount: 5, validFrom: "2024-01-01T00:00:00Z", validTo: "2024-12-31T23:59:59Z", status: 1, active: true, created: new Date().toISOString() },
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
      // Seed Products
      generateProducts().forEach((product) => server.create("product", product));

      // Seed Categories
      generateCategories().forEach((category) => server.create("category", category));

      // Seed Brands
      generateBrands().forEach((brand) => server.create("brand", brand));

      // Seed Orders
      generateOrders().forEach((order) => server.create("order", order));

      // Seed Inventory Items
      generateInventoryItems().forEach((item) => server.create("inventoryItem", item));

      // Seed Locations
      generateLocations().forEach((location) => server.create("location", location));

      // Seed Coupons
      generateCoupons().forEach((coupon) => server.create("coupon", coupon));

      // Seed Customers
      generateCustomers().forEach((customer) => server.create("customer", customer));

      // Seed Notifications
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

      // Get all products (no pagination)
      this.get(API_ENDPOINTS.CATALOG.GET_ALL_PRODUCTS, (schema: any) => {
        return { result: { items: schema.products.all().models } };
      });

      // Get products with pagination
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

      // Get product by ID
      this.get(API_ENDPOINTS.CATALOG.GET_PRODUCT_DETAIL(":id"), (schema: any, request: any) => {
        const product = schema.products.find(request.params.id);
        return { product: product?.attrs || null };
      });

      // Create product
      this.post(API_ENDPOINTS.CATALOG.CREATE_PRODUCT, (schema: any, request: any) => {
        const attrs = JSON.parse(request.requestBody);
        const product = schema.products.create({ ...attrs, id: generateGuid(), created: new Date().toISOString() });
        return { product: product.attrs };
      });

      // Update product
      this.put(API_ENDPOINTS.CATALOG.UPDATE_PRODUCT(":id"), (schema: any, request: any) => {
        const product = schema.products.find(request.params.id);
        const attrs = JSON.parse(request.requestBody);
        product.update({ ...attrs, modified: new Date().toISOString() });
        return { product: product.attrs };
      });

      // Delete product
      this.delete(API_ENDPOINTS.CATALOG.DELETE_PRODUCT(":id"), (schema: any, request: any) => {
        const product = schema.products.find(request.params.id);
        product.destroy();
        return {};
      });

      // Publish product
      this.post(API_ENDPOINTS.CATALOG.PUBLISH_PRODUCT(":id"), (schema: any, request: any) => {
        const product = schema.products.find(request.params.id);
        product.update({ published: true, modified: new Date().toISOString() });
        return {};
      });

      // Unpublish product
      this.post(API_ENDPOINTS.CATALOG.UNPUBLISH_PRODUCT(":id"), (schema: any, request: any) => {
        const product = schema.products.find(request.params.id);
        product.update({ published: false, modified: new Date().toISOString() });
        return {};
      });

      // Get all categories
      this.get(API_ENDPOINTS.CATALOG.GET_CATEGORIES, (schema: any) => {
        return { categories: schema.categories.all().models.map((c) => c.attrs) };
      });

      // Get category tree
      this.get(API_ENDPOINTS.CATALOG.GET_CATEGORY_TREE, (schema: any) => {
        return { categories: schema.categories.all().models.map((c) => c.attrs) };
      });

      // Get category by ID
      this.get(API_ENDPOINTS.CATALOG.GET_CATEGORY_DETAIL(":id"), (schema: any, request: any) => {
        const category = schema.categories.find(request.params.id);
        return { category: category?.attrs || null };
      });

      // Create category
      this.post(API_ENDPOINTS.CATALOG.CREATE_CATEGORY, (schema: any, request: any) => {
        const attrs = JSON.parse(request.requestBody);
        const category = schema.categories.create({ ...attrs, id: generateGuid(), created: new Date().toISOString() });
        return { category: category.attrs };
      });

      // Update category
      this.put(API_ENDPOINTS.CATALOG.UPDATE_CATEGORY(":id"), (schema: any, request: any) => {
        const category = schema.categories.find(request.params.id);
        const attrs = JSON.parse(request.requestBody);
        category.update({ ...attrs, modified: new Date().toISOString() });
        return { category: category.attrs };
      });

      // Delete category
      this.delete(API_ENDPOINTS.CATALOG.DELETE_CATEGORY(":id"), (schema: any, request: any) => {
        const category = schema.categories.find(request.params.id);
        category.destroy();
        return {};
      });

      // Get all brands
      this.get(API_ENDPOINTS.CATALOG.GET_BRANDS, (schema: any) => {
        return { brands: schema.brands.all().models.map((b) => b.attrs) };
      });

      // Get brand by ID
      this.get(API_ENDPOINTS.CATALOG.GET_BRAND_DETAIL(":id"), (schema: any, request: any) => {
        const brand = schema.brands.find(request.params.id);
        return { brand: brand?.attrs || null };
      });

      // Create brand
      this.post(API_ENDPOINTS.CATALOG.CREATE_BRAND, (schema: any, request: any) => {
        const attrs = JSON.parse(request.requestBody);
        const brand = schema.brands.create({ ...attrs, id: generateGuid(), created: new Date().toISOString() });
        return { brand: brand.attrs };
      });

      // Update brand
      this.put(API_ENDPOINTS.CATALOG.UPDATE_BRAND(":id"), (schema: any, request: any) => {
        const brand = schema.brands.find(request.params.id);
        const attrs = JSON.parse(request.requestBody);
        brand.update({ ...attrs, modified: new Date().toISOString() });
        return { brand: brand.attrs };
      });

      // Delete brand
      this.delete(API_ENDPOINTS.CATALOG.DELETE_BRAND(":id"), (schema: any, request: any) => {
        const brand = schema.brands.find(request.params.id);
        brand.destroy();
        return {};
      });

      // ==================== ORDER SERVICE ====================

      // Get all orders
      this.get(API_ENDPOINTS.ORDER.GET_ALL, (schema: any) => {
        return { orders: schema.orders.all().models.map((o) => o.attrs) };
      });

      // Get orders with pagination
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

      // Get order by ID
      this.get(API_ENDPOINTS.ORDER.GET_DETAIL(":id"), (schema: any, request: any) => {
        const order = schema.orders.find(request.params.id);
        return { order: order?.attrs || null };
      });

      // Create order
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

      // Update order
      this.put(API_ENDPOINTS.ORDER.UPDATE(":id"), (schema: any, request: any) => {
        const order = schema.orders.find(request.params.id);
        const attrs = JSON.parse(request.requestBody);
        order.update({ ...attrs, modified: new Date().toISOString() });
        return { order: order.attrs };
      });

      // Update order status
      this.put(API_ENDPOINTS.ORDER.UPDATE_STATUS(":id"), (schema: any, request: any) => {
        const order = schema.orders.find(request.params.id);
        const attrs = JSON.parse(request.requestBody);
        order.update({ status: attrs.status, modified: new Date().toISOString() });
        return { order: order.attrs };
      });

      // Get order by order number
      this.get(API_ENDPOINTS.ORDER.GET_BY_ORDER_NO(":orderNo"), (schema: any, request: any) => {
        const order = schema.orders.all().models.find((o: any) => o.attrs.orderNo === request.params.orderNo);
        return { order: order?.attrs || null };
      });

      // ==================== INVENTORY SERVICE ====================

      // Get all inventory items
      this.get(API_ENDPOINTS.INVENTORY.GET_ALL, (schema: any) => {
        return { items: schema.inventoryItems.all().models.map((i) => i.attrs) };
      });

      // Get inventory items with pagination
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

      // Get inventory item by ID
      this.get(API_ENDPOINTS.INVENTORY.GET_DETAIL(":id"), (schema: any, request: any) => {
        const item = schema.inventoryItems.find(request.params.id);
        return { item: item?.attrs || null };
      });

      // Create inventory item
      this.post(API_ENDPOINTS.INVENTORY.CREATE, (schema: any, request: any) => {
        const attrs = JSON.parse(request.requestBody);
        const item = schema.inventoryItems.create({ ...attrs, id: generateGuid(), created: new Date().toISOString() });
        return { item: item.attrs };
      });

      // Update inventory item
      this.put(API_ENDPOINTS.INVENTORY.UPDATE(":id"), (schema: any, request: any) => {
        const item = schema.inventoryItems.find(request.params.id);
        const attrs = JSON.parse(request.requestBody);
        item.update({ ...attrs, modified: new Date().toISOString() });
        return { item: item.attrs };
      });

      // Delete inventory item
      this.delete(API_ENDPOINTS.INVENTORY.DELETE(":id"), (schema: any, request: any) => {
        const item = schema.inventoryItems.find(request.params.id);
        item.destroy();
        return {};
      });

      // Increase stock
      this.put(API_ENDPOINTS.INVENTORY.INCREASE_STOCK(":id"), (schema: any, request: any) => {
        const item = schema.inventoryItems.find(request.params.id);
        const attrs = JSON.parse(request.requestBody);
        const newQuantity = item.attrs.quantity + attrs.quantity;
        item.update({ quantity: newQuantity, availableQuantity: newQuantity - item.attrs.reservedQuantity, modified: new Date().toISOString() });
        return {};
      });

      // Decrease stock
      this.put(API_ENDPOINTS.INVENTORY.DECREASE_STOCK(":id"), (schema: any, request: any) => {
        const item = schema.inventoryItems.find(request.params.id);
        const attrs = JSON.parse(request.requestBody);
        const newQuantity = Math.max(0, item.attrs.quantity - attrs.quantity);
        item.update({ quantity: newQuantity, availableQuantity: newQuantity - item.attrs.reservedQuantity, modified: new Date().toISOString() });
        return {};
      });

      // Get all locations
      this.get(API_ENDPOINTS.INVENTORY.GET_LOCATIONS, (schema: any) => {
        return { locations: schema.locations.all().models.map((l) => l.attrs) };
      });

      // Get location by ID
      this.get(API_ENDPOINTS.INVENTORY.GET_LOCATION(":id"), (schema: any, request: any) => {
        const location = schema.locations.find(request.params.id);
        return { location: location?.attrs || null };
      });

      // Create location
      this.post(API_ENDPOINTS.INVENTORY.CREATE_LOCATION, (schema: any, request: any) => {
        const attrs = JSON.parse(request.requestBody);
        const location = schema.locations.create({ ...attrs, id: generateGuid(), created: new Date().toISOString() });
        return { location: location.attrs };
      });

      // Update location
      this.put(API_ENDPOINTS.INVENTORY.UPDATE_LOCATION(":id"), (schema: any, request: any) => {
        const location = schema.locations.find(request.params.id);
        const attrs = JSON.parse(request.requestBody);
        location.update({ ...attrs, modified: new Date().toISOString() });
        return { location: location.attrs };
      });

      // Delete location
      this.delete(API_ENDPOINTS.INVENTORY.DELETE_LOCATION(":id"), (schema: any, request: any) => {
        const location = schema.locations.find(request.params.id);
        location.destroy();
        return {};
      });

      // Get histories
      this.get(API_ENDPOINTS.INVENTORY.GET_HISTORIES, () => {
        return { histories: [] };
      });

      // Get all reservations
      this.get(API_ENDPOINTS.INVENTORY.GET_ALL_RESERVATIONS, () => {
        return { reservations: [] };
      });

      // ==================== DISCOUNT SERVICE ====================

      // Get all coupons
      this.get(API_ENDPOINTS.DISCOUNT.GET_ALL_COUPONS, (schema: any) => {
        return { coupons: schema.coupons.all().models.map((c) => c.attrs) };
      });

      // Get coupons with pagination
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

      // Get coupon by ID
      this.get(API_ENDPOINTS.DISCOUNT.GET_DETAIL(":id"), (schema: any, request: any) => {
        const coupon = schema.coupons.find(request.params.id);
        return { coupon: coupon?.attrs || null };
      });

      // Create coupon
      this.post(API_ENDPOINTS.DISCOUNT.CREATE, (schema: any, request: any) => {
        const attrs = JSON.parse(request.requestBody);
        const coupon = schema.coupons.create({ ...attrs, id: generateGuid(), usageCount: 0, created: new Date().toISOString() });
        return { coupon: coupon.attrs };
      });

      // Update coupon
      this.put(API_ENDPOINTS.DISCOUNT.UPDATE(":id"), (schema: any, request: any) => {
        const coupon = schema.coupons.find(request.params.id);
        const attrs = JSON.parse(request.requestBody);
        coupon.update({ ...attrs, modified: new Date().toISOString() });
        return { coupon: coupon.attrs };
      });

      // Delete coupon
      this.delete(API_ENDPOINTS.DISCOUNT.DELETE(":id"), (schema: any, request: any) => {
        const coupon = schema.coupons.find(request.params.id);
        coupon.destroy();
        return {};
      });

      // Approve coupon
      this.post(API_ENDPOINTS.DISCOUNT.APPROVE_COUPON(":id"), (schema: any, request: any) => {
        const coupon = schema.coupons.find(request.params.id);
        coupon.update({ status: 1, active: true, modified: new Date().toISOString() });
        return {};
      });

      // Reject coupon
      this.post(API_ENDPOINTS.DISCOUNT.REJECT_COUPON(":id"), (schema: any, request: any) => {
        const coupon = schema.coupons.find(request.params.id);
        coupon.update({ status: 3, active: false, modified: new Date().toISOString() });
        return {};
      });

      // Update validity period
      this.put(API_ENDPOINTS.DISCOUNT.UPDATE_VALIDITY_PERIOD(":id"), (schema: any, request: any) => {
        const coupon = schema.coupons.find(request.params.id);
        const attrs = JSON.parse(request.requestBody);
        coupon.update({ validFrom: attrs.validFrom, validTo: attrs.validTo, modified: new Date().toISOString() });
        return {};
      });

      // Validate coupon
      this.post(API_ENDPOINTS.DISCOUNT.VALIDATE, (schema: any, request: any) => {
        const attrs = JSON.parse(request.requestBody);
        const coupon = schema.coupons.all().models.find((c: any) => c.attrs.code === attrs.code);
        if (coupon && coupon.attrs.active) {
          return { valid: true, coupon: coupon.attrs };
        }
        return { valid: false, message: "Invalid or expired coupon" };
      });

      // Apply coupon
      this.post(API_ENDPOINTS.DISCOUNT.APPLY, (schema: any, request: any) => {
        const attrs = JSON.parse(request.requestBody);
        const coupon = schema.coupons.all().models.find((c: any) => c.attrs.code === attrs.code);
        if (coupon) {
          coupon.update({ usageCount: coupon.attrs.usageCount + 1 });
          return { success: true, discountAmount: coupon.attrs.discountValue };
        }
        return { success: false, message: "Coupon not found" };
      });

      // ==================== REPORT SERVICE ====================

      // Dashboard statistics
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

      // Order growth line chart
      this.get(API_ENDPOINTS.REPORT.ORDER_GROWTH_LINE_CHART, () => {
        return {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          data: [65, 78, 90, 81, 96, 105],
        };
      });

      // Top product pie chart
      this.get(API_ENDPOINTS.REPORT.TOP_PRODUCT_PIE_CHART, () => {
        return {
          labels: ["iPhone 15 Pro Max", "MacBook Pro M3", "Samsung Galaxy S24 Ultra", "Sony WH-1000XM5", "iPad Pro"],
          data: [35, 25, 20, 12, 8],
        };
      });

      // ==================== NOTIFICATION SERVICE ====================

      // Get notifications
      this.get(API_ENDPOINTS.NOTIFICATION.GET_LIST, (schema: any, request: any) => {
        const notifications = schema.notifications.all().models;
        const pageIndex = parseInt(request.queryParams.pageIndex) || 1;
        const pageSize = parseInt(request.queryParams.pageSize) || 10;
        const start = (pageIndex - 1) * pageSize;
        const end = start + pageSize;
        
        return {
          items: notifications.slice(start, end),
          totalCount: notifications.length,
          pageIndex,
          pageSize,
          totalPages: Math.ceil(notifications.length / pageSize),
          hasPreviousPage: pageIndex > 1,
          hasNextPage: end < notifications.length,
        };
      });

      // Get all notifications
      this.get(API_ENDPOINTS.NOTIFICATION.GET_ALL, (schema: any) => {
        return { notifications: schema.notifications.all().models.map((n: any) => n.attrs) };
      });

      // Mark as read
      this.post(API_ENDPOINTS.NOTIFICATION.MARK_AS_READ, (schema: any, request: any) => {
        const attrs = JSON.parse(request.requestBody);
        const notification = schema.notifications.find(attrs.id);
        if (notification) {
          notification.update({ isRead: true, modified: new Date().toISOString() });
        }
        return {};
      });

      // Get unread count
      this.get(API_ENDPOINTS.NOTIFICATION.GET_COUNT_UNREAD, (schema: any) => {
        const unreadCount = schema.notifications.all().models.filter((n: any) => !n.attrs.isRead).length;
        return { count: unreadCount };
      });

      // Get top 10 unread
      this.get(API_ENDPOINTS.NOTIFICATION.GET_TOP_10_UNREAD, (schema: any) => {
        const notifications = schema.notifications.all().models
          .filter((n: any) => !n.attrs.isRead)
          .slice(0, 10);
        return { notifications: notifications.map((n: any) => n.attrs) };
      });

      // ==================== KEYCLOAK SERVICE ====================

      // Get current user
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

      // Pass through any other requests
      this.passthrough();
    },
  });
}
