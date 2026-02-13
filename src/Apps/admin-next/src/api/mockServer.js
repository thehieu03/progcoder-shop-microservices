import { createServer, Model } from "miragejs";
import { API_ENDPOINTS } from "./endpoints";

export function makeServer({ environment = "development" } = {}) {
  // Get API Gateway URL from env to intercept
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
    },

    seeds(server) {
      // Seed Categories
      server.create("category", {
        id: "1",
        name: "Electronics",
        slug: "electronics",
      });
      server.create("category", {
        id: "2",
        name: "Clothing",
        slug: "clothing",
      });

      // Seed Brands
      server.create("brand", { id: "1", name: "Apple", slug: "apple" });
      server.create("brand", { id: "2", name: "Nike", slug: "nike" });

      // Seed Products
      server.create("product", {
        id: "1",
        name: "iPhone 15 Pro",
        price: 999,
        sku: "IP15P-128",
        stock: 50,
        categoryName: "Electronics",
        brandName: "Apple",
        status: "PUBLISHED",
        imageUrl: "https://placehold.co/100x100?text=iPhone",
      });
      server.create("product", {
        id: "2",
        name: "Nike Air Max",
        price: 129,
        sku: "NAM-001",
        stock: 20,
        categoryName: "Clothing",
        brandName: "Nike",
        status: "PUBLISHED",
        imageUrl: "https://placehold.co/100x100?text=Nike",
      });

      // Seed Orders
      server.create("order", {
        id: "1001",
        orderNo: "ORD-2023-1001",
        customerName: "John Doe",
        totalAmount: 1128,
        status: "COMPLETED",
        createdDate: new Date().toISOString(),
      });
      server.create("order", {
        id: "1002",
        orderNo: "ORD-2023-1002",
        customerName: "Jane Smith",
        totalAmount: 129,
        status: "PENDING",
        createdDate: new Date().toISOString(),
      });

      // Seed Customers (if needed for list)
      server.create("customer", {
        id: "c1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      });
    },

    routes() {
      // Configure base URL to match axiosInstance
      this.urlPrefix = apiGateway;
      // this.namespace = ""; // If your API has a common prefix like /api

      // Allow unhandled requests to pass through (e.g. Next.js assets)
      this.passthrough((request) => {
        if (request.url.startsWith("/_next/")) return true;
        if (request.url.startsWith("/__nextjs")) return true;
        return false;
      });

      this.passthrough(); // Pass through everything else not defined below

      // --- Catalog Service ---
      this.get(API_ENDPOINTS.CATALOG.GET_PRODUCTS, (schema) => {
        return {
          items: schema.products.all().models,
          totalCount: schema.products.all().length,
          pageIndex: 1,
          pageSize: 10,
        };
      });

      this.get(API_ENDPOINTS.CATALOG.GET_ALL_PRODUCTS, (schema) => {
        return schema.products.all().models;
      });

      // --- Order Service ---
      this.get(API_ENDPOINTS.ORDER.GET_LIST, (schema) => {
        return {
          items: schema.orders.all().models,
          totalCount: schema.orders.all().length,
          pageIndex: 1,
          pageSize: 10,
        };
      });

      // --- Dashboard Statistics (Mock) ---
      this.get(API_ENDPOINTS.REPORT.DASHBOARD_STATISTICS, () => {
        return {
          totalRevenue: 54321,
          totalOrders: 125,
          totalProducts: 45,
          totalCustomers: 89,
          growthRate: 15.5,
        };
      });

      // --- Keycloak Me (Fake) ---
      // this.get('/account/me', () => ({ ... })); // Already handled by KeycloakContext mock
      this.passthrough(`${apiGateway}/account/me`);
      this.passthrough((request) => {
        return request.url.includes("/account/me");
      });
    },
  });
}
