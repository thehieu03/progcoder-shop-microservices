/**
 * Catalog Service
 * Mock service functions for product, category, and brand management
 */

import { AxiosResponse } from "axios";
import {
  Guid,
  FilterParams,
  GetAllProductsResponse,
  GetProductsResponse,
  GetProductByIdResponse,
  GetAllCategoriesResponse,
  GetCategoryTreeResponse,
  GetAllBrandsResponse,
} from "@/shared/types";
import {
  mockBrands,
  mockCategories,
  mockProducts,
} from "@/mock/services/catalog.mock";

// Helper to create mock response
const createMockResponse = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: "OK",
  headers: {},
  config: {} as any,
});

export const catalogService = {
  // ==================== Products ====================

  getAllProducts: async (): Promise<AxiosResponse<GetAllProductsResponse>> => {
    return createMockResponse({ result: { items: mockProducts } });
  },

  getProducts: async (params: FilterParams = {}): Promise<AxiosResponse<GetProductsResponse>> => {
    const pageIndex = (params as any).pageIndex || 1;
    const pageSize = (params as any).pageSize || 10;
    const start = (pageIndex - 1) * pageSize;
    const end = start + pageSize;
    
    return createMockResponse({
      items: mockProducts.slice(start, end),
      totalCount: mockProducts.length,
      pageIndex,
      pageSize,
      totalPages: Math.ceil(mockProducts.length / pageSize),
      hasPreviousPage: pageIndex > 1,
      hasNextPage: end < mockProducts.length,
    } as GetProductsResponse);
  },

  getProductById: async (productId: Guid): Promise<AxiosResponse<GetProductByIdResponse>> => {
    const product = mockProducts.find((p) => p.id === productId);
    return createMockResponse({ product: product || mockProducts[0] });
  },

  createProduct: async (productFormData: FormData): Promise<AxiosResponse<any>> => {
    return createMockResponse({ success: true, message: "Product created successfully" });
  },

  updateProduct: async (productId: Guid, productFormData: FormData): Promise<AxiosResponse<any>> => {
    return createMockResponse({ success: true, message: "Product updated successfully" });
  },

  deleteProduct: async (productId: Guid): Promise<AxiosResponse<void>> => {
    return createMockResponse(undefined as any);
  },

  publishProduct: async (productId: Guid): Promise<AxiosResponse<void>> => {
    return createMockResponse(undefined as any);
  },

  unpublishProduct: async (productId: Guid): Promise<AxiosResponse<void>> => {
    return createMockResponse(undefined as any);
  },

  // ==================== Categories ====================

  getCategories: async (): Promise<AxiosResponse<GetAllCategoriesResponse>> => {
    return createMockResponse({ result: { items: mockCategories } });
  },

  getCategoryTree: async (): Promise<AxiosResponse<GetCategoryTreeResponse>> => {
    return createMockResponse({ categories: mockCategories as any });
  },

  getCategoryById: async (categoryId: Guid): Promise<AxiosResponse<any>> => {
    const category = mockCategories.find((c) => c.id === categoryId);
    return createMockResponse({ category: category || mockCategories[0] });
  },

  createCategory: async (categoryData: any): Promise<AxiosResponse<any>> => {
    return createMockResponse({ success: true, message: "Category created successfully" });
  },

  updateCategory: async (categoryId: Guid, categoryData: any): Promise<AxiosResponse<any>> => {
    return createMockResponse({ success: true, message: "Category updated successfully" });
  },

  deleteCategory: async (categoryId: Guid): Promise<AxiosResponse<void>> => {
    return createMockResponse(undefined as any);
  },

  // ==================== Brands ====================

  getBrands: async (): Promise<AxiosResponse<GetAllBrandsResponse>> => {
    return createMockResponse({ result: { items: mockBrands } });
  },

  getBrandById: async (brandId: Guid): Promise<AxiosResponse<any>> => {
    const brand = mockBrands.find((b) => b.id === brandId);
    return createMockResponse({ brand: brand || mockBrands[0] });
  },

  createBrand: async (brandData: any): Promise<AxiosResponse<any>> => {
    return createMockResponse({ success: true, message: "Brand created successfully" });
  },

  updateBrand: async (brandId: Guid, brandData: any): Promise<AxiosResponse<any>> => {
    return createMockResponse({ success: true, message: "Brand updated successfully" });
  },

  deleteBrand: async (brandId: Guid): Promise<AxiosResponse<void>> => {
    return createMockResponse(undefined as any);
  },
};

export default catalogService;
