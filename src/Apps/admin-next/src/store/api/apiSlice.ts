import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "@/core/services/keycloakService";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/",
    prepareHeaders: (headers, { getState }) => {
      // Get Keycloak token
      const token = getToken();

      // If token exists, add it to the Authorization header
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Products", "Orders", "Coupons", "Inventory"], // Add tag types for cache invalidation
  endpoints: (builder) => ({}),
});
