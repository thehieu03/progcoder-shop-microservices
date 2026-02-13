import { apiSlice } from "@/store/api/apiSlice";

export interface ShopProduct {
  id: string;
  name: string;
  price: number;
  img: string;
  brand: string;
  description?: string;
  category?: string;
  stock?: number;
  rating?: number;
}

export const shopApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ShopProduct[], void>({
      query: () => "products",
    }),
    getProduct: builder.query<ShopProduct, string>({
      query: (id) => `/products/${id}`,
    }),
  }),
});

export const { useGetProductsQuery, useGetProductQuery } = shopApi;
